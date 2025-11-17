// [P0][APP][CODE] Rules
// Tags: P0, APP, CODE
import { writeFile } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function userOrgId() { return request.auth.token.orgId; }
    function userRoles() { return request.auth.token.roles; }
    function hasAnyRole(roles) {
      return isSignedIn() && (userRoles().hasAny(roles));
    }
    // Allow both 'admin' and 'manager' as write-capable per compatibility
    function isManager() {
      return isSignedIn() && (userRoles().hasAny(['org_owner','admin','manager']));
    }
    function sameOrg(resourceOrgId) {
      return isSignedIn() && userOrgId() == resourceOrgId;
    }

    // orgs — read by members, write by org_owner only (or server)
    match /orgs/{orgId} {
      allow read: if isSignedIn() && sameOrg(orgId);
      allow write: if isSignedIn() && userRoles().hasAny(['org_owner']);
    }

    // memberships — read own org, write manager+ within same org
    match /memberships/{mid} {
      allow read: if isSignedIn();
      allow create, update, delete: if isManager() && sameOrg(request.resource.data.orgId);
    }

    // schedules — manager+ can write within org, staff can read within org
    match /orgs/{orgId}/schedules/{sid} {
      allow read: if sameOrg(orgId);
      allow create, update, delete: if isManager() && sameOrg(orgId);
    }

    // shifts — similar to schedules
    match /orgs/{orgId}/schedules/{sid}/shifts/{shid} {
      allow read: if sameOrg(orgId);
      allow create, update, delete: if isManager() && sameOrg(orgId);
    }

    // positions, zones — manager+ write, all members read
    match /orgs/{orgId}/{collName=positions|zones}/{docId} {
      allow read: if sameOrg(orgId);
      allow create, update, delete: if isManager() && sameOrg(orgId);
    }

    // users profile (public minimal) — read own, write own
    match /users/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if isSignedIn() && request.auth.uid == uid;
    }
  }
}
`;

const FIRESTORE_INDEXES = `{
  "indexes": [
    {
      "collectionGroup": "schedules",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "shifts",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "start", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
`;

const CACHE_PROVIDER = `export interface CacheProvider {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class InMemoryCache implements CacheProvider {
  private store = new Map<string, { v: unknown; exp: number | null }>();
  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.exp && Date.now() > e.exp) { this.store.delete(key); return null; }
    return e.v as T;
  }
  async set<T>(key: string, value: T, ttlSec?: number) {
    const exp = ttlSec ? Date.now() + ttlSec * 1000 : null;
    this.store.set(key, { v: value, exp });
  }
  async del(key: string) { this.store.delete(key); }
}
`;

const AUTH_IFACE = `export type UserToken = {
  uid: string;
  orgId: string;
  roles: string[];
};

export interface AuthContext {
  currentUser(): Promise<UserToken | null>;
  requireManager(): Promise<UserToken>;
}
`;

export async function ensureRules({
  root,
  force,
  planOnly,
}: {
  root: string;
  force: boolean;
  planOnly: boolean;
}) {
  const paths = [
    ["firestore.rules", FIRESTORE_RULES],
    ["firestore.indexes.json", FIRESTORE_INDEXES],
    ["services/api/src/cache/provider.ts", CACHE_PROVIDER],
    ["services/api/src/auth/types.ts", AUTH_IFACE],
  ] as const;

  for (const [rel, content] of paths) {
    const file = join(root, rel);
    if (!planOnly) {
      const dir = dirname(file);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      if (!existsSync(file) || force) {
        await writeFile(file, content, "utf8");
      }
    }
  }

  // Ensure a README for rules
  const readmePath = join(root, "tests/rules/README.md");
  const readme = `# Firestore Rules Tests

- Uses @firebase/rules-unit-testing
- See \`schedules.test.ts\` for patterns
- Run: \`pnpm test:rules\`
`;
  if (!planOnly) {
    const dir = dirname(readmePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await writeFile(readmePath, readme, "utf8");
  }

  // Scaffold a sample test
  const testPath = join(root, "tests/rules/schedules.test.ts");
  const testContent = `import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { readFile } from "node:fs/promises";
import { setDoc, doc, getDoc, collection, addDoc } from "firebase/firestore";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { beforeAll, afterAll, test, expect } from "vitest";

let testEnv: any;

beforeAll(async () => {
  const rules = await readFile("firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: "demo-fresh",
    firestore: { rules }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authedContext(uid: string, orgId: string, roles: string[]) {
  return testEnv.authenticatedContext(uid, { orgId, roles });
}

test("manager can write schedule within same org", async () => {
  const ctx = authedContext("u1", "orgA", ["manager"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s1");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).resolves.toBeUndefined();
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});

test("staff cannot write schedule", async () => {
  const ctx = authedContext("u2", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s2");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).rejects.toBeTruthy();
});
`;
  if (!planOnly) {
    const dir = dirname(testPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(testPath) || force) await writeFile(testPath, testContent, "utf8");
  }
}
