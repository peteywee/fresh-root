// [P1][INTEGRITY][TEST] Attendance rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, ATTENDANCE
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Attendance Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const SCHED_ID = "test-sched-456";
  const SHIFT_ID = "test-shift-789";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const SCHEDULER_UID = "scheduler-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-attendance-mts");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org member can read attendance record", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `attendance_records/${ORG_ID}/records/att-1`), {
          id: "att-1",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "checked_in",
          scheduledStart: Date.now() - 2 * 60 * 60 * 1000,
          scheduledEnd: Date.now() + 6 * 60 * 60 * 1000,
          actualCheckIn: Date.now() - 2 * 60 * 60 * 1000,
          checkInMethod: "qr_code",
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
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
      await assertSucceeds(getDoc(doc(db, `attendance_records/${ORG_ID}/records/att-1`)));
    });

    it("DENY: non-member cannot read attendance record", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `attendance_records/${ORG_ID}/records/att-1`)));
    });

    it("DENY: unauthenticated cannot read attendance record", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `attendance_records/${ORG_ID}/records/att-1`)));
    });

    it("DENY: listing all attendance records forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `attendance_records/${ORG_ID}/records`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: scheduler+ can create attendance record", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `attendance_records/${ORG_ID}/records/new-att`), {
          id: "new-att",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can create attendance record", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `attendance_records/${ORG_ID}/records/new-att-2`), {
          id: "new-att-2",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create attendance record", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `attendance_records/${ORG_ID}/records/new-att-3`), {
          id: "new-att-3",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create attendance record", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `attendance_records/${ORG_ID}/records/new-att-4`), {
          id: "new-att-4",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: "anon",
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
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
        await setDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`), {
          id: "att-update",
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: scheduler can update attendance record", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`), {
          status: "checked_in",
          actualCheckIn: Date.now(),
          checkInMethod: "manual",
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can update attendance record", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`), {
          breakDuration: 45,
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update attendance record", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`), {
          status: "checked_out",
        }),
      );
    });

    it("DENY: non-member cannot update attendance record", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`), {
          status: "checked_out",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: manager can delete attendance record", async () => {
      const deleteAttId = `delete-att-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `attendance_records/${ORG_ID}/records/${deleteAttId}`), {
          id: deleteAttId,
          orgId: ORG_ID,
          shiftId: SHIFT_ID,
          scheduleId: SCHED_ID,
          staffUid: STAFF_UID,
          status: "scheduled",
          scheduledStart: Date.now(),
          scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        deleteDoc(doc(db, `attendance_records/${ORG_ID}/records/${deleteAttId}`)),
      );
    });

    it("DENY: scheduler cannot delete attendance record", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertFails(deleteDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`)));
    });

    it("DENY: staff cannot delete attendance record", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `attendance_records/${ORG_ID}/records/att-update`)));
    });
  });
});
