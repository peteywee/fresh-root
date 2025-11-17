// [P0][TEST][TEST] Storage Fixed Spec tests
// Tags: P0, TEST, TEST
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';
import * as admin from 'firebase-admin';

let storageTestEnv: RulesTestEnvironment;
let adminApp: admin.app.App | undefined;

beforeAll(async () => {
  const storageOptions: any = { rules: fs.readFileSync('storage.rules', 'utf8') };
  const storageHostRaw = process.env.STORAGE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  if (storageHostRaw) {
    try {
      const url = new URL(storageHostRaw.includes('://') ? storageHostRaw : `http://${storageHostRaw}`);
      storageOptions.host = url.hostname;
      storageOptions.port = Number(url.port) || 9199;
    } catch (err) {
      const [host, portStr] = storageHostRaw.split(':');
      storageOptions.host = host;
      storageOptions.port = Number(portStr) || 9199;
    }
  } else {
    storageOptions.host = 'localhost';
    storageOptions.port = 9199;
  }

  storageTestEnv = await initializeTestEnvironment({
    projectId: 'fresh-schedules-dev',
    storage: storageOptions
  });

  // Initialize admin SDK to create test users (talks to emulator because emulators are running)
  if (!admin.apps.length) {
    adminApp = admin.initializeApp({ projectId: 'fresh-schedules-dev' });
  } else {
    adminApp = admin.app();
  }

  // Ensure clean users
  try { await admin.auth().deleteUser('alice'); } catch {}
  try { await admin.auth().deleteUser('bob'); } catch {}

  await admin.auth().createUser({ uid: 'alice', email: 'alice@test.local', password: 'password' });
  await admin.auth().createUser({ uid: 'bob', email: 'bob@test.local', password: 'password' });
});

afterAll(async () => {
  try { await storageTestEnv.cleanup(); } catch {}
  try { if (adminApp) await adminApp.delete(); } catch {}
});

describe('storage rules', () => {
  it('user writes only to own folder', async () => {
  // Explicitly pass token claims; 'uid' is deprecated in mock token claims. Use 'sub' or omit.
  const ctx = storageTestEnv.authenticatedContext('alice', { sub: 'alice', email: 'alice@test.local' } as Record<string, unknown>);
    const storage = ctx.storage();
    const ref = storage.ref('organizations/orgA/alice/file.txt');
    await expect(ref.putString('hi')).resolves.toBeTruthy();
  });

  it('user cannot write to another user\'s folder', async () => {
  const ctx = storageTestEnv.authenticatedContext('alice', { sub: 'alice', email: 'alice@test.local' } as Record<string, unknown>);
    const storage = ctx.storage();
    const ref = storage.ref('organizations/orgA/bob/file.txt');
    await expect(ref.putString('hi')).rejects.toBeDefined();
  });
});
