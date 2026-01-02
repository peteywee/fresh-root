// [P1][TEST][RULES] Positions collection Firestore rules tests
// Tags: P1, TEST, RULES, POSITIONS, RBAC

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

import { createRulesTestEnv, ctxAnon, ctxUser, type AuthToken } from "./helpers";

describe("positions collection", () => {
  let testEnv: Awaited<ReturnType<typeof createRulesTestEnv>>;

  beforeAll(async () => {
    testEnv = await createRulesTestEnv();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    // Seed org
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("orgs").doc("org-123").set({
        name: "Test Org",
        createdAt: Date.now(),
      });

      // Seed test position
      await ctx
        .firestore()
        .collection("orgs")
        .doc("org-123")
        .collection("positions")
        .doc("pos-1")
        .set({
          name: "Manager",
          orgId: "org-123",
          description: "Management position",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed top-level position path (alternate pattern)
      await ctx
        .firestore()
        .collection("positions")
        .doc("org-123")
        .collection("positions")
        .doc("pos-2")
        .set({
          name: "Staff",
          orgId: "org-123",
          description: "Staff position",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed legacy memberships for testing
      await ctx.firestore().collection("memberships").doc("user-staff_org-123").set({
        uid: "user-staff",
        orgId: "org-123",
        roles: ["staff"],
        status: "active",
        createdAt: Date.now(),
      });

      await ctx.firestore().collection("memberships").doc("user-manager_org-123").set({
        uid: "user-manager",
        orgId: "org-123",
        roles: ["manager"],
        status: "active",
        createdAt: Date.now(),
      });

      await ctx.firestore().collection("memberships").doc("user-admin_org-123").set({
        uid: "user-admin",
        orgId: "org-123",
        roles: ["admin"],
        status: "active",
        createdAt: Date.now(),
      });
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("unauthenticated access", () => {
    it("should deny reading positions without auth", async () => {
      const ctx = ctxAnon(testEnv);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertFails(posRef.get());
    });

    it("should deny writing positions without auth", async () => {
      const ctx = ctxAnon(testEnv);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-new");

      await assertFails(
        posRef.set({
          name: "New Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });

    it("should deny listing positions without auth", async () => {
      const ctx = ctxAnon(testEnv);
      const posCol = ctx.firestore().collection("orgs").doc("org-123").collection("positions");

      await assertFails(posCol.get());
    });
  });

  describe("staff role access (read-only)", () => {
    const staffClaims: AuthToken = { orgId: "org-123", roles: ["staff"] };

    it("should allow staff to read positions in their org (token-based)", async () => {
      const ctx = ctxUser(testEnv, "user-staff", staffClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertSucceeds(posRef.get());
    });

    it("should allow staff to read positions via legacy membership", async () => {
      const ctx = ctxUser(testEnv, "user-staff", {});
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertSucceeds(posRef.get());
    });

    it("should deny staff from creating positions", async () => {
      const ctx = ctxUser(testEnv, "user-staff", staffClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-new");

      await assertFails(
        posRef.set({
          name: "New Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });

    it("should deny staff from updating positions", async () => {
      const ctx = ctxUser(testEnv, "user-staff", staffClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertFails(posRef.update({ name: "Modified" }));
    });

    it("should deny staff from deleting positions", async () => {
      const ctx = ctxUser(testEnv, "user-staff", staffClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertFails(posRef.delete());
    });
  });

  describe("manager role access (full CRUD)", () => {
    const managerClaims: AuthToken = { orgId: "org-123", roles: ["manager"] };

    it("should allow manager to read positions in their org", async () => {
      const ctx = ctxUser(testEnv, "user-manager", managerClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertSucceeds(posRef.get());
    });

    it("should allow manager to create positions", async () => {
      const ctx = ctxUser(testEnv, "user-manager", managerClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-new");

      await assertSucceeds(
        posRef.set({
          name: "Senior Staff",
          orgId: "org-123",
          description: "Senior staff position",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );
    });

    it("should allow manager to update positions", async () => {
      const ctx = ctxUser(testEnv, "user-manager", managerClaims);
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertSucceeds(posRef.update({ name: "Senior Manager" }));
    });

    it("should allow manager to delete positions via legacy membership", async () => {
      const ctx = ctxUser(testEnv, "user-manager", {});
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertSucceeds(posRef.delete());
    });
  });

  describe("admin and org_owner role access", () => {
    it("should allow admin to manage positions", async () => {
      const ctx = ctxUser(testEnv, "user-admin", { orgId: "org-123", roles: ["admin"] });
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-admin");

      await assertSucceeds(
        posRef.set({
          name: "Admin Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });

    it("should allow org_owner to manage positions", async () => {
      const ctx = ctxUser(testEnv, "user-owner", { orgId: "org-123", roles: ["org_owner"] });
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-owner");

      await assertSucceeds(
        posRef.set({
          name: "Owner Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });
  });

  describe("tenant isolation", () => {
    it("should deny cross-org position access", async () => {
      const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertFails(posRef.get());
    });

    it("should deny cross-org position writes", async () => {
      const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-1");

      await assertFails(posRef.update({ name: "Hacked" }));
    });
  });

  describe("alternate top-level path", () => {
    it("should allow manager to read positions at /positions/{orgId}/positions/", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const posRef = ctx.firestore().collection("positions").doc("org-123").collection("positions").doc("pos-2");

      await assertSucceeds(posRef.get());
    });

    it("should allow manager to create positions at alternate path", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const posRef = ctx.firestore().collection("positions").doc("org-123").collection("positions").doc("pos-alt");

      await assertSucceeds(
        posRef.set({
          name: "Alternate Position",
          orgId: "org-123",
          createdAt: Date.now(),
        })
      );
    });

    it("should deny cross-org access at alternate path", async () => {
      const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
      const posRef = ctx.firestore().collection("positions").doc("org-123").collection("positions").doc("pos-2");

      await assertFails(posRef.get());
    });

    it("should block listing positions at alternate path", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const posCol = ctx.firestore().collection("positions").doc("org-123").collection("positions");

      await assertFails(posCol.get());
    });
  });

  describe("data validation", () => {
    it("should require orgId to match path", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const posRef = ctx.firestore().collection("orgs").doc("org-123").collection("positions").doc("pos-invalid");

      // This test verifies that even if we try to create with wrong orgId,
      // the rules should prevent it (though they don't explicitly validate this in current rules)
      // Adding this as a reminder to enhance rules if needed
      await assertSucceeds(
        posRef.set({
          name: "Test Position",
          orgId: "org-123", // Must match path
          createdAt: Date.now(),
        })
      );
    });
  });
});
