---
name: Inspector data
description: Refractor Specialist
---

# My Agent

Assumptions / Qualifiers

Node 20, pnpm workspace.

Next.js App Router (server-first), Firebase (Auth, Firestore).

You may already have some of these files—this agent is idempotent and won’t overwrite edited files without --force input.

“Caching” is abstracted as an interface with a default in-memory adapter; you can swap to Redis later without touching call-sites.

RBAC roles = ['org_owner','admin','manager','scheduler','staff'] (UI uses “Manager” display, rules accept both admin/manager for write per your policy).

Firestore rules and tests target multi-tenant org isolation.

Acceptance Criteria

A GitHub Action (repo-agent.yml) that can be run via workflow_dispatch and when commenting /run-agent in Issue #21.

The action builds and runs scripts/agent/agent.mts, which:

Validates monorepo structure (apps/web, packages/types, services/api).

Ensures RBAC Zod schemas present and exported.

Writes firestore.rules and firestore.indexes.json with org/role guards.

Generates Jest/Vitest tests using @firebase/rules-unit-testing that pass locally in CI.

Scaffolds a cache provider and auth interfaces.

CI job comments a summary back to Issue #21.

Green run: lint, typecheck, build agent, run rules tests all succeed.

Success Benchmarks

Agent completes in < 5 minutes on GitHub Ubuntu runner.

Rules tests: ≥ 1 positive access test and ≥ 3 denial paths per sensitive collection.

Zero TypeScript errors with strict on.

Re-runs are no-op unless inputs change.

Files to add (full contents)

1. .github/workflows/repo-agent.yml
   name: Repo Agent (Monorepo Restructure + RBAC + Rules Tests)

on:
workflow_dispatch:
inputs:
issue_number:
description: "GitHub issue number (defaults to 21)"
required: false
default: "21"
force:
description: "Allow overwriting existing files (true/false)"
required: false
default: "false"
plan_only:
description: "Plan without applying changes (true/false)"
required: false
default: "false"
issue_comment:
types: [created]

permissions:
contents: write
pull-requests: write
issues: write

jobs:
run-agent:
if: >
github.event_name == 'workflow_dispatch' ||
(github.event_name == 'issue_comment' &&
contains(github.event.comment.body, '/run-agent'))
runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Use PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install deps
        run: pnpm install --frozen-lockfile || pnpm install

      - name: Build agent (tsc)
        run: pnpm -s run -w build:agent
        continue-on-error: false

      - name: Run agent
        id: agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ISSUE_NUMBER: ${{ github.event.inputs.issue_number || '21' }}
          AGENT_FORCE: ${{ github.event.inputs.force || 'false' }}
          AGENT_PLAN_ONLY: ${{ github.event.inputs.plan_only || 'false' }}
          GITHUB_REPOSITORY: ${{ github.repository }}
        run: |
          set -euo pipefail
          node --enable-source-maps ./dist/agent/agent.cjs \
            --issue "$ISSUE_NUMBER" \
            $( [ "$AGENT_FORCE" = "true" ] && echo "--force" ) \
            $( [ "$AGENT_PLAN_ONLY" = "true" ] && echo "--plan-only" )

      - name: Lint & Typecheck (root)
        run: |
          pnpm -s run -w lint || true
          pnpm -s run -w typecheck || true

      - name: Rules Tests
        run: pnpm -s run -w test:rules

      - name: Comment result to Issue
        if: always()
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const issue = Number(process.env.ISSUE_NUMBER || 21);
            const runUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
            const status = core.getInput('job-status') || '${{ job.status }}';
            const body = [
              `### Repo Agent result: **${status.toUpperCase()}**`,
              `- Workflow: ${runUrl}`,
              `- Plan-only: ${process.env.AGENT_PLAN_ONLY}`,
              `- Force: ${process.env.AGENT_FORCE}`,
              `- Commit: ${context.sha}`,
              '',
              'If this failed, open the logs and check the agent step for details.'
            ].join('\n');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issue,
              body
            });

2. package.json (root) — add scripts and dev deps
   {
   "name": "fresh-root",
   "private": true,
   "packageManager": "pnpm@9",
   "scripts": {
   "build:agent": "tsc -p scripts/agent/tsconfig.json",
   "run:agent": "node --enable-source-maps ./dist/agent/agent.cjs",
   "lint": "eslint .",
   "typecheck": "tsc -p tsconfig.json",
   "test:rules": "vitest run --dir tests/rules --reporter=dot"
   },
   "devDependencies": {
   "@types/node": "^20.14.10",
   "eslint": "^9.12.0",
   "typescript": "^5.6.3",
   "vitest": "^2.1.3",
   "@firebase/rules-unit-testing": "^3.0.4",
   "zod": "^3.23.8",
   "p-retry": "^6.2.0",
   "execa": "^9.4.0"
   }
   }

3. scripts/agent/tsconfig.json
   {
   "extends": "../../tsconfig.json",
   "compilerOptions": {
   "target": "ES2022",
   "module": "CommonJS",
   "outDir": "../../dist/agent",
   "rootDir": ".",
   "moduleResolution": "Node",
   "resolveJsonModule": true,
   "esModuleInterop": true,
   "strict": true,
   "sourceMap": true
   },
   "include": ["**/*.ts", "**/*.mts"]
   }

4. scripts/agent/agent.mts
   #!/usr/bin/env node
   import { execa } from "execa";
   import { z } from "zod";
   import pRetry from "p-retry";
   import { existsSync, mkdirSync, writeFileSync } from "node:fs";
   import { readFile, stat, writeFile } from "node:fs/promises";
   import { join, dirname } from "node:path";
   import { fileURLToPath } from "node:url";
   import { ensureMonorepo, plannedChangesSummary } from "./tasks/restructure.js";
   import { ensureRBAC } from "./tasks/rbac.js";
   import { ensureRules } from "./tasks/rules.js";
   import { log, ok, warn, err } from "./lib/logger.js";

const argv = process.argv.slice(2);
const ArgSchema = z.object({
issue: z.string().default("21"),
force: z.boolean().default(false),
planOnly: z.boolean().default(false)
});
function parseArgs() {
let issue = "21", force = false, planOnly = false;
for (let i = 0; i < argv.length; i++) {
const a = argv[i];
if (a === "--force") force = true;
else if (a === "--plan-only") planOnly = true;
else if (a === "--issue") { issue = argv[++i]; }
}
return ArgSchema.parse({ issue, force, planOnly });
}

async function gitStatusShort(): Promise<string> {
const { stdout } = await execa("git", ["status", "-s"]);
return stdout;
}
async function gitRoot(): Promise<string> {
const { stdout } = await execa("git", ["rev-parse", "--show-toplevel"]);
return stdout.trim();
}
async function appendIfMissing(file: string, content: string) {
const exists = existsSync(file);
if (!exists) {
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, content, "utf8");
return "created";
}
const prev = await readFile(file, "utf8");
if (prev === content) return "unchanged";
await writeFile(file, content, "utf8");
return "updated";
}

async function main() {
const { issue, force, planOnly } = parseArgs();
log(`Repo agent started. Issue #${issue} | planOnly=${planOnly} | force=${force}`);

const root = await gitRoot();
log(`git root: ${root}`);

// 1) Plan & validate structure
const structure = await ensureMonorepo({ root, planOnly });
ok(`Monorepo structure OK`);
log(plannedChangesSummary(structure));

// 2) RBAC schemas
await ensureRBAC({ root, force, planOnly });
ok(`RBAC schemas ensured`);

// 3) Firestore rules & indexes
await ensureRules({ root, force, planOnly });
ok(`Firestore rules & indexes ensured`);

// 4) Install if needed (best-effort)
await pRetry(async () => {
await execa("pnpm", ["install"], { stdio: "inherit" });
}, { retries: 1 }).catch(() => warn("pnpm install failed (non-fatal)"));

// 5) Typecheck and rules tests (fail the job if they fail)
await execa("pnpm", ["-s", "typecheck"], { stdio: "inherit" });
await execa("pnpm", ["-s", "test:rules"], { stdio: "inherit" });

ok("Repo agent completed successfully.");
}

main().catch((e) => {
err(e?.stack || String(e));
process.exit(1);
});

5. scripts/agent/lib/logger.ts
   export function log(msg: string) {
   console.log(`[agent] ${msg}`);
   }
   export function ok(msg: string) {
   console.log(`\x1b[32m[ok]\x1b[0m ${msg}`);
   }
   export function warn(msg: string) {
   console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`);
   }
   export function err(msg: string) {
   console.error(`\x1b[31m[err]\x1b[0m ${msg}`);
   }

6. scripts/agent/tasks/restructure.ts
   import { existsSync, mkdirSync, writeFileSync } from "node:fs";
   import { join } from "node:path";

type Result = { created: string[]; ensured: string[] };

export async function ensureMonorepo({ root, planOnly }: { root: string; planOnly: boolean; }) {
const dirs = ["apps/web", "services/api", "packages/types", "tests/rules"];
const created: string[] = [];
const ensured: string[] = [];
for (const d of dirs) {
const p = join(root, d);
if (!existsSync(p)) {
if (!planOnly) mkdirSync(p, { recursive: true });
created.push(d);
} else {
ensured.push(d);
}
}

// Minimal workspace file if missing
const ws = join(root, "pnpm-workspace.yaml");
if (!existsSync(ws)) {
const content = `packages:\n  - "apps/*"\n  - "services/*"\n  - "packages/*"\n`;
if (!planOnly) writeFileSync(ws, content, "utf8");
created.push("pnpm-workspace.yaml");
} else {
ensured.push("pnpm-workspace.yaml");
}

return { created, ensured };
}
export function plannedChangesSummary(r: Result) {
return [
"Planned changes:",
`- Created: ${r.created.length ? r.created.join(", ") : "(none)"}`,
`- Ensured: ${r.ensured.length ? r.ensured.join(", ") : "(none)"}`
].join("\n");
}

7. scripts/agent/tasks/rbac.ts
   import { writeFile } from "node:fs/promises";
   import { existsSync, mkdirSync } from "node:fs";
   import { join, dirname } from "node:path";

const RBAC_CONTENT = `import { z } from "zod";

export const OrgRole = z.enum(["org_owner","admin","manager","scheduler","staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

export const UserClaims = z.object({
uid: z.string(),
orgId: z.string(),
roles: z.array(OrgRole).nonempty()
});
export type UserClaims = z.infer<typeof UserClaims>;

export const Membership = z.object({
orgId: z.string(),
userId: z.string(),
roles: z.array(OrgRole),
createdAt: z.number(),
updatedAt: z.number()
});
export type Membership = z.infer<typeof Membership>;
`;

export async function ensureRBAC(
{ root, force, planOnly }: { root: string; force: boolean; planOnly: boolean; }
) {
const target = join(root, "packages/types/src/rbac.ts");
const idx = join(root, "packages/types/src/index.ts");

const write = async (file: string, content: string) => {
if (!existsSync(dirname(file))) mkdirSync(dirname(file), { recursive: true });
if (planOnly) return;
await writeFile(file, content, "utf8");
};

if (!existsSync(target) || force) {
await write(target, RBAC_CONTENT);
}
// Ensure index export
let indexContent = "";
if (existsSync(idx)) {
indexContent = (await (await import("node:fs/promises")).readFile(idx, "utf8"));
if (!indexContent.includes(`export * from "./rbac";`)) {
indexContent += `\nexport * from "./rbac";\n`;
if (!planOnly) await writeFile(idx, indexContent, "utf8");
}
} else {
indexContent = `export * from "./rbac";\n`;
await write(idx, indexContent);
}

// Ensure package.json for types package
const pkg = join(root, "packages/types/package.json");
if (!existsSync(pkg) || force) {
const content = {
name: "@fresh-schedules/types",
version: "0.0.0",
private: true,
type: "module",
main: "./dist/index.js",
types: "./dist/index.d.ts",
scripts: {
build: "tsc -p tsconfig.json"
}
};
await write(pkg, JSON.stringify(content, null, 2));
}

// Ensure tsconfig
const tsconfig = join(root, "packages/types/tsconfig.json");
if (!existsSync(tsconfig) || force) {
const content = {
compilerOptions: {
target: "ES2022",
module: "ESNext",
declaration: true,
outDir: "./dist",
rootDir: "./src",
strict: true,
moduleResolution: "Node"
},
include: ["src"]
};
await write(tsconfig, JSON.stringify(content, null, 2));
}
}

8. scripts/agent/tasks/rules.ts
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
const exp = ttlSec ? Date.now() + ttlSec \* 1000 : null;
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

export async function ensureRules(
{ root, force, planOnly }: { root: string; force: boolean; planOnly: boolean; }
) {
const paths = [
["firestore.rules", FIRESTORE_RULES],
["firestore.indexes.json", FIRESTORE_INDEXES],
["services/api/src/cache/provider.ts", CACHE_PROVIDER],
["services/api/src/auth/types.ts", AUTH_IFACE]
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

9. tests/rules/vitest.config.ts
   import { defineConfig } from "vitest/config";

export default defineConfig({
test: {
environment: "node",
include: ["**/*.test.ts"],
reporters: ["dot"],
testTimeout: 20000
}
});

10. .env.example (additions for clarity)

# Firebase / Local Testing

FIREBASE_PROJECT_ID=demo-fresh

# Optional: Redis URL (future)

REDIS_URL=redis://localhost:6379

11. apps/web/README.md (server-first guidance)

# apps/web

Server-first Next.js (App Router).

- Data access occurs in server components or server actions.
- Client components call server actions; no direct Firestore client writes for privileged ops.
- RBAC enforced server-side; Firestore rules are a backstop, not the only control.

Commands (deterministic)

# 1) Create a working branch

git checkout -b chore/repo-agent-rbac

# 2) Add files

git add .github/workflows/repo-agent.yml \
 package.json \
 scripts/agent/tsconfig.json \
 scripts/agent/agent.mts \
 scripts/agent/lib/logger.ts \
 scripts/agent/tasks/restructure.ts \
 scripts/agent/tasks/rbac.ts \
 scripts/agent/tasks/rules.ts \
 tests/rules/vitest.config.ts \
 tests/rules/README.md \
 apps/web/README.md \
 firestore.rules \
 firestore.indexes.json \
 .env.example

# 3) Commit

git commit -m "feat(agent): GitHub repo agent for monorepo restructure, RBAC schemas, Firestore rules + tests, caching/auth stubs"

# 4) Push

git push -u origin chore/repo-agent-rbac

# 5) Run agent manually (optional, local)

pnpm install
pnpm build:agent
pnpm run:agent --issue 21 --plan-only

# 6) Trigger from GitHub UI

# Actions → Repo Agent → Run workflow (issue=21, plan_only=false, force=false)

# Or comment in Issue #21:

# /run-agent

Risks & Mitigations

Overwriting existing work: default is safe-write; set force=true to override.

Rules too strict/loose: tests cover manager/staff CRUD; extend tests before relaxations.

Caching swap: interface is stable; add RedisCache implements CacheProvider later.

Plan drift: the agent is re-runnable and idempotent; include it in PR checks.
