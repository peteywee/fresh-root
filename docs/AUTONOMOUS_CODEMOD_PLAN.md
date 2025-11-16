# Autonomous Codemod Implementation Plan - v15 Bible Compliance

**Created:** 2025-11-16  
**Status:** READY FOR EXECUTION  
**Purpose:** Systematic, automated implementation of Project Bible v15.0.0 standards across the codebase

---

## Executive Summary

This plan provides a **fully autonomous, executable roadmap** for bringing the Fresh Schedules codebase into complete compliance with Project Bible v15.0.0. The plan is divided into phases that can be executed independently with automated verification at each step.

### Success Metrics
- ✅ All 34 API routes comply with ROUTE_API_STANDARD
- ✅ 80%+ code coverage with comprehensive unit tests
- ✅ E2E tests cover all critical user journeys
- ✅ Layer dependency violations: 0
- ✅ Firestore rules 100% tested
- ✅ Security headers implemented on all responses
- ✅ Zero high/critical security vulnerabilities

---

## Phase 1: Testing Infrastructure (Foundational)

**Priority:** P0 - CRITICAL  
**Estimated Effort:** 2-4 hours  
**Dependencies:** None

### 1.1 End-to-End Test Suite Expansion

**Current State:** 4 E2E test files exist but may be incomplete  
**Target State:** Complete E2E coverage per TESTING_STANDARD.md §C

**Actions:**
```bash
# Files to enhance/create:
tests/e2e/onboarding-full-flow.spec.ts       # Expand to full wizard coverage
tests/e2e/auth-complete.spec.ts              # Sign-in, MFA, sign-out
tests/e2e/schedule-crud.spec.ts              # Create, update, delete shifts
tests/e2e/attendance-flow.spec.ts            # Clock in/out workflow
```

**Implementation Steps:**
1. ✅ Audit existing E2E tests for coverage gaps
2. ✅ Implement missing critical journey tests:
   - Org-centric network creation (full wizard)
   - Admin MFA flow
   - Shift CRUD operations
   - Attendance clock-in/out
3. ✅ Configure Playwright CI pipeline
4. ✅ Add E2E smoke tests to pre-push hook

**Verification:**
```bash
pnpm test:e2e --reporter=list
# Must show: 4 critical journeys × 3-5 test cases each ≈ 15-20 E2E tests passing
```

### 1.2 Unit Test Coverage Enforcement

**Current State:** Tests exist but coverage % unknown  
**Target State:** 80% line coverage minimum (TESTING_STANDARD.md §A)

**Actions:**
```bash
# Add to vitest.config.ts:
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  },
  exclude: [
    '**/__tests__/**',
    '**/node_modules/**',
    '**/.next/**'
  ]
}
```

**Implementation Steps:**
1. ✅ Enable coverage reporting in vitest config
2. ✅ Generate baseline coverage report
3. ✅ Identify files below 80% threshold
4. ✅ Create unit tests for uncovered critical paths:
   - Domain entity validators (`packages/types/src/**`)
   - Business logic in `apps/web/src/lib/**`
   - API validation helpers (`apps/web/app/api/_shared/**`)
5. ✅ Add coverage gate to CI

**Verification:**
```bash
pnpm test --coverage
# Must show: ≥80% lines, ≥80% functions, ≥75% branches
```

### 1.3 Firestore Rules Integration Tests

**Current State:** Rules exist (`firestore.rules`), test coverage unclear  
**Target State:** 100% of security rules tested (TESTING_STANDARD.md §B)

**Actions:**
```bash
# Expand tests/rules/*.spec.ts:
tests/rules/attendance-role-validation.spec.ts    # NEW - validates roleId
tests/rules/shift-org-isolation.spec.ts           # NEW - org tenancy
tests/rules/cross-org-read-prevention.spec.ts     # NEW - isolation tests
```

**Implementation Steps:**
1. ✅ Audit `firestore.rules` for all access paths
2. ✅ Create test cases for:
   - Every `allow read/write if` condition
   - Multi-org isolation enforcement
   - Role-based access control (RBAC)
3. ✅ Run rules tests against emulator
4. ✅ Add rules test gate to CI

**Verification:**
```bash
pnpm test:rules
# Must show: All rules paths tested, 0 uncovered rule conditions
```

---

## Phase 2: API Route Compliance (Structural)

**Priority:** P0 - CRITICAL  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Phase 1.2 (coverage tooling)

### 2.1 Automated API Route Audit

**Current State:** 34 API routes with varying compliance  
**Target State:** 100% compliance with ROUTE_API_STANDARD.md

**Actions:**
```typescript
// Create: scripts/audit/api-compliance-checker.mts
// Checks each route.ts for:
// - Telemetry logging (trace/span setup)
// - Zod validation on request body
// - Structured error responses
// - Security headers
// - Rate limiting on sensitive endpoints
```

**Implementation Steps:**
1. ✅ Create automated compliance checker script
2. ✅ Run audit across all 34 routes
3. ✅ Generate compliance report (`api-compliance-report.md`)
4. ✅ Prioritize fixes by endpoint criticality

**Verification:**
```bash
pnpm tsx scripts/audit/api-compliance-checker.mts --report
# Must generate: markdown report showing 34/34 routes compliant
```

### 2.2 Systematic Route Refactoring

**Target Routes (Critical First):**
```
Priority P0 (Auth/Onboarding):
- apps/web/app/api/onboarding/create-network-org/route.ts
- apps/web/app/api/onboarding/admin-form/route.ts
- apps/web/app/api/auth/mfa/setup/route.ts

Priority P1 (Core Operations):
- apps/web/app/api/schedules/route.ts
- apps/web/app/api/shifts/route.ts
- apps/web/app/api/attendance/route.ts

Priority P2 (Supporting):
- All remaining routes in apps/web/app/api/
```

**Standard Route Template:**
```typescript
// apps/web/app/api/_template/v15-compliant-route.ts
import { withTelemetry } from '@/lib/telemetry';
import { validateRequest } from '@/lib/api/validation';
import { ErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';

// Every route MUST:
// 1. Wrap handler with telemetry
// 2. Validate input with Zod
// 3. Return structured errors
// 4. Apply rate limiting where appropriate
// 5. Set security headers (via middleware)

export const POST = withTelemetry('POST /api/example', async (req) => {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(req, 'example-create');
    if (!rateLimitResult.ok) {
      return ErrorResponse.tooManyRequests();
    }

    // Validation
    const body = await req.json();
    const validated = ExampleSchema.parse(body);

    // Business logic
    const result = await createExample(validated);

    return Response.json({ success: true, data: result });
  } catch (err) {
    return ErrorResponse.fromError(err);
  }
});
```

**Implementation Steps:**
1. ✅ Create v15-compliant route template
2. ✅ Refactor P0 routes (auth/onboarding)
3. ✅ Refactor P1 routes (schedules/shifts/attendance)
4. ✅ Refactor P2 routes (remaining)
5. ✅ Run compliance checker after each batch

**Verification:**
```bash
# After each priority group:
pnpm tsx scripts/audit/api-compliance-checker.mts --priority P0
pnpm test # Ensure no regressions
pnpm typecheck # Ensure no type errors
```

---

## Phase 3: Layer Architecture Enforcement (Structural)

**Priority:** P1 - HIGH  
**Estimated Effort:** 3-5 hours  
**Dependencies:** None (can run parallel to Phase 2)

### 3.1 Dependency Direction Validator

**Current State:** Layer violations may exist (00→01→02→03→04)  
**Target State:** Zero violations of layer dependency rules

**Actions:**
```typescript
// Create: scripts/audit/layer-dependency-checker.mts
// Validates:
// - No imports from higher to lower layers
// - Domain (00) imports nothing from infra/app/API/UI
// - UI (04) doesn't import Firebase Admin directly
```

**Implementation Steps:**
1. ✅ Create layer dependency AST parser
2. ✅ Map all imports across codebase
3. ✅ Flag violations with file:line:import-path
4. ✅ Generate violation report
5. ✅ Refactor violations (extract to correct layer)

**Verification:**
```bash
pnpm tsx scripts/audit/layer-dependency-checker.mts
# Must output: "✅ 0 layer violations detected"
```

### 3.2 Layer Boundary Documentation

**Actions:**
```bash
# Create layer README files:
packages/types/README.md          # Layer 00 - Domain Kernel
apps/web/src/lib/README.md       # Layers 01-02 split explanation
apps/web/app/api/README.md       # Layer 03 - API Edge
apps/web/app/README.md           # Layer 04 - UI/UX
```

**Implementation Steps:**
1. ✅ Document each layer's responsibilities
2. ✅ Provide import examples (allowed vs forbidden)
3. ✅ Link to Bible v15 §2 (Architecture)

---

## Phase 4: Security Hardening (Critical)

**Priority:** P0 - CRITICAL  
**Estimated Effort:** 2-3 hours  
**Dependencies:** Phase 2.1 (API routes refactored)

### 4.1 Security Headers Implementation

**Current State:** Headers partially configured in next.config.mjs  
**Target State:** Full CSP + security headers on all responses

**Actions:**
```typescript
// Enhance: apps/web/app/api/_shared/middleware.ts
export function withSecurityHeaders(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const response = await handler(req);
    
    // Apply headers per SECURITY_HARDENING_STANDARD.md
    response.headers.set('Content-Security-Policy', strictCSP);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
    
    return response;
  };
}
```

**Implementation Steps:**
1. ✅ Create security headers middleware
2. ✅ Wrap all API routes with middleware
3. ✅ Verify headers in E2E tests
4. ✅ Add CSP violation reporting endpoint

**Verification:**
```bash
# Test with curl:
curl -I http://localhost:3000/api/health | grep -E "(Content-Security|X-Frame|X-Content-Type)"
# Must show all required headers present
```

### 4.2 Dependency Vulnerability Scanning

**Current State:** No automated audit in CI  
**Target State:** `pnpm audit --prod` fails CI on high/critical vulns

**Actions:**
```yaml
# Add to .github/workflows/ci.yml:
- name: Dependency Audit
  run: |
    pnpm audit --prod --audit-level=high
  # Fails CI if high/critical vulnerabilities found
```

**Implementation Steps:**
1. ✅ Add audit step to CI workflow
2. ✅ Run baseline audit, fix existing issues
3. ✅ Document audit policy in SECURITY.md

**Verification:**
```bash
pnpm audit --prod --audit-level=high
# Must exit 0 (no high/critical vulnerabilities)
```

### 4.3 Input Validation Audit

**Current State:** Zod used inconsistently  
**Target State:** Every API endpoint validates input with Zod

**Actions:**
```bash
# Audit script output should show:
# ✅ 34/34 routes have Zod validation
# ✅ 0 routes accept unvalidated JSON
```

**Implementation Steps:**
1. ✅ Run API compliance checker (from Phase 2.1)
2. ✅ Fix any routes missing validation
3. ✅ Create validation test template

---

## Phase 5: Telemetry & Observability (Operations)

**Priority:** P1 - HIGH  
**Estimated Effort:** 2-3 hours  
**Dependencies:** Phase 2 (API routes refactored)

### 5.1 Structured Logging Implementation

**Current State:** Logging exists but may not be structured/consistent  
**Target State:** JSON logs per TELEMETRY_LOGGING_STANDARD.md §3

**Actions:**
```typescript
// Enhance: apps/web/src/lib/logger.ts
export const logger = {
  info: (message: string, context: LogContext) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      message,
      context: {
        project: 'FreshSchedules',
        requestId: context.requestId,
        tenancy: context.tenancy,
        actor: context.actor,
        metadata: context.metadata
      }
    }));
  },
  // ... error, warn, debug
};
```

**Implementation Steps:**
1. ✅ Standardize logger interface
2. ✅ Add logger to all API routes
3. ✅ Mask PII (passwords, tokens) in logs
4. ✅ Add correlation IDs to requests

**Verification:**
```bash
# Start dev server, make API call, check logs:
pnpm dev
curl -X POST http://localhost:3000/api/orgs -d '{...}'
# Log output must be valid JSON with required fields
```

### 5.2 OpenTelemetry Instrumentation

**Current State:** OTEL scaffolding exists (`apps/web/src/lib/otel.ts`)  
**Target State:** Tracing enabled on all critical paths

**Actions:**
```typescript
// Ensure: apps/web/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./src/lib/otel');
  }
}
```

**Implementation Steps:**
1. ✅ Verify OTEL SDK initialized
2. ✅ Add spans to all API handlers
3. ✅ Configure trace export (console/cloud)
4. ✅ Test trace propagation

---

## Phase 6: Codebase Cleanup (Quality)

**Priority:** P2 - MEDIUM  
**Estimated Effort:** 2-3 hours  
**Dependencies:** Phases 1-5 complete

### 6.1 Unused Code Removal

**Actions:**
```bash
# Use: ts-prune or depcheck
npx depcheck --ignores="@types/*,eslint-*"
npx ts-prune | grep -v "used in module"
```

**Implementation Steps:**
1. ✅ Identify unused exports
2. ✅ Remove dead code (non-breaking)
3. ✅ Remove unused dependencies
4. ✅ Run full test suite to verify

### 6.2 Import Organization

**Current State:** Imports may not follow IMPORT_STANDARD.md  
**Target State:** All files have organized imports (React → 3rd party → local)

**Actions:**
```bash
# Use ESLint plugin: eslint-plugin-import
# Configure auto-fix on save
```

**Implementation Steps:**
1. ✅ Configure import sorting rules
2. ✅ Run `pnpm lint:fix` across codebase
3. ✅ Verify no breakage

---

## Execution Strategy

### Automated Execution Order

```bash
# 1. Setup & Baseline
pnpm install --frozen-lockfile
pnpm typecheck  # Ensure clean baseline
pnpm test       # Establish baseline coverage

# 2. Phase 1 - Testing (Foundation)
pnpm tsx scripts/setup-e2e-tests.mts
pnpm test:e2e
pnpm tsx scripts/setup-coverage.mts
pnpm test --coverage

# 3. Phase 2 - API Compliance
pnpm tsx scripts/audit/api-compliance-checker.mts --report
pnpm tsx scripts/refactor/apply-route-standard.mts --priority P0
pnpm test && pnpm typecheck  # Verify after each priority

# 4. Phase 3 - Layer Enforcement
pnpm tsx scripts/audit/layer-dependency-checker.mts
# Fix violations manually (requires domain knowledge)

# 5. Phase 4 - Security
pnpm tsx scripts/security/apply-headers.mts
pnpm audit --prod --audit-level=high

# 6. Phase 5 - Telemetry
pnpm tsx scripts/telemetry/standardize-logging.mts

# 7. Phase 6 - Cleanup
npx depcheck
pnpm lint:fix

# 8. Final Verification
pnpm -w typecheck
pnpm test --coverage
pnpm test:e2e
pnpm lint
```

### CI/CD Integration

```yaml
# .github/workflows/v15-compliance.yml
name: v15 Bible Compliance Check
on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install
        run: pnpm install --frozen-lockfile
      
      - name: Typecheck
        run: pnpm typecheck
      
      - name: Unit Tests (80% coverage)
        run: pnpm test --coverage
      
      - name: E2E Tests
        run: pnpm test:e2e
      
      - name: Firestore Rules Tests
        run: pnpm test:rules
      
      - name: API Compliance Check
        run: pnpm tsx scripts/audit/api-compliance-checker.mts
      
      - name: Layer Dependency Check
        run: pnpm tsx scripts/audit/layer-dependency-checker.mts
      
      - name: Security Audit
        run: pnpm audit --prod --audit-level=high
      
      - name: Lint
        run: pnpm lint
```

---

## Success Criteria

### Phase Completion Checklist

- [ ] **Phase 1:** E2E tests cover 4 critical journeys, 80% unit test coverage, 100% rules tested
- [ ] **Phase 2:** All 34 API routes comply with ROUTE_API_STANDARD
- [ ] **Phase 3:** Zero layer dependency violations
- [ ] **Phase 4:** Security headers on all responses, zero high/critical vulnerabilities
- [ ] **Phase 5:** Structured JSON logging, OTEL traces enabled
- [ ] **Phase 6:** No unused code, organized imports

### Final Deliverable

A **green CI pipeline** with all compliance checks passing:

```
✅ Typecheck: PASS
✅ Unit Tests: PASS (≥80% coverage)
✅ E2E Tests: PASS (4 critical journeys)
✅ Rules Tests: PASS (100% rule coverage)
✅ API Compliance: PASS (34/34 routes)
✅ Layer Check: PASS (0 violations)
✅ Security Audit: PASS (0 high/critical)
✅ Lint: PASS (0 errors)
```

---

## Rollback Plan

Each phase creates a git tag for safe rollback:

```bash
# After each phase:
git tag -a "v15-phase-N-complete" -m "Phase N: [Name] - COMPLETE"
git push origin v15-phase-N-complete

# To rollback:
git reset --hard v15-phase-N-complete
```

---

## Estimated Timeline

| Phase | Hours | Can Parallelize? |
|-------|-------|------------------|
| 1     | 2-4   | No (foundation)  |
| 2     | 4-6   | Yes (with Phase 3) |
| 3     | 3-5   | Yes (with Phase 2) |
| 4     | 2-3   | No (depends on 2) |
| 5     | 2-3   | No (depends on 2) |
| 6     | 2-3   | No (final cleanup) |
| **Total** | **15-24 hours** | **10-16 hours parallelized** |

---

## Next Actions

1. ✅ Review this plan with stakeholders
2. ✅ Execute Phase 1 (testing foundation)
3. ✅ Create tracking issue with phase checkboxes
4. ✅ Begin automated execution with scripts

**Status:** READY TO EXECUTE  
**Reviewed by:** [To be filled]  
**Approved on:** [To be filled]
