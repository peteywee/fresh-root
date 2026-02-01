---

title: "Test Coverage Strategy"
description: "Guidelines for comprehensive test coverage across schemas, API routes, and business logic"
keywords:
  - testing
  - coverage
  - standards
  - zod
  - schemas
category: "standard"
status: "active"
audience:
  - developers
  - qa
related-docs:
  - ../guides/TESTING.md
  - CODING_RULES_AND_PATTERNS.md
createdAt: "2026-01-31T07:19:02Z"
lastUpdated: "2026-01-31T07:19:02Z"

---

# Coverage Strategy

## What "Comprehensive" Means Here

- **Schemas**: 100% property coverage via Zod safeParse tests (valid + invalid matrices).
- **Rules**: Each resource path gets allow/deny matrices for roles
  `['admin','manager','staff','anon']` and membership states.
- **API**: Request validation (happy + edge), authN, authZ, rate limit, shape of response, and error
  codes.
- **Flows**: At least one integration test per core flow (onboarding, join, create schedule,
  publish).

## Metrics We Track

- Schema test presence per exported `*Schema`.
- API route test presence per `app/api/**/route.ts`.
- Rules test presence per collection in rules matrix.
- Golden-path E2E smoke bundle exists and is green in CI.

## Scope Control

- Prefer depth in critical flows over breadth everywhere.
- E2E limited to "5-minute scheduling" golden path; fail fast if it regresses.
