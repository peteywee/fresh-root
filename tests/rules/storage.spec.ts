import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'fresh-schedules-dev',
    storage: { rules: fs.readFileSync('storage.rules', 'utf8') }
  });
});

afterAll(async () => { await testEnv.cleanup(); });

describe('storage rules', () => {
  it('user writes only to own folder', async () => {
    const ctx = testEnv.authenticatedContext('alice');
    const storage = ctx.storage();
    const ref = storage.ref('organizations/orgA/alice/file.txt');
    await expect(storage.upload(ref, new Blob(['hi']))).resolves.toBeTruthy();
  });

  it('user cannot write to another user\'s folder', async () => {
    const ctx = testEnv.authenticatedContext('alice');
    const storage = ctx.storage();
    const ref = storage.ref('organizations/orgA/bob/file.txt');
    await expect(storage.upload(ref, new Blob(['hi']))).rejects.toBeDefined();
  });
});
