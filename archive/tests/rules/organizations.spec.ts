// [P1][INTEGRITY][TEST] Organizations rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, ORGANIZATIONS
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Organizations Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org member can read org", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `organizations/${ORG_ID}`), {
          id: ORG_ID,
          name: "Test Org",
          ownerId: OWNER_UID,
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
      await assertSucceeds(getDoc(doc(db, `organizations/${ORG_ID}`)));
    });

    it("DENY: non-member cannot read org", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `organizations/${ORG_ID}`)));
    });

    it("DENY: unauthenticated cannot read org", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `organizations/${ORG_ID}`)));
    });

    it("DENY: listing all organizations forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, "organizations")));
    });
  });

  describe("Create access", () => {
    it("ALLOW: authenticated user can create org", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID);
      const db = ownerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `organizations/new-org-${Date.now()}`), {
          name: "New Organization",
          ownerId: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create org", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `organizations/new-org-${Date.now()}`), {
          name: "New Organization",
          ownerId: OWNER_UID,
        }),
      );
    });
  });

  describe("Update access", () => {
    beforeAll(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `organizations/${ORG_ID}`), {
          id: ORG_ID,
          name: "Test Org",
          ownerId: OWNER_UID,
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: org_owner can update org", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        orgId: ORG_ID,
        roles: ["org_owner"],
      });
      const db = ownerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `organizations/${ORG_ID}`), {
          name: "Updated Org Name",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: manager cannot update org", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(
        updateDoc(doc(db, `organizations/${ORG_ID}`), {
          description: "Updated description",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update org", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `organizations/${ORG_ID}`), {
          name: "Unauthorized Update",
        }),
      );
    });

    it("DENY: non-member cannot update org", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["org_owner"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `organizations/${ORG_ID}`), {
          name: "Cross-org Update",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: org_owner can delete org", async () => {
      const deleteOrgId = `delete-org-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `organizations/${deleteOrgId}`), {
          id: deleteOrgId,
          name: "To Delete",
          ownerId: OWNER_UID,
        });
      });

      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        orgId: deleteOrgId,
        roles: ["org_owner"],
      });
      const db = ownerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `organizations/${deleteOrgId}`)));
    });

    it("DENY: manager cannot delete org", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(deleteDoc(doc(db, `organizations/${ORG_ID}`)));
    });

    it("DENY: staff cannot delete org", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `organizations/${ORG_ID}`)));
    });
  });
});
