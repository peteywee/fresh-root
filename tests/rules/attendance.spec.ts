// [P1][INTEGRITY][TEST] Attendance rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, ATTENDANCE
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Attendance Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-attendance";
  const SHIFT_ID = "shift-attendance-123";
  const ATTENDANCE_ID = "attendance-456";
  const USER_UID = "user-attendance";
  const MANAGER_UID = "manager-attendance";
  const OTHER_UID = "other-attendance";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-attendance-ts");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, `organizations/${ORG_ID}`), { id: ORG_ID, name: "Test Org" });
      await setDoc(doc(db, `memberships/${USER_UID}_${ORG_ID}`), {
        uid: USER_UID,
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await setDoc(doc(db, `memberships/${MANAGER_UID}_${ORG_ID}`), {
        uid: MANAGER_UID,
        orgId: ORG_ID,
        roles: ["manager"],
      });
      await setDoc(doc(db, `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`), {
        id: ATTENDANCE_ID,
        orgId: ORG_ID,
        shiftId: SHIFT_ID,
        staffUid: USER_UID,
        status: "checked_in",
        checkInTime: Date.now(),
        createdAt: Date.now(),
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: user can read their own attendance", async () => {
      const userContext = testEnv.authenticatedContext(USER_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await assertSucceeds(
        getDoc(
          doc(userContext.firestore(), `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`),
        ),
      );
    });

    it("ALLOW: manager can read any attendance", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      await assertSucceeds(
        getDoc(
          doc(managerContext.firestore(), `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`),
        ),
      );
    });

    it("DENY: non-member cannot read attendance", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      await assertFails(
        getDoc(
          doc(otherContext.firestore(), `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`),
        ),
      );
    });
  });

  describe("Write access", () => {
    it("DENY: user cannot create their own check-in (scheduler/manager only)", async () => {
      const userContext = testEnv.authenticatedContext(USER_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const newAttendance = {
        id: "attendance-new",
        orgId: ORG_ID,
        shiftId: SHIFT_ID,
        staffUid: USER_UID,
        status: "checked_in",
        checkInTime: Date.now(),
        createdAt: Date.now(),
      };
      await assertFails(
        setDoc(
          doc(userContext.firestore(), `attendance_records/${ORG_ID}/records/${newAttendance.id}`),
          newAttendance,
        ),
      );
    });

    it("DENY: user cannot create attendance for others", async () => {
      const userContext = testEnv.authenticatedContext(USER_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const fakeAttendance = {
        id: "attendance-fake",
        orgId: ORG_ID,
        shiftId: SHIFT_ID,
        staffUid: OTHER_UID,
        status: "checked_in",
        checkInTime: Date.now(),
        createdAt: Date.now(),
      };
      await assertFails(
        setDoc(
          doc(userContext.firestore(), `attendance_records/${ORG_ID}/records/${fakeAttendance.id}`),
          fakeAttendance,
        ),
      );
    });

    it("DENY: user cannot update their own check-out (scheduler/manager only)", async () => {
      const userContext = testEnv.authenticatedContext(USER_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await assertFails(
        updateDoc(
          doc(userContext.firestore(), `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`),
          {
            status: "checked_out",
            checkOutTime: Date.now(),
          },
        ),
      );
    });

    it("ALLOW: manager can update any attendance", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      await assertSucceeds(
        updateDoc(
          doc(managerContext.firestore(), `attendance_records/${ORG_ID}/records/${ATTENDANCE_ID}`),
          {
            status: "approved",
          },
        ),
      );
    });
  });
});
