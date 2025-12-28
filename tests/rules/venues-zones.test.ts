// [P1][TEST][RULES] Venues and Zones collection Firestore rules tests
// Tags: P1, TEST, RULES, VENUES, ZONES, RBAC

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

import { createRulesTestEnv, ctxAnon, ctxUser, type AuthToken } from "./helpers";

describe("venues and zones collections", () => {
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

      // Seed venue
      await ctx
        .firestore()
        .collection("venues")
        .doc("org-123")
        .collection("venues")
        .doc("venue-1")
        .set({
          name: "Main Office",
          orgId: "org-123",
          address: "123 Main St",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed zone
      await ctx
        .firestore()
        .collection("zones")
        .doc("org-123")
        .collection("zones")
        .doc("zone-1")
        .set({
          name: "Front Desk",
          orgId: "org-123",
          venueId: "venue-1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed memberships
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
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("venues collection", () => {
    describe("unauthenticated access", () => {
      it("should deny reading venues without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertFails(venueRef.get());
      });

      it("should deny writing venues without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-new");

        await assertFails(
          venueRef.set({
            name: "New Venue",
            orgId: "org-123",
            createdAt: Date.now(),
          })
        );
      });
    });

    describe("staff role access", () => {
      const staffClaims: AuthToken = { orgId: "org-123", roles: ["staff"] };

      it("should allow staff to read venues in their org", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertSucceeds(venueRef.get());
      });

      it("should deny staff from creating venues", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-new");

        await assertFails(
          venueRef.set({
            name: "New Venue",
            orgId: "org-123",
            createdAt: Date.now(),
          })
        );
      });

      it("should deny staff from updating venues", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertFails(venueRef.update({ name: "Modified Venue" }));
      });
    });

    describe("manager role access", () => {
      const managerClaims: AuthToken = { orgId: "org-123", roles: ["manager"] };

      it("should allow manager to read venues", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertSucceeds(venueRef.get());
      });

      it("should allow manager to create venues", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-new");

        await assertSucceeds(
          venueRef.set({
            name: "New Venue",
            orgId: "org-123",
            address: "456 Oak St",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        );
      });

      it("should allow manager to update venues", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertSucceeds(venueRef.update({ name: "Updated Office" }));
      });

      it("should deny manager from deleting venues (owner/admin only)", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertFails(venueRef.delete());
      });
    });

    describe("admin and owner role access", () => {
      it("should allow admin to delete venues", async () => {
        const ctx = ctxUser(testEnv, "user-admin", { orgId: "org-123", roles: ["admin"] });
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertSucceeds(venueRef.delete());
      });

      it("should allow org_owner to delete venues", async () => {
        const ctx = ctxUser(testEnv, "user-owner", { orgId: "org-123", roles: ["org_owner"] });

        // Create a venue first
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-temp");
        await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
          await adminCtx
            .firestore()
            .collection("venues")
            .doc("org-123")
            .collection("venues")
            .doc("venue-temp")
            .set({
              name: "Temp Venue",
              orgId: "org-123",
              createdAt: Date.now(),
            });
        });

        await assertSucceeds(venueRef.delete());
      });
    });

    describe("tenant isolation", () => {
      it("should deny cross-org venue access", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertFails(venueRef.get());
      });

      it("should deny cross-org venue writes", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const venueRef = ctx.firestore().collection("venues").doc("org-123").collection("venues").doc("venue-1");

        await assertFails(venueRef.update({ name: "Hacked" }));
      });
    });

    describe("listing prevention", () => {
      it("should block listing venues (no enumeration)", async () => {
        const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
        const venueCol = ctx.firestore().collection("venues").doc("org-123").collection("venues");

        await assertFails(venueCol.get());
      });
    });
  });

  describe("zones collection", () => {
    describe("unauthenticated access", () => {
      it("should deny reading zones without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertFails(zoneRef.get());
      });

      it("should deny writing zones without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-new");

        await assertFails(
          zoneRef.set({
            name: "New Zone",
            orgId: "org-123",
            createdAt: Date.now(),
          })
        );
      });
    });

    describe("staff role access", () => {
      const staffClaims: AuthToken = { orgId: "org-123", roles: ["staff"] };

      it("should allow staff to read zones in their org", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertSucceeds(zoneRef.get());
      });

      it("should deny staff from creating zones", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-new");

        await assertFails(
          zoneRef.set({
            name: "New Zone",
            orgId: "org-123",
            createdAt: Date.now(),
          })
        );
      });
    });

    describe("manager role access", () => {
      const managerClaims: AuthToken = { orgId: "org-123", roles: ["manager"] };

      it("should allow manager to read zones", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertSucceeds(zoneRef.get());
      });

      it("should allow manager to create zones", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-new");

        await assertSucceeds(
          zoneRef.set({
            name: "Kitchen",
            orgId: "org-123",
            venueId: "venue-1",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        );
      });

      it("should allow manager to update zones", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertSucceeds(zoneRef.update({ name: "Reception Area" }));
      });

      it("should allow manager to delete zones", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertSucceeds(zoneRef.delete());
      });
    });

    describe("tenant isolation", () => {
      it("should deny cross-org zone access", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertFails(zoneRef.get());
      });

      it("should deny cross-org zone writes", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const zoneRef = ctx.firestore().collection("zones").doc("org-123").collection("zones").doc("zone-1");

        await assertFails(zoneRef.update({ name: "Hacked" }));
      });
    });

    describe("listing prevention", () => {
      it("should block listing zones (no enumeration)", async () => {
        const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
        const zoneCol = ctx.firestore().collection("zones").doc("org-123").collection("zones");

        await assertFails(zoneCol.get());
      });
    });
  });
});
