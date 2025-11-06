// [P1][INTEGRITY][TEST] Zones rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, ZONES
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

describe("Zones Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const VENUE_ID = "test-venue-456";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
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
    it("ALLOW: org member can read zone", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `zones/${ORG_ID}/zones/zone-1`), {
          id: "zone-1",
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "Test Zone",
          type: "production",
          capacity: 50,
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
      await assertSucceeds(getDoc(doc(db, `zones/${ORG_ID}/zones/zone-1`)));
    });

    it("DENY: non-member cannot read zone", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `zones/${ORG_ID}/zones/zone-1`)));
    });

    it("DENY: unauthenticated cannot read zone", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `zones/${ORG_ID}/zones/zone-1`)));
    });

    it("DENY: listing all zones forbidden", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDocs(collection(db, `zones/${ORG_ID}/zones`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: manager+ can create zone", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `zones/${ORG_ID}/zones/new-zone`), {
          id: "new-zone",
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "New Zone",
          type: "service",
          capacity: 25,
          isActive: true,
          createdBy: MANAGER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create zone", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `zones/${ORG_ID}/zones/new-zone-2`), {
          id: "new-zone-2",
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "New Zone 2",
          type: "production",
          capacity: 30,
          isActive: true,
          createdBy: STAFF_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create zone", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `zones/${ORG_ID}/zones/new-zone-3`), {
          id: "new-zone-3",
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "New Zone 3",
          type: "other",
          capacity: 20,
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
        await setDoc(doc(db, `zones/${ORG_ID}/zones/zone-update`), {
          id: "zone-update",
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "Update Test Zone",
          type: "production",
          capacity: 50,
          isActive: true,
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: manager can update zone", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `zones/${ORG_ID}/zones/zone-update`), {
          name: "Updated Zone Name",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot update zone", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `zones/${ORG_ID}/zones/zone-update`), {
          name: "Unauthorized Update",
        }),
      );
    });

    it("DENY: non-member cannot update zone", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["manager"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `zones/${ORG_ID}/zones/zone-update`), {
          name: "Cross-org Update",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: manager can delete zone", async () => {
      const deleteZoneId = `delete-zone-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `zones/${ORG_ID}/zones/${deleteZoneId}`), {
          id: deleteZoneId,
          orgId: ORG_ID,
          venueId: VENUE_ID,
          name: "To Delete",
          type: "service",
          capacity: 25,
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
      await assertSucceeds(deleteDoc(doc(db, `zones/${ORG_ID}/zones/${deleteZoneId}`)));
    });

    it("DENY: staff cannot delete zone", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `zones/${ORG_ID}/zones/zone-update`)));
    });
  });
});
