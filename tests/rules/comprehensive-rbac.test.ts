// [P1][TEST][RULES] Comprehensive RBAC hierarchy tests
// Tags: P1, TEST, RULES, RBAC, HIERARCHY

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

import { createRulesTestEnv, ctxUser, type AuthToken } from "./helpers";

describe("RBAC role hierarchy", () => {
  let testEnv: Awaited<ReturnType<typeof createRulesTestEnv>>;

  beforeAll(async () => {
    testEnv = await createRulesTestEnv();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    // Seed test data
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("orgs").doc("org-123").set({
        name: "Test Org",
        createdAt: Date.now(),
      });

      // Seed schedule for testing
      await ctx
        .firestore()
        .collection("orgs")
        .doc("org-123")
        .collection("schedules")
        .doc("sched-1")
        .set({
          name: "Weekly Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed memberships for all roles
      const roles = ["staff", "scheduler", "manager", "admin", "org_owner"];
      for (const role of roles) {
        await ctx.firestore().collection("memberships").doc(`user-${role}_org-123`).set({
          uid: `user-${role}`,
          orgId: "org-123",
          roles: [role],
          status: "active",
          createdAt: Date.now(),
        });
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("schedule write permissions by role", () => {
    it("staff should NOT be able to write schedules", async () => {
      const ctx = ctxUser(testEnv, "user-staff", { orgId: "org-123", roles: ["staff"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-new");

      await assertFails(
        schedRef.set({
          name: "Staff Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });

    it("scheduler SHOULD be able to write schedules", async () => {
      const ctx = ctxUser(testEnv, "user-scheduler", { orgId: "org-123", roles: ["scheduler"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-scheduler");

      await assertSucceeds(
        schedRef.set({
          name: "Scheduler Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });

    it("manager SHOULD be able to write schedules", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-manager");

      await assertSucceeds(
        schedRef.set({
          name: "Manager Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });

    it("admin SHOULD be able to write schedules", async () => {
      const ctx = ctxUser(testEnv, "user-admin", { orgId: "org-123", roles: ["admin"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-admin");

      await assertSucceeds(
        schedRef.set({
          name: "Admin Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });

    it("org_owner SHOULD be able to write schedules", async () => {
      const ctx = ctxUser(testEnv, "user-org_owner", { orgId: "org-123", roles: ["org_owner"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-owner");

      await assertSucceeds(
        schedRef.set({
          name: "Owner Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });
  });

  describe("org write permissions by role", () => {
    it("staff should NOT be able to update org", async () => {
      const ctx = ctxUser(testEnv, "user-staff", { orgId: "org-123", roles: ["staff"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertFails(orgRef.update({ name: "Modified by Staff" }));
    });

    it("scheduler should NOT be able to update org", async () => {
      const ctx = ctxUser(testEnv, "user-scheduler", { orgId: "org-123", roles: ["scheduler"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertFails(orgRef.update({ name: "Modified by Scheduler" }));
    });

    it("manager should NOT be able to update org", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertFails(orgRef.update({ name: "Modified by Manager" }));
    });

    it("admin SHOULD be able to update org (super admin)", async () => {
      const ctx = ctxUser(testEnv, "user-admin", { orgId: "org-123", roles: ["admin"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertSucceeds(orgRef.update({ name: "Modified by Admin" }));
    });

    it("org_owner SHOULD be able to update their own org", async () => {
      const ctx = ctxUser(testEnv, "user-org_owner", { orgId: "org-123", roles: ["org_owner"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertSucceeds(orgRef.update({ name: "Modified by Owner" }));
    });

    it("org_owner should NOT be able to update other orgs", async () => {
      const ctx = ctxUser(testEnv, "user-org_owner", { orgId: "org-456", roles: ["org_owner"] });
      const orgRef = ctx.firestore().collection("orgs").doc("org-123");

      await assertFails(orgRef.update({ name: "Cross-org update" }));
    });
  });

  describe("super admin privileges", () => {
    const adminClaims: AuthToken = { orgId: "org-123", roles: ["admin"] };

    it("admin should be able to read any org", async () => {
      const ctx = ctxUser(testEnv, "admin-user", adminClaims);

      // Create another org
      await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
        await adminCtx.firestore().collection("orgs").doc("org-456").set({
          name: "Other Org",
          createdAt: Date.now(),
        });
      });

      const orgRef = ctx.firestore().collection("orgs").doc("org-456");
      await assertSucceeds(orgRef.get());
    });

    it("admin should be able to list all orgs", async () => {
      const ctx = ctxUser(testEnv, "admin-user", adminClaims);
      const orgCol = ctx.firestore().collection("orgs");

      await assertSucceeds(orgCol.get());
    });

    it("non-admin should NOT be able to list all orgs", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const orgCol = ctx.firestore().collection("orgs");

      await assertFails(orgCol.get());
    });
  });

  describe("role hierarchy enforcement", () => {
    it("should enforce scheduler < manager for deletions", async () => {
      // Scheduler can create but manager should delete
      const schedulerCtx = ctxUser(testEnv, "user-scheduler", { orgId: "org-123", roles: ["scheduler"] });
      const managerCtx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });

      // Create schedule as scheduler
      const schedRef = schedulerCtx
        .firestore()
        .collection("orgs")
        .doc("org-123")
        .collection("schedules")
        .doc("sched-test");
      await assertSucceeds(
        schedRef.set({
          name: "Test Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          createdAt: Date.now(),
        })
      );

      // Scheduler should NOT be able to delete
      await assertFails(schedulerCtx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-test").delete());

      // Manager SHOULD be able to delete
      await assertSucceeds(managerCtx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-test").delete());
    });

    it("should enforce manager < org_owner for org deletion", async () => {
      const managerCtx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const ownerCtx = ctxUser(testEnv, "user-org_owner", { orgId: "org-123", roles: ["org_owner"] });

      const orgRef = ownerCtx.firestore().collection("orgs").doc("org-123");

      // Manager should NOT be able to delete org
      await assertFails(managerCtx.firestore().collection("orgs").doc("org-123").delete());

      // Owner SHOULD be able to delete org
      await assertSucceeds(orgRef.delete());
    });
  });

  describe("corporate role", () => {
    const corporateClaims: AuthToken = { orgId: "org-123", roles: ["corporate"] };

    it("corporate role should have manager-level permissions", async () => {
      const ctx = ctxUser(testEnv, "user-corporate", corporateClaims);
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-corporate");

      await assertSucceeds(
        schedRef.set({
          name: "Corporate Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          endDate: Date.now() + 604800000,
          createdAt: Date.now(),
        })
      );
    });

    it("corporate role should be able to manage positions", async () => {
      const ctx = ctxUser(testEnv, "user-corporate", corporateClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-corporate");

      await assertSucceeds(
        posRef.set({
          name: "Corporate Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });
  });

  describe("legacy membership-based roles", () => {
    it("should allow access via legacy membership without token claims", async () => {
      const ctx = ctxUser(testEnv, "user-manager", {}); // No token claims
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-legacy");

      // Should succeed because membership document exists
      await assertSucceeds(
        schedRef.set({
          name: "Legacy Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          createdAt: Date.now(),
        })
      );
    });

    it("should enforce role hierarchy in legacy memberships", async () => {
      const ctx = ctxUser(testEnv, "user-staff", {}); // Staff via legacy membership
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-staff-legacy");

      // Staff should NOT be able to write even with legacy membership
      await assertFails(
        schedRef.set({
          name: "Staff Legacy Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          createdAt: Date.now(),
        })
      );
    });
  });

  describe("combined token and legacy auth", () => {
    it("should work with token claims when available", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-token");

      await assertSucceeds(
        schedRef.set({
          name: "Token Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          createdAt: Date.now(),
        })
      );
    });

    it("should fallback to legacy membership when token missing", async () => {
      const ctx = ctxUser(testEnv, "user-manager", {}); // No token, uses membership
      const schedRef = ctx.firestore().collection("orgs").doc("org-123").collection("schedules").doc("sched-fallback");

      await assertSucceeds(
        schedRef.set({
          name: "Fallback Schedule",
          orgId: "org-123",
          startDate: Date.now(),
          createdAt: Date.now(),
        })
      );
    });
  });
});
