import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, test, expect } from "vitest";
import { setDoc, doc, getDoc } from "firebase/firestore";

import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rules = await readFile("firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({ 
    projectId: "demo-fresh", 
    firestore: { 
      rules,
      host: "127.0.0.1",
      port: 8080
    } 
  });
});

afterAll(async () => { await testEnv.cleanup(); });

function authed(uid: string, orgId: string, roles: string[]) {
  return testEnv.authenticatedContext(uid, { orgId, roles }).firestore();
}

test("manager can create membership in same org", async () => {
  const db = authed("m1", "orgA", ["manager"]);
  const ref = doc(db, "memberships/mA1");
  await expect(setDoc(ref, { orgId: "orgA", userId: "u2", roles: ["staff"], createdAt: Date.now(), updatedAt: Date.now() }))
    .resolves.toBeUndefined();
  await expect(getDoc(ref)).resolves.toBeTruthy();
});

test("staff cannot create membership", async () => {
  const db = authed("s1", "orgA", ["staff"]);
  const ref = doc(db, "memberships/mA2");
  await expect(setDoc(ref, { orgId: "orgA", userId: "u3", roles: ["staff"], createdAt: 1, updatedAt: 1 }))
    .rejects.toBeTruthy();
});

test("manager cannot write membership in different org", async () => {
  const db = authed("m1", "orgA", ["manager"]);
  const ref = doc(db, "memberships/mB1");
  await expect(setDoc(ref, { orgId: "orgB", userId: "uX", roles: ["staff"], createdAt: 1, updatedAt: 1 }))
    .rejects.toBeTruthy();
});
