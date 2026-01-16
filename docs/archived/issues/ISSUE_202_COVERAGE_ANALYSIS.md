# Issue #202: Firestore Rules Test Coverage Analysis
**Date**: 2025-12-26
**Status**: In Progress
**Current Coverage**: ~40% (estimated)
**Target Coverage**: 80%+

---

## Current Test Infrastructure
### Existing Test Files (628 lines total)
1. **auth-boundaries.test.ts** (~150 lines)
   - ✅ Unauthenticated access denied
   - ✅ Basic auth boundary checks
   - ✅ Self-only access for /users

1. **tenant-isolation.test.ts** (~70 lines)
   - ✅ Cross-org read prevention
   - ✅ Basic tenant isolation
   - ✅ Schedule isolation between orgs

1. **roles-schedules.test.ts** (~130 lines)
   - ✅ RBAC for schedules
   - ✅ Role hierarchy enforcement
   - ⚠️ Limited to schedules only

1. **helpers.ts** (~90 lines)
   - ✅ Test environment setup
   - ✅ Context builders
   - ✅ Seed functions

1. **rules-smoke.spec.mts** (~160 lines)
   - ✅ Basic smoke tests
   - ✅ Rules file validation

---

## Firestore Rules Analysis
### Collections Covered by Rules
#### Primary Collections (9 total)
1. `/users/{userId}` - User profiles (self-only)
2. `/orgs/{orgId}` - Organizations (member access)
3. `/organizations/{orgId}` - Alternate org path
4. `/memberships/{membershipId}` - Org memberships

#### Org-Scoped Subcollections (7 total under /orgs/)
1. `/orgs/{orgId}/schedules/{scheduleId}`
2. `/orgs/{orgId}/positions/{positionId}`
3. `/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}`
4. `/orgs/{orgId}/join_tokens/{tokenId}`
5. `/organizations/{orgId}/messages/{messageId}`
6. `/organizations/{orgId}/receipts/{receiptId}`
7. `/organizations/{orgId}/schedules/{scheduleId}`
8. `/organizations/{orgId}/positions/{positionId}`

#### Top-Level Per-Org Collections (6 total)
1. `/venues/{orgId}/venues/{venueId}`
2. `/zones/{orgId}/zones/{zoneId}`
3. `/positions/{orgId}/positions/{positionId}`
4. `/schedules/{orgId}/schedules/{scheduleId}`
5. `/shifts/{orgId}/shifts/{shiftId}`
6. `/attendance_records/{orgId}/records/{recordId}`
7. `/join_tokens/{orgId}/join_tokens/{tokenId}`

**Total**: 19 collection patterns with security rules

---

## Coverage Gaps Analysis
### High Priority Gaps (Critical Security Paths)
#### 1. Shifts Collection (NOT TESTED)
- ❌ No tests for `/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}`
- ❌ No tests for `/shifts/{orgId}/shifts/{shiftId}`
- ❌ Staff self-service limited updates not tested
- **Risk**: Staff could modify unauthorized fields
- **Effort**: 2 hours

#### 2. Positions Collection (NOT TESTED)
- ❌ No tests for `/orgs/{orgId}/positions/{positionId}`
- ❌ No tests for `/positions/{orgId}/positions/{positionId}`
- ❌ Manager+ write access not verified
- **Risk**: Unauthorized position modifications
- **Effort**: 1.5 hours

#### 3. Venues & Zones (NOT TESTED)
- ❌ No tests for `/venues/{orgId}/venues/{venueId}`
- ❌ No tests for `/zones/{orgId}/zones/{zoneId}`
- ❌ Tenant isolation not verified for these collections
- **Risk**: Cross-org venue/zone access
- **Effort**: 1.5 hours

#### 4. Attendance Records (NOT TESTED)
- ❌ No tests for `/attendance_records/{orgId}/records/{recordId}`
- ❌ Scheduler+ write access not verified
- **Risk**: Unauthorized attendance modifications
- **Effort**: 1 hour

#### 5. Join Tokens (NOT TESTED)
- ❌ No tests for `/orgs/{orgId}/join_tokens/{tokenId}`
- ❌ No tests for `/join_tokens/{orgId}/join_tokens/{tokenId}`
- ❌ Manager-only access not verified
- **Risk**: Unauthorized token creation
- **Effort**: 1 hour

#### 6. Messages & Receipts (NOT TESTED)
- ❌ No tests for `/organizations/{orgId}/messages/{messageId}`
- ❌ No tests for `/organizations/{orgId}/receipts/{receiptId}`
- ❌ Self-service receipt creation not tested
- **Risk**: Cross-user receipt access
- **Effort**: 1 hour

### Medium Priority Gaps
#### 7. RBAC Role Hierarchy (PARTIAL)
- ⚠️ Only schedules tested for RBAC
- ❌ No tests for other collections with role checks
- ❌ Admin super-access not fully tested
- ❌ Corporate role not tested
- **Effort**: 1.5 hours

#### 8. Memberships Collection (PARTIAL)
- ⚠️ Basic membership tested
- ❌ Manager-created memberships not tested
- ❌ Self-created memberships not tested
- ❌ Update/delete permissions not tested
- **Effort**: 1 hour

#### 9. Organizations Collection (PARTIAL)
- ⚠️ Basic org access tested
- ❌ Alternate path (`/organizations/`) not tested
- ❌ Create/update/delete not fully tested
- **Effort**: 1 hour

### Low Priority Gaps
#### 10. Edge Cases & Error Paths
- ❌ Invalid custom claims handling
- ❌ Missing orgId in token
- ❌ Malformed membership IDs
- **Effort**: 1 hour

---

## Implementation Plan
### Phase 1: Critical Security (6 hours)
**Week 2, Day 1-2**

1. **Shifts Tests** (2h)
   - File: `tests/rules/shifts.test.ts`
   - Tests: 15+ scenarios
   - Coverage: Both `/orgs/` and `/shifts/` paths
   - Special: Staff limited updates

1. **Positions Tests** (1.5h)
   - File: `tests/rules/positions.test.ts`
   - Tests: 10+ scenarios
   - Coverage: Both paths, RBAC, tenant isolation

1. **Venues & Zones Tests** (1.5h)
   - File: `tests/rules/venues-zones.test.ts`
   - Tests: 12+ scenarios
   - Coverage: Manager+ access, tenant isolation

1. **Attendance & Tokens Tests** (1h)
   - File: `tests/rules/attendance-tokens.test.ts`
   - Tests: 10+ scenarios
   - Coverage: Scheduler+ access, manager-only tokens

### Phase 2: RBAC Completeness (2 hours)
**Week 2, Day 2**

1. **RBAC Comprehensive Tests** (1.5h)
   - File: `tests/rules/rbac-comprehensive.test.ts`
   - Tests: 20+ scenarios
   - Coverage: All roles × all collections
   - Special: Admin super-access, role hierarchy

1. **Memberships Tests** (0.5h)
   - File: `tests/rules/memberships.test.ts`
   - Tests: 8+ scenarios
   - Coverage: Create, update, delete, manager vs self

### Phase 3: Edge Cases & Validation (1 hour)
**Week 2, Day 3**

1. **Edge Cases Tests** (1h)
   - File: `tests/rules/edge-cases.test.ts`
   - Tests: 10+ scenarios
   - Coverage: Invalid tokens, missing claims, error paths

### Phase 4: Coverage Reporting (30 min)
**Week 2, Day 3**

1. **Generate Coverage Report**
   - Run all tests with coverage
   - Verify 80%+ achieved
   - Document any remaining gaps

---

## Test Structure Template
### Standard Test Pattern
```typescript
// [P0][TEST][RULES] Collection name rules tests
// Tags: P0, TEST, RULES, SECURITY, COLLECTION_NAME

import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { createRulesTestEnv, ctxUser, ctxUnauth, seed, cleanup } from "./helpers";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";

describe("rules: collection_name", () => {
  const orgA = "org-a";
  const orgB = "org-b";
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await createRulesTestEnv();
  });

  beforeEach(async () => {
    await env.clearFirestore();
    await seed(env, async (db) => {
      // Setup test data
    });
  });

  afterAll(async () => {
    await cleanup(env);
  });

  describe("authentication boundaries", () => {
    it("denies unauthenticated access", async () => {
      // Test implementation
    });
  });

  describe("tenant isolation", () => {
    it("allows same-org access", async () => {
      // Test implementation
    });

    it("denies cross-org access", async () => {
      // Test implementation
    });
  });

  describe("RBAC enforcement", () => {
    it("allows staff read", async () => {
      // Test implementation
    });

    it("allows manager+ write", async () => {
      // Test implementation
    });

    it("denies staff write", async () => {
      // Test implementation
    });
  });
});
```

---

## Test Scenarios Checklist
### For Each Collection Path
#### Authentication (3 tests)
- \[ ] Unauthenticated read denied
- \[ ] Unauthenticated write denied
- \[ ] Unauthenticated list denied

#### Tenant Isolation (4 tests)
- \[ ] Same-org read allowed
- \[ ] Cross-org read denied
- \[ ] Same-org write allowed (if authorized)
- \[ ] Cross-org write denied

#### RBAC - Read (6 tests)
- \[ ] Staff can read (if applicable)
- \[ ] Scheduler can read
- \[ ] Manager can read
- \[ ] Org\_owner can read
- \[ ] Admin can read (super-access)
- \[ ] Corporate can read (if applicable)

#### RBAC - Write (6 tests)
- \[ ] Staff write denied (unless self-service)
- \[ ] Scheduler write allowed (if applicable)
- \[ ] Manager write allowed
- \[ ] Org\_owner write allowed
- \[ ] Admin write allowed (super-access)
- \[ ] Role hierarchy enforced

#### Special Cases (varies)
- \[ ] Self-service operations (if applicable)
- \[ ] Limited field updates (shifts, receipts)
- \[ ] No-enumeration enforcement (list denied)
- \[ ] Delete restrictions (manager+ vs scheduler+)

**Total per collection**: ~20 test scenarios

---

## Success Metrics
### Quantitative Targets
| Metric | Current | Target | Delta |
|--------|---------|--------|-------|
| Test Files | 5 | 12 | +7 |
| Test Scenarios | ~30 | 150+ | +120 |
| Rule Coverage | ~40% | 80%+ | +40% |
| Collections Tested | 4 | 19 | +15 |

### Qualitative Targets
- ✅ All critical security paths tested
- ✅ Tenant isolation verified for all collections
- ✅ RBAC enforced for all permission checks
- ✅ No authorization bypass vulnerabilities
- ✅ Edge cases handled gracefully
- ✅ CI integration complete (tests block PRs)

---

## Risk Assessment
### High Risk Areas (Must Test)
1. **Shifts self-service updates** - Staff modifying unauthorized fields
2. **Cross-org data access** - Tenant isolation breaches
3. **Admin super-access** - Overly broad permissions
4. **Join token creation** - Unauthorized token generation

### Medium Risk Areas (Should Test)
1. **Role hierarchy** - Incorrect role comparisons
2. **Membership management** - Unauthorized membership changes
3. **Soft-delete behavior** - Data still accessible after delete

### Low Risk Areas (Nice to Test)
1. **Edge cases** - Invalid input handling
2. **Error paths** - Graceful failures
3. **Performance** - Rules execution time

---

## Next Steps
1. **Immediate** (Today):
   - Create shifts.test.ts
   - Create positions.test.ts
   - Run partial coverage report

1. **Short Term** (Week 2):
   - Complete all 7 new test files
   - Achieve 80%+ coverage
   - Integrate into CI/CD

1. **Medium Term** (Week 3):
   - Add regression tests for found issues
   - Optimize slow tests
   - Document testing patterns

---

## Commands Reference
```bash
# Run all rules tests
pnpm test:rules

# Run specific test file
pnpm test:rules -- shifts.test.ts

# Generate coverage report
pnpm test:rules -- --coverage

# Watch mode (during development)
pnpm test:rules -- --watch
```

---

**Status**: Analysis Complete
**Ready For**: Implementation Phase
**Estimated Completion**: Week 2, Day 3 (72 hours from now)
**Priority**: HIGH (Security-critical)

---

**Last Updated**: 2025-12-26
**Author**: AI Development Agent
**Review**: Pending team approval
