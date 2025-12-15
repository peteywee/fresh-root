// [P0][APP][CODE] Denormalization
// Tags: P0, APP, CODE
/**
 * Denormalization Triggers
 *
 * Maintain denormalized data to eliminate N+1 queries.
 *
 * PATTERN:
 * Instead of: Fetch venue → Fetch zones (N queries)
 * We do: Fetch venue (includes cachedZones) → 1 query
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

// =============================================================================
// TRIGGER 1: Sync Zones to Venue
// =============================================================================

export const onZoneWrite = functions.firestore
  .document("organizations/{orgId}/venues/{venueId}/zones/{zoneId}")
  .onWrite(async (change, context) => {
    const { orgId, venueId, zoneId } = context.params;

    functions.logger.info(`[DENORM] Zone write: ${orgId}/${venueId}/${zoneId}`);

    try {
      const zonesSnapshot = await db
        .collection(`organizations/${orgId}/venues/${venueId}/zones`)
        .where("isActive", "==", true)
        .orderBy("name")
        .get();

      const cachedZones = zonesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        capacity: doc.data().capacity,
        type: doc.data().type,
        isActive: doc.data().isActive,
      }));

      await db.doc(`organizations/${orgId}/venues/${venueId}`).update({
        cachedZones,
        cachedZonesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        zoneCount: cachedZones.length,
      });

      functions.logger.info(`[DENORM] Updated venue with ${cachedZones.length} zones`);
    } catch (error) {
      functions.logger.error(`[DENORM] Failed to sync zones:`, error);
    }
  });

// =============================================================================
// TRIGGER 2: Sync Membership Count to Organization
// =============================================================================

export const onMembershipWrite = functions.firestore
  .document("memberships/{membershipId}")
  .onWrite(async (change, _context) => {
    const data = change.after.exists ? change.after.data() : change.before.data();

    if (!data?.orgId) {
      return;
    }

    const { orgId } = data;
    functions.logger.info(`[DENORM] Membership write for org: ${orgId}`);

    try {
      const membershipsSnapshot = await db
        .collectionGroup("memberships")
        .where("orgId", "==", orgId)
        .where("status", "==", "active")
        .get();

      const roleCounts: Record<string, number> = {
        owner: 0,
        admin: 0,
        manager: 0,
        staff: 0,
        viewer: 0,
      };

      membershipsSnapshot.docs.forEach((doc) => {
        const role = doc.data().role;
        if (role in roleCounts) {
          roleCounts[role]++;
        }
      });

      await db.doc(`organizations/${orgId}`).update({
        memberCount: membershipsSnapshot.size,
        memberCountByRole: roleCounts,
        memberCountUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`[DENORM] Updated org member count: ${membershipsSnapshot.size}`);
    } catch (error) {
      functions.logger.error(`[DENORM] Failed to sync membership count:`, error);
    }
  });

// =============================================================================
// TRIGGER 3: Sync User Profile to Memberships
// =============================================================================

export const onUserProfileUpdate = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const { userId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    const relevantFields = ["displayName", "avatarUrl", "email"];
    const hasRelevantChange = relevantFields.some((field) => before[field] !== after[field]);

    if (!hasRelevantChange) {
      return;
    }

    functions.logger.info(`[DENORM] User profile updated: ${userId}`);

    try {
      const membershipsSnapshot = await db
        .collectionGroup("memberships")
        .where("uid", "==", userId)
        .get();

      if (membershipsSnapshot.empty) {
        return;
      }

      const batch = db.batch();

      membershipsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          displayName: after.displayName,
          avatarUrl: after.avatarUrl || null,
          email: after.email,
          profileSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      functions.logger.info(`[DENORM] Synced profile to ${membershipsSnapshot.size} memberships`);
    } catch (error) {
      functions.logger.error(`[DENORM] Failed to sync user profile:`, error);
    }
  });

// =============================================================================
// TRIGGER 4: Sync Schedule Summary to Shifts
// =============================================================================

export const onScheduleUpdate = functions.firestore
  .document("organizations/{orgId}/schedules/{scheduleId}")
  .onUpdate(async (change, context) => {
    const { orgId, scheduleId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    const relevantFields = ["name", "status", "weekStart"];
    const hasRelevantChange = relevantFields.some(
      (field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]),
    );

    if (!hasRelevantChange) {
      return;
    }

    functions.logger.info(`[DENORM] Schedule updated: ${scheduleId}`);

    try {
      const shiftsSnapshot = await db
        .collection(`organizations/${orgId}/schedules/${scheduleId}/shifts`)
        .get();

      if (shiftsSnapshot.empty) {
        return;
      }

      const batch = db.batch();
      const scheduleSummary = {
        id: scheduleId,
        name: after.name,
        status: after.status,
        weekStart: after.weekStart,
      };

      shiftsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          cachedSchedule: scheduleSummary,
          scheduleSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      functions.logger.info(`[DENORM] Synced schedule to ${shiftsSnapshot.size} shifts`);
    } catch (error) {
      functions.logger.error(`[DENORM] Failed to sync schedule:`, error);
    }
  });

// =============================================================================
// TRIGGER 5: Daily Reconciliation (catch missed triggers)
// =============================================================================

export const reconcileOrgStats = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  functions.logger.info("[RECONCILE] Starting daily org stats reconciliation");

  try {
    const orgsSnapshot = await db.collection("organizations").get();

    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;

      const [membersCount, schedulesCount, venuesCount] = await Promise.all([
        db
          .collectionGroup("memberships")
          .where("orgId", "==", orgId)
          .where("status", "==", "active")
          .count()
          .get(),
        db.collection(`organizations/${orgId}/schedules`).count().get(),
        db.collection(`organizations/${orgId}/venues`).where("isActive", "==", true).count().get(),
      ]);

      await db.doc(`organizations/${orgId}`).update({
        reconciledStats: {
          memberCount: membersCount.data().count,
          scheduleCount: schedulesCount.data().count,
          venueCount: venuesCount.data().count,
          reconciledAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    functions.logger.info(`[RECONCILE] Completed for ${orgsSnapshot.size} organizations`);
  } catch (error) {
    functions.logger.error("[RECONCILE] Failed:", error);
  }
});
