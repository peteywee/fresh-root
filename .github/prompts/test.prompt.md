---
agent: "agent"
description: "Generate and run tests for a feature or file"
tools: ["search/codebase", "edit/editFiles", "problems", "runTasks", "testFailure"]
---

# Generate & Run Tests

## Directive

Generate or run tests for: `${input:Target}`

Target can be: file path, feature name, or "coverage" for coverage report.

## Test Types

### Unit Tests (Vitest)

- Test individual functions/methods
- Mock external dependencies
- Fast execution

### API Route Tests

- Test HTTP handlers
- Mock request/response
- Verify status codes and responses

### E2E Tests (Playwright)

- Test user flows
- Real browser interaction
- Accessibility checks

## Process

### 1. Analyze Target

Determine what needs testing:

- What functions/methods exist?
- What are the inputs/outputs?
- What edge cases exist?

### 2. Generate Tests

Create test file with:

- Happy path tests
- Error case tests
- Edge case tests
- Validation tests (for API routes)

### 3. Run Tests

```bash
pnpm test [file]           # Run specific tests
pnpm test:coverage         # With coverage
pnpm test:e2e              # E2E tests
```

## Test Templates

### Unit Test

```typescript
import { describe, it, expect, vi } from "vitest";

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

### API Route Test

```typescript
import { describe, it, expect } from "vitest";
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
    const request = createMockRequest("/api/feature", {
      method: "POST",
      body: invalidInput,
      cookies: { session: "valid-session" },
    });

    const response = await POST(request, { params: {} });
    expect(response.status).toBe(400);
  });

  it("should deny without auth", async () => {
    const request = createMockRequest("/api/feature", {
      method: "POST",
      body: validInput,
    });

    const response = await POST(request, { params: {} });
    expect(response.status).toBe(401);
  });
});
```

## Output Format

```markdown
# Test Results

## Tests Generated

- [file]: [count] tests

## Test Summary
```

✓ Test suite passed ✓ should handle valid input ✓ should throw on invalid input ✓ should handle edge
case

```

## Coverage (if requested)
| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| ... | X% | X% | X% | X% |

## Next Steps
- [Any additional tests needed]
- [Coverage gaps to address]
```

## Rules

- Follow existing test patterns
- Use meaningful test names
- Test both success and failure
- Include edge cases
- Mock external dependencies
