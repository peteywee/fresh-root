// [P2][APP][CODE] Kv
// Tags: P2, APP, CODE
// Small IndexedDB KV store using idb.
// Avoids localStorage perf/size pitfalls and is resilient across tabs.

import { openDB } from "idb";

type KV = { key: string; value: unknown; expiresAt?: number };

const DB_NAME = "fresh-schedules-kv";
const STORE = "kv";
const VERSION = 1;

async function db() {
  return await openDB(DB_NAME, VERSION, {
    upgrade(d: IDBDatabase) {
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath: "key" });
        s.createIndex("by-expiry", "expiresAt");
      }
    },
  });
}

export async function kvSet(key: string, value: unknown, ttlMs?: number) {
  const now = Date.now();
  const expiresAt = ttlMs ? now + ttlMs : undefined;
  const handle = await db();
  await handle.put(STORE, { key, value, expiresAt });
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const handle = await db();
  const row = (await handle.get(STORE, key)) as KV | undefined;
  if (!row) return null;
  if (row.expiresAt && row.expiresAt < Date.now()) {
    await handle.delete(STORE, key);
    return null;
  }
  return row.value as T;
}

export async function kvDelete(key: string) {
  const handle = await db();
  await handle.delete(STORE, key);
}

export async function kvCleanupExpired() {
  const handle = await db();
  const tx = handle.transaction(STORE, "readwrite");
  const idx = tx.store.index("by-expiry");
  let cur = await idx.openCursor();
  const now = Date.now();
  while (cur) {
    const val = cur.value as KV;
    if (val.expiresAt && val.expiresAt < now) await cur.delete();
    cur = await cur.continue();
  }
  await tx.done;
}
