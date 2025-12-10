// [P1][TEST][UNIT] firebase typed wrappers
// Tags: P1, TEST, UNIT

import { beforeEach, describe, expect, it } from "vitest";
import {
  batchWrite,
  countDocuments,
  deleteDocSafe,
  getDocWithType,
  getDocWithTypeOrThrow,
  isDocumentType,
  queryWithType,
  queryWithTypeSingle,
  setDocWithType,
  transactionWithType,
  updateDocWithType,
} from "../../apps/web/src/lib/firebase/typed-wrappers";

type Stored = Record<string, any>;
const store = new Map<string, Stored>();

function makeRef(id: string) {
  return {
    id,
    path: id,
    async get() {
      const data = store.get(id);
      return data ? { exists: true, data: () => ({ ...data }) } : { exists: false };
    },
    async set(data: any, opts?: { merge?: boolean }) {
      if (opts?.merge) {
        store.set(id, { ...(store.get(id) || {}), ...data });
      } else {
        store.set(id, { ...data });
      }
    },
    async update(data: any) {
      store.set(id, { ...(store.get(id) || {}), ...data });
    },
    async delete() {
      store.delete(id);
    },
  };
}

const fakeDb = {
  async runTransaction(fn: any) {
    const txn = {
      get: async (ref: any) => ref.get(),
      update: async (ref: any, data: any) => ref.update(data),
      set: async (ref: any, data: any) => ref.set(data),
    };
    return fn(txn);
  },
  batch: () => {
    const ops: { type: string; ref: any; data?: any }[] = [];
    return {
      set: (ref: any, data: any) => ops.push({ type: "set", ref, data }),
      update: (ref: any, data: any) => ops.push({ type: "update", ref, data }),
      delete: (ref: any) => ops.push({ type: "delete", ref }),
      commit: async () => {
        for (const op of ops) {
          if (op.type === "set") {
            await op.ref.set(op.data);
          } else if (op.type === "update") {
            await op.ref.update(op.data);
          } else if (op.type === "delete") {
            await op.ref.delete();
          }
        }
      },
    };
  },
};

describe("firebase typed wrappers", () => {
  beforeEach(() => {
    store.clear();
  });

  it("sets, updates, and reads docs with helpers", async () => {
    const ref = makeRef("doc-1");

    await setDocWithType(fakeDb as any, ref as any, { name: "alpha", count: 1 });
    await updateDocWithType(fakeDb as any, ref as any, { count: 2 });

    const doc = await getDocWithType<{ name: string; count: number }>(fakeDb as any, ref as any);
    expect(doc).toEqual({ name: "alpha", count: 2 });

    const docRequired = await getDocWithTypeOrThrow<{ name: string; count: number }>(
      fakeDb as any,
      ref as any,
    );
    expect(docRequired.count).toBe(2);
  });

  it("runs transactions via transactionWithType", async () => {
    const ref = makeRef("doc-2");
    await setDocWithType(fakeDb as any, ref as any, { total: 1 });

    const result = await transactionWithType(fakeDb as any, async (txn: any) => {
      const snap = await txn.get(ref);
      const current = snap.exists ? snap.data().total : 0;
      await txn.update(ref, { total: current + 4 });
      return current + 4;
    });

    expect(result).toBe(5);
    const updated = await getDocWithType<{ total: number }>(fakeDb as any, ref as any);
    expect(updated?.total).toBe(5);
  });

  it("deletes documents with deleteDocSafe", async () => {
    const ref = makeRef("doc-del");
    await setDocWithType(fakeDb as any, ref as any, { remove: true });

    await deleteDocSafe(fakeDb as any, ref as any);

    const snap = await ref.get();
    expect(snap.exists).toBe(false);
  });

  it("executes batchWrite operations", async () => {
    const refA = makeRef("batch-a");
    const refB = makeRef("batch-b");

    await batchWrite(fakeDb as any, [
      { type: "set", ref: refA as any, data: { value: 1 } },
      { type: "set", ref: refB as any, data: { value: 2 } },
      { type: "update", ref: refB as any, data: { value: 3 } },
    ]);

    const a = await getDocWithType<{ value: number }>(fakeDb as any, refA as any);
    const b = await getDocWithType<{ value: number }>(fakeDb as any, refB as any);

    expect(a?.value).toBe(1);
    expect(b?.value).toBe(3);
  });

  it("queries collections with query helpers", async () => {
    const ref1 = makeRef("q-1");
    await setDocWithType(fakeDb as any, ref1 as any, { label: "one" });

    const q = {
      get: async () => ({
        empty: false,
        docs: [{ id: "q-1", data: () => ({ label: "one" }) }],
        count: () => ({ get: async () => ({ data: () => ({ count: 1 }) }) }),
      }),
      limit: () => q,
      count: () => ({ get: async () => ({ data: () => ({ count: 1 }) }) }),
    } as any;

    const list = await queryWithType<{ label: string }>(fakeDb as any, q);
    expect(list.data).toHaveLength(1);
    expect(list.data[0]).toMatchObject({ id: "q-1", label: "one" });

    const single = await queryWithTypeSingle<{ label: string }>(fakeDb as any, q);
    expect(single.data?.label).toBe("one");
  });

  it("throws when queryWithType forbids empty results", async () => {
    const qEmpty = {
      limit: () => qEmpty,
      get: async () => ({ empty: true, docs: [] }),
    } as any;

    await expect(queryWithType(fakeDb as any, qEmpty, { allowEmpty: false })).rejects.toThrow(
      /no results/i,
    );
  });

  it("counts documents with countDocuments", async () => {
    const qCount = {
      count: () => ({
        get: async () => ({
          data: () => ({ count: 7 }),
        }),
      }),
    } as any;

    const count = await countDocuments(fakeDb as any, qCount);
    expect(count).toBe(7);
  });

  it("identifies document shapes with isDocumentType", () => {
    expect(isDocumentType<{ id: string }>({ id: "a" }, ["id"])).toBe(true);
    expect(isDocumentType<{ id: string }>({ name: "x" }, ["id"])).toBe(false);
    expect(isDocumentType<{ id: string }>(null, ["id"])).toBe(false);
  });
});
