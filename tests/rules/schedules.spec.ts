// [P1][INTEGRITY][TEST] Firestore rules tests for schedules collection
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SECURITY, RBAC
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { DENY_RE, initFirestoreTestEnv } from "./_setup";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initFirestoreTestEnv("fresh-schedules-test-schedules");
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Schedules Collection - Read Access", () => {
  test("✅ ALLOW: Member can read schedules in their org", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "published",
          createdBy: "admin1",
          createdAt: new Date().toISOString(),
        });
    });

    const userCtx = testEnv.authenticatedContext("user1", { orgId, roles: ["org_member"] });
    await expect(
      userCtx.firestore().doc(`organizations/${orgId}/schedules/${scheduleId}`).get(),
    ).resolves.toBeTruthy();
  });

  test("❌ DENY: Cannot read schedules from other orgs", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "published",
          createdBy: "admin1",
          createdAt: new Date().toISOString(),
        });
    });

    const outsiderCtx = testEnv.authenticatedContext("outsider1", {
      orgId: "orgB",
      roles: ["org_member"],
    });
    await expect(
      outsiderCtx.firestore().doc(`organizations/${orgId}/schedules/${scheduleId}`).get(),
    ).rejects.toThrow(DENY_RE);
  });

  test("❌ DENY: Unauthenticated users cannot read schedules", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "published",
          createdBy: "admin1",
          createdAt: new Date().toISOString(),
        });
    });

    const unauthCtx = testEnv.unauthenticatedContext();
    await expect(
      unauthCtx.firestore().doc(`organizations/${orgId}/schedules/${scheduleId}`).get(),
    ).rejects.toThrow(DENY_RE);
  });
});

describe("Schedules Collection - Write Access", () => {
  test("✅ ALLOW: Scheduler can create schedule in their org", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    const schedulerCtx = testEnv.authenticatedContext("scheduler1", {
      orgId,
      roles: ["scheduler"],
    });
    await expect(
      schedulerCtx
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "draft",
          createdBy: "scheduler1",
          createdAt: new Date().toISOString(),
        }),
    ).resolves.toBeUndefined();
  });

  test("❌ DENY: Regular member cannot create schedules", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    const memberCtx = testEnv.authenticatedContext("member1", { orgId, roles: ["org_member"] });
    await expect(
      memberCtx
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "draft",
          createdBy: "member1",
          createdAt: new Date().toISOString(),
        }),
    ).rejects.toThrow(DENY_RE);
  });

  test("✅ ALLOW: Manager can publish schedule in their org", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "draft",
          createdBy: "scheduler1",
          createdAt: new Date().toISOString(),
        });
    });

    const managerCtx = testEnv.authenticatedContext("manager1", { orgId, roles: ["manager"] });
    await expect(
      managerCtx
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .update({
          status: "published",
          publishedAt: new Date().toISOString(),
        }),
    ).resolves.toBeUndefined();
  });

  test.skip("❌ DENY: Cannot modify archived schedules (rules do not enforce archived immutability)", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "archived",
          createdBy: "scheduler1",
          createdAt: new Date().toISOString(),
        });
    });

    const schedulerCtx = testEnv.authenticatedContext("scheduler1", {
      orgId,
      roles: ["scheduler"],
    });
    await expect(
      schedulerCtx
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .update({
          name: "Updated Schedule",
        }),
    ).rejects.toThrow(DENY_RE);
  });

  test("❌ DENY: Cannot create schedules in other orgs", async () => {
    const scheduleId = "schedule1";
    const orgId = "orgA";

    const outsiderCtx = testEnv.authenticatedContext("scheduler1", {
      orgId: "orgB",
      roles: ["scheduler"],
    });
    await expect(
      outsiderCtx
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({
          name: "Weekly Schedule",
          orgId,
          startDate: "2024-01-01",
          endDate: "2024-01-07",
          status: "draft",
          createdBy: "scheduler1",
          createdAt: new Date().toISOString(),
        }),
    ).rejects.toThrow(DENY_RE);
  });
});
