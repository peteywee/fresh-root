# Plan to Fix 52 Legitimate ESLint Warnings

**Date:** 2025-12-14  
**Status:** Ready for Implementation  
**Priority:** Medium (no errors, all warnings are naming conventions)

## Warning Summary

- **Total Warnings:** 52
- **Files Affected:** 31
- **Breaking Down By Type:**
  - Unused function parameters: ~30 (needs `_` prefix)
  - Unused variables (assignments): ~18 (remove or prefix with `_`)
  - Type-only imports: 1 (use `type` keyword)
  - Generic type parameters: 1 (prefix with `_`)

## Issue Analysis

### Type 1: Unused Function Parameters (30+ warnings)

These are typically Next.js API route handlers that follow a standard signature but don't use all
parameters.

**Pattern:**

```typescript
// ❌ Current (triggers warning)
async function handler(request, input, context, params) {
  // only uses some of these
}

// ✅ Fixed (no warning)
async function handler(_request, _input, _context, _params) {
  // prefix unused with underscore
}
```

**Common in:**

- `apps/web/app/api/**/*.ts` (API routes)
- Next.js handlers with standard signatures

### Type 2: Unused Variable Assignments (18+ warnings)

Variables assigned but never used - can be removed or prefixed.

**Examples:**

- `const idToken = ...` but never used
- `const searchParams = ...` but never used
- `const profiler = ...` but never used

**Pattern:**

```typescript
// ❌ Current
const idToken = extractToken(req);
const result = await processRequest();

// ✅ Fixed - Option A: Remove if not needed
const result = await processRequest();

// ✅ Fixed - Option B: Prefix if needed for future
const _idToken = extractToken(req);
```

### Type 3: Type-Only Imports (1 warning)

[apps/web/src/lib/userProfile.ts:28](apps/web/src/lib/userProfile.ts#L28) - `UserProfileSchema` used
only as a type.

**Pattern:**

```typescript
// ❌ Current
import { UserProfileSchema } from "./types";
const schema: typeof UserProfileSchema = ...;

// ✅ Fixed
import type { UserProfileSchema } from "./types";
const schema: typeof UserProfileSchema = ...;
```

## Implementation Plan

### Phase 1: API Routes (Highest Impact)

**Files:** 22 API route files  
**Warnings to Fix:** ~35

#### Step 1.1: Handler Parameters

Files with multiple unused parameters in handlers:

- [apps/web/app/api/health/route.ts](apps/web/app/api/health/route.ts#L15) - 4 unused params
- [apps/web/app/api/organizations/[id]/members/route.ts](apps/web/app/api/organizations/[id]/members/route.ts#L34) -
  4 unused params
- [apps/web/app/api/batch/route.ts](apps/web/app/api/batch/route.ts#L24) - 1 unused param
- Many others with 1-2 unused params

**Action:** Prefix unused parameters with `_`

### Phase 2: Core Application Files

**Files:** 7 files  
**Warnings to Fix:** ~12

1. [apps/web/src/lib/userProfile.ts](apps/web/src/lib/userProfile.ts#L28) - Type import (use `type`
   keyword)
2. [functions/src/onboarding.ts](functions/src/onboarding.ts#L153) - Unused variable `tokenData`
3. [packages/markdown-fixer/src/fixer.ts](packages/markdown-fixer/src/fixer.ts) - 3 unused variables
4. Other assignments that should be removed

### Phase 3: Test Files

**Files:** 7 test/intelligence files  
**Warnings to Fix:** ~7

Test files often have unused parameters in callbacks. Options:

- Prefix with `_` to indicate intentionally unused
- Remove if truly not needed

## Detailed File-by-File Breakdown

### Tier 1: Quick Wins (1-2 line changes each)

| File                                                                                                               | Issue            | Count | Fix             |
| ------------------------------------------------------------------------------------------------------------------ | ---------------- | ----- | --------------- |
| [apps/web/app/api/auth/mfa/setup/route.ts](apps/web/app/api/auth/mfa/setup/route.ts#L20)                           | `input` unused   | 1     | Prefix with `_` |
| [apps/web/app/api/batch/route.ts](apps/web/app/api/batch/route.ts#L24)                                             | `index` unused   | 1     | Prefix with `_` |
| [apps/web/app/api/items/route.ts](apps/web/app/api/items/route.ts#L15)                                             | `params` unused  | 1     | Prefix with `_` |
| [apps/web/app/api/join-tokens/route.ts](apps/web/app/api/join-tokens/route.ts#L14)                                 | `params` unused  | 1     | Prefix with `_` |
| [apps/web/app/api/metrics/route.ts](apps/web/app/api/metrics/route.ts#L13)                                         | 3 unused params  | 3     | Prefix with `_` |
| [apps/web/app/api/onboarding/activate-network/route.ts](apps/web/app/api/onboarding/activate-network/route.ts#L36) | `context` unused | 1     | Prefix with `_` |

### Tier 2: Multiple Parameters

| File                                                                                                                                   | Issue            | Count | Fix                                     |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----- | --------------------------------------- |
| [apps/web/app/api/health/route.ts](apps/web/app/api/health/route.ts#L15)                                                               | 4 unused params  | 4     | `(_request, _input, _context, _params)` |
| [apps/web/app/api/healthz/route.ts](apps/web/app/api/healthz/route.ts#L30)                                                             | `context` unused | 1     | Prefix with `_`                         |
| [apps/web/app/api/organizations/[id]/members/[memberId]/route.ts](apps/web/app/api/organizations/[id]/members/[memberId]/route.ts#L13) | 2 unused params  | 2     | Prefix with `_`                         |
| [apps/web/app/api/organizations/[id]/members/route.ts](apps/web/app/app/api/organizations/[id]/members/route.ts#L34)                   | Multiple unused  | 4     | Prefix with `_`                         |
| [apps/web/app/api/organizations/[id]/route.ts](apps/web/app/api/organizations/[id]/route.ts#L65)                                       | `context` unused | 1     | Prefix with `_`                         |
| [apps/web/app/api/organizations/route.ts](apps/web/app/api/organizations/route.ts#L19)                                                 | Unused variable  | 1     | Remove or prefix                        |
| [apps/web/app/api/positions/[id]/route.ts](apps/web/app/api/positions/[id]/route.ts#L129)                                              | `context` unused | 1     | Prefix with `_`                         |
| [apps/web/app/api/positions/route.ts](apps/web/app/api/positions/route.ts#L15)                                                         | 2 unused params  | 2     | Prefix with `_`                         |

### Tier 3: Variable Assignments

| File                                                                         | Issue              | Count | Fix                  |
| ---------------------------------------------------------------------------- | ------------------ | ----- | -------------------- |
| [apps/web/app/api/session/route.ts](apps/web/app/api/session/route.ts#L25)   | `idToken` unused   | 1     | Remove if not needed |
| [apps/web/src/lib/userProfile.ts](apps/web/src/lib/userProfile.ts#L28)       | Type-only import   | 1     | Add `type` keyword   |
| [functions/src/onboarding.ts](functions/src/onboarding.ts#L153)              | `tokenData` unused | 1     | Remove if not needed |
| [packages/markdown-fixer/src/fixer.ts](packages/markdown-fixer/src/fixer.ts) | Multiple unused    | 3     | Review and remove    |

### Tier 4: Test/Intelligence Files

| File                                                                                         | Issues             | Count | Fix                       |
| -------------------------------------------------------------------------------------------- | ------------------ | ----- | ------------------------- |
| [tests/intelligence/chaos-engineering.ts](tests/intelligence/chaos-engineering.ts#L91)       | `request` unused   | 1     | Prefix with `_`           |
| [tests/intelligence/ci-cd-integration.ts](tests/intelligence/ci-cd-integration.ts)           | Multiple unused    | 4     | Prefix with `_`           |
| [tests/intelligence/demo.ts](tests/intelligence/demo.ts#L60)                                 | `profiler` unused  | 1     | Remove if not needed      |
| [tests/intelligence/orchestrator.ts](tests/intelligence/orchestrator.ts)                     | Multiple unused    | 3     | Prefix with `_` or remove |
| [tests/intelligence/performance-profiler.ts](tests/intelligence/performance-profiler.ts#L73) | `T` generic unused | 1     | Prefix with `_`           |
| [tests/intelligence/self-healing-tests.ts](tests/intelligence/self-healing-tests.ts#L329)    | `error` unused     | 1     | Prefix with `_`           |
| [vitest.global-setup.ts](vitest.global-setup.ts#L16)                                         | `event` unused     | 1     | Prefix with `_`           |

## Implementation Strategy

### Strategy A: Quick Fix (30 min - 1 hour)

Prefix all unused parameters with `_` without removing code logic.

**Pros:**

- No behavioral changes
- Quick to implement
- Safe and conservative

**Cons:**

- Leaves unused variables in place
- Code may still do unnecessary work

### Strategy B: Thorough Fix (2-3 hours)

Actually remove unused assignments and parameters where safe.

**Pros:**

- Cleaner code
- Better performance
- Reduced cognitive load

**Cons:**

- Requires deeper analysis of each case
- Risk of removing needed code

### Recommended: Hybrid Approach

1. **For function parameters:** Always prefix with `_` (safe)
2. **For variable assignments:** Remove if truly never read
3. **For type imports:** Add `type` keyword
4. **For generics:** Prefix with `_`

## Execution Steps

```bash
# Step 1: Create a new branch
git checkout -b fix/unused-variable-warnings

# Step 2: Fix files tier by tier (use find-replace or manual edits)
# Tier 1: Quick single-parameter fixes
# Tier 2: Multiple parameter fixes
# Tier 3: Variable assignment cleanup
# Tier 4: Test file cleanup

# Step 3: Verify fixes
pnpm lint

# Step 4: Test
pnpm test
pnpm build

# Step 5: Commit and PR
git add .
git commit -m "fix: remove all eslint unused variable warnings"
git push origin fix/unused-variable-warnings
```

## Success Criteria

- [ ] Zero warnings from `pnpm lint`
- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No performance regressions
- [ ] Code is cleaner and more maintainable

## Effort Estimate

- **Quick Fix:** 30-45 minutes
- **Thorough Fix:** 2-3 hours
- **Total with Testing:** 3-4 hours

## Risk Assessment

**Risk Level:** LOW

- No breaking changes
- Unused variables don't affect runtime
- All changes are mechanical
- Easy to revert if issues arise
- No impact on API contracts

## Next Steps

1. ✅ PR linter fixes to main (DONE - PR #153)
2. Create fix branch from main (after merge)
3. Implement fixes tier by tier
4. Run full test suite
5. Create PR with fixes
6. Merge to dev, then to main

---

**Owner:** Development Team  
**Timeline:** Ready to start after PR #153 merge  
**Tracking:** Create GitHub issue for tracking progress across all 31 files
