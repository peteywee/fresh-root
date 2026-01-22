# Test Agent

Generate and run tests for a feature or file.

## Overview

The Test Agent generates comprehensive tests following Fresh Schedules testing standards and runs
them to verify coverage and functionality.

## When to Use

✅ **Use this agent for**:

- Generate tests for new features
- Test API routes
- Increase test coverage
- Verify all edge cases are covered

❌ **Don't use this agent for**:

- Quick unit test (write directly)
- Code review (use Review Agent)
- Performance testing (manual work)

## Invocation

```
Use the test agent to generate tests for the auth module
Run the test agent to create tests for this API route
Generate tests for the schedule feature
```

## Test Types

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from "vitest";

describe("functionName", () => {
  it("should handle valid input", () => {
    const result = functionName(validInput);
    expect(result).toEqual(expected);
  });

  it("should throw on invalid input", () => {
    expect(() => functionName(invalidInput)).toThrow();
  });

  it("should handle edge case", () => {
    const result = functionName(edgeCase);
    expect(result).toEqual(expected);
  });
});
```

### API Route Tests

```typescript
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { GET, POST } from "../route";

describe("POST /api/feature", () => {
  it("should create with valid input", async () => {
    const request = createMockRequest("/api/feature", {
      method: "POST",
      body: validInput,
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await POST(request, { params: {} });
    expect(response.status).toBe(201);
  });

  it("should reject invalid input", async () => {
    // ...
  });
});
```

### E2E Tests (Playwright)

- Real browser interaction
- Accessibility checks
- User flow validation

## Process

1. **Analyze Target**
   - What functions/methods exist?
   - What are inputs/outputs?
   - What edge cases exist?

2. **Generate Tests**
   - Happy path tests
   - Error case tests
   - Edge case tests
   - Validation tests

3. **Run Tests**
   ```bash
   pnpm test [file]        # Specific tests
   pnpm test:coverage      # With coverage
   pnpm test:e2e           # E2E tests
   ```

## Test Coverage

Run with coverage:

```bash
pnpm test:coverage
```

Reports percentage of:

- Statements covered
- Branches covered
- Functions covered
- Lines covered

## Output Format

Tests organized by type with clear descriptions of:

- What is being tested
- Expected behavior
- Edge cases

## See Also

- [Implement Agent](./../implement-agent/) — Code implementation
- [Review Agent](./../review-agent/) — Code review
- [Audit Agent](./../audit-agent/) — Security testing
