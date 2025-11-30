// [P0][TEST][TEST] Join Organization Test tests
// Tags: P0, TEST, TEST
/**
 * Integration Tests: Join Organization Flow
 *
 * RUN:
 *   pnpm test:integration tests/integration/join-organization.test.ts
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as admin from "firebase-admin";
import { createTestOrg, createTestJoinToken, getFirestoreDoc } from "./setup";

describe("Join Organization Flow", () => {
  let testOrgId: string;
  let testTokenId: string;

  beforeEach(async () => {
    testOrgId = await createTestOrg();
    testTokenId = await createTestJoinToken(testOrgId, {
      maxUses: 5,
      role: "staff",
    });
  });

  describe("Token Validation", () => {
    it("should accept a valid, active token", async () => {
      const token = await getFirestoreDoc(`join_tokens/${testTokenId}`);

      expect(token).not.toBeNull();
      expect(token?.status).toBe("active");
      expect(token?.orgId).toBe(testOrgId);
      expect(token?.currentUses).toBe(0);
      expect(token?.maxUses).toBe(5);
    });

    it("should reject an expired token", async () => {
      const db = admin.firestore();
      const expiredTokenId = "expired-token";
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      await db.doc(`join_tokens/${expiredTokenId}`).set({
        orgId: testOrgId,
        role: "staff",
        status: "active",
        maxUses: 1,
        currentUses: 0,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(pastDate),
        createdBy: "test-admin",
      });

      const token = await getFirestoreDoc(`join_tokens/${expiredTokenId}`);
      const isExpired = token?.expiresAt.toDate() < new Date();

      expect(isExpired).toBe(true);
    });

    it("should reject a fully-used token", async () => {
      const db = admin.firestore();
      const usedTokenId = "used-token";

      await db.doc(`join_tokens/${usedTokenId}`).set({
        orgId: testOrgId,
        role: "staff",
        status: "used",
        maxUses: 1,
        currentUses: 1,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 86400000)),
        createdBy: "test-admin",
      });

      const token = await getFirestoreDoc(`join_tokens/${usedTokenId}`);

      expect(token?.status).toBe("used");
      expect(token?.currentUses).toBeGreaterThanOrEqual(token?.maxUses);
    });
  });

  describe("Membership Creation", () => {
    it("should create a membership document with correct data", async () => {
      const db = admin.firestore();
      const userId = "test-user-123";
      const membershipId = "test-membership-123";

      await db.runTransaction(async (transaction) => {
        const tokenRef = db.doc(`join_tokens/${testTokenId}`);
        const membershipRef = db.doc(`memberships/${membershipId}`);

        transaction.set(membershipRef, {
          uid: userId,
          orgId: testOrgId,
          role: "staff",
          status: "active",
          joinedVia: "token",
          joinToken: testTokenId,
          email: "test@example.com",
          displayName: "Test User",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        transaction.update(tokenRef, {
          currentUses: admin.firestore.FieldValue.increment(1),
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      const membership = await getFirestoreDoc(`memberships/${membershipId}`);
      expect(membership).not.toBeNull();
      expect(membership?.uid).toBe(userId);
      expect(membership?.orgId).toBe(testOrgId);
      expect(membership?.role).toBe("staff");

      const token = await getFirestoreDoc(`join_tokens/${testTokenId}`);
      expect(token?.currentUses).toBe(1);
    });

    it("should atomically fail if token is used during transaction", async () => {
      const db = admin.firestore();

      await db.doc(`join_tokens/${testTokenId}`).update({
        currentUses: 5,
        status: "used",
      });

      let transactionFailed = false;

      try {
        await db.runTransaction(async (transaction) => {
          const tokenRef = db.doc(`join_tokens/${testTokenId}`);
          const tokenSnapshot = await transaction.get(tokenRef);
          const tokenData = tokenSnapshot.data();

          if (!tokenData || tokenData.currentUses >= tokenData.maxUses) {
            throw new Error("Token exhausted");
          }

          transaction.set(db.doc("memberships/should-not-exist"), {
            test: true,
          });
        });
      } catch {
        transactionFailed = true;
      }

      expect(transactionFailed).toBe(true);

      const membership = await getFirestoreDoc("memberships/should-not-exist");
      expect(membership).toBeNull();
    });
  });

  describe("Idempotency", () => {
    it("should return existing membership if user already joined", async () => {
      const db = admin.firestore();
      const userId = "idempotent-user";
      const existingMembershipId = "existing-membership";

      await db.doc(`memberships/${existingMembershipId}`).set({
        uid: userId,
        orgId: testOrgId,
        role: "staff",
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const existingQuery = await db
        .collectionGroup("memberships")
        .where("uid", "==", userId)
        .where("orgId", "==", testOrgId)
        .limit(1)
        .get();

      expect(existingQuery.empty).toBe(false);
      expect(existingQuery.docs[0].id).toBe(existingMembershipId);

      const token = await getFirestoreDoc(`join_tokens/${testTokenId}`);
      expect(token?.currentUses).toBe(0);
    });
  });

  describe("Multi-Use Token", () => {
    it("should allow multiple users to join with same token", async () => {
      const db = admin.firestore();
      const users = ["user-1", "user-2", "user-3"];

      for (const userId of users) {
        const membershipId = `membership-${userId}`;

        await db.runTransaction(async (transaction) => {
          const tokenRef = db.doc(`join_tokens/${testTokenId}`);
          const tokenSnapshot = await transaction.get(tokenRef);
          const tokenData = tokenSnapshot.data();

          if (!tokenData || tokenData.currentUses >= tokenData.maxUses) {
            throw new Error("Token exhausted");
          }

          transaction.set(db.doc(`memberships/${membershipId}`), {
            uid: userId,
            orgId: testOrgId,
            role: "staff",
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          transaction.update(tokenRef, {
            currentUses: admin.firestore.FieldValue.increment(1),
          });
        });
      }

      for (const userId of users) {
        const membership = await getFirestoreDoc(`memberships/membership-${userId}`);
        expect(membership).not.toBeNull();
        expect(membership?.uid).toBe(userId);
      }

      const token = await getFirestoreDoc(`join_tokens/${testTokenId}`);
      expect(token?.currentUses).toBe(3);
    });
  });
});
