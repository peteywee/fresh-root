// @vitest-environment node
// @vitest-typescript esm
// [P1][INTEGRITY][TEST] Firestore rules tests for organizations collection
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SECURITY, RBAC
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";

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
    projectId: "fresh-schedules-test-orgs",
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
  test("✅ ALLOW: Member can read their own org", async () => {
    // Setup: Create org in Firestore
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    // Test: Member with orgId token can read
    const memberCtx = testEnv.authenticatedContext("member1", {
      orgId: "orgA",
      roles: ["org_member"],
    });
    await expect(memberCtx.firestore().doc("orgs/orgA").get()).resolves.toBeTruthy();
  });

  test("❌ DENY: Unauthenticated user cannot read org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(unauthCtx.firestore().doc("orgs/orgA").get()).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("❌ DENY: Non-member cannot read org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    // User from different org
    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["org_member"],
    });
    await expect(outsiderCtx.firestore().doc("orgs/orgA").get()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });

  test("❌ DENY: Member cannot list all orgs (enumeration protection)", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().collection("orgs").doc("orgB").set({ name: "Org B" });
    });

    const memberCtx = testEnv.authenticatedContext("member1", {
      orgId: "orgA",
      roles: ["org_member"],
    });
    await expect(memberCtx.firestore().collection("orgs").get()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });
});

describe("Organizations Collection - Create Access", () => {
  test("✅ ALLOW: Authenticated user can create org", async () => {
    const userCtx = testEnv.authenticatedContext("newuser1", {
      roles: [],
    });
    await expect(
      userCtx.firestore().collection("orgs").doc("newOrg").set({
        name: "New Organization",
        createdAt: new Date().toISOString(),
        createdBy: "newuser1",
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Unauthenticated user cannot create org", async () => {
    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(
      unauthCtx.firestore().collection("orgs").doc("newOrg").set({
        name: "New Organization",
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});

describe("Organizations Collection - Update Access", () => {
  test("❌ DENY: Regular member cannot update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const memberCtx = testEnv.authenticatedContext("member1", {
      orgId: "orgA",
      roles: ["org_member"],
    });
    await expect(
      memberCtx.firestore().doc("orgs/orgA").update({
        name: "Updated Name",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("❌ DENY: Staff cannot update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA").update({
        name: "Updated Name",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA").update({
        name: "Updated by Manager",
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Admin can update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const adminCtx = testEnv.authenticatedContext("admin1", {
      orgId: "orgA",
      roles: ["admin"],
    });
    await expect(
      adminCtx.firestore().doc("orgs/orgA").update({
        name: "Updated by Admin",
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Org owner can update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const ownerCtx = testEnv.authenticatedContext("owner1", {
      orgId: "orgA",
      roles: ["org_owner"],
    });
    await expect(
      ownerCtx.firestore().doc("orgs/orgA").update({
        name: "Updated by Owner",
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager from different org cannot update org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const outsiderManagerCtx = testEnv.authenticatedContext("manager2", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      outsiderManagerCtx.firestore().doc("orgs/orgA").update({
        name: "Malicious Update",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});

describe("Organizations Collection - Delete Access", () => {
  test("✅ ALLOW: Org owner can delete org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const ownerCtx = testEnv.authenticatedContext("owner1", {
      orgId: "orgA",
      roles: ["org_owner"],
    });
    await expect(ownerCtx.firestore().doc("orgs/orgA").delete()).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager cannot delete org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(managerCtx.firestore().doc("orgs/orgA").delete()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });

  test("❌ DENY: Staff cannot delete org", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({
        name: "Organization A",
        createdAt: new Date().toISOString(),
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(staffCtx.firestore().doc("orgs/orgA").delete()).rejects.toThrow(
      /PERMISSION_DENIED/,
    );
  });
});
