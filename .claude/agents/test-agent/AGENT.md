---
agent: "test-agent"
name: "Test Agent"
description: "Generate and run tests for a feature or file"
version: "1.0.0"
category: "Quality & Process"
invocation:
  - type: "orchestration"
    pattern: "Use the test agent to generate tests for"
status: "active"
tools:
  - "search/codebase"
  - "edit/editFiles"
  - "problems"
  - "runTasks"
  - "testFailure"
---

# Test Agent

Generate and run tests for a feature or file.

## Quick Start

Use this agent to:

- Generate unit tests (Vitest)
- Generate API route tests
- Generate E2E tests (Playwright)
- Run tests with coverage
- Analyze test failures

## Invocation

```
Use the test agent to generate tests for the auth module
Run the test agent to create tests for this function
Generate tests for the schedule API routes
```

## Test Types

- **Unit Tests** (Vitest): Individual functions, fast execution
- **API Route Tests**: HTTP handlers, request/response verification
- **E2E Tests** (Playwright): User flows, real browser interaction

## Process

1. Analyze target (functions, inputs/outputs, edge cases)
2. Generate tests (happy path, errors, edge cases)
3. Run tests (`pnpm test`)
4. Report coverage

## Output Format

Tests organized by type with:

- Happy path tests
- Error case tests
- Edge case tests
- Validation tests

## See Also

- [Implement Agent](./../implement-agent/) — Code implementation
- [Review Agent](./../review-agent/) — Code review
