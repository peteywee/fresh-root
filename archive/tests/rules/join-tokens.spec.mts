// [P1][INTEGRITY][TEST] Join tokens rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, JOIN_TOKENS
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Join Tokens Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-123";
  const OWNER_UID = "owner-user";
  const MANAGER_UID = "manager-user";
  const ADMIN_UID = "admin-user";
  const STAFF_UID = "staff-user";
  const OTHER_UID = "other-user";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-join-tokens-mts");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("Read access", () => {
    it("ALLOW: org admin can read join token", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`), {
          id: "jt-1",
          orgId: ORG_ID,
          token: "abc123def456xyz789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 10,
          currentUses: 3,
          usedBy: ["user1", "user2", "user3"],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "General staff invitation",
          createdBy: OWNER_UID,
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        });
        await setDoc(doc(db, `memberships/${ADMIN_UID}_${ORG_ID}`), {
          uid: ADMIN_UID,
          orgId: ORG_ID,
          roles: ["admin"],
        });
      });

      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const db = adminContext.firestore();
      await assertSucceeds(getDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`)));
    });

    it("ALLOW: org manager can read join token", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertSucceeds(getDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`)));
    });

    it("DENY: staff cannot read join token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(getDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`)));
    });

    it("DENY: non-member cannot read join token", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["admin"],
      });
      const db = otherContext.firestore();
      await assertFails(getDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`)));
    });

    it("DENY: unauthenticated cannot read join token", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(getDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-1`)));
    });

    it("DENY: listing all join tokens forbidden", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const db = adminContext.firestore();
      await assertFails(getDocs(collection(db, `join_tokens/${ORG_ID}/join_tokens`)));
    });
  });

  describe("Create access", () => {
    it("ALLOW: admin+ can create join token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const db = adminContext.firestore();
      await assertSucceeds(
        setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/new-jt`), {
          id: "new-jt",
          orgId: ORG_ID,
          token: "newtoken123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 5,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "New invitation",
          createdBy: ADMIN_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: manager cannot create join token", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(
        setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/new-jt-2`), {
          id: "new-jt-2",
          orgId: ORG_ID,
          token: "token123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 5,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "New invitation",
          createdBy: MANAGER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: staff cannot create join token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/new-jt-3`), {
          id: "new-jt-3",
          orgId: ORG_ID,
          token: "token123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 5,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "New invitation",
          createdBy: STAFF_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: unauthenticated cannot create join token", async () => {
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();
      await assertFails(
        setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/new-jt-4`), {
          id: "new-jt-4",
          orgId: ORG_ID,
          token: "token123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 5,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "New invitation",
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
        await setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`), {
          id: "jt-update",
          orgId: ORG_ID,
          token: "update123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 10,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "Update test",
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("ALLOW: admin can update join token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const db = adminContext.firestore();
      await assertSucceeds(
        updateDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`), {
          status: "expired",
          updatedAt: Date.now(),
        }),
      );
    });

    it("DENY: manager cannot update join token", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(
        updateDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`), {
          status: "expired",
        }),
      );
    });

    it("DENY: staff cannot update join token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(
        updateDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`), {
          status: "expired",
        }),
      );
    });

    it("DENY: non-member cannot update join token", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["admin"],
      });
      const db = otherContext.firestore();
      await assertFails(
        updateDoc(doc(db, `join-tokens/${ORG_ID}/join-tokens/jt-update`), {
          status: "expired",
        }),
      );
    });
  });

  describe("Delete access", () => {
    it("ALLOW: admin can delete join token", async () => {
      const deleteJtId = `delete-jt-${Date.now()}`;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/${deleteJtId}`), {
          id: deleteJtId,
          orgId: ORG_ID,
          token: "delete123456789",
          defaultRoles: ["staff"],
          status: "active",
          maxUses: 5,
          currentUses: 0,
          usedBy: [],
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          description: "To delete",
          createdBy: OWNER_UID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const db = adminContext.firestore();
      await assertSucceeds(deleteDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/${deleteJtId}`)));
    });

    it("DENY: manager cannot delete join token", async () => {
      const managerContext = testEnv.authenticatedContext(MANAGER_UID, {
        orgId: ORG_ID,
        roles: ["manager"],
      });
      const db = managerContext.firestore();
      await assertFails(deleteDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`)));
    });

    it("DENY: staff cannot delete join token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const db = staffContext.firestore();
      await assertFails(deleteDoc(doc(db, `join_tokens/${ORG_ID}/join_tokens/jt-update`)));
    });
  });
});
