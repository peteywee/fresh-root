// [P1][INTEGRITY][TEST] Venues rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, VENUES
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Venues Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-venues-mts");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org member can read venue", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `venues/${ORG_ID}/venues/venue-1`), {
          id: "venue-1",
          orgId: ORG_ID,
          name: "Test Venue",
          type: "indoor",
          capacity: 100,
          isActive: true,
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
      await assertSucceeds(getDoc(doc(db, `venues/${ORG_ID}/venues/venue-1`)));
    });

    it("DENY: non-member cannot read venue", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `venues/${ORG_ID}/venues/venue-1`)));
    });

    it("DENY: unauthenticated cannot read venue", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `venues/${ORG_ID}/venues/venue-1`)));
    });

    it("DENY: listing all venues forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `venues/${ORG_ID}/venues`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: manager+ can create venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `venues/${ORG_ID}/venues/new-venue`), {
          id: "new-venue",
          orgId: ORG_ID,
          name: "New Venue",
          type: "indoor",
          capacity: 50,
          isActive: true,
          createdBy: MANAGER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `venues/${ORG_ID}/venues/new-venue-2`), {
          id: "new-venue-2",
          orgId: ORG_ID,
          name: "New Venue 2",
          type: "outdoor",
          capacity: 25,
          isActive: true,
          createdBy: STAFF_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create venue", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `venues/${ORG_ID}/venues/new-venue-3`), {
          id: "new-venue-3",
          orgId: ORG_ID,
          name: "New Venue 3",
          type: "indoor",
          capacity: 100,
          isActive: true,
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
        await setDoc(doc(db, `venues/${ORG_ID}/venues/venue-update`), {
          id: "venue-update",
          orgId: ORG_ID,
          name: "Update Test Venue",
          type: "indoor",
          capacity: 100,
          isActive: true,
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: manager can update venue", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `venues/${ORG_ID}/venues/venue-update`), {
          name: "Updated Venue Name",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `venues/${ORG_ID}/venues/venue-update`), {
          name: "Unauthorized Update",
        }),
      );
    });

    it("DENY: non-member cannot update venue", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["manager"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `venues/${ORG_ID}/venues/venue-update`), {
          name: "Cross-org Update",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("DENY: manager cannot delete venue (admin/owner only)", async () => {
      const deleteVenueId = `delete-venue-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `venues/${ORG_ID}/venues/${deleteVenueId}`), {
          id: deleteVenueId,
          orgId: ORG_ID,
          name: "To Delete",
          type: "indoor",
          capacity: 50,
          isActive: true,
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
      await assertFails(deleteDoc(doc(db, `venues/${ORG_ID}/venues/${deleteVenueId}`)));
    });

    it("DENY: staff cannot delete venue", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `venues/${ORG_ID}/venues/venue-update`)));
    });
  });
});
