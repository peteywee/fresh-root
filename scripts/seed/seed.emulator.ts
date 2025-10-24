/* pnpm seed (requires emulators running) */
import * as admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const app = admin.initializeApp({ projectId: 'fresh-schedules-dev' });
const auth = admin.auth();
const db = admin.firestore();

async function seed() {
  console.log('Seeding emulator data…');

  const { users } = await auth.listUsers();
  if (users.length) await auth.deleteUsers(users.map((u) => u.uid));

  const manager = await auth.createUser({
    uid: 'manager_uid_123',
    email: 'manager@test.com',
    password: 'TestUser!2345',
    displayName: 'Test Manager'
  });
  const staff = await auth.createUser({
    uid: 'staff_uid_123',
    email: 'staff@test.com',
    password: 'TestUser!2345',
    displayName: 'Test Staff'
  });

  const orgRef = db.collection('organizations').doc('test_org_123');
  await orgRef.set({
    name: 'Demo Organization',
    ownerUid: manager.uid,
    createdAt: new Date()
  });

  await orgRef.collection('members').doc(manager.uid).set({
    role: 'org_owner',
    status: 'active',
    joinedAt: new Date()
  });

  await orgRef.collection('members').doc(staff.uid).set({
    role: 'org_member',
    status: 'pending',
    joinedAt: new Date()
  });

  await db.collection('users').doc(manager.uid).set({
    displayName: 'Test Manager',
    lastOrgId: 'test_org_123',
    updatedAt: new Date()
  });

  console.log('Seed complete.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
