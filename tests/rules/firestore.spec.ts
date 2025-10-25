import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'fresh-schedules-dev',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore rules', () => {
  it('member can read org, admin can write', async () => {
    const ctx = testEnv.authenticatedContext('u1', { roles: { 'orgA': 'org_member' }});
    const db = ctx.firestore();
    await expect(db.doc('organizations/orgA').get()).resolves.toBeTruthy();
  });

  it('non-admin cannot create join_tokens', async () => {
    const ctx = testEnv.authenticatedContext('u2', { roles: { 'orgA': 'org_member' }});
    const db = ctx.firestore();
    await expect(db.collection('join_tokens').doc('t').set({ orgId: 'orgA' }))
      .rejects.toThrow();
  });

  it('admin can create join_tokens', async () => {
    const ctx = testEnv.authenticatedContext('admin1', { roles: { 'orgA': 'org_admin' }});
    const db = ctx.firestore();
    await expect(db.collection('join_tokens').doc('t2').set({ orgId: 'orgA' }))
      .resolves.toBeUndefined();
  });
});
