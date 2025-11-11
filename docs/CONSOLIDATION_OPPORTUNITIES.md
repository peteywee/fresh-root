# Codebase Consolidation & Cleanup Opportunities

> **Tags**: P2, REFACTORING, TECHNICAL_DEBT
> **Date**: November 10, 2025
> **Status**: Identified (not yet prioritized)

---

## Executive Summary

After Phase 1 implementation, the codebase has grown to ~22,100 insertions across 210 files. Several consolidation opportunities have been identified that could improve maintainability, reduce duplication, and improve developer experience.

**Total Identified Opportunities**: 12 high-impact areas
**Estimated Effort**: 1-2 weeks (low priority, can be staged)

---

## High-Priority Consolidation Areas

### 1. **Duplicate Firebase Admin Imports** ⭐⭐⭐

**Files Affected**:
- `apps/web/lib/firebase-admin.ts` (new)
- `apps/web/src/lib/firebase.server.ts` (existing)

**Issue**: 
Both files may be importing/initializing Firebase Admin SDK. Should consolidate to single entry point.

**Action**:
- [ ] Audit both files for overlap
- [ ] Merge into single `apps/web/src/lib/firebase.server.ts`
- [ ] Update imports across `apps/web/app/api/**/*.ts` to use consolidated path
- [ ] Remove `apps/web/lib/firebase-admin.ts`

**Impact**: -1 file, clearer import patterns, single source of truth for admin SDK

**Effort**: 30 min

---

### 2. **Onboarding Page Layout Duplication** ⭐⭐⭐

**Files Affected**:
- `apps/web/app/onboarding/profile/page.tsx`
- `apps/web/app/onboarding/create-network-org/page.tsx`
- `apps/web/app/onboarding/create-network-corporate/page.tsx`
- `apps/web/app/onboarding/admin-form/page.tsx`
- `apps/web/app/onboarding/admin-responsibility/page.tsx`
- `apps/web/app/onboarding/join/page.tsx`
- `apps/web/app/onboarding/intent/page.tsx`
- `apps/web/app/onboarding/layout.tsx` (wrapper)

**Issue**:
All pages likely have similar structure (form header, progress bar, error handling). Should extract common layout component.

**Action**:
- [ ] Create `apps/web/app/onboarding/_components/OnboardingPageLayout.tsx`
  ```tsx
  interface OnboardingPageLayoutProps {
    title: string;
    description: string;
    step: number;
    totalSteps: number;
    children: React.ReactNode;
    isLoading?: boolean;
    error?: string;
  }
  ```
- [ ] Refactor all 7 pages to use new layout component
- [ ] Move common form logic to reusable hooks (e.g., `useOnboardingFormState()`)

**Files to Consolidate**:
- Duplicate progress bar rendering
- Duplicate error state handling
- Duplicate loading spinners
- Duplicate form submission patterns

**Impact**: -100+ lines of duplication, clearer page structure, easier to maintain

**Effort**: 1-2 hours

---

### 3. **API Endpoint Handler Pattern Consolidation** ⭐⭐⭐

**Files Affected**:
All onboarding API routes:
- `apps/web/app/api/onboarding/profile/route.ts`
- `apps/web/app/api/onboarding/verify-eligibility/route.ts`
- `apps/web/app/api/onboarding/create-network-org/route.ts`
- `apps/web/app/api/onboarding/create-network-corporate/route.ts`
- `apps/web/app/api/onboarding/join-with-token/route.ts`
- `apps/web/app/api/onboarding/admin-form/route.ts`

**Issue**:
All handlers follow same pattern:
```typescript
export async function handler(req, injectedAdminDb = defaultAdminDb) {
  const uid = req.user?.uid;
  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  
  if (!injectedAdminDb) {
    return NextResponse.json({ ok: true, /* stub */ }, { status: 200 });
  }
  
  // Actual logic
}

export const POST = withSecurity(handler, { requireAuth: true });
```

**Action**:
- [ ] Create `apps/web/src/lib/api/endpoint-builder.ts`
  ```typescript
  export function createAuthenticatedEndpoint<TReq, TRes>(
    handler: (req: AuthReq, adminDb: AdminDb) => Promise<TRes>,
    options?: { requireAuth?: boolean; schema?: ZodSchema }
  )
  ```
- [ ] Consolidate common patterns: uid extraction, adminDb fallback, security wrapping
- [ ] Apply to all 6 onboarding endpoints

**Impact**: -50+ lines per endpoint (300+ total), clearer contracts, less copy-paste

**Effort**: 2-3 hours

---

### 4. **Test Setup Consolidation** ⭐⭐

**Files Affected**:
- `apps/web/vitest.setup.ts` (global)
- `apps/web/src/lib/api/__tests__/security-integration.test.ts`
- `apps/web/src/lib/api/csrf.test.ts`
- `apps/web/src/lib/api/validation.test.ts`
- `apps/web/src/__tests__/api/admin-form.test.ts`
- `apps/web/src/__tests__/api/create-network-org.test.ts`
- `tests/rules/networks.spec.mts`
- `tests/rules/admin-form.spec.mts`

**Issue**:
- Duplicate Firebase mock setup across test files
- Redundant test helper functions
- Inconsistent request/response factories

**Action**:
- [ ] Create `apps/web/src/lib/api/__tests__/helpers.ts`
  ```typescript
  export function createMockRequest(options: { uid?: string; body?: object; ... })
  export function expectAuthError(response, message)
  export function expectValidationError(response, field)
  ```
- [ ] Consolidate all test setup into `vitest.setup.ts`
- [ ] Remove duplicate helpers from individual test files
- [ ] Create shared fixtures for onboarding test data

**Impact**: -50+ lines of test duplication, faster test development

**Effort**: 1-2 hours

---

### 5. **Type Definition Consolidation** ⭐⭐

**Files Affected**:
- `packages/types/src/networks.ts` (new v14 types)
- `packages/types/src/orgs.ts` (v13 types)
- `packages/types/src/links/corpOrgLinks.ts` (new)
- `packages/types/src/links/orgVenueAssignments.ts` (existing)

**Issue**:
- Network and Org types may have overlapping fields
- Link types use different patterns
- No clear pattern for v13 vs v14 type variants

**Action**:
- [ ] Audit type overlap between `networks.ts` and `orgs.ts`
- [ ] Create `packages/types/src/migrations/v13-to-v14.ts` with mapping types
- [ ] Consolidate link types to single pattern: `Link<TParent, TChild>`
- [ ] Add JSDoc markers for v14-only types:
  ```typescript
  /**
   * @since v14.0.0 - Network-scoped tenancy
   */
  export type Network = { ... }
  ```

**Impact**: Clearer type hierarchy, easier migrations, better documentation

**Effort**: 2-3 hours

---

### 6. **Firestore Rules Consolidation** ⭐⭐

**Files Affected**:
- `firestore.rules` (126 lines)
- `storage.rules` (new/updated)
- Tests: `tests/rules/*.spec.mts`

**Issue**:
- Rules may have overlapping match patterns
- Duplicate permission checks
- Could extract common functions

**Action**:
- [ ] Extract common permission predicates to functions:
  ```javascript
  function isNetworkMember(uid, networkId) {
    return exists(/databases/$(database)/documents/networks/$(networkId)/members/$(uid))
  }
  ```
- [ ] Consolidate role-based access patterns
- [ ] Move network-specific rules to separate function blocks
- [ ] Add rule versioning comments

**Impact**: -20+ lines, clearer security model, easier audits

**Effort**: 1-2 hours

---

### 7. **Configuration Duplication** ⭐⭐

**Files Affected**:
- `apps/web/vitest.config.ts`
- `apps/web/vitest.setup.ts`
- `tests/rules/vitest.config.ts`
- `vitest.config.ts` (root)
- `jest.rules.config.js`

**Issue**:
- Multiple vitest configs with similar settings
- Some settings duplicated across Jest + Vitest
- Worker/thread configurations not centralized

**Action**:
- [ ] Create `vitest.base.config.ts` at root with shared config
- [ ] Import and extend in `apps/web/vitest.config.ts` and `tests/rules/vitest.config.ts`
- [ ] Document worker/thread strategy in config comments
- [ ] Add `// @shared-config-base` marker to base config

**Impact**: Single source of truth for test settings, easier maintenance

**Effort**: 1 hour

---

### 8. **Validation Schema Consolidation** ⭐

**Files Affected**:
- `apps/web/app/api/_shared/validation.ts` (exists, good! ✅)
- But scattered inline schemas in route files:
  - `apps/web/app/api/onboarding/profile/route.ts` - `ProfileSchema` defined inline
  - `apps/web/app/api/session/route.ts` - `CreateSessionSchema` defined inline

**Issue**:
- Some schemas defined inline in route files instead of being exported
- Makes reuse difficult, duplication risk

**Action**:
- [ ] Move all schemas to `apps/web/app/api/_shared/validation.ts`
- [ ] Export as:
  ```typescript
  export const ProfileSchema = z.object({ ... });
  export const CreateNetworkOrgSchema = z.object({ ... });
  export const JoinWithTokenSchema = z.object({ ... });
  // etc.
  ```
- [ ] Update imports in route files
- [ ] Organize schemas by feature (onboarding, admin, etc.)

**Impact**: Single source of truth for validation, easier schema reuse

**Effort**: 1 hour

---

### 9. **Environment Variable Consolidation** ⭐

**Files Affected**:
- `apps/web/.env.example` (new, 146 lines)
- `apps/web/src/lib/env.server.ts` (193 lines)
- `apps/web/src/lib/env.ts` (61 lines)
- `apps/web/lib/env.ts` (appears to be legacy)
- `.env.example` (root, 22 lines)

**Issue**:
- Multiple env files (root + app level)
- Potential duplication between `env.ts` and `env.server.ts`
- Legacy `apps/web/lib/env.ts` may be unused

**Action**:
- [ ] Verify `apps/web/lib/env.ts` is not imported anywhere
  ```bash
  grep -r "apps/web/lib/env" --include="*.ts" --include="*.tsx"
  ```
- [ ] If unused, delete it
- [ ] Consolidate client/server env vars into single file with clear sections
- [ ] Add documentation: which env vars are client-safe vs. server-only

**Impact**: -1 to -50 lines of duplication, clearer env var usage

**Effort**: 30 min

---

### 10. **Documentation Consolidation** ⭐

**Files Affected**:
- `docs/TODO-v14.md` (480 lines)
- `docs/PHASE2_OPTIONS.md` (232 lines)
- `docs/PHASE2_IMPLEMENTATION.md` (259 lines)
- `docs/BLOCK4_PLANNING.md` (346 lines)
- Multiple other phase/block docs

**Issue**:
- Multiple overlapping planning documents
- Cross-references but not DRY
- Hard to find single source of truth

**Action**:
- [ ] Create `docs/PHASES_ROADMAP.md` as master index
- [ ] Link from there to specific phase docs
- [ ] Mark docs as: "Master Index" / "Phase 2 Options" / "Phase 2 Implementation"
- [ ] Remove redundant cross-reference explanations
- [ ] Add navigation breadcrumbs to each doc

**Impact**: Clearer navigation, reduced redundancy, better cross-linking

**Effort**: 1-2 hours

---

### 11. **Component Import Paths** ⭐

**Files Affected**:
- `apps/web/app/onboarding/**/*.tsx`
- `apps/web/components/**/*.tsx`
- `apps/web/app/components/**/*.tsx` (if exists)

**Issue**:
- Unclear where common components live
- May have multiple dirs: `components/`, `app/components/`, `lib/components/`
- Imports may use relative paths like `../../../../components/Foo`

**Action**:
- [ ] Verify all component locations
  ```bash
  find apps/web -name "*.tsx" -path "*components*" | head -20
  ```
- [ ] Consolidate to single structure: `apps/web/components/**/*.tsx`
- [ ] Configure path alias in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@components/*": ["./components/*"]
      }
    }
  }
  ```
- [ ] Update all imports to use alias

**Impact**: Clearer component organization, easier imports, better discoverability

**Effort**: 1-2 hours

---

### 12. **Error Handling Consolidation** ⭐

**Files Affected**:
- `apps/web/src/lib/error/**/*.ts` (error handling utilities)
- `apps/web/src/lib/api/validation.ts` (error handling)
- Scattered error handling in endpoint handlers

**Issue**:
- Multiple ways to create error responses
- Inconsistent error shape across endpoints
- `badRequest()`, `serverError()`, `ok()` helpers exist but may not be used everywhere

**Action**:
- [ ] Create centralized error factory:
  ```typescript
  // apps/web/src/lib/api/errors.ts
  export class ApiErrorHandler {
    static notAuthenticated()
    static notAuthorized()
    static badRequest(message, details)
    static validationError(issues)
    static serverError(message)
  }
  ```
- [ ] Use throughout all endpoints
- [ ] Add error telemetry hooks

**Impact**: Consistent error shape, easier debugging, audit trail

**Effort**: 2-3 hours

---

## Medium-Priority Cleanup

### Cleanup Item 1: Remove `.skip` and `__tests__` directories
- `apps/web/src/__tests__/api-orgs-tokens-approvals.spec.ts.skip` - if not needed, delete
- Consolidate `src/__tests__` and `src/lib/api/__tests__` if possible

**Effort**: 30 min

### Cleanup Item 2: Archive old docs
- Move completed doc files to `docs/archive/` (already partially done ✅)
- Remove `-v13` suffixes from finalized docs
- Create index of archived docs

**Effort**: 1 hour

### Cleanup Item 3: Unused packages/imports
- Audit `package.json` for unused dependencies
- Run `pnpm audit` and address findings
- Remove unused Firebase SDK imports

**Effort**: 30 min

---

## Implementation Priority Roadmap

### Week 1 (If Consolidation Prioritized)
- [ ] Item 1: Merge Firebase Admin imports (30 min)
- [ ] Item 9: Clean up env files (30 min)
- [ ] Item 8: Move inline schemas (1 hour)
- [ ] Item 7: Config consolidation (1 hour)
- [ ] Subtotal: ~3 hours

### Week 2
- [ ] Item 4: Test helper consolidation (1-2 hours)
- [ ] Item 6: Firestore rules cleanup (1-2 hours)
- [ ] Item 2: Onboarding page layout (1-2 hours)
- [ ] Subtotal: ~4-6 hours

### Week 3
- [ ] Item 3: API endpoint builder (2-3 hours)
- [ ] Item 5: Type definition consolidation (2-3 hours)
- [ ] Item 11: Component import paths (1-2 hours)
- [ ] Subtotal: ~5-8 hours

### Optional (Nice-to-have)
- [ ] Item 10: Documentation consolidation (1-2 hours)
- [ ] Item 12: Error handling factory (2-3 hours)
- [ ] Medium-priority cleanups (1-2 hours)

---

## Recommendation

**Start with Items 1, 9, 8, 7** (Quick wins, 3-4 hours)
- These have minimal risk of breaking changes
- Provide immediate clarity
- Good first consolidation passes

**Then proceed to Item 3** (API endpoint builder)
- High impact on maintainability
- Touches 6 core endpoints
- Worth the effort investment

**Consider postponing Items 10, 12** until after Phase 2 implementation
- Less urgent than core consolidation
- Can be revisited when docs/errors are more stable

---

## Notes

- ✅ Already well-organized:
  - `apps/web/app/api/_shared/validation.ts` - good centralization ✅
  - `apps/web/app/onboarding/` - good route organization ✅
  - Firestore rules - well-commented ✅

- ⚠️ Watch for:
  - Changing patterns will affect existing tests - update them
  - Component consolidation should not break import paths in active pages
  - Document any config changes in migration guide

- 🚀 After consolidation:
  - Run full test suite: `pnpm test`
  - Run typecheck: `pnpm typecheck`
  - Run build: `pnpm build`

---

**Created by**: Codebase analysis (Phase 1 + 3 months forward-planning)
**Next Review**: After Phase 2 completion
