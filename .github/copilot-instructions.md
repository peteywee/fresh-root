# Fresh Root — AI Coding Agent Instructions

> **Code Owner:** Patrick Craven | **Stack:** pnpm monorepo · Next.js (App Router) · Firebase · TypeScript

This is a pnpm monorepo for an enterprise staff scheduling PWA backed by Firebase (Auth, Firestore, Storage). Use this guide to be immediately productive.

---

## Quick Start Commands

```bash
pnpm install --frozen-lockfile     # Install dependencies (Node ≥20.10, pnpm ≥9.12)
pnpm dev                            # Start dev server on :3000
pnpm typecheck                      # Type-check all workspaces
pnpm test                           # Run Vitest unit tests
pnpm test:rules                     # Run Firestore/Storage rules tests (Jest)
pnpm lint                           # Lint all code
pnpm build                          # Production build
```

---

## Architecture Overview

```
fresh-root/
├── apps/web/           # Next.js PWA (App Router in app/, client code in src/)
├── packages/           # Shared libraries
│   ├── types/          # Zod schemas + TypeScript types (single source of truth)
│   ├── api-framework/  # API middleware, security wrappers, rate limiting
│   ├── ui/             # Shared UI components
│   └── config/         # Shared configuration
├── functions/          # Firebase Cloud Functions
├── tests/              # Integration & rules tests
│   └── rules/          # Firestore security rules tests
├── firestore.rules     # Firestore security rules (multi-tenant RBAC)
└── storage.rules       # Cloud Storage security rules
```

---

## Key Patterns to Follow

### 1. Zod-First Type Safety (The Triad)

Every domain entity must have three components:

| Component | Location | Purpose |
|-----------|----------|---------|
| **Schema** | `packages/types/src/[entity].ts` | Zod schema + derived TypeScript types |
| **API Route** | `apps/web/app/api/[entities]/route.ts` | Validated endpoints with security middleware |
| **Firestore Rules** | `firestore.rules` | Security rules matching API permissions |

```typescript
// packages/types/src/schedules.ts — Schema first
export const ScheduleSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string().min(1).max(100),
  state: z.enum(["draft", "published", "archived"]),
});
export type Schedule = z.infer<typeof ScheduleSchema>;
export const CreateScheduleSchema = ScheduleSchema.omit({ id: true });
```

### 2. API Route Pattern

All API routes must use security middleware:

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { parseJson, ok, badRequest } from "../_shared/validation";

export const POST = createOrgEndpoint(
  async (request, context) => {
    const parsed = await parseJson(request, CreateScheduleSchema);
    if (!parsed.success) return badRequest("Invalid payload", parsed.details);
    // Use parsed.data (typed & validated)
    return ok({ success: true });
  },
  { requireAuth: true, roles: ["manager", "admin", "org_owner"] }
);
```

### 3. File Headers (Required)

Every source file needs a priority/domain header:

```typescript
// [P0][SCHEDULE][API] Schedules list endpoint
// Tags: P0, SCHEDULE, API, CRUD
```

Priority: P0 (critical) → P1 (important) → P2 (standard)

---

## Where to Look First

| What | Location |
|------|----------|
| UI routes & pages | `apps/web/app/(app)/` and `apps/web/app/(auth)/` |
| API endpoints | `apps/web/app/api/` |
| Shared validation | `apps/web/app/api/_shared/validation.ts` |
| Type definitions | `packages/types/src/` |
| API middleware | `packages/api-framework/src/index.ts` |
| Firebase client | `apps/web/src/lib/firebase.client.ts` |
| Firebase admin | `apps/web/src/lib/firebase.server.ts` |
| Security rules | `firestore.rules`, `storage.rules` |
| Detailed patterns | `docs/CODING_RULES_AND_PATTERNS.md` |

---

## Firebase & Emulator Setup

```bash
# Set in apps/web/.env.local
NEXT_PUBLIC_USE_EMULATORS=true

# Start emulators from repo root
firebase emulators:start

# Seed test data
pnpm tsx scripts/seed/seed.emulator.ts
```

Environment variables: `NEXT_PUBLIC_FIREBASE_*` for client, `FIREBASE_ADMIN_*` for server.

---

## Quality Gates (Must Pass Before PR)

1. `pnpm install --frozen-lockfile` — No deprecated/peer-dependency warnings
2. `pnpm typecheck` — Zero type errors
3. `pnpm lint` — Zero lint errors
4. `pnpm test` — All unit tests pass
5. `pnpm test:rules` — Rules tests pass (if touching Firestore/Storage)

---

## Hard Rules

- **No `any` types** — Use `unknown` with type guards or Zod validation
- **No duplicate type definitions** — Always derive from Zod with `z.infer<>`
- **No unprotected API routes** — All routes must use `createOrgEndpoint` or `withSecurity`
- **No raw Firebase calls in routes** — Use typed wrappers from `@/lib/firebase/typed-wrappers`
- **No secrets in code** — Use `.env.local` (excluded from git)
- **No lockfile churn** — Explain intentional `pnpm-lock.yaml` changes in PR

---

## Testing Strategy

| Test Type | Command | Location |
|-----------|---------|----------|
| Unit tests | `pnpm test` | `**/*.test.ts` near code |
| Rules tests | `pnpm test:rules` | `tests/rules/**/*.spec.ts` |
| E2E tests | `pnpm test:e2e` | Playwright tests |

Co-locate tests: `apps/web/app/api/schedules/__tests__/schedules.test.ts`

---

## Repo Automations

```bash
# Auto-tag files with priority headers
node scripts/tag-files.mjs --dry-run    # Preview
node scripts/tag-files.mjs              # Apply

# Fix markdown formatting
pnpm format
```

Pre-commit hook runs tagging + lint/format automatically.

---

## Related Documentation

- [Full Coding Rules](docs/CODING_RULES_AND_PATTERNS.md) — Detailed patterns with examples
- [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAMS.md) — System overview
- [Setup Guide](docs/SETUP.md) — Complete local setup
- [Security Docs](docs/security.md) — Auth/authz architecture
- [AGENTS.md](AGENTS.md) — Additional agent guidelines

---

*This file helps AI agents and contributors get productive quickly. Submit a PR to fix inaccuracies.*
