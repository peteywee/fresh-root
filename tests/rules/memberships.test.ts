// [P0][TEST][TEST] Memberships Test tests
// Tags: P0, TEST, TEST
import { readFile } from "node:fs/promises";

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { beforeAll, afterAll, test, expect } from "vitest";
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

test("✅ ALLOW: Member can read own membership", async () => {
  // Setup membership
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/m1"), {
      orgId: "orgA",
      userId: "user1",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = authed("user1", "orgA", ["staff"]);
  await expect(getDoc(doc(db, "memberships/m1"))).resolves.toBeTruthy();
});

test("✅ ALLOW: Member can read other memberships in same org", async () => {
  // Setup memberships
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/m2"), {
      orgId: "orgA",
      userId: "user2",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = authed("user1", "orgA", ["staff"]);
  await expect(getDoc(doc(db, "memberships/m2"))).resolves.toBeTruthy();
});

test("❌ DENY: Unauthenticated user cannot read memberships", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/m1"), {
      orgId: "orgA",
      userId: "user1",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = testEnv.unauthenticatedContext().firestore();
  await expect(getDoc(doc(db, "memberships/m1"))).rejects.toBeTruthy();
});

test("❌ DENY: Cannot read memberships from other orgs", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/mB1"), {
      orgId: "orgB",
      userId: "userB",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = authed("user1", "orgA", ["staff"]);
  await expect(getDoc(doc(db, "memberships/mB1"))).rejects.toBeTruthy();
});

test("❌ DENY: Member cannot update membership role (only managers)", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/m1"), {
      orgId: "orgA",
      userId: "user1",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = authed("user1", "orgA", ["staff"]);
  const ref = doc(db, "memberships/m1");
  await expect(
    setDoc(ref, {
      orgId: "orgA",
      userId: "user1",
      roles: ["manager"], // Trying to elevate own role
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  ).rejects.toBeTruthy();
});

test("✅ ALLOW: Manager can update membership role", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "memberships/m3"), {
      orgId: "orgA",
      userId: "user3",
      roles: ["staff"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  const db = authed("manager1", "orgA", ["manager"]);
  const ref = doc(db, "memberships/m3");
  await expect(
    setDoc(ref, {
      orgId: "orgA",
      userId: "user3",
      roles: ["scheduler"], // Manager promoting staff
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  ).resolves.toBeUndefined();
});
