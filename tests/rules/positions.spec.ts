// [P1][INTEGRITY][TEST] Firestore rules tests for positions collection
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SECURITY, RBAC
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";

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
    projectId: "fresh-schedules-test-positions",
    firestore: firestoreOptions,
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Positions Collection - Read Access", () => {
  test("✅ ALLOW: Member can read positions in their org", async () => {
    // Setup: Create org and position
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
      });
      await context
        .firestore()
        .collection("orgs")
        .doc("orgA")
        .collection("positions")
        .doc("pos1")
        .set({
          name: "Software Engineer",
          department: "Engineering",
          createdAt: new Date().toISOString(),
        });
    });

    // Test: Member can read positions in their org
    const memberCtx = testEnv.authenticatedContext("member1", {
      orgId: "orgA",
      roles: ["org_member"],
    });
    await expect(
      memberCtx.firestore().doc("orgs/orgA/positions/pos1").get(),
    ).resolves.toBeTruthy();
  });

  test("❌ DENY: Unauthenticated user cannot read positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
    });

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(unauthCtx.firestore().doc("orgs/orgA/positions/pos1").get()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });

  test("❌ DENY: Cannot read positions from other orgs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
    });

    // User from orgB tries to read orgA position
    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["org_member"],
    });
    await expect(
      outsiderCtx.firestore().doc("orgs/orgA/positions/pos1").get(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("❌ DENY: Cannot list positions from other orgs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
      await context.firestore().doc("orgs/orgA/positions/pos2").set({
        name: "Product Manager",
      });
    });

    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      outsiderCtx.firestore().collection("orgs/orgA/positions").get(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});

describe("Positions Collection - Create Access", () => {
  test("❌ DENY: Staff cannot create positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/positions/newPos").set({
        name: "New Position",
        department: "HR",
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("❌ DENY: Scheduler cannot create positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
    });

    const schedulerCtx = testEnv.authenticatedContext("scheduler1", {
      orgId: "orgA",
      roles: ["scheduler"],
    });
    await expect(
      schedulerCtx.firestore().doc("orgs/orgA/positions/newPos").set({
        name: "New Position",
        department: "HR",
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can create positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/positions/newPos").set({
        name: "New Position",
        department: "HR",
        createdAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Admin can create positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
    });

    const adminCtx = testEnv.authenticatedContext("admin1", {
      orgId: "orgA",
      roles: ["admin"],
    });
    await expect(
      adminCtx.firestore().doc("orgs/orgA/positions/newPos").set({
        name: "New Position",
        department: "Engineering",
        createdAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });
});

describe("Positions Collection - Update Access", () => {
  test("❌ DENY: Staff cannot update positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
        department: "Engineering",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/positions/pos1").update({
        name: "Senior Software Engineer",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can update positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
        department: "Engineering",
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/positions/pos1").update({
        name: "Senior Software Engineer",
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager from different org cannot update positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
        department: "Engineering",
      });
    });

    const outsiderManagerCtx = testEnv.authenticatedContext("manager2", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      outsiderManagerCtx.firestore().doc("orgs/orgA/positions/pos1").update({
        name: "Malicious Update",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});

describe("Positions Collection - Delete Access", () => {
  test("❌ DENY: Staff cannot delete positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/positions/pos1").delete(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("❌ DENY: Manager cannot delete positions (admin-only)", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/positions/pos1").delete(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Admin can delete positions", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/positions/pos1").set({
        name: "Software Engineer",
      });
    });

    const adminCtx = testEnv.authenticatedContext("admin1", {
      orgId: "orgA",
      roles: ["admin"],
    });
    await expect(
      adminCtx.firestore().doc("orgs/orgA/positions/pos1").delete(),
    ).resolves.toBeUndefined();
  });
});
