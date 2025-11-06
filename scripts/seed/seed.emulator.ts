// [P0][APP][CODE] Seed Emulator
// Tags: P0, APP, CODE
/* pnpm seed (requires emulators running) */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

const app = initializeApp({ projectId: "fresh-schedules-dev" });
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding emulator data…");

  const { users } = await auth.listUsers();
  if (users.length) await auth.deleteUsers(users.map((u: any) => u.uid));

  const manager = await auth.createUser({
    uid: "manager_uid_123",
    email: "manager@test.com",
    password: "TestUser!2345",
    displayName: "Test Manager",
  });
  const staff = await auth.createUser({
    uid: "staff_uid_123",
    email: "staff@test.com",
    password: "TestUser!2345",
    displayName: "Test Staff",
  });

  const orgRef = db.collection("organizations").doc("test_org_123");
  await orgRef.set({
    name: "Demo Organization",
    ownerUid: manager.uid,
    createdAt: new Date(),
  });

  await orgRef.collection("members").doc(manager.uid).set({
    role: "org_owner",
    status: "active",
    joinedAt: new Date(),
  });

  await orgRef.collection("members").doc(staff.uid).set({
    role: "org_member",
    status: "pending",
    joinedAt: new Date(),
  });

  await db.collection("users").doc(manager.uid).set({
    displayName: "Test Manager",
    lastOrgId: "test_org_123",
    updatedAt: new Date(),
  });

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
