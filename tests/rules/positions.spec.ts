// [P1][INTEGRITY][TEST] Positions rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, POSITIONS
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Positions Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-pos";
  const POS_ID = "position-123";
  const MANAGER_UID = "manager-pos";
  const STAFF_UID = "staff-pos";
  const OTHER_ORG_UID = "other-org-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-pos");

    // Setup test data
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`), {
        id: POS_ID,
        orgId: ORG_ID,
        name: "Event Staff",
        type: "part_time",
        createdAt: Date.now(),
      });
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org member can read position", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertSucceeds(getDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`)));
    });

    it("DENY: non-member cannot read position", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_ORG_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`)));
    });

    it("DENY: unauthenticated cannot read position", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`)));
    });

    it("DENY: listing positions forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `positions/${ORG_ID}/positions`)));
    });
  });

  describe("Write access", () => {
    it("ALLOW: manager can create position", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `positions/${ORG_ID}/positions/new-pos-${Date.now()}`), {
          name: "New Position",
          orgId: ORG_ID,
          type: "full_time",
          createdAt: Date.now(),
        }),
      );
    });

    it("ALLOW: manager can update position", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`), {
          name: "Updated Position",
        }),
      );
    });

    it("DENY: staff cannot create position", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `positions/${ORG_ID}/positions/staff-pos-${Date.now()}`), {
          name: "Unauthorized Position",
          orgId: ORG_ID,
        }),
      );
    });

    it("DENY: staff cannot update position", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`), {
          name: "Staff Update Attempt",
        }),
      );
    });

    it("DENY: manager from different org cannot write", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_ORG_UID, {
        orgId: "different-org",
        roles: ["manager"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `positions/${ORG_ID}/positions/${POS_ID}`), {
          name: "Cross-org Update",
        }),
      );
    });

    it("ALLOW: manager can delete position", async () => {
      const deletePos = `delete-pos-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `positions/${ORG_ID}/positions/${deletePos}`), {
          name: "To Delete",
          orgId: ORG_ID,
        });
      });

      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `positions/${ORG_ID}/positions/${deletePos}`)));
    });
  });
});
