---
title: "Test Specification Template"
description: "Template for test specifications with comprehensive coverage"
keywords:
  - template
  - testing
  - test-spec
  - vitest
category: "template"
status: "active"
audience:
  - developers
  - qa-engineers
related-docs:
  - ../guides/TESTING.md
  - ../standards/COVERAGE_STRATEGY.md
---

# TEST SPEC — \<Feature/Route/Schema>

## Purpose

Explain the user/business risk covered by these tests.

## Scope & Risks

- Primary path(s):
- Security considerations (authN/authZ/PII):
- Data constraints (Zod schema references):

## Test Matrix

### Valid Cases

| Case | Input summary | Expected |
| ---- | ------------- | -------- |
| 1    |               |          |

### Invalid Cases

| Case | Input summary | Expected error code |
| ---- | ------------- | ------------------- |
| 1    |               |                     |

### Security Cases

| Role/State | Operation | Expect |
| ---------- | --------- | ------ |
| admin      | write     | allow  |
| anon       | read      | deny   |

## Notes

- Links: schema docs, API docs.
