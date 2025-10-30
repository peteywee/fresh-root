import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import { beforeAll, afterAll, test } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Navigate to workspace root to find firestore.rules
  const rulesPath = join(process.cwd(), "../../firestore.rules");
  testEnv = await initializeTestEnvironment({
    projectId: "demo-fresh",
    firestore: {
      rules: readFileSync(rulesPath, "utf8"),
      host: "127.0.0.1",
      port: 8080
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authed(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function unauth() {
  return testEnv.unauthenticatedContext().firestore();
}

test("deny unauthenticated read of org doc", async () => {
  const db = unauth();
  const ref = doc(db, "orgs/demo-org");
  await assertFails(getDoc(ref));
});

test("member can read their org", async () => {
  // seed membership
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await setDoc(doc(unauthDb, "memberships", "u1_demo-org"), { uid: "u1", orgId: "demo-org", roles: ["manager"] });

  const db = authed("u1");
  const ref = doc(db, "orgs", "demo-org");
  await assertSucceeds(getDoc(ref));
});

test("non-member cannot read org", async () => {
  const db = authed("u2");
  const ref = doc(db, "orgs", "demo-org");
  await assertFails(getDoc(ref));
});
