// [P1][INTEGRITY][TEST] Join Tokens rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, JOIN_TOKENS
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

describe("Join Tokens Rules", () => {
  let testEnv: RulesTestEnvironment;
  const ORG_ID = "test-org-tokens";
  const TOKEN_ID = "token-abc123";
  const ADMIN_UID = "admin-tokens";
  const STAFF_UID = "staff-tokens";
  const OTHER_UID = "other-tokens";

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project-tokens",
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
      await setDoc(doc(db, `memberships/${ADMIN_UID}_${ORG_ID}`), {
        uid: ADMIN_UID,
        orgId: ORG_ID,
        roles: ["admin"],
      });
      await setDoc(doc(db, `memberships/${STAFF_UID}_${ORG_ID}`), {
        uid: STAFF_UID,
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await setDoc(doc(db, `join_tokens/${TOKEN_ID}`), {
        id: TOKEN_ID,
        orgId: ORG_ID,
        token: "abc123xyz",
        roles: ["staff"],
        maxUses: 10,
        uses: 0,
        status: "active",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        createdBy: ADMIN_UID,
      });
    });
  });

  describe("Read access", () => {
    it("ALLOW: admin can read token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      await assertSucceeds(getDoc(doc(adminContext.firestore(), `join_tokens/${TOKEN_ID}`)));
    });

    it("DENY: staff cannot read token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await assertFails(getDoc(doc(staffContext.firestore(), `join_tokens/${TOKEN_ID}`)));
    });

    it("DENY: non-member cannot read token", async () => {
      const otherContext = testEnv.authenticatedContext(OTHER_UID, {
        orgId: "different-org",
        roles: ["admin"],
      });
      await assertFails(getDoc(doc(otherContext.firestore(), `join_tokens/${TOKEN_ID}`)));
    });
  });

  describe("Write access", () => {
    it("ALLOW: admin can create token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      const newToken = {
        id: "token-new",
        orgId: ORG_ID,
        token: "newtoken456",
        roles: ["staff"],
        maxUses: 5,
        uses: 0,
        status: "active",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        createdBy: ADMIN_UID,
      };
      await assertSucceeds(setDoc(doc(adminContext.firestore(), `join_tokens/${newToken.id}`), newToken));
    });

    it("DENY: staff cannot create token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      const newToken = {
        id: "token-fail",
        orgId: ORG_ID,
        token: "unauthorized",
        roles: ["staff"],
        maxUses: 5,
        uses: 0,
        status: "active",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        createdBy: STAFF_UID,
      };
      await assertFails(setDoc(doc(staffContext.firestore(), `join_tokens/${newToken.id}`), newToken));
    });

    it("ALLOW: admin can update token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      await assertSucceeds(
        updateDoc(doc(adminContext.firestore(), `join_tokens/${TOKEN_ID}`), {
          status: "revoked",
          revokedAt: Date.now(),
        })
      );
    });

    it("ALLOW: admin can delete token", async () => {
      const adminContext = testEnv.authenticatedContext(ADMIN_UID, {
        orgId: ORG_ID,
        roles: ["admin"],
      });
      await assertSucceeds(deleteDoc(doc(adminContext.firestore(), `join_tokens/${TOKEN_ID}`)));
    });

    it("DENY: staff cannot delete token", async () => {
      const staffContext = testEnv.authenticatedContext(STAFF_UID, {
        orgId: ORG_ID,
        roles: ["staff"],
      });
      await assertFails(deleteDoc(doc(staffContext.firestore(), `join_tokens/${TOKEN_ID}`)));
    });
  });
});
