---
description: "TypeScript schema pattern lessons learned from Zod validation implementation in monorepo. Covers module resolution, inline vs. exported schemas, and pragmatic workarounds."
applyTo: "packages/types/**/*.ts,apps/web/app/api/**/*.ts"
priority: 2
---

# TypeScript Schema & Module Resolution Memory

Lessons from implementing Zod input validation across the fresh-root monorepo.

## The Module Resolution Trap: Newly Created Schema Files

**Problem**: Created new schema files (`session.ts`, `internal.ts`) in `packages/types/src/`, exported them in `index.ts`, but TypeScript compiler couldn't resolve them when importing in API routes.

**Error Pattern**:
```
TS2305: Module '"@fresh-schedules/types"' has no exported member 'CreateBackupSchema'
```

**Root Cause**: TypeScript compiler caching or import path resolution in monorepo context. When you create a new `.ts` file and immediately export it from `index.ts`, the module graph hasn't fully updated in the type checker's internal state.

### What Didn't Work ❌

**Attempt 1: Import from newly created package file**
```typescript
// ❌ DON'T DO THIS on fresh schema files
import { CreateSessionSchema } from "@fresh-schedules/types";

export const POST = createAuthenticatedEndpoint({
  input: CreateSessionSchema, // TypeScript: "no exported member"
  handler: async ({ input }) => { /* ... */ }
});
```

**Why it failed**:
- New files in monorepo don't immediately resolve in import paths
- TypeScript cache hasn't recomputed module graph
- `pnpm` workspace resolution may not have indexed new exports yet
- Even after `pnpm install --frozen-lockfile`, type information not refreshed

**Attempt 2: Force TypeScript recompilation**
```bash
# ❌ DON'T RELY SOLELY ON THIS
pnpm -w typecheck --force
```

**Why it's insufficient**:
- `--force` flag clears cache but doesn't guarantee reindex of new package exports
- Issue persists across multiple type-check runs
- Suggests deeper module resolution issue in monorepo setup

### What Worked ✅

**Solution: Inline Zod schemas directly in route files**

```typescript
// ✅ DO THIS for immediate validation needs
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID required").optional(),
  email: z.string().email("Invalid email").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

type CreateSession = z.infer<typeof CreateSessionSchema>;

export const POST = createAuthenticatedEndpoint({
  input: CreateSessionSchema, // ✅ TypeScript resolves inline schema immediately
  handler: async ({ input }) => {
    const { userId, email, metadata } = input; // ✅ Type inference works
    // ...
  },
});
```

**Why this works**:
- Schema defined in same file scope
- No import path resolution needed
- TypeScript compiler has full visibility
- Works immediately, no caching issues
- Clear locality (schema near usage)

### Hybrid Approach: Best for Medium-Term ✅

**Pattern: Define inline now, plan refactor for later**

```typescript
// 1. Create schema files for documentation/future export
//    (packages/types/src/session.ts, internal.ts)

// 2. Use inline schemas in routes immediately
//    (Unblocks development, validates input)

// 3. Plan refactor: Once schemas are stable and fully tested
//    - Move back to package exports
//    - Run full monorepo rebuild (turbo clean + pnpm install)
//    - Verify module resolution stabilizes
```

**Timeline advantage**: 
- Inline schemas: Immediate validation, production-ready
- Package schemas: Can be refactored once module resolution is proven stable
- Created files: Already exist for future refactoring/documentation

## Rule: Pragmatic Module Resolution in Monorepos

**When implementing new cross-package features**:

1. **Define schema file** in `packages/types/src/` (for documentation/git history)
2. **Start with inline usage** in routes (for immediate type safety)
3. **Document the intent** in comments (why inline for now)
4. **Monitor for resolution** on next `pnpm install --frozen-lockfile`
5. **Refactor to imports** once module graph stabilizes

**Don't**: Fight TypeScript module resolution immediately. Work around it pragmatically while documenting the path to proper imports.

**Pattern code**:
```typescript
// apps/web/app/api/session/bootstrap/route.ts
// [P0][API][CODE] Session bootstrap endpoint

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

// TODO: Move to packages/types/src/session.ts once module resolution stabilizes
// For now, inline to avoid TypeScript import resolution issues in monorepo
const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID required").optional(),
  email: z.string().email("Invalid email").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateSession = z.infer<typeof CreateSessionSchema>;

export const POST = createAuthenticatedEndpoint({
  input: CreateSessionSchema,
  handler: async ({ input }) => { /* ... */ }
});
```

## Validation Workaround: Multiple Typecheck Runs

**If module resolution still fails after first attempt**:

```bash
# 1. Clean TypeScript cache
pnpm -w typecheck --force

# 2. Clean turbo cache (more aggressive)
pnpm exec turbo clean

# 3. Reinstall with full lockfile resolution
pnpm install --frozen-lockfile

# 4. Retry typecheck
pnpm -w typecheck
```

**Success indicator**:
- TypeCheck completes with 0 errors across all packages
- All imports resolve correctly in IDE
- `@fresh-schedules/types` exports are visible in autocomplete

## Takeaway

**Monorepo module resolution can lag behind file creation.** When implementing new schemas:

- ✅ Create files (for documentation)
- ✅ Use inline schemas immediately (unblocked validation)
- ✅ Plan gradual migration to package exports (once stable)
- ❌ Don't force complex import paths before resolution is proven

**Pragmatism over purity**: Getting validation working beats waiting for perfect module organization.
