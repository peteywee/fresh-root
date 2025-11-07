// [P1][INTEGRITY][TEST] Shifts rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SHIFTS
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Shifts Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const SCHED_ID = "test-sched-456";
  const _OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const SCHEDULER_UID = "scheduler-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-shifts-mts");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org member can read shift", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-1`), {
          id: "shift-1",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "published",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await setDoc(doc(db, `memberships/${STAFF_UID}_${ORG_ID}`), {
          uid: STAFF_UID,
          orgId: ORG_ID,
          roles: ["staff"],
        });
      });

      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertSucceeds(getDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-1`)));
    });

    it("DENY: non-member cannot read shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-1`)));
    });

    it("DENY: unauthenticated cannot read shift", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-1`)));
    });

    it("DENY: listing all shifts forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `shifts/${ORG_ID}/shifts`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: scheduler+ can create shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `shifts/${ORG_ID}/shifts/new-shift`), {
          id: "new-shift",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can create shift", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `shifts/${ORG_ID}/shifts/new-shift-2`), {
          id: "new-shift-2",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `shifts/${ORG_ID}/shifts/new-shift-3`), {
          id: "new-shift-3",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create shift", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `shifts/${ORG_ID}/shifts/new-shift-4`), {
          id: "new-shift-4",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: "anon",
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });
  });

  describe("Update access", () => {
    beforeAll(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`), {
          id: "shift-update",
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: scheduler can update shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`), {
          status: "published",
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can update shift", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`), {
          breakMinutes: 45,
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`), {
          status: "cancelled",
        }),
      );
    });

    it("DENY: non-member cannot update shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`), {
          status: "cancelled",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: manager can delete shift", async () => {
      const deleteShiftId = `delete-shift-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `shifts/${ORG_ID}/shifts/${deleteShiftId}`), {
          id: deleteShiftId,
          scheduleId: SCHED_ID,
          positionId: "pos-1",
          userId: STAFF_UID,
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "draft",
          breakMinutes: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `shifts/${ORG_ID}/shifts/${deleteShiftId}`)));
    });

    it("DENY: scheduler cannot delete shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertFails(deleteDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`)));
    });

    it("DENY: staff cannot delete shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `shifts/${ORG_ID}/shifts/shift-update`)));
    });
  });
});
