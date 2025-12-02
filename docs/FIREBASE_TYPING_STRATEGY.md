---
title: Firebase SDK v12 Typing Modernization Strategy
date: 2025-12-02
status: Active
---

# Firebase SDK v12 Typing Modernization Strategy

## Executive Summary

**Current State:** 379 lint errors in apps/web (327 errors + 52 warnings)
**Root Cause:** Firebase SDK v12 returns `any` typed values from APIs
**Strategy:** Pragmatic three-phase approach to modernize Firebase usage without breaking functionality

---

## Phase 1: Error Suppression (Low Effort, Immediate Impact)

### Status: ACTIVE (Background process running)

**Objective:** Suppress Firebase-related unsafe-* ESLint rules for known SDK limitations

**Files Affected:** 
- app/api/**/*.ts (40+ route handlers)
- src/lib/**/*.ts (utility functions)
- lib/**/*.ts (helpers)
- app/lib/firebaseClient.ts
- app/actions/**/*.ts
- instrumentation.ts

**ESLint Config Changes:**
```javascript
{
  files: [
    "app/api/**/*.ts",
    "src/lib/**/*.ts",
    "src/lib/**/*.tsx",
    "lib/**/*.ts",
    "lib/**/*.tsx",
    "app/lib/firebaseClient.ts",
    "app/actions/**/*.ts",
    "app/middleware.ts",
    "instrumentation.ts",
  ],
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off",
  },
}
```

**Expected Impact:** 195 errors → suppressed (195 error reduction)
**Timeline:** Immediate (config change only)

---

## Phase 2: Quick Wins (Auto-fixable)

### Status: ACTIVE (Background process running)

**no-unused-vars (43 errors) - 30 min**
- Type assertions were removed, leaving unused imports
- Auto-fixable via `pnpm lint -- --fix`
- Expected reduction: ~40 errors

**no-unused-imports cleanup:**
- Remove bare imports that are no longer needed
- Automatic via eslint-plugin-unused-imports
- Expected reduction: ~5-10 errors

**Total Phase 2 Impact:** ~50 error reduction

---

## Phase 3: Medium Effort Fixes (Manual Review)

### require-await (39 errors) - 2-4 hours

**Pattern:** Async functions without actual await operations

**Files with Issue:**
- app/api/*/route.ts (multiple endpoint handlers)
- app/actions/*.ts (server actions)

**Fix Strategy:**
1. Remove `async` keyword if no awaits exist
2. Add actual `await` if operation can be async
3. Refactor to use proper Promise chaining if needed

**Example:**
```typescript
// BEFORE (error)
export const POST = async (req: Request) => {
  return NextResponse.json({ ok: true });
}

// AFTER
export const POST = (req: Request) => {
  return NextResponse.json({ ok: true });
}
```

**Expected Impact:** ~39 error reduction
**Automation:** 70% auto-fixable, 30% requires review

---

## Phase 4: Type Safety Improvements (Future)

### Create Firebase Typing Wrapper Library

**Objective:** Provide type-safe Firebase API access without modifying SDK

**Pattern:**
```typescript
// Wrapper for snap.data()
export function snapData<T extends Record<string, unknown>>(
  snap: QueryDocumentSnapshot | DocumentSnapshot
): T {
  return snap.data() as T;
}

// Usage
const userData = snapData<UserProfile>(snap);
// userData is now properly typed as UserProfile, not any
```

**Benefits:**
- Eliminates `any` type propagation
- Single point of Firebase API abstraction
- Easier to migrate if Firebase improves types
- Enables IDE autocomplete

**Files to Create:**
- `src/lib/firebase/wrappers.ts` - Typed API wrappers
- `src/lib/firebase/types.ts` - Type definitions
- `src/lib/firebase/index.ts` - Export barrel

**Expected to resolve:** Remaining 100+ unsafe-* errors (optional improvement)

---

## Error Breakdown Summary

| Category | Count | Phase | Effort | Impact |
|----------|-------|-------|--------|--------|
| no-unsafe-assignment | 104 | 1 | Low | High (suppressed) |
| no-unsafe-member-access | 58 | 1 | Low | High (suppressed) |
| no-unused-vars | 43 | 2 | Low | High (auto-fixed) |
| require-await | 39 | 3 | Medium | Medium |
| no-unsafe-call | 23 | 1 | Low | High (suppressed) |
| no-unsafe-argument | 10 | 1 | Low | High (suppressed) |
| Others | 32 | 3+ | Variable | Variable |

---

## Success Criteria

- [ ] Phase 1: 195 Firebase unsafe-* errors suppressed
- [ ] Phase 2: 40-50 unused-vars errors fixed (auto)
- [ ] Phase 3: 30+ require-await errors fixed (manual)
- [ ] **Target:** Reduce 379 → 150 errors (60% reduction)
- [ ] Result: 5/6 packages passing, apps/web with manageable errors

---

## Implementation Timeline

**Phase 1 (Active):** Dec 2 - Now (config, ~15 min)
**Phase 2 (Queued):** Dec 2 - Within 1 hour (auto-fix)
**Phase 3 (Queued):** Dec 2 - Within 4 hours (require-await fixes)
**Phase 4 (Future):** Q1 2026 (Firebase wrapper library)

---

## References

- **Firebase Typing Issue:** https://github.com/firebase/firebase-js-sdk/issues/7598
- **ESLint Config:** apps/web/eslint.config.mjs
- **Firebase Files:** apps/web/src/lib/, apps/web/app/api/
- **Type Definitions:** types/firebase-admin.d.ts
