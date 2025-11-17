// [P1][INTEGRITY][TEST] Network tenancy rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, NETWORK, TENANCY
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  doc,
  deleteDoc as fsDeleteDoc,
  DocumentData,
  DocumentReference,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Network tenancy rules", () => {
  let testEnv: RulesTestEnvironment;
  const NETWORK_ID = "network-123";
  const OWNER_UID = "owner-uid";
  const MEMBER_UID = "member-uid";
  const NON_MEMBER_UID = "non-member-uid";
  const SUPER_ADMIN_UID = "super-admin-uid";
  const SVC_UID = "svc-onboarding";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-networks");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Network document access", () => {
    it("DENY: unauthenticated cannot read network", async () => {
      const unauth = testEnv.unauthenticatedContext();
      const db = unauth.firestore();
      await assertFails(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });

    it("DENY: non-member cannot read network", async () => {
      const userCtx = testEnv.authenticatedContext(NON_MEMBER_UID, {});
      const db = userCtx.firestore();
      await assertFails(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });

    it("ALLOW: network member can read network", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `networks/${NETWORK_ID}`), {
          id: NETWORK_ID,
          name: "Test Network",
          ownerId: OWNER_UID,
        });
        await setDoc(doc(db, `memberships/${MEMBER_UID}_${NETWORK_ID}`), {
          uid: MEMBER_UID,
          networkId: NETWORK_ID,
          roles: ["member"],
        });
      });

      const memberContext = testEnv.authenticatedContext(MEMBER_UID, {
        networkId: NETWORK_ID,
        roles: ["member"],
      });
      const db = memberContext.firestore();
      await assertSucceeds(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });

    it("ALLOW: network owner can read network", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        networkId: NETWORK_ID,
        roles: ["owner"],
      });
      const db = ownerContext.firestore();
      await assertSucceeds(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });

    it("ALLOW: super admin can read network", async () => {
      const superAdminContext = testEnv.authenticatedContext(SUPER_ADMIN_UID, {
        roles: ["super_admin"],
      });
      const db = superAdminContext.firestore();
      await assertSucceeds(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });

    it("ALLOW: service account can read network", async () => {
      const svcContext = testEnv.authenticatedContext(SVC_UID, {
        roles: ["service"],
      });
      const db = svcContext.firestore();
      await assertSucceeds(getDoc(doc(db, `networks/${NETWORK_ID}`)));
    });
  });

  describe("Network document creation", () => {
    it("ALLOW: authenticated user can create network", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID);
      const db = ownerContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `networks/new-network-${Date.now()}`), {
          name: "New Network",
          ownerId: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create network", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `networks/new-network-${Date.now()}`), {
          name: "New Network",
          ownerId: OWNER_UID,
        }),
      );
    });
  });

  describe("Network document updates", () => {
    beforeAll(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `networks/${NETWORK_ID}`), {
          id: NETWORK_ID,
          name: "Test Network",
          ownerId: OWNER_UID,
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: network owner can update network", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        networkId: NETWORK_ID,
        roles: ["owner"],
      });
      const db = ownerContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `networks/${NETWORK_ID}`), {
          name: "Updated Network Name",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: network member cannot update network", async () => {
      const memberContext = testEnv.authenticatedContext(MEMBER_UID, {
        networkId: NETWORK_ID,
        roles: ["member"],
      });
      const db = memberContext.firestore();
      await assertFails(
        updateDoc(doc(db, `networks/${NETWORK_ID}`), {
          description: "Updated description",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: non-member cannot update network", async () => {
      const otherContext = testEnv.authenticatedContext(NON_MEMBER_UID, {
        networkId: "different-network",
        roles: ["owner"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `networks/${NETWORK_ID}`), {
          name: "Cross-network Update",
        }),
      );
    });
  });

  describe("Network document deletion", () => {
    it("ALLOW: network owner can delete network", async () => {
      const deleteNetworkId = `delete-network-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `networks/${deleteNetworkId}`), {
          id: deleteNetworkId,
          name: "To Delete",
          ownerId: OWNER_UID,
        });
      });

      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        networkId: deleteNetworkId,
        roles: ["owner"],
      });
      const db = ownerContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `networks/${deleteNetworkId}`)));
    });

    it("DENY: network member cannot delete network", async () => {
      const memberContext = testEnv.authenticatedContext(MEMBER_UID, {
        networkId: NETWORK_ID,
        roles: ["member"],
      });
      const db = memberContext.firestore();
      await assertFails(deleteDoc(doc(db, `networks/${NETWORK_ID}`)));
    });
  });

  describe("Network-scoped compliance documents (server-only)", () => {
    const COMPLIANCE_NETWORK_ID = `compliance-network-${Date.now()}`;

    beforeAll(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        // Create a network
        await setDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}`), {
          id: COMPLIANCE_NETWORK_ID,
          name: "Compliance Test Network",
          ownerId: OWNER_UID,
        });
        // Create a compliance doc under the network
        await setDoc(
          doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`),
          {
            legalName: "Test Corp",
            taxId: "12-3456789",
            attachedAt: Date.now(),
            immutable: true,
            status: "attached",
          },
        );
        // Set up network membership for the member
        await setDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/memberships/${MEMBER_UID}`), {
          uid: MEMBER_UID,
          networkId: COMPLIANCE_NETWORK_ID,
          roles: ["member"],
        });
      });
    });

    it("DENY: network owner cannot read network-scoped compliance doc", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        networkId: COMPLIANCE_NETWORK_ID,
        roles: ["owner"],
      });
      const db = ownerContext.firestore();
      await assertFails(
        getDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`)),
      );
    });

    it("DENY: network member cannot read network-scoped compliance doc", async () => {
      const memberContext = testEnv.authenticatedContext(MEMBER_UID, {
        networkId: COMPLIANCE_NETWORK_ID,
        roles: ["member"],
      });
      const db = memberContext.firestore();
      await assertFails(
        getDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`)),
      );
    });

    it("DENY: unauthenticated cannot read network-scoped compliance doc", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        getDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`)),
      );
    });

    it("DENY: network owner cannot write network-scoped compliance doc", async () => {
      const ownerContext = testEnv.authenticatedContext(OWNER_UID, {
        networkId: COMPLIANCE_NETWORK_ID,
        roles: ["owner"],
      });
      const db = ownerContext.firestore();
      await assertFails(
        updateDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`), {
          status: "modified",
        }),
      );
    });

    it("DENY: network member cannot write network-scoped compliance doc", async () => {
      const memberContext = testEnv.authenticatedContext(MEMBER_UID, {
        networkId: COMPLIANCE_NETWORK_ID,
        roles: ["member"],
      });
      const db = memberContext.firestore();
      await assertFails(
        updateDoc(doc(db, `networks/${COMPLIANCE_NETWORK_ID}/compliance/adminResponsibilityForm`), {
          status: "modified",
        }),
      );
    });
  });

  describe("Global compliance documents (server-only)", () => {
    it("DENY: authenticated user cannot read global compliance doc", async () => {
      const userContext = testEnv.authenticatedContext(OWNER_UID, {
        roles: ["owner"],
      });
      const db = userContext.firestore();
      await assertFails(getDoc(doc(db, `compliance/adminResponsibilityForms/forms/token-123`)));
    });

    it("DENY: authenticated user cannot write global compliance doc", async () => {
      const userContext = testEnv.authenticatedContext(OWNER_UID, {
        roles: ["owner"],
      });
      const db = userContext.firestore();
      await assertFails(
        setDoc(doc(db, `compliance/adminResponsibilityForms/forms/new-token`), {
          legalName: "Attacker Corp",
          status: "submitted",
        }),
      );
    });

    it("DENY: unauthenticated cannot read global compliance doc", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `compliance/adminResponsibilityForms`)));
    });
  });

  describe("Cross-network access prevention", () => {
    const NETWORK_A = `network-a-${Date.now()}`;
    const NETWORK_B = `network-b-${Date.now()}`;
    const USER_A = "user-a-uid";
    const USER_B = "user-b-uid";

    beforeAll(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        // Create two networks
        await setDoc(doc(db, `networks/${NETWORK_A}`), {
          id: NETWORK_A,
          name: "Network A",
          ownerId: USER_A,
        });
        await setDoc(doc(db, `networks/${NETWORK_B}`), {
          id: NETWORK_B,
          name: "Network B",
          ownerId: USER_B,
        });
        // Set up memberships
        await setDoc(doc(db, `networks/${NETWORK_A}/memberships/${USER_A}`), {
          uid: USER_A,
          networkId: NETWORK_A,
          roles: ["owner"],
        });
        await setDoc(doc(db, `networks/${NETWORK_B}/memberships/${USER_B}`), {
          uid: USER_B,
          networkId: NETWORK_B,
          roles: ["owner"],
        });
      });
    });

    it("DENY: user from network A cannot read network B", async () => {
      const contextA = testEnv.authenticatedContext(USER_A, {
        networkId: NETWORK_A,
        roles: ["owner"],
      });
      const db = contextA.firestore();
      await assertFails(getDoc(doc(db, `networks/${NETWORK_B}`)));
    });

    it("DENY: user from network A cannot update network B", async () => {
      const contextA = testEnv.authenticatedContext(USER_A, {
        networkId: NETWORK_A,
        roles: ["owner"],
      });
      const db = contextA.firestore();
      await assertFails(
        updateDoc(doc(db, `networks/${NETWORK_B}`), {
          name: "Hacked Network B",
        }),
      );
    });

    it("DENY: user from network A cannot list network B memberships", async () => {
      // List operations on nested collections are typically blocked at the subcollection level
      const contextA = testEnv.authenticatedContext(USER_A, {
        networkId: NETWORK_A,
        roles: ["owner"],
      });
      const db = contextA.firestore();
      // This would typically be tested with query-level rules
      // For now, verify that access is controlled by network membership
      const docRef = doc(db, `networks/${NETWORK_B}/memberships/${USER_B}`);
      await assertFails(getDoc(docRef));
    });
  });
});
function deleteDoc(arg0: DocumentReference<DocumentData, DocumentData>): Promise<unknown> {
  // Delegate to Firestore SDK deleteDoc; cast to relax generic differences
  return fsDeleteDoc(arg0 as any);
}
