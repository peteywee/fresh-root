// [P1][INTEGRITY][TEST] Schedules rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, SCHEDULES
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll } from "vitest";

describe("Schedules Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const SCHEDULER_UID = "scheduler-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project",
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

  describe("Read access", () => {
    it("ALLOW: org member can read schedule", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-1`), {
          id: "sched-1",
          orgId: ORG_ID,
          name: "Test Schedule",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: OWNER_UID,
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
      await assertSucceeds(getDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-1`)));
    });

    it("DENY: non-member cannot read schedule", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-1`)));
    });

    it("DENY: unauthenticated cannot read schedule", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-1`)));
    });

    it("DENY: listing all schedules forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `schedules/${ORG_ID}/schedules`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: scheduler+ can create schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `schedules/${ORG_ID}/schedules/new-sched`), {
          id: "new-sched",
          orgId: ORG_ID,
          name: "New Schedule",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: SCHEDULER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can create schedule", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `schedules/${ORG_ID}/schedules/new-sched-2`), {
          id: "new-sched-2",
          orgId: ORG_ID,
          name: "New Schedule 2",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: MANAGER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `schedules/${ORG_ID}/schedules/new-sched-3`), {
          id: "new-sched-3",
          orgId: ORG_ID,
          name: "New Schedule 3",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: STAFF_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create schedule", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `schedules/${ORG_ID}/schedules/new-sched-4`), {
          id: "new-sched-4",
          orgId: ORG_ID,
          name: "New Schedule 4",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: "anon",
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
        await setDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`), {
          id: "sched-update",
          orgId: ORG_ID,
          name: "Update Test Schedule",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: scheduler can update schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`), {
          name: "Updated Schedule Name",
          updatedAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can update schedule", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`), {
          status: "published",
          updatedAt: Date.now(),
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
        updateDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`), {
          name: "Unauthorized Update",
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
        updateDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`), {
          name: "Cross-org Update",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: manager can delete schedule", async () => {
      const deleteSchedId = `delete-sched-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `schedules/${ORG_ID}/schedules/${deleteSchedId}`), {
          id: deleteSchedId,
          orgId: ORG_ID,
          name: "To Delete",
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          status: "draft",
          visibility: "team",
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `schedules/${ORG_ID}/schedules/${deleteSchedId}`)));
    });

    it("DENY: scheduler cannot delete schedule", async () => {
      const schedulerContext = testEnv.authenticatedContext(SCHEDULER_UID, {
        orgId: ORG_ID,
        roles: ["scheduler"],
      });
      const db = schedulerContext.firestore();
      await assertFails(deleteDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`)));
    });

    it("DENY: staff cannot delete schedule", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `schedules/${ORG_ID}/schedules/sched-update`)));
    });
  });
});
