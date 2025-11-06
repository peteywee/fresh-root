// [P1][INTEGRITY][TEST] Schedules rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SCHEDULES
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

describe("Schedules Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-schedules";
  const SCHEDULE_ID = "schedule-789";
  const OWNER_UID = "owner-schedules";
  const SCHEDULER_UID = "scheduler-schedules";
  const STAFF_UID = "staff-schedules";
  const OTHER_UID = "other-user-schedules";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project-schedules",
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

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, `organizations/${ORG_ID}`), {
        id: ORG_ID,
        name: "Test Org",
        ownerId: OWNER_UID,
      });

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

      await setDoc(doc(db, `schedules/${SCHEDULE_ID}`), {
        id: SCHEDULE_ID,
        orgId: ORG_ID,
        name: "Week 1 Schedule",
        weekStart: "2025-01-15",
        status: "draft",
        createdAt: Date.now(),
        createdBy: SCHEDULER_UID,
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: org member can read schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertSucceeds(getDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });

    it("DENY: non-member cannot read schedule", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });

    it("DENY: unauthenticated cannot read schedule", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });

    it("ALLOW: org member can list schedules", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      const schedulesQuery = query(collection(db, "schedules"), where("orgId", "==", ORG_ID));
      await assertSucceeds(getDocs(schedulesQuery));
    });
  });

  describe("Create access", () => {
    it("ALLOW: scheduler can create schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      const newSchedule = {
        id: "schedule-new-999",
        orgId: ORG_ID,
        name: "Week 2 Schedule",
        weekStart: "2025-01-22",
        status: "draft",
        createdAt: Date.now(),
        createdBy: SCHEDULER_UID,
      };
      await assertSucceeds(setDoc(doc(db, `schedules/${newSchedule.id}`), newSchedule));
    });

    it("DENY: staff cannot create schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      const newSchedule = {
        id: "schedule-fail-888",
        orgId: ORG_ID,
        name: "Unauthorized Schedule",
        weekStart: "2025-01-22",
        status: "draft",
        createdAt: Date.now(),
        createdBy: STAFF_UID,
      };
      await assertFails(setDoc(doc(db, `schedules/${newSchedule.id}`), newSchedule));
    });

    it("DENY: non-member cannot create schedule", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      const newSchedule = {
        id: "schedule-other-777",
        orgId: ORG_ID,
        name: "Other User Schedule",
        weekStart: "2025-01-22",
        status: "draft",
        createdAt: Date.now(),
        createdBy: OTHER_UID,
      };
      await assertFails(setDoc(doc(db, `schedules/${newSchedule.id}`), newSchedule));
    });
  });

  describe("Update access", () => {
    it("ALLOW: scheduler can update schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `schedules/${SCHEDULE_ID}`), {
          status: "published",
          publishedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `schedules/${SCHEDULE_ID}`), {
          status: "published",
        }),
      );
    });

    it("DENY: non-member cannot update schedule", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["scheduler"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `schedules/${SCHEDULE_ID}`), {
          status: "published",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: scheduler with admin role can delete schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler", "admin"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });

    it("DENY: scheduler without admin cannot delete schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertFails(deleteDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });

    it("DENY: staff cannot delete schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `schedules/${SCHEDULE_ID}`)));
    });
  });
});
