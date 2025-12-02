# How to be immediately useful in this repository

This is a pnpm monorepo for a Next.js PWA backed by Firebase (Auth, Firestore, Storage). Code owner: Patrick Craven.

## Architecture at a glance

```text
fresh-root/
├── apps/web/          # Next.js App Router — pages, API routes, components
│   ├── app/api/       # API routes with security middleware
│   └── src/lib/       # Firebase clients, hooks, utilities
├── packages/          # Shared libraries
│   ├── types/         # Zod schemas → TypeScript types
│   ├── api-framework/ # SDK helpers (createPublicEndpoint, etc.)
│   └── ui/            # Reusable UI components
├── functions/         # Firebase Cloud Functions
├── firestore.rules    # Security rules with RBAC
└── tests/rules/       # Firebase rules tests
```

## Essential commands

```bash
pnpm -w install --frozen-lockfile   # Install deps (Node ≥20.10, pnpm ≥9.12)
pnpm dev                            # Dev server on :3000
pnpm -w typecheck                   # Typecheck all workspaces
pnpm test                           # Vitest unit tests
pnpm test:rules                     # Firestore/Storage rules tests
pnpm lint                           # ESLint with auto-fix
```

For Firebase emulators: `NEXT_PUBLIC_USE_EMULATORS=true firebase emulators:start`

## Key patterns to follow

### API routes: Always use security middleware

```typescript
// apps/web/app/api/example/route.ts
import { withSecurity, requireOrgMembership } from "../_shared/middleware";
import { parseJson, ok, badRequest } from "../_shared/validation";
import { CreateEntitySchema } from "@fresh-schedules/types";

export const POST = withSecurity(
  requireOrgMembership(async (request, context) => {
    const parsed = await parseJson(request, CreateEntitySchema);
    if (!parsed.success) return badRequest("Invalid payload", parsed.details);
    // Use parsed.data (validated + typed)
    return ok({ success: true });
  }),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
```

### Type safety: Zod-first approach

All domain types live in `packages/types/src/`. Define Zod schema first, infer TypeScript type:

```typescript
// packages/types/src/entity.ts
import { z } from "zod";

export const EntitySchema = z.object({ id: z.string(), name: z.string() });
export type Entity = z.infer<typeof EntitySchema>;
export const CreateEntitySchema = EntitySchema.omit({ id: true });
```

### Firestore rules: RBAC with token claims

Rules use `request.auth.token.orgId` and `request.auth.token.roles` for tenant isolation.
Match patterns: `/orgs/{orgId}/...` or `/organizations/{orgId}/...`.

## File headers (auto-tagging)

Every source file needs a two-line header:

```typescript
// [P0][API][CODE] Description of the file
// Tags: P0, API, CODE
```

Run `node scripts/tag-files.mjs --dry-run` to preview, omit `--dry-run` to apply.

## Quality gates (required before PR)

1. `pnpm -w typecheck` — no errors
2. `pnpm lint` — no errors
3. `pnpm test` — all pass
4. `pnpm test:rules` — if touching security rules
5. No deprecated deps or unmet peer deps

## Hard rules

- **No `any`**: Use `unknown` + narrowing or Zod validation
- **No duplicate types**: Infer from Zod with `z.infer<>`
- **All API writes validate input**: Use `parseJson(request, Schema)`
- **Security-first**: Every API route wrapped with `withSecurity()`
- **Lockfile integrity**: Explain intentional `pnpm-lock.yaml` changes

## Reference files

- API validation patterns: `apps/web/app/api/_shared/validation.ts`
- Security middleware: `apps/web/app/api/_shared/middleware.ts`
- API route template: `apps/web/app/api/_template/route.ts`
- Coding rules guide: `docs/CODING_RULES_AND_PATTERNS.md`
- Type schemas: `packages/types/src/`

---

*This file helps automated agents get productive quickly. PRs to correct inaccuracies are welcome.*
