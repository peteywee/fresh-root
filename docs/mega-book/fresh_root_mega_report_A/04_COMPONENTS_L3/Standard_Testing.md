# Testing Standard

## Purpose

Create predictable, comprehensive tests that reflect business risk and enforce security/role logic across Fresh Schedules.

## Test Layers

1. **Unit**: Pure functions, schemas (Zod), utility libs.
2. **Rules**: Firestore rules via emulator; membership/claims checks; RLS parity with schemas.
3. **API/Edge**: Next.js App Router routes (request validation, authN/Z, rate limiting).
4. **Integration**: Cross-module flows (e.g., create org → add member → create schedule).
5. **E2E (select)**: Golden paths only (onboarding to publish). Keep minimal but reliable.

## Required Artifacts per Feature

- **Schema**: Zod schema + schema doc (from template) + unit tests.
- **API Route**: Route doc (from template) + route tests (request/response matrix).
- **Rules**: Rules spec sections referenced in tests (positive/negative).
- **UI**: Component test only if logic-heavy; snapshot tests discouraged.

## Conventions

- Frameworks: Vitest for unit/integration; Playwright for E2E; Firestore emulator for rules.
- File names: `*.spec.ts` (unit/integration/rules), `*.e2e.ts` (Playwright).
- Data: Use minimal factory helpers; never hardcode secrets.
- Performance: Each test < 2s; suite < 90s locally (when we're able to run).

## Quality Gates

- All new code requires: schema validation, authZ tests (if applicable), error-path tests.
- PRs must include a link to the doc page generated from the templates below.
