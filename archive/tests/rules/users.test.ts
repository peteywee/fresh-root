// [P0][TEST][TEST] Users Test tests
// Tags: P0, TEST, TEST
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { beforeAll, afterAll, test, expect } from "vitest";

import { initFirestoreTestEnv } from "./_setup";
export const TEST_PROJECT_ID = "demo-fresh";
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initFirestoreTestEnv("demo-fresh-users-test");
});
afterAll(async () => {
  await testEnv.cleanup();
});

function authed(uid: string, orgId: string, roles: string[]) {
  return testEnv.authenticatedContext(uid, { orgId, roles }).firestore();
}

test("user can write own profile", async () => {
  const db = authed("u1", "orgA", ["staff"]);
  const ref = doc(db, "users/u1");
  await expect(setDoc(ref, { displayName: "Pat" })).resolves.toBeUndefined();
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});

test("user cannot write other user's profile", async () => {
  const db = authed("u1", "orgA", ["staff"]);
  const ref = doc(db, "users/u2");
  await expect(setDoc(ref, { displayName: "X" })).rejects.toBeTruthy();
});
