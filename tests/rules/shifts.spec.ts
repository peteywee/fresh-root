// [P0][TEST][TEST] Shifts Spec tests
// Tags: P0, TEST, TEST
export {};
// [P1][INTEGRITY][TEST] Firestore rules tests for shifts collection
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SECURITY, RBAC
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";

import { DENY_RE, initFirestoreTestEnv } from "./_setup";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initFirestoreTestEnv("fresh-schedules-test-shifts");
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Shifts Collection - Read Access", () => {
  test("✅ ALLOW: Member can read shifts in their org's schedules", async () => {
    // Setup: Create org, schedule, and shift
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1 Schedule",
        status: "draft",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "user1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
        positionId: "pos1",
      });
    });

    // Test: Member can read shifts in their org
    const memberCtx = testEnv.authenticatedContext("member1", {
      orgId: "orgA",
      roles: ["org_member"],
    });
    await expect(
      memberCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").get(),
    ).resolves.toBeTruthy();
  });

  test("❌ DENY: Unauthenticated user cannot read shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "user1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(
      unauthCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").get(),
    ).rejects.toThrow(DENY_RE);
  });

  test("❌ DENY: Cannot read shifts from other orgs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "user1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    // User from orgB tries to read orgA shift
    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["org_member"],
    });
    await expect(
      outsiderCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").get(),
    ).rejects.toThrow(DENY_RE);
  });

  test("✅ ALLOW: Staff can list their own shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift2").set({
        userId: "staff2",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().collection("orgs/orgA/schedules/sched1/shifts").get(),
    ).resolves.toBeTruthy();
  });
});

describe("Shifts Collection - Create Access", () => {
  test("❌ DENY: Staff cannot assign shifts to others (only self or managers)", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
        status: "draft",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    // Staff tries to assign shift to another user
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/newShift").set({
        userId: "staff2", // Different user
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
        positionId: "pos1",
      }),
    ).rejects.toThrow(DENY_RE);
  });

  test("❌ DENY: Staff cannot create shifts in other orgs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgB",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/newShift").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      }),
    ).rejects.toThrow(DENY_RE);
  });

  test("✅ ALLOW: Manager can create shifts for any user", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
        status: "draft",
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/newShift").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
        positionId: "pos1",
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Scheduler can create shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
        status: "draft",
      });
    });

    const schedulerCtx = testEnv.authenticatedContext("scheduler1", {
      orgId: "orgA",
      roles: ["scheduler"],
    });
    await expect(
      schedulerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/newShift").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
        positionId: "pos1",
      }),
    ).resolves.toBeUndefined();
  });
});

describe("Shifts Collection - Update Access", () => {
  test("✅ ALLOW: Staff can update their own shift notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
        notes: "",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        notes: "I will be 15 minutes late",
      }),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Staff can check in to their own shift", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        checkInTime: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Staff cannot update other users' shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff2",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        notes: "Malicious update",
      }),
    ).rejects.toThrow(DENY_RE);
  });

  test("❌ DENY: Staff cannot change shift assignment (userId)", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        userId: "staff2", // Trying to reassign
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can update any shift", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
        end: "2024-01-01T17:00:00Z",
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        userId: "staff2", // Reassign
        start: "2024-01-01T10:00:00Z", // Change time
      }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager from different org cannot update shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const outsiderManagerCtx = testEnv.authenticatedContext("manager2", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      outsiderManagerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").update({
        notes: "Malicious",
      }),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});

describe("Shifts Collection - Delete Access", () => {
  test("❌ DENY: Staff cannot delete shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const staffCtx = testEnv.authenticatedContext("staff1", {
      orgId: "orgA",
      roles: ["staff"],
    });
    await expect(
      staffCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").delete(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });

  test("✅ ALLOW: Manager can delete any shift", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", {
      orgId: "orgA",
      roles: ["manager"],
    });
    await expect(
      managerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").delete(),
    ).resolves.toBeUndefined();
  });

  test("✅ ALLOW: Scheduler can delete shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const schedulerCtx = testEnv.authenticatedContext("scheduler1", {
      orgId: "orgA",
      roles: ["scheduler"],
    });
    await expect(
      schedulerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").delete(),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Manager from different org cannot delete shifts", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("orgs").doc("orgA").set({ name: "Org A" });
      await context.firestore().doc("orgs/orgA/schedules/sched1").set({
        name: "Week 1",
      });
      await context.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").set({
        userId: "staff1",
        start: "2024-01-01T09:00:00Z",
      });
    });

    const outsiderManagerCtx = testEnv.authenticatedContext("manager2", {
      orgId: "orgB",
      roles: ["manager"],
    });
    await expect(
      outsiderManagerCtx.firestore().doc("orgs/orgA/schedules/sched1/shifts/shift1").delete(),
    ).rejects.toThrow(/PERMISSION_DENIED/);
  });
});
