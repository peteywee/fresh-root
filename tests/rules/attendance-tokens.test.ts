// [P1][TEST][RULES] Attendance records and Join tokens Firestore rules tests
// Tags: P1, TEST, RULES, ATTENDANCE, TOKENS, RBAC

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

import { createRulesTestEnv, ctxAnon, ctxUser, type AuthToken } from "./helpers";

describe("attendance records and join tokens", () => {
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

      // Seed attendance record
      await ctx
        .firestore()
        .collection("attendance_records")
        .doc("org-123")
        .collection("records")
        .doc("record-1")
        .set({
          userId: "user-staff",
          shiftId: "shift-1",
          orgId: "org-123",
          checkInTime: Date.now(),
          status: "present",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

      // Seed join token (under /orgs/)
      await ctx
        .firestore()
        .collection("orgs")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-1")
        .set({
          token: "invite-abc123",
          orgId: "org-123",
          role: "staff",
          expiresAt: Date.now() + 86400000,
          createdBy: "user-manager",
          createdAt: Date.now(),
        });

      // Seed join token (top-level /join_tokens/)
      await ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-2")
        .set({
          token: "invite-xyz789",
          orgId: "org-123",
          role: "staff",
          expiresAt: Date.now() + 86400000,
          createdBy: "user-manager",
          createdAt: Date.now(),
        });

      // Seed memberships
      await ctx
        .firestore()
        .collection("memberships")
        .doc("user-staff_org-123")
        .set({
          uid: "user-staff",
          orgId: "org-123",
          roles: ["staff"],
          status: "active",
          createdAt: Date.now(),
        });

      await ctx
        .firestore()
        .collection("memberships")
        .doc("user-scheduler_org-123")
        .set({
          uid: "user-scheduler",
          orgId: "org-123",
          roles: ["scheduler"],
          status: "active",
          createdAt: Date.now(),
        });

      await ctx
        .firestore()
        .collection("memberships")
        .doc("user-manager_org-123")
        .set({
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

  describe("attendance_records collection", () => {
    describe("unauthenticated access", () => {
      it("should deny reading attendance records without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertFails(recordRef.get());
      });

      it("should deny writing attendance records without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-new");

        await assertFails(
          recordRef.set({
            userId: "user-staff",
            shiftId: "shift-1",
            orgId: "org-123",
            status: "present",
            createdAt: Date.now(),
          }),
        );
      });
    });

    describe("staff role access (read-only)", () => {
      const staffClaims: AuthToken = { orgId: "org-123", roles: ["staff"] };

      it("should allow staff to read attendance records in their org", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertSucceeds(recordRef.get());
      });

      it("should deny staff from creating attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-new");

        await assertFails(
          recordRef.set({
            userId: "user-staff",
            shiftId: "shift-1",
            orgId: "org-123",
            status: "present",
            createdAt: Date.now(),
          }),
        );
      });

      it("should deny staff from updating attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertFails(recordRef.update({ status: "absent" }));
      });
    });

    describe("scheduler role access (full CRUD)", () => {
      const schedulerClaims: AuthToken = { orgId: "org-123", roles: ["scheduler"] };

      it("should allow scheduler to read attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-scheduler", schedulerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertSucceeds(recordRef.get());
      });

      it("should allow scheduler to create attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-scheduler", schedulerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-new");

        await assertSucceeds(
          recordRef.set({
            userId: "user-staff",
            shiftId: "shift-2",
            orgId: "org-123",
            checkInTime: Date.now(),
            status: "present",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
        );
      });

      it("should allow scheduler to update attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-scheduler", schedulerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertSucceeds(recordRef.update({ status: "late" }));
      });

      it("should deny scheduler from deleting attendance records (manager+ only)", async () => {
        const ctx = ctxUser(testEnv, "user-scheduler", schedulerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertFails(recordRef.delete());
      });
    });

    describe("manager role access", () => {
      const managerClaims: AuthToken = { orgId: "org-123", roles: ["manager"] };

      it("should allow manager to delete attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertSucceeds(recordRef.delete());
      });

      it("should allow manager to create attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-manager");

        await assertSucceeds(
          recordRef.set({
            userId: "user-staff",
            shiftId: "shift-3",
            orgId: "org-123",
            status: "present",
            createdAt: Date.now(),
          }),
        );
      });
    });

    describe("tenant isolation", () => {
      it("should deny cross-org attendance record access", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["scheduler"] });
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertFails(recordRef.get());
      });

      it("should deny cross-org attendance record writes", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["scheduler"] });
        const recordRef = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records")
          .doc("record-1");

        await assertFails(recordRef.update({ status: "hacked" }));
      });
    });

    describe("listing prevention", () => {
      it("should block listing attendance records", async () => {
        const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
        const recordCol = ctx
          .firestore()
          .collection("attendance_records")
          .doc("org-123")
          .collection("records");

        await assertFails(recordCol.get());
      });
    });
  });

  describe("join_tokens collection (under /orgs/)", () => {
    describe("unauthenticated access", () => {
      it("should deny reading join tokens without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertFails(tokenRef.get());
      });

      it("should deny writing join tokens without auth", async () => {
        const ctx = ctxAnon(testEnv);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-new");

        await assertFails(
          tokenRef.set({
            token: "new-token",
            orgId: "org-123",
            role: "staff",
            createdAt: Date.now(),
          }),
        );
      });
    });

    describe("staff role access", () => {
      const staffClaims: AuthToken = { orgId: "org-123", roles: ["staff"] };

      it("should allow staff to read join tokens in their org", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertSucceeds(tokenRef.get());
      });

      it("should deny staff from creating join tokens", async () => {
        const ctx = ctxUser(testEnv, "user-staff", staffClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-new");

        await assertFails(
          tokenRef.set({
            token: "staff-token",
            orgId: "org-123",
            role: "staff",
            createdAt: Date.now(),
          }),
        );
      });
    });

    describe("manager role access (full CRUD)", () => {
      const managerClaims: AuthToken = { orgId: "org-123", roles: ["manager"] };

      it("should allow manager to read join tokens", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertSucceeds(tokenRef.get());
      });

      it("should allow manager to create join tokens", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-mgr");

        await assertSucceeds(
          tokenRef.set({
            token: "manager-created-token",
            orgId: "org-123",
            role: "staff",
            expiresAt: Date.now() + 86400000,
            createdBy: "user-manager",
            createdAt: Date.now(),
          }),
        );
      });

      it("should allow manager to update join tokens", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertSucceeds(tokenRef.update({ expiresAt: Date.now() + 172800000 }));
      });

      it("should allow manager to delete join tokens", async () => {
        const ctx = ctxUser(testEnv, "user-manager", managerClaims);
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertSucceeds(tokenRef.delete());
      });
    });

    describe("tenant isolation", () => {
      it("should deny cross-org join token access", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertFails(tokenRef.get());
      });

      it("should deny cross-org join token writes", async () => {
        const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
        const tokenRef = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens")
          .doc("token-1");

        await assertFails(tokenRef.update({ role: "admin" }));
      });
    });

    describe("listing prevention", () => {
      it("should block listing join tokens (no enumeration)", async () => {
        const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
        const tokenCol = ctx
          .firestore()
          .collection("orgs")
          .doc("org-123")
          .collection("join_tokens");

        await assertFails(tokenCol.get());
      });
    });
  });

  describe("join_tokens collection (top-level /join_tokens/)", () => {
    it("should allow manager to read tokens at top-level path", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const tokenRef = ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-2");

      await assertSucceeds(tokenRef.get());
    });

    it("should allow org_owner to create tokens at top-level path", async () => {
      // Note: top-level /join_tokens path write is restricted to org_owner/admin only
      const ctx = ctxUser(testEnv, "user-owner", { orgId: "org-123", roles: ["org_owner"] });
      const tokenRef = ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-top");

      await assertSucceeds(
        tokenRef.set({
          token: "top-level-token",
          orgId: "org-123",
          role: "staff",
          createdAt: Date.now(),
        }),
      );
    });

    it("should deny manager from creating tokens at top-level path", async () => {
      // Manager can only read at top-level /join_tokens path, not write
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const tokenRef = ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-mgr");

      await assertFails(
        tokenRef.set({
          token: "manager-token",
          orgId: "org-123",
          role: "staff",
          createdAt: Date.now(),
        }),
      );
    });

    it("should deny cross-org access at top-level path", async () => {
      const ctx = ctxUser(testEnv, "user-other", { orgId: "org-456", roles: ["manager"] });
      const tokenRef = ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens")
        .doc("token-2");

      await assertFails(tokenRef.get());
    });

    it("should block listing tokens at top-level path", async () => {
      const ctx = ctxUser(testEnv, "user-manager", { orgId: "org-123", roles: ["manager"] });
      const tokenCol = ctx
        .firestore()
        .collection("join_tokens")
        .doc("org-123")
        .collection("join_tokens");

      await assertFails(tokenCol.get());
    });
  });
});
