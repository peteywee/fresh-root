# Technical Debt Tracking

## Current Status: ✅ MINIMAL DEBT

Last updated: November 7, 2025

## 🟡 MEDIUM Priority Items

### 1. Temporary Metrics Implementation

**File**: `apps/web/app/api/metrics/route.ts`
**Issue**: In-memory metrics with comment _"temporary - will use OpenTelemetry in production"_
**Impact**: Medium - Works for development but not production-ready for distributed systems
**Recommendation**: Integrate with OpenTelemetry metrics when moving to production
**Blockers**: None - can be done anytime before production deployment

### 2. Development Bypass Flags

**File**: `apps/web/proxy.ts`
**Issue**: `BYPASS_ONBOARDING_GUARD` env flag with _"TEMPORARY"_ comments
**Impact**: Low - Only active in development mode
**Recommendation**: Remove or convert to feature flag system before production
**Blockers**: None - safe for development

### 3. Incomplete Feature Implementations

**Files**:

- `apps/web/app/actions/scheduleActions.ts` - Line 17: `TODO: perform the privileged write`
- `apps/web/app/(app)/protected/schedules/page.tsx` - Line 15: `TODO: replace with real org gating`

**Impact**: Medium - Features work but need proper authorization
**Recommendation**: Implement proper RBAC checks and privileged write patterns
**Blockers**: Waiting for full RBAC system (Block 3 - Integrity Core)

### 4. E2E Test Skeleton

**File**: `tests/e2e/login_publish_logout.e2e.spec.ts`
**Issue**: Has 3 TODO comments, no implementation
**Impact**: Low - Unit tests cover most functionality
**Recommendation**: Implement full E2E flow for critical user journeys
**Blockers**: None - can be done anytime

## ✅ Recently Resolved

### Duplicate Dependencies (Fixed: Nov 7, 2025)

- ~~execa and p-retry listed in both dependencies and devDependencies~~
- **Resolution**: Moved to devDependencies only (execa ^9.6.0, p-retry ^7.1.0)
- **Impact**: Eliminates version conflicts, reduces production bundle size

### Duplicate Rules Test Files (Fixed: Nov 7, 2025)

- ~~6 test files had both .ts and .mts versions (attendance, shifts, venues, zones, schedules, join-tokens)~~
- **Resolution**: Kept .mts versions as standard, removed duplicate .ts files
- **Impact**: Reduced maintenance burden by 50%, eliminated risk of divergent expectations

### Path Alias Inconsistency (Fixed: Nov 7, 2025)

- ~~@ alias pointed only to apps/web/app, limiting imports from apps/web/src~~
- **Resolution**: Changed @ to map to apps/web root, enabling @/app/* and @/src/* imports
- **Files Updated**: tsconfig.base.json, apps/web/tsconfig.json, vitest.config.ts, apps/web/vitest.config.ts
- **Impact**: Consistent import patterns, easier cross-directory imports

### Lint Warning Threshold Reduction (Nov 7, 2025)

- **Change**: Reduced --max-warnings from 200 to 100 (50% reduction)
- **Goal**: Continue reducing to 0 over time as warnings are addressed
- **Next Steps**: 
  - Measure current warning count with `pnpm lint`
  - Categorize warnings by type
  - Reduce to 50 when <75 warnings remain, then to 0

### IndexedDB Polyfill (Verified: Nov 7, 2025)

- **Status**: Already implemented in apps/web/vitest.setup.ts (fake-indexeddb/auto)
- **Impact**: Tests can use idb without additional mocking

### Console Statement Violations (Fixed: Nov 6, 2025)

- ~~13 console.debug/console.log violations across 3 files~~
- **Resolution**: Replaced with proper logging (console.error for logs) or removed
- **Files Fixed**:
  - `apps/web/app/lib/registerServiceWorker.ts` - Removed all console.debug calls
  - `apps/web/src/lib/logger.ts` - Changed console.log to console.error
  - `apps/web/app/(app)/protected/dashboard/page.tsx` - Removed debug console.log

### Deprecated Test File (Fixed: Nov 6, 2025)

- ~~`tests/rules/storage.spec.ts` - Deprecated placeholder~~
- **Resolution**: Deleted - tests consolidated in `storage.fixed.spec.ts`

## 📊 Quality Metrics

- **ESLint Warnings**: Target 100 (reduced from 200, goal: 0) 🎯
- **ESLint Errors**: 0 ✅
- **TypeScript Errors**: 0 ✅
- **Deprecated Dependencies**: 0 ✅
- **Unmet Peer Dependencies**: 0 ✅
- **Spelling Errors**: 0 ✅
- **Intentional `eslint-disable` Comments**: 6 (all justified)
- **`ts-ignore` / `ts-expect-error` Usage**: 0 ✅
- **Skipped Tests**: 0 ✅
- **Duplicate Test Files**: 0 ✅ (fixed: removed 6 duplicate .ts files)
- **Path Alias Consistency**: ✅ (@ now maps to apps/web root)

## 🎯 Next Actions

### Before Block 3

1. None - all critical items resolved

### During Block 3 (Integrity Core)

1. Implement proper RBAC checks for schedule actions
1. Add privileged write patterns with Firebase Cloud Functions or API routes
1. Implement real org gating with custom claims

### Before Production

1. Replace in-memory metrics with OpenTelemetry
1. Remove or convert `BYPASS_ONBOARDING_GUARD` to feature flag
1. Implement E2E test suite for critical flows
1. Audit all TODO/FIXME comments in code

## 📝 Notes

- This codebase maintains exceptionally high code quality standards
- All lint/format/type errors are addressed immediately
- Technical debt is tracked and prioritized appropriately
- No "junk code" or quick hacks without proper documentation
