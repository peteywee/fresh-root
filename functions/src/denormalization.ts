import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

/**
 * Admin initialization guard.
 */
if (!getApps().length) {
  initializeApp();
}

const db: Firestore = getFirestore();

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface ZoneSummary {
  id: string;
  name: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/* Trigger: onZoneWrite                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Denormalization trigger:
 * Whenever a Zone is created/updated/deleted under:
 *
 *   orgs/{orgId}/venues/{venueId}/zones/{zoneId}
 *
 * we recompute the `cachedZones` array on the parent Venue document.
 *
 * This is deliberately idempotent. Running it twice produces the same result,
 * because we always recompute from the current set of zone documents.
 */
export const onZoneWrite = onDocumentWritten(
  "orgs/{orgId}/venues/{venueId}/zones/{zoneId}",
  async (event) => {
    const { orgId, venueId, zoneId } = event.params;

    logger.info("onZoneWrite triggered", {
      orgId,
      venueId,
      zoneId,
      changeType: event.data?.before.exists
        ? event.data.after.exists
          ? "update"
          : "delete"
        : "create",
    });

    const venueRef = db.doc(`orgs/${orgId}/venues/${venueId}`);

    try {
      await db.runTransaction(async (tx) => {
        // Ensure the venue exists – if not, bail gracefully.
        const venueSnap = await tx.get(venueRef);
        if (!venueSnap.exists) {
          logger.warn(
            "onZoneWrite: venue does not exist; skipping cachedZones update",
            { orgId, venueId }
          );
          return;
        }

        const zonesCollection = db.collection(
          `orgs/${orgId}/venues/${venueId}/zones`
        );

        const zonesSnap = await tx.get(zonesCollection);

        const cachedZones: ZoneSummary[] = zonesSnap.docs.map((doc) => {
          const data = doc.data() as Partial<ZoneSummary>;
          return {
            id: doc.id,
            name: typeof data.name === "string" ? data.name : "(unnamed zone)",
            status: typeof data.status === "string" ? data.status : "active",
          };
        });

        tx.update(venueRef, {
          cachedZones,
          zonesUpdatedAt: FirebaseFirestore.Timestamp.now(),
        });
      });

      logger.info("onZoneWrite: cachedZones recomputed successfully", {
        orgId,
        venueId,
      });
    } catch (error: unknown) {
      logger.error("onZoneWrite failed", {
        orgId,
        venueId,
        zoneId,
        error: (error as Error).message,
      });
      // Let Functions retry according to its retry policy.
      throw error;
    }
  }
);
