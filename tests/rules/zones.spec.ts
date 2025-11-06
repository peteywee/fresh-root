// [P1][INTEGRITY][TEST] Zones rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, ZONES
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

describe("Zones Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-zones";
  const VENUE_ID = "venue-zones-123";
  const ZONE_ID = "zone-456";
  const MANAGER_UID = "manager-zones";
  const STAFF_UID = "staff-zones";
  const OTHER_UID = "other-zones";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project-zones",
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
      
      await setDoc(doc(db, `organizations/${ORG_ID}`), { id: ORG_ID, name: "Test Org" });
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
      await setDoc(doc(db, `zones/${ZONE_ID}`), {
        id: ZONE_ID,
        orgId: ORG_ID,
        venueId: VENUE_ID,
        name: "Main Floor",
        status: "active",
        createdAt: Date.now(),
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: org member can read zone", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await assertSucceeds(getDoc(doc(staffContext.firestore(), `zones/${ZONE_ID}`)));
    });

    it("DENY: non-member cannot read zone", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["staff"],
      });
      await assertFails(getDoc(doc(otherContext.firestore(), `zones/${ZONE_ID}`)));
    });
  });

  describe("Write access", () => {
    it("ALLOW: manager can create zone", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const newZone = {
        id: "zone-new",
        orgId: ORG_ID,
        venueId: VENUE_ID,
        name: "VIP Section",
        status: "active",
        createdAt: Date.now(),
      };
      await assertSucceeds(setDoc(doc(managerContext.firestore(), `zones/${newZone.id}`), newZone));
    });

    it("DENY: staff cannot create zone", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const newZone = {
        id: "zone-fail",
        orgId: ORG_ID,
        venueId: VENUE_ID,
        name: "Unauthorized",
        status: "active",
        createdAt: Date.now(),
      };
      await assertFails(setDoc(doc(staffContext.firestore(), `zones/${newZone.id}`), newZone));
    });

    it("ALLOW: manager can update zone", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      await assertSucceeds(
        updateDoc(doc(managerContext.firestore(), `zones/${ZONE_ID}`), { status: "inactive" })
      );
    });

    it("ALLOW: admin can delete zone", async () => {
      const adminContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      await assertSucceeds(deleteDoc(doc(adminContext.firestore(), `zones/${ZONE_ID}`)));
    });
  });
});
