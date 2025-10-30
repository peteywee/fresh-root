import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, afterAll, describe, test, expect } from 'vitest';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Load rules from repository root
  const rulesPath = join(process.cwd(), '../../firestore.rules');
  const firestoreOptions: any = { 
    rules: readFileSync(rulesPath, 'utf8'),
    host: 'localhost',
    port: 8080
  };
  
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  if (firestoreHost) {
    const [host, portStr] = firestoreHost.split(':');
    firestoreOptions.host = host;
    firestoreOptions.port = Number(portStr);
  }

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-fresh-rbac',
    firestore: firestoreOptions
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

describe('RBAC Rules Tests', () => {
  describe('Organization Access', () => {
    test('org_owner can write to org', async () => {
      const membershipId = 'u1_orgA';
      const ctx = testEnv.authenticatedContext('u1', {});
      const db = ctx.firestore();
      
      // First create membership
      await setDoc(doc(db, `memberships/${membershipId}`), {
        uid: 'u1',
        orgId: 'orgA',
        roles: ['owner']
      });
      
      // Then org document should be writable by owner via custom claims
      const ctxWithClaims = testEnv.authenticatedContext('u1', { 
        orgId: 'orgA', 
        roles: ['owner'] 
      });
      const dbClaims = ctxWithClaims.firestore();
      await expect(
        setDoc(doc(dbClaims, 'orgs/orgA'), { name: 'Org A' })
      ).resolves.toBeUndefined();
    });

    test('manager cannot write to org (only read)', async () => {
      const ctx = testEnv.authenticatedContext('u2', { 
        orgId: 'orgA', 
        roles: ['manager'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'orgs/orgA'), { name: 'Org A Modified' })
      ).rejects.toThrow();
    });

    test('staff cannot write to org', async () => {
      const ctx = testEnv.authenticatedContext('u3', { 
        orgId: 'orgA', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'orgs/orgA'), { name: 'Org A' })
      ).rejects.toThrow();
    });
  });

  describe('Schedule Access', () => {
    test('manager can create schedule in their org', async () => {
      const ctx = testEnv.authenticatedContext('u4', { 
        orgId: 'orgB', 
        roles: ['manager'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'schedules/orgB/s1'), { 
          orgId: 'orgB',
          name: 'Week 1',
          startDate: 1234567890
        })
      ).resolves.toBeUndefined();
    });

    test('scheduler can create schedule in their org', async () => {
      const ctx = testEnv.authenticatedContext('u5', { 
        orgId: 'orgB', 
        roles: ['scheduler'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'schedules/orgB/s2'), { 
          orgId: 'orgB',
          name: 'Week 2'
        })
      ).resolves.toBeUndefined();
    });

    test('staff cannot create schedule', async () => {
      const ctx = testEnv.authenticatedContext('u6', { 
        orgId: 'orgB', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'schedules/orgB/s3'), { 
          orgId: 'orgB',
          name: 'Week 3'
        })
      ).rejects.toThrow();
    });

    test('staff can read schedule from their org', async () => {
      const ctx = testEnv.authenticatedContext('u7', { 
        orgId: 'orgC', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        getDoc(doc(db, 'schedules/orgC/s1'))
      ).resolves.toBeTruthy();
    });

    test('user cannot read schedule from different org', async () => {
      const ctx = testEnv.authenticatedContext('u8', { 
        orgId: 'orgD', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        getDoc(doc(db, 'schedules/orgC/s1'))
      ).rejects.toThrow();
    });
  });

  describe('Membership Access', () => {
    test('manager can create membership in their org', async () => {
      const ctx = testEnv.authenticatedContext('u9', { 
        orgId: 'orgE', 
        roles: ['manager'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'memberships/newuser_orgE'), {
          uid: 'newuser',
          orgId: 'orgE',
          roles: ['staff'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      ).resolves.toBeUndefined();
    });

    test('admin can create membership in their org', async () => {
      const ctx = testEnv.authenticatedContext('u10', { 
        orgId: 'orgE', 
        roles: ['admin'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'memberships/anotheruser_orgE'), {
          uid: 'anotheruser',
          orgId: 'orgE',
          roles: ['scheduler']
        })
      ).resolves.toBeUndefined();
    });

    test('staff cannot create membership', async () => {
      const ctx = testEnv.authenticatedContext('u11', { 
        orgId: 'orgF', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'memberships/newuser_orgF'), {
          uid: 'newuser',
          orgId: 'orgF',
          roles: ['staff']
        })
      ).rejects.toThrow();
    });
  });

  describe('User Profile Access', () => {
    test('user can read their own profile', async () => {
      const ctx = testEnv.authenticatedContext('u12', { 
        orgId: 'orgG', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        getDoc(doc(db, 'users/u12'))
      ).resolves.toBeTruthy();
    });

    test('user can write their own profile', async () => {
      const ctx = testEnv.authenticatedContext('u13', { 
        orgId: 'orgG', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, 'users/u13'), {
          name: 'User 13',
          email: 'u13@example.com'
        })
      ).resolves.toBeUndefined();
    });

    test('user cannot read another user profile', async () => {
      const ctx = testEnv.authenticatedContext('u14', { 
        orgId: 'orgG', 
        roles: ['staff'] 
      });
      const db = ctx.firestore();
      await expect(
        getDoc(doc(db, 'users/u13'))
      ).rejects.toThrow();
    });
  });
});
