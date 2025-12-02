# How to be immediately useful in this repository

This repo is a pnpm monorepo for a Next.js PWA backed by Firebase (Auth, Firestore, Storage). The guidance below focuses on concrete, discoverable patterns and commands an AI coding agent should use when making or reviewing changes.

Code owner: Patrick Craven

## Monorepo structure

```text
fresh-root/
├── apps/web/          # Next.js PWA (main application)
├── packages/          # Shared libraries
│   ├── types/         # Zod schemas and TypeScript types
│   ├── ui/            # Shared UI components
│   ├── config/        # Shared configuration
│   └── api-framework/ # API testing helpers
├── functions/         # Firebase Cloud Functions
├── tests/rules/       # Firestore/Storage rules tests
├── scripts/           # Automation and CI helpers
└── docs/              # Documentation and standards
```

## Key commands

From the repository root:

- **Install**: `pnpm install --frozen-lockfile` (requires Node ≥20.10, pnpm ≥9.12)
- **Dev server**: `pnpm dev` (starts web on :3000)
- **Build**: `pnpm build`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Unit tests**: `pnpm test` (Vitest)
- **Rules tests**: `pnpm test:rules` (Jest, for Firestore/Storage rules)
- **E2E tests**: `pnpm test:e2e` (Playwright)

## Where to look first

- **App UI/routes**: `apps/web/app/` (Next.js App Router)
- **Client utilities**: `apps/web/src/lib/` (Firebase helpers, React Query hooks)
- **API routes**: `apps/web/app/api/` with shared middleware in `apps/web/app/api/_shared/`
- **Server Firebase**: `apps/web/lib/firebase-admin.ts` for Admin SDK
- **Zod schemas**: `packages/types/src/` and `apps/web/app/api/_shared/validation.ts`
- **Security rules**: `firestore.rules` and `storage.rules` at repo root

## Critical API patterns

**Every API route MUST follow this pattern:**

```typescript
// 1. Import security middleware and validation helpers
import { withSecurity } from "../_shared/middleware";
import { ok, badRequest, parseJson } from "../_shared/validation";
import { CreateEntitySchema } from "@fresh-schedules/types";

// 2. Wrap handler with withSecurity for auth and rate limiting
export const POST = withSecurity(
  async (req, ctx) => {
    // 3. Validate input with Zod
    const parsed = await parseJson(req, CreateEntitySchema);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.details);
    }
    // 4. Use parsed.data (typed and validated)
    return ok({ success: true });
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 }
);
```

**Security middleware options:**

- `requireAuth: true` — Requires valid session cookie
- `require2FA: true` — Requires MFA for manager operations
- `maxRequests` / `windowMs` — Rate limiting (default: 100/15min)

## Key workflows

- **Firebase emulators**: Set `NEXT_PUBLIC_USE_EMULATORS=true` in `apps/web/.env.local`, then run `firebase emulators:start`
- **Seeding data**: `pnpm tsx scripts/seed/seed.emulator.ts`

## Conventions

- **Zod-first types**: Define schemas in `packages/types/src/`, derive types with `z.infer<typeof Schema>`
- **React Query**: Follow existing query-key patterns in `apps/web/src/lib/` (e.g., `['items']`)
- **Environment vars**: Client-side uses `NEXT_PUBLIC_FIREBASE_*`, server uses `FIREBASE_ADMIN_*`
- **File headers**: All source files should include `// [P#][DOMAIN][CATEGORY] Description` and `// Tags: ...`
- **Import order**: ESLint enforces: external → internal packages → relative imports

## Gotchas

- **pnpm overrides**: Root `package.json` pins `undici` and remaps some packages
- **PWA/Service Worker**: See `apps/web/app/RegisterServiceWorker.tsx` for registration
- **Strict TypeScript**: `noUncheckedIndexedAccess` is enabled — always check array access

## PR checklist

1. `pnpm install --frozen-lockfile` — no deprecated or peer warnings
2. `pnpm typecheck` — must pass
3. `pnpm lint` — no errors
4. `pnpm test` — unit tests pass
5. If touching Firebase rules: `pnpm test:rules` and add/update `tests/rules/` coverage

## Hard rules

- **No deprecated dependencies** — resolve warnings before merge
- **No unmet peer dependencies** — align versions or add required peers
- **Pinned pnpm version** — use version in `package.json` `packageManager` field
- **Lockfile integrity** — avoid incidental `pnpm-lock.yaml` changes
- **Auto-fix lint/format** — pre-commit hooks enforce this

## Reference docs

- **API patterns**: `docs/CODING_RULES_AND_PATTERNS.md`
- **Project guidelines**: `AGENTS.md`
- **Architecture**: `docs/ARCHITECTURE_DIAGRAMS.md`
- **Security**: `docs/security.md`

---

(This file is maintained to help automated agents and contributors get productive quickly. If you see an inaccuracy, submit a PR with the correction.)
