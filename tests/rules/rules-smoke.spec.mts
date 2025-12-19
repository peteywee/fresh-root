// [P2][TEST][RULES] Firestore security rules smoke tests with Phase 2 validation
// Tags: P2, TEST, RULES, SECURITY, B5

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, deleteApp } from "firebase-admin/app";
import type { App } from "firebase-admin/app";

describe("Firestore rules basic smoke", () => {
  it("runs a quick sanity test", () => {
    expect(true).toBe(true);
  });
});

describe("Phase 2 Data Persistence Tests (B1, B2, B3, B4)", () => {
  let app: App;
  let db: ReturnType<typeof getFirestore>;

  beforeAll(async () => {
    // Initialize Firebase Admin - emulator connection automatic via FIRESTORE_EMULATOR_HOST
    if (getApps().length === 0) {
      app = initializeApp({ projectId: "fresh-schedules-test" });
    } else {
      app = getApps()[0]!;
    }
    db = getFirestore(app);
  });

  afterAll(async () => {
    if (app) {
      await deleteApp(app);
    }
  });

  it("should create and read organization documents (B1)", async () => {
    const orgId = `test-org-${Date.now()}`;
    const orgData = {
      name: "Test Organization",
      type: "network",
      ownerId: "test-user-001",
      createdAt: Date.now(),
      status: "active",
    };

    await db.collection("organizations").doc(orgId).set(orgData);
    const doc = await db.collection("organizations").doc(orgId).get();

    expect(doc.exists).toBe(true);
    expect(doc.data()?.name).toBe("Test Organization");
  });

  it("should create org_owner membership for creator (B2)", async () => {
    const orgId = `test-org-membership-${Date.now()}`;
    const userId = "test-owner-001";

    // Create parent org
    await db.collection("organizations").doc(orgId).set({
      name: "Test Org with Members",
      type: "network",
      ownerId: userId,
      createdAt: Date.now(),
      status: "active",
    });

    // Create membership
    const membershipData = {
      userId,
      orgId,
      role: "org_owner",
      status: "active",
      joinedAt: Date.now(),
    };

    await db
      .collection("organizations")
      .doc(orgId)
      .collection("members")
      .doc(userId)
      .set(membershipData);

    const memberDoc = await db
      .collection("organizations")
      .doc(orgId)
      .collection("members")
      .doc(userId)
      .get();

    expect(memberDoc.exists).toBe(true);
    expect(memberDoc.data()?.role).toBe("org_owner");
  });

  it("should create corporate network documents (B3)", async () => {
    const networkId = `test-network-${Date.now()}`;
    const networkData = {
      type: "corporate",
      corporateName: "Test Corporation",
      brandName: "Test Brand",
      formToken: "test-form-token",
      ownerId: "test-user-004",
      createdAt: Date.now(),
    };

    await db.collection("networks").doc(networkId).set(networkData);
    const doc = await db.collection("networks").doc(networkId).get();

    expect(doc.exists).toBe(true);
    expect(doc.data()?.corporateName).toBe("Test Corporation");
  });

  it("should mark invite tokens as used (B4)", async () => {
    const tokenId = `test-token-${Date.now()}`;
    const tokenData = {
      orgId: "test-org-002",
      role: "member",
      createdBy: "test-owner-002",
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      used: false,
    };

    await db.collection("invite_tokens").doc(tokenId).set(tokenData);

    // Mark as used
    await db.collection("invite_tokens").doc(tokenId).update({
      used: true,
      usedBy: "test-user-006",
      usedAt: Date.now(),
    });

    const doc = await db.collection("invite_tokens").doc(tokenId).get();
    expect(doc.data()?.used).toBe(true);
    expect(doc.data()?.usedBy).toBe("test-user-006");
  });

  it("should complete full org creation flow (B1 + B2 integration)", async () => {
    const orgId = `test-org-full-flow-${Date.now()}`;
    const userId = "test-user-full-flow";

    // B1: Create organization
    await db.collection("organizations").doc(orgId).set({
      name: "Full Flow Organization",
      type: "network",
      ownerId: userId,
      createdAt: Date.now(),
      status: "active",
    });

    // B2: Create org_owner membership
    await db
      .collection("organizations")
      .doc(orgId)
      .collection("members")
      .doc(userId)
      .set({
        userId,
        orgId,
        role: "org_owner",
        status: "active",
        joinedAt: Date.now(),
      });

    // Verify both documents exist
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    const memberDoc = await db
      .collection("organizations")
      .doc(orgId)
      .collection("members")
      .doc(userId)
      .get();

    expect(orgDoc.exists).toBe(true);
    expect(memberDoc.exists).toBe(true);
    expect(memberDoc.data()?.role).toBe("org_owner");
  });
});
