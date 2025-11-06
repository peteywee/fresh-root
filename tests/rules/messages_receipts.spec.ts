// [P0][TEST][TEST] Messages Receipts Spec tests
// Tags: P0, TEST, TEST
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
  }
  else {
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

describe('messages and receipts rules', () => {
  it('admin can create messages, member cannot', async () => {
    const adminCtx = testEnv.authenticatedContext('a1', { orgId: 'orgA', roles: ['manager'] });
    const memberCtx = testEnv.authenticatedContext('m1', { orgId: 'orgA', roles: ['org_member'] });
    const adminDb = adminCtx.firestore();
    const memberDb = memberCtx.firestore();

    // admin create message
    await expect(adminDb.collection('organizations/orgA/messages').doc('msg1').set({ title: 'X', type: 'publish_notice', createdAt: Date.now(), targets: 'members' }))
      .resolves.toBeUndefined();

    // member cannot create message
    await expect(memberDb.collection('organizations/orgA/messages').doc('msg2').set({ title: 'Y' }))
      .rejects.toThrow();
  });

  it('member can create receipt for self, cannot for others', async () => {
    const memberCtx = testEnv.authenticatedContext('m1', { orgId: 'orgA', roles: ['org_member'] });
    const memberDb = memberCtx.firestore();
    // create own receipt
    await expect(memberDb.collection('organizations/orgA/receipts').doc('r1').set({ userId: 'm1' }))
      .resolves.toBeUndefined();
    // attempt to create receipt for another user
    await expect(memberDb.collection('organizations/orgA/receipts').doc('r2').set({ userId: 'other' }))
      .rejects.toThrow();
  });
});
