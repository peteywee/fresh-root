# Test Auto-Generation System

**Purpose**: Automatically generate test file templates when coverage falls below thresholds.

**Status**: ✅ Enabled and Production-Ready

---

## Overview

The system automatically:

1. **Monitors** test coverage metrics (unit, integration, E2E)
2. **Detects** gaps when coverage falls below thresholds
3. **Generates** test file templates with helpful TODOs
4. **Commits** auto-generated files for developers to complete
5. **Reports** gaps and next steps

### Coverage Thresholds

| Layer | Minimum | Status |
|-------|---------|--------|
| **Unit Tests** | ≥90% | 🔴 Hard Requirement (CI blocks if <90%) |
| **Integration Tests** | ≥80% | 🔴 Hard Requirement (CI blocks if <80%) |
| **E2E Tests** | ≥70% | 🟡 Recommended (monitored) |
| **Overall** | ≥85% | 🔴 Hard Requirement (CI blocks if <85%) |

---

## How It Works

### 1. Coverage Analysis

**Script**: `scripts/tests/auto-generate-tests.mjs`

Analyzes:
- All API routes in `apps/web/app/api/**/route.ts`
- All modules in `packages/**/src/**/*.ts`
- Existing test files in `**/__tests__/**/*.test.ts`

Identifies gaps:
- Routes without test files
- Critical modules without tests
- Untested functions

### 2. Test Template Generation

**Templates Created**:

#### Route Tests (Unit)
```typescript
// Generated for: apps/web/app/api/schedules/route.ts
describe("schedules API Route", () => {
  // Happy path test
  it("should return successful response", async () => {
    // TODO: Implement
  });

  // Validation test
  it("should validate input", async () => {
    // TODO: Implement
  });

  // Auth test
  it("should require authentication", async () => {
    // TODO: Implement
  });

  // Error test
  it("should handle errors gracefully", async () => {
    // TODO: Implement
  });
});
```

#### Integration Tests
```typescript
// Tests multi-step workflows, permissions, concurrency
describe("${name} Integration Tests", () => {
  // CRUD cycle
  it("should complete full create-read-update-delete cycle", () => {
    // TODO: Implement
  });

  // Concurrency
  it("should handle concurrent operations", () => {
    // TODO: Implement
  });

  // Permissions
  it("should enforce permissions across organizations", () => {
    // TODO: Implement
  });
});
```

#### Module Tests (Unit)
```typescript
// Tests individual functions, validation, errors
describe("${moduleName}", () => {
  // Happy path
  it("should work with valid input", () => {
    // TODO: Implement
  });

  // Validation
  it("should reject invalid input", () => {
    // TODO: Implement
  });

  // Error handling
  it("should handle errors gracefully", () => {
    // TODO: Implement
  });
});
```

**Key Features**:
- ✅ Pre-formatted with TODO sections
- ✅ Include test hints and examples
- ✅ Scaffolding for happy path + error cases
- ✅ File location calculated automatically
- ✅ Organized by test type (unit/integration)

### 3. Workflow Execution

**Triggered By**:
- Workflow dispatch (on-demand)
- Part of `test-coverage.yml` (automatic)
- Manual trigger via CLI

**Process**:
1. Run coverage analysis
2. Compare against thresholds
3. If below threshold → Generate tests
4. Commit generated files
5. Report results

### 4. Developer Workflow

**After Auto-Generation**:

```bash
# 1. See generated files
git status

# 2. Review templates
cat apps/web/app/api/schedules/__tests__/schedules.test.ts

# 3. Implement test logic (replace TODOs)
# - Fill in actual test code
# - Use SDK test utilities
# - Follow existing patterns

# 4. Run tests to verify
pnpm test

# 5. Check coverage
pnpm test -- --coverage

# 6. Commit when ready
git add .
git commit -m "test(schedules): implement unit tests for coverage"
```

---

## Usage

### Automatic (CI/CD Integration)

Tests auto-generate when:
1. **Unit test coverage < 90%**
2. **Integration test coverage < 80%**
3. **Overall coverage < 85%**

When detected:
- `scripts/tests/auto-generate-tests.mjs` runs
- Test templates created in `__tests__/` directories
- Files committed automatically
- Developers implement test logic

### Manual Trigger

```bash
# Force generation even if coverage is good
gh workflow run auto-generate-tests.yml -f force_generation=true

# Or directly
node scripts/tests/auto-generate-tests.mjs
```

### Check Coverage Status

```bash
# Run full test suite with coverage
pnpm test -- --coverage

# See coverage breakdown
pnpm test -- --coverage --reporter=verbose

# Check specific category
pnpm test:integration
```

---

## Example: Route Without Tests

### Before

```
apps/web/app/api/schedules/
├── route.ts          ✅ Route implemented
└── __tests__/        ❌ No tests!
```

### After Auto-Generation

```
apps/web/app/api/schedules/
├── route.ts          ✅ Route implemented
└── __tests__/
    └── route.test.ts ✅ AUTO-GENERATED TEST TEMPLATE
```

**Generated File** (`__tests__/route.test.ts`):

```typescript
// [P1][TEST][ROUTE] schedules API route tests
// Tags: P1, TEST, ROUTE, AI-GENERATED
// 🤖 AUTO-GENERATED: Complete this test to meet coverage threshold (≥90%)

import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "../route";

describe("schedules API Route", () => {
  beforeEach(() => {
    // Setup: Mock Firebase, set auth context, prepare test data
  });

  describe("GET Request", () => {
    it("should return successful response", async () => {
      // TODO: Implement happy path test
      expect(true).toBe(true); // Placeholder
    });

    it("should validate input", async () => {
      // TODO: Test input validation
      expect(true).toBe(true); // Placeholder
    });

    it("should require authentication", async () => {
      // TODO: Test auth requirement
      expect(true).toBe(true); // Placeholder
    });

    it("should handle errors gracefully", async () => {
      // TODO: Test error handling
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("POST Request", () => {
    it("should create resource with valid input", async () => {
      // TODO: Implement creation test
      expect(true).toBe(true); // Placeholder
    });

    it("should reject duplicate resources", async () => {
      // TODO: Test conflict handling
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### Developer Implements

```typescript
describe("schedules API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET Request", () => {
    it("should return successful response", async () => {
      const request = createMockRequest("/api/schedules", {
        cookies: { session: "valid-session" },
        searchParams: { orgId: "org-123" }
      });

      const response = await GET(request, { params: {} });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pagination).toBeDefined();
    });

    it("should require authentication", async () => {
      const request = createMockRequest("/api/schedules", {
        // No auth cookie
      });

      const response = await GET(request, { params: {} });

      expect(response.status).toBe(401);
    });

    // ... implement other tests
  });
});
```

---

## Test Template Structure

All generated templates follow this pattern:

### 1. Happy Path (Success Case)
- Valid input → 200/201 response
- Assert response structure
- Verify side effects

### 2. Validation (Input Check)
- Invalid input → 400 error
- Missing fields → 400 error
- Out-of-range values → 400 error

### 3. Authentication (Auth Required)
- No session → 401 error
- Expired token → 401 error
- Invalid token → 401 error

### 4. Authorization (Permission Check)
- Insufficient role → 403 error
- Wrong organization → 403 error
- Resource owned by other org → 403 error

### 5. Error Handling (Edge Cases)
- Database error → 500 error + logged
- Timeout → 504 error
- Rate limit → 429 error

---

## Integration with CI/CD

### Workflow Chain

```
Push to main
    ↓
test-coverage.yml
    ├─ Run tests
    ├─ Measure coverage
    ├─ If below threshold:
    │   ↓
    │   auto-generate-tests.yml (TRIGGERED)
    │       ├─ Analyze gaps
    │       ├─ Generate templates
    │       ├─ Commit files
    │       └─ Report results
    └─ Update quality scorecard
```

### Quality Gates

```
Coverage Below Thresholds?
    ├─ YES → Auto-generate tests + Commit
    │       ├─ Developers implement
    │       ├─ Re-run tests
    │       └─ Merge when passing
    │
    └─ NO → Merge approved
```

---

## Test Utilities (Use These)

### Mock Builders

```typescript
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { createMockAuthContext, createMockOrgContext } from "@fresh-schedules/api-framework/testing";

// Mock HTTP request
const request = createMockRequest("/api/schedules", {
  method: "POST",
  body: { name: "Q4 Schedule" },
  cookies: { session: "valid-session" },
  searchParams: { orgId: "org-123" }
});

// Mock auth context
const auth = createMockAuthContext({
  userId: "user-123",
  email: "test@example.com",
  emailVerified: true
});

// Mock org context
const org = createMockOrgContext({
  orgId: "org-123",
  role: "manager"
});
```

### Database Mocking

```typescript
import { vi } from "vitest";
import * as admin from "firebase-admin";

// Mock Firestore
const mockDb = {
  collection: vi.fn().mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      set: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined)
    })
  })
};

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => mockDb
}));
```

---

## Common Patterns in Generated Tests

### Route Test Pattern

```typescript
it("should [do something]", async () => {
  // Setup: Create request
  const request = createMockRequest(...);

  // Execute: Call handler
  const response = await GET(request, { params: {} });

  // Assert: Check response
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.id).toBeDefined();
});
```

### Integration Test Pattern

```typescript
it("should complete full cycle", async () => {
  // Setup: Initialize test state
  // Execute: Create → Read → Update → Delete
  // Assert: Verify each step worked
  // Cleanup: Reset database
});
```

### Module Test Pattern

```typescript
it("should validate input", () => {
  // Arrange: Set up test data
  // Act: Call function with invalid input
  // Assert: Expect error thrown
  expect(() => {
    myFunction(invalidInput);
  }).toThrow("Expected error message");
});
```

---

## Troubleshooting

### Generated Tests Won't Run

```bash
# Ensure test config is correct
pnpm test apps/web/app/api/schedules/__tests__/route.test.ts

# Check imports work
pnpm typecheck

# Verify mocks are set up
pnpm test --reporter=verbose
```

### Coverage Not Improving

```bash
# Check current coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- apps/web/app/api/schedules/__tests__/route.test.ts

# Debug: See what's untested
pnpm test -- --coverage --reporter=html
```

### Tests Generated But Not Detected

```bash
# Ensure files are in __tests__ directory
find apps/web/app/api -name "*.test.ts" | head -10

# Check file naming convention
# ✅ route.test.ts (detected)
# ❌ routetest.ts (not detected)

# Run test discovery
pnpm test -- --listTests | grep schedules
```

---

## Best Practices

### ✅ DO

- ✅ Implement all TODO sections
- ✅ Follow existing test patterns
- ✅ Use SDK test utilities
- ✅ Test happy path + error cases
- ✅ Keep tests focused (one concept per test)
- ✅ Use descriptive test names
- ✅ Mock external dependencies

### ❌ DON'T

- ❌ Skip TODO sections (placeholders fail)
- ❌ Test implementation details
- ❌ Use `expect(true).toBe(true)` in production tests
- ❌ Create overly large test files (split by feature)
- ❌ Ignore TypeScript errors in tests
- ❌ Skip test after generating

---

## Coverage Targets by Domain

### API Routes (Unit Tests)

**Target**: ≥90% of critical paths tested

```
GET /api/schedules     → Happy path, validation, auth, error
POST /api/schedules    → Create, validation, auth, conflict
GET /api/schedules/[id] → Retrieve, validation, auth
PATCH /api/schedules/[id] → Update, validation, auth, validation
DELETE /api/schedules/[id] → Delete, auth, cascade/prevent
```

### Core Modules (Unit Tests)

**Target**: ≥90% of functions tested

```
Firebase helpers       → Query, write, error handling
Type validation (Zod) → Schema validation, coercion, errors
Auth middleware       → Session verification, role checking
Error handling        → Error codes, logging, recovery
```

### Integration Workflows (Integration Tests)

**Target**: ≥80% of multi-step flows tested

```
Create → Read → Update → Delete cycle
Permission boundary enforcement
Organization isolation
Concurrent operation safety
Data consistency across operations
```

### E2E & User Flows (E2E Tests)

**Target**: ≥70% of critical user journeys tested

```
Onboarding flow
Schedule creation workflow
Shift assignment process
Permission changes propagation
Data export/import cycles
```

---

## Summary

| Feature | Status | Details |
|---------|--------|---------|
| Auto-analysis | ✅ | Identifies missing tests |
| Template generation | ✅ | Creates stubs with TODOs |
| Auto-commit | ✅ | Commits generated files |
| CI/CD integration | ✅ | Runs on coverage failures |
| Developer workflow | ✅ | Clear TODO → Implement flow |
| Test utilities | ✅ | Mocks, helpers available |
| Coverage reporting | ✅ | Tracks metrics per domain |

**Next**: When coverage falls below thresholds, the system automatically generates test templates and commits them. Developers implement the TODOs and verify coverage improves.

---

**Auto-maintained by**: `.github/workflows/auto-generate-tests.yml`  
**Script**: `scripts/tests/auto-generate-tests.mjs`  
**Last Updated**: December 7, 2025
