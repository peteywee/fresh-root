// [P1][INTEGRITY][TEST] Firestore rules tests for organizations collection
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SECURITY, RBAC
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
import { beforeAll, afterAll, beforeEach, describe, test, expect } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const firestoreOptions: { rules: string; host?: string; port?: number } = {
    rules: fs.readFileSync("firestore.rules", "utf8"),
  };
  const firestoreHost =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  if (firestoreHost) {
    const [host, portStr] = firestoreHost.split(":");
    firestoreOptions.host = host;
    firestoreOptions.port = Number(portStr);
  } else {
    firestoreOptions.host = "localhost";
    firestoreOptions.port = 8080;
  }

  testEnv = await initializeTestEnvironment({
    projectId: "fresh-schedules-test-organizations",
    firestore: firestoreOptions,
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Organizations Collection - Read Access", () => {
  test("✅ ALLOW: Member can read org they belong to", async () => {
    const orgId = "orgA";
    const uid = "user1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["staff"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const userCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["staff"] });
    await expect(userCtx.firestore().doc(`organizations/${orgId}`).get()).resolves.toBeTruthy();
  });

  test("❌ DENY: Unauthenticated user cannot read org", async () => {
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });
    });

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(unauthCtx.firestore().doc(`organizations/${orgId}`).get()).rejects.toThrow();
  });

  test("❌ DENY: Non-member cannot read org", async () => {
    const orgId = "orgA";
    const uid = "user1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });
    });

    // User with no membership
    const userCtx = testEnv.authenticatedContext(uid, { orgId: "orgB", roles: ["staff"] });
    await expect(userCtx.firestore().doc(`organizations/${orgId}`).get()).rejects.toThrow();
  });

  test("❌ DENY: Member from different org cannot read org", async () => {
    const orgId = "orgA";
    const uid = "user1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_orgB`)
        .set({
          userId: uid,
          orgId: "orgB",
          roles: ["staff"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const userCtx = testEnv.authenticatedContext(uid, { orgId: "orgB", roles: ["staff"] });
    await expect(userCtx.firestore().doc(`organizations/${orgId}`).get()).rejects.toThrow();
  });
});

describe("Organizations Collection - Create Access", () => {
  test("✅ ALLOW: Authenticated user can create org", async () => {
    const orgId = "newOrg";
    const uid = "user1";

    const userCtx = testEnv.authenticatedContext(uid);
    await expect(
      userCtx.firestore().collection("organizations").doc(orgId).set({
        name: "New Organization",
        createdBy: uid,
        createdAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Unauthenticated user cannot create org", async () => {
    const orgId = "newOrg";

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(
      unauthCtx.firestore().collection("organizations").doc(orgId).set({
        name: "New Organization",
        createdBy: "someone",
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow();
  });
});

describe("Organizations Collection - Update Access", () => {
  test("❌ DENY: Regular member cannot update org", async () => {
    const orgId = "orgA";
    const uid = "user1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["staff"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const userCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["staff"] });
    await expect(
      userCtx.firestore().doc(`organizations/${orgId}`).update({
        name: "Updated Name",
      }),
    ).rejects.toThrow();
  });

  test("✅ ALLOW: Org owner can update org", async () => {
    const orgId = "orgA";
    const uid = "owner1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: uid,
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["org_owner"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const ownerCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["org_owner"] });
    await expect(
      ownerCtx.firestore().doc(`organizations/${orgId}`).update({
        name: "Updated Name",
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Manager can update org", async () => {
    const orgId = "orgA";
    const uid = "manager1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["manager"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const managerCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["manager"] });
    await expect(
      managerCtx.firestore().doc(`organizations/${orgId}`).update({
        name: "Updated by Manager",
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Scheduler cannot update org", async () => {
    const orgId = "orgA";
    const uid = "scheduler1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["scheduler"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const schedulerCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["scheduler"] });
    await expect(
      schedulerCtx.firestore().doc(`organizations/${orgId}`).update({
        name: "Updated Name",
      }),
    ).rejects.toThrow();
  });
});

describe("Organizations Collection - Delete Access", () => {
  test("✅ ALLOW: Org owner can delete org", async () => {
    const orgId = "orgA";
    const uid = "owner1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: uid,
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["org_owner"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const ownerCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["org_owner"] });
    await expect(ownerCtx.firestore().doc(`organizations/${orgId}`).delete()).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager cannot delete org", async () => {
    const orgId = "orgA";
    const uid = "manager1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["manager"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const managerCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["manager"] });
    await expect(managerCtx.firestore().doc(`organizations/${orgId}`).delete()).rejects.toThrow();
  });

  test("❌ DENY: Staff cannot delete org", async () => {
    const orgId = "orgA";
    const uid = "staff1";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("organizations").doc(orgId).set({
        name: "Organization A",
        createdBy: "creator1",
        createdAt: new Date().toISOString(),
      });

      await context
        .firestore()
        .collection("memberships")
        .doc(`${uid}_${orgId}`)
        .set({
          userId: uid,
          orgId,
          roles: ["staff"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    });

    const staffCtx = testEnv.authenticatedContext(uid, { orgId, roles: ["staff"] });
    await expect(staffCtx.firestore().doc(`organizations/${orgId}`).delete()).rejects.toThrow();
  });
});
