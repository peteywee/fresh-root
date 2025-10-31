import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { readFile } from "node:fs/promises";
import { setDoc, doc, getDoc, collection, addDoc } from "firebase/firestore";
import { beforeAll, afterAll, test, expect } from "vitest";

let testEnv: any;

beforeAll(async () => {
  const rules = await readFile("firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: "demo-fresh",
    firestore: { rules }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authedContext(uid: string, orgId: string, roles: string[]) {
  return testEnv.authenticatedContext(uid, { orgId, roles });
}

test("manager can write schedule within same org", async () => {
  const ctx = authedContext("u1", "orgA", ["manager"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s1");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).resolves.toBeUndefined();
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});

test("staff cannot write schedule", async () => {
  const ctx = authedContext("u2", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s2");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).rejects.toBeTruthy();
});

test("org_owner can write to org", async () => {
  const ctx = authedContext("u3", "orgA", ["org_owner"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA");
  await expect(setDoc(ref, { name: "Org A", createdAt: Date.now() })).resolves.toBeUndefined();
});

test("staff cannot write to org", async () => {
  const ctx = authedContext("u4", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA");
  await expect(setDoc(ref, { name: "Org A" })).rejects.toBeTruthy();
});

test("user can read and write their own profile", async () => {
  const ctx = authedContext("u5", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "users/u5");
  await expect(setDoc(ref, { name: "User 5", email: "u5@test.com" })).resolves.toBeUndefined();
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});

test("user cannot read another user profile", async () => {
  const ctx = authedContext("u6", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "users/u7");
  await expect(getDoc(ref)).rejects.toBeTruthy();
});
