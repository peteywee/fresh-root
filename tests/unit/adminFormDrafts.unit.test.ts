// [P1][TEST][UNIT] adminFormDrafts helper coverage
// Tags: P1, TEST, UNIT

import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, any>();

function makeRef(id: string) {
  return {
    id,
    async set(data: any) {
      store.set(id, { ...data });
    },
    async update(data: any) {
      store.set(id, { ...(store.get(id) || {}), ...data });
    },
    async get() {
      const data = store.get(id);
      return data ? { exists: true, data: () => ({ ...data }) } : { exists: false };
    },
    async delete() {
      store.delete(id);
    },
  };
}

const fakeDb = {
  collection: (name: string) => ({
    doc: (id?: string) => makeRef(id || `${name}-${Math.random().toString(36).slice(2)}`),
  }),
  async runTransaction<T>(fn: (txn: any) => Promise<T>) {
    const txn = {
      get: async (ref: any) => ref.get(),
      update: async (ref: any, data: any) => ref.update(data),
    };
    return fn(txn);
  },
};

vi.mock("../../apps/web/lib/firebase-admin", () => ({
  getFirebaseAdminDb: () => fakeDb,
}));

vi.mock("../../apps/web/src/lib/firebase/typed-wrappers", () => ({
  setDocWithType: async (_db: unknown, ref: any, data: any) => ref.set(data),
  getDocWithType: async (_db: unknown, ref: any) => {
    const snap = await ref.get();
    return snap.exists ? snap.data() : null;
  },
  updateDocWithType: async (_db: unknown, ref: any, data: any) => ref.update(data),
  transactionWithType: async (_db: unknown, cb: any) => fakeDb.runTransaction(cb),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminDb: () => fakeDb,
}));

vi.mock("@/src/lib/firebase/typed-wrappers", () => ({
  setDocWithType: async (_db: unknown, ref: any, data: any) => ref.set(data),
  getDocWithType: async (_db: unknown, ref: any) => {
    const snap = await ref.get();
    return snap.exists ? snap.data() : null;
  },
  updateDocWithType: async (_db: unknown, ref: any, data: any) => ref.update(data),
  transactionWithType: async (_db: unknown, cb: any) => fakeDb.runTransaction(cb),
}));

import {
  consumeAdminFormDraft,
  createAdminFormDraft,
  getAdminFormDraft,
} from "../../apps/web/src/lib/onboarding/adminFormDrafts";

const baseForm = {
  networkId: "net-1",
  uid: "user-1",
  role: "network_owner",
  certification: {
    acknowledgesDataProtection: true,
    acknowledgesGDPRCompliance: true,
    acknowledgesAccessControl: true,
    acknowledgesMFARequirement: true,
    acknowledgesAuditTrail: true,
    acknowledgesIncidentReporting: true,
    understandsRoleScope: true,
    agreesToTerms: true,
  },
  data: { legalName: "Acme LLC" },
};

describe("adminFormDrafts", () => {
  beforeEach(() => {
    store.clear();
  });

  it("creates and retrieves an active draft", async () => {
    const { formToken } = await createAdminFormDraft({
      userId: "user-1",
      form: baseForm,
      taxValidation: { isValid: true },
      ttlMinutes: 5,
    });

    expect(formToken).toBeTruthy();

    const draft = await getAdminFormDraft(formToken);
    expect(draft).toBeTruthy();
    expect(draft?.form.data?.legalName).toBe("Acme LLC");
  });

  it("consumes a draft only once", async () => {
    const { formToken } = await createAdminFormDraft({
      userId: "user-1",
      form: baseForm,
      taxValidation: { isValid: true, reason: "autovalidated" },
    });

    const first = await consumeAdminFormDraft({ formToken, expectedUserId: "user-1" });
    expect(first).not.toBeNull();
    expect(first?.form.data?.legalName).toBe("Acme LLC");

    const second = await consumeAdminFormDraft({ formToken, expectedUserId: "user-1" });
    expect(second).toBeNull();

    const draft = await getAdminFormDraft(formToken);
    expect(draft).toBeNull();
  });
});
