import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { readFile } from "node:fs/promises";
import { setDoc, doc, getDoc, collection, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { beforeAll, afterAll, test, expect, describe } from "vitest";

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

function unauthContext() {
  return testEnv.unauthenticatedContext();
}

describe("Schedules collection - org-scoped", () => {
  test("manager can create schedule within same org", async () => {
    const ctx = authedContext("u1", "orgA", ["manager"]);
    const db = ctx.firestore();
    const ref = doc(db, "orgs/orgA/schedules/s1");
    await expect(setDoc(ref, { orgId: "orgA", startDate: 1, name: "Week 1" })).resolves.toBeUndefined();
    const snap = await getDoc(ref);
    expect(snap.exists()).toBe(true);
  });

  test("staff can read schedule within same org", async () => {
    // First create a schedule as manager
    const managerCtx = authedContext("u1", "orgA", ["manager"]);
    const managerDb = managerCtx.firestore();
    await setDoc(doc(managerDb, "orgs/orgA/schedules/s2"), { orgId: "orgA", startDate: 2, name: "Week 2" });
    
    // Then read as staff
    const staffCtx = authedContext("u2", "orgA", ["staff"]);
    const staffDb = staffCtx.firestore();
    const ref = doc(staffDb, "orgs/orgA/schedules/s2");
    const snap = await getDoc(ref);
    expect(snap.exists()).toBe(true);
  });

  test("staff cannot write schedule", async () => {
    const ctx = authedContext("u2", "orgA", ["staff"]);
    const db = ctx.firestore();
    const ref = doc(db, "orgs/orgA/schedules/s3");
    await expect(setDoc(ref, { orgId: "orgA", startDate: 3 })).rejects.toBeTruthy();
  });

  test("user from different org cannot read schedule", async () => {
    // Create schedule in orgA
    const ctxA = authedContext("u1", "orgA", ["manager"]);
    const dbA = ctxA.firestore();
    await setDoc(doc(dbA, "orgs/orgA/schedules/s4"), { orgId: "orgA", startDate: 4, name: "Week 4" });
    
    // Try to read from orgB
    const ctxB = authedContext("u3", "orgB", ["manager"]);
    const dbB = ctxB.firestore();
    const ref = doc(dbB, "orgs/orgA/schedules/s4");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });

  test("unauthenticated user cannot access schedules", async () => {
    const ctx = unauthContext();
    const db = ctx.firestore();
    const ref = doc(db, "orgs/orgA/schedules/s5");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });
});

describe("Shifts collection - nested under schedules", () => {
  test("manager can create shift", async () => {
    const ctx = authedContext("u1", "orgA", ["manager"]);
    const db = ctx.firestore();
    const ref = doc(db, "orgs/orgA/schedules/sched1/shifts/shift1");
    await expect(setDoc(ref, { orgId: "orgA", start: 1000, end: 2000 })).resolves.toBeUndefined();
  });

  test("staff can read shift but not write", async () => {
    // Create shift as manager
    const managerCtx = authedContext("u1", "orgA", ["manager"]);
    const managerDb = managerCtx.firestore();
    await setDoc(doc(managerDb, "orgs/orgA/schedules/sched2/shifts/shift2"), { 
      orgId: "orgA", start: 1000, end: 2000 
    });
    
    // Read as staff
    const staffCtx = authedContext("u2", "orgA", ["staff"]);
    const staffDb = staffCtx.firestore();
    const readRef = doc(staffDb, "orgs/orgA/schedules/sched2/shifts/shift2");
    const snap = await getDoc(readRef);
    expect(snap.exists()).toBe(true);
    
    // Try to write as staff
    const writeRef = doc(staffDb, "orgs/orgA/schedules/sched2/shifts/shift3");
    await expect(setDoc(writeRef, { orgId: "orgA", start: 3000, end: 4000 })).rejects.toBeTruthy();
  });

  test("cross-org access is blocked", async () => {
    const ctx = authedContext("u3", "orgB", ["manager"]);
    const db = ctx.firestore();
    const ref = doc(db, "orgs/orgA/schedules/sched3/shifts/shift4");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });
});

describe("Memberships collection", () => {
  test("authenticated user can read", async () => {
    const ctx = authedContext("u1", "orgA", ["manager"]);
    const db = ctx.firestore();
    const ref = doc(db, "memberships/m1");
    // This will fail on read if doc doesn't exist, but we test permission not existence
    await expect(getDoc(ref)).resolves.toBeTruthy();
  });

  test("manager can create membership", async () => {
    const ctx = authedContext("u1", "orgA", ["manager"]);
    const db = ctx.firestore();
    const ref = doc(db, "memberships/m2");
    await expect(setDoc(ref, { orgId: "orgA", userId: "u2", roles: ["staff"] })).resolves.toBeUndefined();
  });

  test("staff cannot create membership", async () => {
    const ctx = authedContext("u2", "orgA", ["staff"]);
    const db = ctx.firestore();
    const ref = doc(db, "memberships/m3");
    await expect(setDoc(ref, { orgId: "orgA", userId: "u3", roles: ["staff"] })).rejects.toBeTruthy();
  });

  test("unauthenticated user cannot read memberships", async () => {
    const ctx = unauthContext();
    const db = ctx.firestore();
    const ref = doc(db, "memberships/m4");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });
});

describe("Users collection", () => {
  test("user can read own profile", async () => {
    const ctx = authedContext("u1", "orgA", ["staff"]);
    const db = ctx.firestore();
    const ref = doc(db, "users/u1");
    await expect(getDoc(ref)).resolves.toBeTruthy();
  });

  test("user can write own profile", async () => {
    const ctx = authedContext("u1", "orgA", ["staff"]);
    const db = ctx.firestore();
    const ref = doc(db, "users/u1");
    await expect(setDoc(ref, { name: "User 1", email: "u1@example.com" })).resolves.toBeUndefined();
  });

  test("user cannot read another user's profile", async () => {
    const ctx = authedContext("u1", "orgA", ["staff"]);
    const db = ctx.firestore();
    const ref = doc(db, "users/u2");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });

  test("unauthenticated user cannot access profiles", async () => {
    const ctx = unauthContext();
    const db = ctx.firestore();
    const ref = doc(db, "users/u1");
    await expect(getDoc(ref)).rejects.toBeTruthy();
  });
});
