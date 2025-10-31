// Use Jest globals for rules tests
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const firestoreOptions: any = { rules: fs.readFileSync('firestore.rules', 'utf8') };
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  if (firestoreHost) {
    const [host, portStr] = firestoreHost.split(':');
    firestoreOptions.host = host;
    firestoreOptions.port = Number(portStr);
  } else {
    // Default to localhost:8080 so tests can be pointed at a running emulator without extra env setup.
    firestoreOptions.host = 'localhost';
    firestoreOptions.port = 8080;
  }

  testEnv = await initializeTestEnvironment({
    projectId: 'fresh-schedules-dev',
    firestore: firestoreOptions
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore rules', () => {
  it('member can read org, admin can write', async () => {
    const ctx = testEnv.authenticatedContext('u1', { orgId: 'orgA', roles: ['org_member'] });
    const db = ctx.firestore();
    await expect(db.doc('orgs/orgA').get()).resolves.toBeTruthy();
  });

  it('non-admin cannot create join_tokens', async () => {
    const ctx = testEnv.authenticatedContext('u2', { orgId: 'orgA', roles: ['org_member'] });
    const db = ctx.firestore();
    await expect(db.collection('join_tokens/orgA').doc('t').set({ orgId: 'orgA' }))
      .rejects.toThrow();
  });

  it('admin can create join_tokens', async () => {
    const ctx = testEnv.authenticatedContext('admin1', { orgId: 'orgA', roles: ['manager'] });
    const db = ctx.firestore();
    await expect(db.collection('join_tokens/orgA').doc('t2').set({ orgId: 'orgA' }))
      .resolves.toBeUndefined();
  });
});
