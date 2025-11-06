// [P1][INTEGRITY][TEST] Shifts rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SHIFTS
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

describe("Shifts Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-shifts";
  const SCHEDULE_ID = "schedule-123";
  const SHIFT_ID = "shift-456";
  const OWNER_UID = "owner-shifts";
  const SCHEDULER_UID = "scheduler-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-org-user";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project-shifts",
      firestore: {
        rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    
    // Setup test data
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      
      // Create org
      await setDoc(doc(db, `organizations/${ORG_ID}`), {
        id: ORG_ID,
        name: "Test Org",
        ownerId: OWNER_UID,
      });
      
      // Create memberships
      await setDoc(doc(db, `memberships/${SCHEDULER_UID}_${ORG_ID}`), {
        uid: SCHEDULER_UID,
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      
      await setDoc(doc(db, `memberships/${STAFF_UID}_${ORG_ID}`), {
        uid: STAFF_UID,
        orgId: ORG_ID,
        roles: ["staff"],
      });
      
      // Create schedule
      await setDoc(doc(db, `schedules/${SCHEDULE_ID}`), {
        id: SCHEDULE_ID,
        orgId: ORG_ID,
        name: "Week 1 Schedule",
        status: "draft",
      });
      
      // Create shift
      await setDoc(doc(db, `shifts/${SHIFT_ID}`), {
        id: SHIFT_ID,
        orgId: ORG_ID,
        scheduleId: SCHEDULE_ID,
        positionId: "pos-123",
        startTime: Date.now(),
        endTime: Date.now() + 8 * 60 * 60 * 1000,
        status: "draft",
        createdAt: Date.now(),
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: org member can read shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertSucceeds(getDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });

    it("DENY: non-member cannot read shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });

    it("DENY: unauthenticated cannot read shift", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });

    it("ALLOW: org member can list shifts for their schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      const shiftsQuery = query(
        collection(db, "shifts"),
        where("scheduleId", "==", SCHEDULE_ID),
        where("orgId", "==", ORG_ID)
      );
      await assertSucceeds(getDocs(shiftsQuery));
    });
  });

  describe("Create access", () => {
    it("ALLOW: scheduler can create shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      const newShift = {
        id: "new-shift-789",
        orgId: ORG_ID,
        scheduleId: SCHEDULE_ID,
        positionId: "pos-456",
        startTime: Date.now(),
        endTime: Date.now() + 8 * 60 * 60 * 1000,
        status: "draft",
        createdAt: Date.now(),
        createdBy: SCHEDULER_UID,
      };
      await assertSucceeds(setDoc(doc(db, `shifts/${newShift.id}`), newShift));
    });

    it("DENY: staff cannot create shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      const newShift = {
        id: "new-shift-999",
        orgId: ORG_ID,
        scheduleId: SCHEDULE_ID,
        positionId: "pos-456",
        startTime: Date.now(),
        endTime: Date.now() + 8 * 60 * 60 * 1000,
        status: "draft",
        createdAt: Date.now(),
        createdBy: STAFF_UID,
      };
      await assertFails(setDoc(doc(db, `shifts/${newShift.id}`), newShift));
    });

    it("DENY: non-member cannot create shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      const newShift = {
        id: "new-shift-888",
        orgId: ORG_ID,
        scheduleId: SCHEDULE_ID,
        positionId: "pos-456",
        startTime: Date.now(),
        endTime: Date.now() + 8 * 60 * 60 * 1000,
        status: "draft",
        createdAt: Date.now(),
        createdBy: OTHER_UID,
      };
      await assertFails(setDoc(doc(db, `shifts/${newShift.id}`), newShift));
    });
  });

  describe("Update access", () => {
    it("ALLOW: scheduler can update shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `shifts/${SHIFT_ID}`), {
          status: "published",
          updatedAt: Date.now(),
        })
      );
    });

    it("DENY: staff cannot update shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `shifts/${SHIFT_ID}`), {
          status: "published",
        })
      );
    });

    it("DENY: non-member cannot update shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `shifts/${SHIFT_ID}`), {
          status: "published",
        })
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: scheduler can delete shift", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler", "admin"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });

    it("DENY: staff cannot delete shift", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });

    it("DENY: non-member cannot delete shift", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["admin"],
      });
      const db = otherContext.firestore();
      await assertFails(deleteDoc(doc(db, `shifts/${SHIFT_ID}`)));
    });
  });
});
