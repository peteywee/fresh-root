---

applyTo: "**/\*.{test,spec}.{ts,tsx},tests/**,**/**tests**/**"
description:
"Testing standards and code review guidelines for Vitest, Playwright, and review processes."
## priority: 5

# Testing & Review Standards
## Code Review Priorities
### 🔴 CRITICAL (Block Merge)
- **Security**: Vulnerabilities, exposed secrets, auth issues
- **Correctness**: Logic errors, data corruption risks
- **Breaking Changes**: API changes without versioning
- **Data Loss**: Risk of data loss or corruption

### 🟡 IMPORTANT (Requires Discussion)
- **Code Quality**: SOLID violations, excessive duplication
- **Test Coverage**: Missing tests for critical paths
- **Performance**: N+1 queries, memory leaks
- **Architecture**: Deviations from patterns

### 🟢 SUGGESTION (Non-Blocking)
- **Readability**: Poor naming, complexity
- **Optimization**: Performance without functional impact
- **Best Practices**: Minor convention deviations
- **Documentation**: Missing comments/docs

---

## Review Principles
1. **Be specific**: Reference exact lines, files
2. **Provide context**: Explain WHY it's an issue
3. **Suggest solutions**: Show corrected code
4. **Be constructive**: Improve code, not criticize author
5. **Recognize good practices**: Acknowledge good work
6. **Be pragmatic**: Not everything needs immediate fix
7. **Group related comments**: Don't scatter similar feedback

---

## Vitest (Unit Testing)
### Test Structure
```typescript
// [P1][TEST][TEST] Feature tests
// Tags: P1, TEST, TEST

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("FeatureName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("methodName", () => {
    it("should do expected behavior", () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });

    it("should handle edge case", () => {
      // ...
    });
  });
});
```

### Test File Location
```
src/
├── services/
│   ├── scheduler.ts
│   └── __tests__/
│       └── scheduler.test.ts
```

### Mock Patterns
```typescript
// Mock module
vi.mock("@/lib/firebase-admin", () => ({
  getFirestore: vi.fn(() => mockDb),
}));

// Mock function
const mockFetch = vi.fn().mockResolvedValue({ data: [] });

// Spy on method
const spy = vi.spyOn(service, "method");
expect(spy).toHaveBeenCalledWith(expectedArg);
```

### API Route Testing
```typescript
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { GET, POST } from "../route";

describe("GET /api/schedules", () => {
  it("should return schedules for org", async () => {
    const request = createMockRequest("/api/schedules", {
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await GET(request, { params: {} });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
  });
});

describe("POST /api/schedules", () => {
  it("should create schedule with valid input", async () => {
    const request = createMockRequest("/api/schedules", {
      method: "POST",
      body: { name: "Test", startDate: 1234567890 },
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await POST(request, { params: {} });
    expect(response.status).toBe(201);
  });

  it("should reject invalid input", async () => {
    const request = createMockRequest("/api/schedules", {
      method: "POST",
      body: { name: "" }, // Invalid
      cookies: { session: "valid-session" },
    });

    const response = await POST(request, { params: {} });
    expect(response.status).toBe(400);
  });
});
```

---

## Playwright (E2E Testing)
### Test Structure
```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should complete user flow", async ({ page }) => {
    await test.step("Navigate to feature", async () => {
      await page.getByRole("link", { name: "Feature" }).click();
    });

    await test.step("Perform action", async () => {
      await page.getByRole("button", { name: "Submit" }).click();
    });

    await test.step("Verify result", async () => {
      await expect(page.getByText("Success")).toBeVisible();
    });
  });
});
```

### Locator Best Practices
```typescript
// ✅ Good - User-facing, accessible
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email");
page.getByText("Welcome");
page.getByTestId("schedule-card");

// ❌ Avoid - Brittle
page.locator(".btn-primary");
page.locator("#submit-btn");
page.locator("div > button:first-child");
```

### Assertions
```typescript
// ✅ Use auto-retrying assertions
await expect(page.getByText("Loaded")).toBeVisible();
await expect(page).toHaveURL("/dashboard");
await expect(page.getByRole("list")).toHaveCount(5);

// ❌ Avoid hard waits
await page.waitForTimeout(1000);
```

### ARIA Snapshots
```typescript
await expect(page.getByRole("main")).toMatchAriaSnapshot(`
  - main:
    - heading "Dashboard" [level=1]
    - list "schedules":
      - listitem:
        - link "Schedule 1"
`);
```

---

## Test Coverage Strategy
### What Must Be Tested
| Component         | Coverage Target       |
| ----------------- | --------------------- |
| API Routes        | 80%+ (all methods)    |
| Business Logic    | 90%+                  |
| Utility Functions | 95%+                  |
| UI Components     | 70%+ (critical paths) |
| Edge Cases        | Explicit tests        |

### What to Test
```typescript
// Happy path
it("should create schedule with valid data", () => {});

// Validation errors
it("should reject empty name", () => {});
it("should reject invalid date", () => {});

// Authorization
it("should deny access without auth", () => {});
it("should deny access without manager role", () => {});

// Edge cases
it("should handle empty list", () => {});
it("should handle maximum items", () => {});
```

### Running Tests
```bash
pnpm test              # Unit tests
pnpm test:coverage     # With coverage report
pnpm test:rules        # Firestore rules
pnpm test:e2e          # Playwright E2E
```

---

## Test File Naming
```
*.test.ts      # Unit tests (Vitest)
*.spec.ts      # E2E tests (Playwright)
*.integration.test.ts  # Integration tests
```

---

## Review Checklist
### Before Requesting Review
- \[ ] All tests pass locally
- \[ ] Coverage maintained/improved
- \[ ] No console.log statements
- \[ ] Error cases tested
- \[ ] Edge cases considered
- \[ ] Documentation updated

### During Review
- \[ ] Tests cover the change
- \[ ] Tests are readable
- \[ ] Mocks are appropriate
- \[ ] Assertions are meaningful
- \[ ] No flaky test patterns

---

## Quality Checklist (Tests)
- \[ ] Locators are accessible and specific
- \[ ] Tests grouped logically
- \[ ] Assertions reflect user expectations
- \[ ] Naming follows convention
- \[ ] Code properly formatted

---

**Last Updated**: December 8, 2025
