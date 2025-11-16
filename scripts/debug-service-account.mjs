// [P0][APP][CODE] Debug Service Account
// Tags: P0, APP, CODE
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
async function run() {
  const cfg = JSON.parse(fs.readFileSync("firebase.test.json", "utf8"));
  const { host, port } = cfg.emulators.firestore;
  const rules = fs.readFileSync("firestore.rules", "utf8");
  const testEnv = await initializeTestEnvironment({
    projectId: "test-project-admin-forms",
    firestore: { host, port, rules },
  });
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc("service_accounts/svc-onboarding").set({ onboarding: true });
  });

  const ctx = testEnv.authenticatedContext("svc-onboarding", {});
  const db = ctx.firestore();
  try {
    await db
      .doc("compliance/adminResponsibilityForms/forms/form-123")
      .set({ id: "form-123", createdBy: "svc-onboarding" });
    console.log("write succeeded");
  } catch (e) {
    console.error("write failed", e.message);
  }

  await testEnv.cleanup();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
