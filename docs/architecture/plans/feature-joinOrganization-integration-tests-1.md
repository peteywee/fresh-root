---

goal: "Unblock joinOrganization integration tests against Firebase emulators"
version: "1.0"
date\_created: "2025-02-05"
last\_updated: "2025-02-05"
owner: "Backend QA"
status: "In progress"
## tags: \[feature, testing, firebase, functions]

# Introduction
![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

This plan restores passing integration coverage for the `joinOrganization` Cloud Function by
stabilizing emulator setup, shortening data teardown, and ensuring deterministic token/membership
assertions.

## 1. Requirements & Constraints
- **REQ-001**: Integration tests must pass reliably on local emulators and CI runners within 90
  seconds total wall time.
- **REQ-002**: Tests must exercise the real `joinOrganizationHandler` with Firestore/Auth emulator
  state (no mocks).
- **SEC-001**: No real Firebase project credentials may be used; all traffic must target emulators.
- **CON-001**: Preserve current production logic in `functions/src/joinOrganization.ts`; only test
  harness changes allowed unless a blocking defect is found.
- **GUD-001**: Keep tests idempotent and isolated; each test must fully clean its data without
  affecting others.
- **PAT-001**: Prefer deterministic, time-bounded cleanup over unbounded collection scans.

## 2. Implementation Steps
### Implementation Phase 1
- GOAL-001: Stabilize emulator bootstrap and teardown to eliminate timeouts.

| Task     | Description                                                                                                                                                                                                               | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Update `tests/integration/setup.ts` to use a single `admin` app instance guarded by `admin.apps.length` and add explicit `process.env.GCLOUD_PROJECT = "fresh-schedules-test"` to avoid emulator project fallback delays. |           |      |
| TASK-002 | Replace collection-scan cleanup in `afterEach` with per-collection chunked deletes using `listDocuments()` and looped batch commits with a hard cap (e.g., 200 docs per batch) plus a test-level timeout guard.           |           |      |
| TASK-003 | Increase `testTimeout` and `hookTimeout` for the integration suite to 60s in `vitest.integration.config.ts` (or file-local `describe` timeout) while keeping per-test operations under 20s; document rationale.           |           |      |

### Implementation Phase 2
- GOAL-002: Ensure deterministic test data and assertions for `joinOrganization`.

| Task     | Description                                                                                                                                                                                   | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-004 | In `tests/integration/joinOrganization.test.ts`, generate token/user ids with `crypto.randomUUID()` instead of `Date.now()` to avoid collisions in parallel runs and to tighten expectations. |           |      |
| TASK-005 | Add assertion helpers to wait for Firestore transaction consistency (retry `getFirestoreDoc` with backoff up to 5s) to avoid flakiness immediately after transaction commit.                  |           |      |
| TASK-006 | Add coverage for expired/exhausted token handling using emulator data seeded per test; ensure cleanup reuses the new teardown utilities.                                                      |           |      |

## 3. Alternatives
- **ALT-001**: Stub Firestore/Auth calls in integration tests; rejected because requirement mandates
  exercising emulator-backed logic.
- **ALT-002**: Move tests to unit-only coverage; rejected because transactional and auth side
  effects must be validated end-to-end.

## 4. Dependencies
- **DEP-001**: Firebase emulators (auth, firestore, functions) must be running locally or via CI
  service before tests start.
- **DEP-002**: `vitest.integration.config.ts` must allow custom timeouts and import of
  `tests/integration/setup.ts`.

## 5. Files
- **FILE-001**: `tests/integration/setup.ts` — emulator bootstrap and cleanup adjustments.
- **FILE-002**: `tests/integration/joinOrganization.test.ts` — deterministic data creation and
  stability helpers.
- **FILE-003**: `vitest.integration.config.ts` — integration-specific timeouts/config.

## 6. Testing
- **TEST-001**:
  `pnpm vitest run --config vitest.integration.config.ts tests/integration/joinOrganization.test.ts`
  passes locally with emulators running.
- **TEST-002**: CI integration workflow executes the same command and completes within the 90s
  wall-clock budget.

## 7. Risks & Assumptions
- **RISK-001**: Emulator cleanup might still be slow if other suites populate large collections;
  mitigation is chunked deletes with hard caps and logging.
- **RISK-002**: Increasing timeouts could mask underlying performance regressions; mitigation is to
  log per-test durations and revisit after stability is confirmed.
- **ASSUMPTION-001**: No production code changes are needed; failures are due solely to test harness
  instability.

## 8. Related Specifications / Further Reading
- `functions/src/joinOrganization.ts`
- `tests/integration/setup.ts`
- `RATE_LIMIT_IMPLEMENTATION.md` (for emulator invocation behavior)
