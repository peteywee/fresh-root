// [P1][INTEGRITY][TEST] Venues rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, VENUES
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

describe("Venues Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-venues";
  const VENUE_ID = "venue-123";
  const MANAGER_UID = "manager-venues";
  const STAFF_UID = "staff-venues";
  const OTHER_UID = "other-user-venues";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project-venues",
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
      });
      
      await setDoc(doc(db, `memberships/${MANAGER_UID}_${ORG_ID}`), {
        uid: MANAGER_UID,
        orgId: ORG_ID,
        roles: ["manager"],
      });
      
      await setDoc(doc(db, `memberships/${STAFF_UID}_${ORG_ID}`), {
        uid: STAFF_UID,
        orgId: ORG_ID,
        roles: ["staff"],
      });
      
      await setDoc(doc(db, `venues/${VENUE_ID}`), {
        id: VENUE_ID,
        orgId: ORG_ID,
        name: "Main Venue",
        type: "indoor",
        status: "active",
        createdAt: Date.now(),
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: org member can read venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertSucceeds(getDoc(doc(db, `venues/${VENUE_ID}`)));
    });

    it("DENY: non-member cannot read venue", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `venues/${VENUE_ID}`)));
    });

    it("DENY: unauthenticated cannot read venue", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `venues/${VENUE_ID}`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: manager can create venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      const newVenue = {
        id: "venue-new-456",
        orgId: ORG_ID,
        name: "Second Venue",
        type: "outdoor",
        status: "active",
        createdAt: Date.now(),
        createdBy: MANAGER_UID,
      };
      await assertSucceeds(setDoc(doc(db, `venues/${newVenue.id}`), newVenue));
    });

    it("DENY: staff cannot create venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      const newVenue = {
        id: "venue-fail-789",
        orgId: ORG_ID,
        name: "Unauthorized Venue",
        type: "indoor",
        status: "active",
        createdAt: Date.now(),
        createdBy: STAFF_UID,
      };
      await assertFails(setDoc(doc(db, `venues/${newVenue.id}`), newVenue));
    });

    it("DENY: non-member cannot create venue", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["manager"],
      });
      const db = otherContext.firestore();
      const newVenue = {
        id: "venue-other-999",
        orgId: ORG_ID,
        name: "Other Venue",
        type: "indoor",
        status: "active",
        createdAt: Date.now(),
        createdBy: OTHER_UID,
      };
      await assertFails(setDoc(doc(db, `venues/${newVenue.id}`), newVenue));
    });
  });

  describe("Update access", () => {
    it("ALLOW: manager can update venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `venues/${VENUE_ID}`), {
          status: "inactive",
          updatedAt: Date.now(),
        })
      );
    });

    it("DENY: staff cannot update venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `venues/${VENUE_ID}`), {
          status: "inactive",
        })
      );
    });

    it("DENY: non-member cannot update venue", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["manager"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `venues/${VENUE_ID}`), {
          status: "inactive",
        })
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: manager with admin role can delete venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager", "admin"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `venues/${VENUE_ID}`)));
    });

    it("DENY: manager without admin cannot delete venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(deleteDoc(doc(db, `venues/${VENUE_ID}`)));
    });

    it("DENY: staff cannot delete venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `venues/${VENUE_ID}`)));
    });
  });
});
