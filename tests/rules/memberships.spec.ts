// [P1][INTEGRITY][TEST] Firestore rules tests for memberships collection
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
    projectId: "fresh-schedules-test-memberships",
    firestore: firestoreOptions,
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Memberships Collection - Read Access", () => {
  test("✅ ALLOW: Member can read own membership", async () => {
    const uid = "user1";
    const membershipId = `${uid}_orgA`;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid,
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    const userCtx = testEnv.authenticatedContext(uid, { orgId: "orgA", roles: ["org_member"] });
    await expect(
      userCtx.firestore().doc(`memberships/${membershipId}`).get(),
    ).resolves.toBeTruthy();
  });

  test("✅ ALLOW: Manager can read other memberships in same org", async () => {
    const membershipId = "user2_orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid: "user2",
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc(`memberships/${membershipId}`).get(),
    ).resolves.toBeTruthy();
  });

  test("❌ DENY: Cannot read memberships from other orgs", async () => {
    const membershipId = "user2_orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid: "user2",
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    // User from orgB tries to read orgA membership
    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["org_member"],
    });
    await expect(outsiderCtx.firestore().doc(`memberships/${membershipId}`).get()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });

  test("❌ DENY: Cannot list all memberships (enumeration protection)", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc("user1_orgA")
        .set({
          uid: "user1",
          orgId: "orgA",
          roles: ["org_member"],
        });
      await context
        .firestore()
        .collection("memberships")
        .doc("user2_orgB")
        .set({
          uid: "user2",
          orgId: "orgB",
          roles: ["org_member"],
        });
    });

    const userCtx = testEnv.authenticatedContext("user1", { orgId: "orgA", roles: ["org_member"] });
    await expect(userCtx.firestore().collection("memberships").get()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });
});

describe("Memberships Collection - Write Access", () => {
  test("✅ ALLOW: User can create their own membership", async () => {
    const uid = "user1";
    const membershipId = `${uid}_orgA`;

    const userCtx = testEnv.authenticatedContext(uid, { orgId: "orgA", roles: ["org_member"] });
    await expect(
      userCtx
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid,
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Manager can create membership for others in same org", async () => {
    const membershipId = "user2_orgA";

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid: "user2",
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Member cannot update membership roles (only managers)", async () => {
    const uid = "user1";
    const membershipId = `${uid}_orgA`;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid,
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    const userCtx = testEnv.authenticatedContext(uid, { orgId: "orgA", roles: ["org_member"] });
    await expect(
      userCtx
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .update({
          roles: ["manager"],
        }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can update membership roles in same org", async () => {
    const membershipId = "user2_orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid: "user2",
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .update({
          roles: ["scheduler"],
        }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager cannot modify memberships in other orgs", async () => {
    const membershipId = "user2_orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .set({
          uid: "user2",
          orgId: "orgA",
          roles: ["org_member"],
          joinedAt: new Date().toISOString(),
        });
    });

    // Manager from orgB tries to modify orgA membership
    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      managerCtx
        .firestore()
        .collection("memberships")
        .doc(membershipId)
        .update({
          roles: ["scheduler"],
        }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});
