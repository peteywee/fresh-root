# Technical Debt Tracking

## Current Status: ✅ MINIMAL DEBT

Last updated: November 6, 2025

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

- **ESLint Warnings**: 0 ✅
- **ESLint Errors**: 0 ✅
- **TypeScript Errors**: 0 ✅
- **Deprecated Dependencies**: 0 ✅
- **Unmet Peer Dependencies**: 0 ✅
- **Spelling Errors**: 0 ✅
- **Intentional `eslint-disable` Comments**: 6 (all justified)
- **`ts-ignore` / `ts-expect-error` Usage**: 0 ✅
- **Skipped Tests**: 0 ✅

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
