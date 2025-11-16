// [P0][FIREBASE][TEST] Admin Form Spec tests
// Tags: P0, FIREBASE, TEST
// Consolidated Admin Responsibility Form rules tests
// Tags: P1, INTEGRITY, TEST, FIRESTORE, RULES, COMPLIANCE
import { assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { describe, it, beforeAll, afterAll } from "vitest";

import { initFirestoreTestEnv } from "./_setup";

describe("Admin Responsibility Form rules", () => {
  let testEnv: RulesTestEnvironment;
  const SVC_UID = "svc-onboarding";
  const NORMAL_UID = "normal-user";
  const FORM_ID = "form-123";

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv("test-project-admin-forms");
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("ALLOW: onboarding service account can create and read admin form", async () => {
    // Create service_accounts doc and then assert service account can create/read
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `service_accounts/${SVC_UID}`), {
        onboarding: true,
        name: "onboarding-service",
      });
    });

    // Ensure the token has `sub` claim so the emulator maps to request.auth.uid
    // (some emulators require explicit `sub` for service identities in tests).
    const svcContext = testEnv.authenticatedContext(SVC_UID, { sub: SVC_UID, user_id: SVC_UID });
    const svcDb = svcContext.firestore();

    await assertSucceeds(
      setDoc(doc(svcDb, `compliance/adminResponsibilityForms/forms/${FORM_ID}`), {
        id: FORM_ID,
        createdAt: Date.now(),
        createdBy: SVC_UID,
        status: "submitted",
        data: { agreement: true },
      }),
    );

    await assertSucceeds(
      getDoc(doc(svcDb, `compliance/adminResponsibilityForms/forms/${FORM_ID}`)),
    );
  });

  it("DENY: unauthenticated cannot create or read admin form", async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(
      setDoc(doc(db, `compliance/adminResponsibilityForms/forms/anon-form`), { foo: "bar" }),
    );
    await assertFails(getDoc(doc(db, `compliance/adminResponsibilityForms/forms/${FORM_ID}`)));
  });

  it("DENY: normal authenticated user cannot create or read admin form", async () => {
    const userCtx = testEnv.authenticatedContext(NORMAL_UID, { orgId: "any", roles: ["staff"] });
    const db = userCtx.firestore();
    await assertFails(
      setDoc(doc(db, `compliance/adminResponsibilityForms/forms/user-form`), { foo: "bar" }),
    );
    await assertFails(getDoc(doc(db, `compliance/adminResponsibilityForms/forms/${FORM_ID}`)));
  });

  it("DENY: unauthenticated cannot update admin form (immutable enforcement)", async () => {
    // Seed a document as the admin/service and test unauthenticated update is denied
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `compliance/adminResponsibilityForms/forms/${FORM_ID}`), {
        id: FORM_ID,
        createdAt: Date.now(),
        token: FORM_ID,
        status: "submitted",
        expiresAt: Date.now() + 1000 * 60 * 60,
        immutable: false,
      });
    });

    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(
      updateDoc(doc(db, `compliance/adminResponsibilityForms/forms/${FORM_ID}`), {
        status: "attached",
      }),
    );
  });
});
