// [P1][TEST][UNIT] joinOrganization handler - unit tests (mocked admin)
// Tags: P1, TEST, UNIT

import { describe, it, expect, vi } from "vitest";

// In-memory Firestore & Auth mock implementation for unit testing
const firestoreData: Record<string, any> = {};

function docPath(...parts: string[]) {
  return parts.join("/");
}

function createDoc(refPath: string, data: any) {
  firestoreData[refPath] = { ...data };
}

function getDoc(refPath: string) {
  return firestoreData[refPath] ? { exists: true, data: () => ({ ...firestoreData[refPath] }) } : { exists: false };
}

// Minimal mock of Firestore's collection/doc reference
const fakeFirestore = {
  collection: (path: string) => ({
    doc: (id?: string) => {
      const pathId = id || `doc-${Date.now()}`;
      const refPath = `${path}/${pathId}`;
      return {
        _path: refPath,
        id: pathId,
        get: async () => getDoc(refPath),
        set: async (data: any) => {
          firestoreData[refPath] = { ...(firestoreData[refPath] || {}), ...data };
        },
        update: async (data: any) => {
          firestoreData[refPath] = { ...(firestoreData[refPath] || {}), ...data };
        },
      };
    },
    docRef: null,
    id: path,
  }),
  doc: (path: string) => ({
    _path: path,
    get: async () => getDoc(path),
    set: async (data: any) => {
      firestoreData[path] = { ...(firestoreData[path] || {}), ...data };
    },
    update: async (data: any) => {
      firestoreData[path] = { ...(firestoreData[path] || {}), ...data };
    },
  }),
  collectionGroup: (name: string) => ({
    where: function (field: string, op: string, value: any) {
      const filters: any[] = [{ field, op, value }];
      const chain: any = {
        where: (f: string, o: string, v: any) => {
          filters.push({ field: f, op: o, value: v });
          return chain;
        },
        limit: () => ({ get: async () => chain.get() }),
        get: async () => {
          // Find docs in firestoreData that are in 'memberships' collection and match filters
          const docs = Object.entries(firestoreData)
            .filter(([path, data]) => path.includes('memberships/'))
            .filter(([, data]) => filters.every((f) => {
              if (!data) return false;
              const val = (data as any)[f.field];
              if (f.op === '==') return val === f.value;
              return false;
            }))
            .map(([path, data]) => ({ id: path.split('/').pop(), data: () => data }));
            console.info(`[FAKE FIRESTORE] collectionGroup.get ${name} filters=${JSON.stringify(chain.filters)} docs=${docs.map(d=>d.id).join(',')}`);
            return { empty: docs.length === 0, docs };
        },
      };
      return chain;
    },
    get: async () => ({ docs: [] }),
  }),
  runTransaction: async (cb: any) => {
    // For simplicity, not fully implementing transaction isolation; call cb with a transaction object
    const transaction: any = {
      get: async (ref: any) => getDoc(ref._path),
      set: async (ref: any, data: any, options?: any) => {
        createDoc(ref._path, data);
      },
      update: async (ref: any, data: any) => {
        const existing = firestoreData[ref._path] || {};
        const newData: any = { ...existing };
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === 'object' && (v as any).__increment !== undefined) {
            const inc = (v as any).__increment as number;
            const base = typeof newData[k] === 'number' ? newData[k] : 0;
            newData[k] = base + inc;
          } else {
            newData[k] = v;
          }
        }
        firestoreData[ref._path] = newData;
      },
    };
    return await cb(transaction);
  },
  FieldValue: {
    increment: (n: number) => ({ __increment: n }),
    serverTimestamp: () => ({ _isServerTimestamp: true }),
  },
  Timestamp: {
    now: () => ({ toMillis: Date.now, _isTimestamp: true }),
    fromDate: (d: Date) => ({ toDate: () => d }),
  },
};

const authUsers: Record<string, any> = {};
let userSeq = 1000;

const fakeAuth = {
  createUser: async (payload: any) => {
    const uid = `user-${userSeq++}`;
    authUsers[uid] = { uid, email: payload.email, displayName: payload.displayName };
    return { uid, email: payload.email, displayName: payload.displayName };
  },
  getUserByEmail: async (email: string) => {
    const user = Object.values(authUsers).find((u: any) => u.email === email);
    if (user) return user;
    const err: any = new Error("user-not-found");
    err.code = "auth/user-not-found";
    throw err;
  },
  deleteUser: async (uid: string) => {
    delete authUsers[uid];
    return true;
  },
  createCustomToken: async (uid: string) => `token-for-${uid}`,
};

vi.mock("firebase-admin", async () => {
  return {
    auth: () => fakeAuth,
    firestore: () => fakeFirestore,
    firestoreInstance: fakeFirestore,
    firestoreFieldValue: fakeFirestore.FieldValue,
    initializeApp: vi.fn(),
  };
});

// Import the handler after mocking firebase-admin
const { joinOrganizationHandler } = await import("../../functions/src/joinOrganization");

describe("joinOrganizationHandler (unit, mocked admin)", () => {
  it("creates a new membership for a new user and updates token", async () => {
    // Prepare token
    const orgId = `org-${Date.now()}`;
    const tokenId = `token-${Date.now()}`;

    firestoreData[`join_tokens/${tokenId}`] = {
      orgId,
      role: "member",
      status: "active",
      createdAt: { toDate: () => new Date() },
      expiresAt: { toDate: () => new Date(Date.now() + 1000 * 60 * 60) },
      maxUses: 1,
      currentUses: 0,
      createdBy: "test-admin",
    };

    const email = `mock-join-${Date.now()}@example.com`;

    const res = await joinOrganizationHandler({
      data: { token: tokenId, email, password: "test-12345", displayName: "Mock User" },
      auth: undefined,
    }, { db: fakeFirestore, auth: fakeAuth });

    expect(res.success).toBe(true);
    expect(res.userId).toBeDefined();
    expect(res.membershipId).toBeDefined();

    // token currentUses should be incremented
    const token = firestoreData[`join_tokens/${tokenId}`];
    expect(token.currentUses).toBe(1);

    // membership exists
    const membership = Object.values(firestoreData).find((d: any) => d && d.uid === res.userId && d.orgId === orgId);
    expect(membership).toBeTruthy();
  });

  it("returns same membership for repeated call (idempotency)", async () => {
    const orgId = `org-${Date.now()}`;
    const tokenId = `token-${Date.now()}`;

    firestoreData[`join_tokens/${tokenId}`] = {
      orgId,
      role: "member",
      status: "active",
      createdAt: { toDate: () => new Date() },
      expiresAt: { toDate: () => new Date(Date.now() + 1000 * 60 * 60) },
      maxUses: 2,
      currentUses: 0,
      createdBy: "test-admin",
    };

    const email = `mock-join-${Date.now()}@example.com`;

    const res1 = await joinOrganizationHandler({
      data: { token: tokenId, email, password: "test-12345", displayName: "Mock User" },
      auth: undefined,
    }, { db: fakeFirestore, auth: fakeAuth });

    const res2 = await joinOrganizationHandler({
      data: { token: tokenId, email, password: "test-12345", displayName: "Mock User" },
      auth: undefined,
    }, { db: fakeFirestore, auth: fakeAuth });

    expect(res1.membershipId).toBe(res2.membershipId);

    const token = firestoreData[`join_tokens/${tokenId}`];
    // Since the second call returns existing membership (idempotent), it should NOT consume token again
    expect(token.currentUses).toBe(1);
  });
});
