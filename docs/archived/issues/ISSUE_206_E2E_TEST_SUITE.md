---

title: "[ARCHIVED] Issue #206: E2E Test Suite (Playwright)"
description: "Archived issue brief for the E2E test suite initiative."
keywords:
	- archive
	- issue-206
	- e2e
	- playwright
category: "archive"
status: "archived"
audience:
	- developers
	- qa
createdAt: "2026-01-31T07:18:58Z"
lastUpdated: "2026-01-31T07:18:58Z"

---

# Issue #206: E2E Test Suite (Playwright)

## Labels

- P0: MEDIUM
- Area: Testing, QA

## Objective

Implement comprehensive E2E test suite covering critical user flows to prevent UI/UX regressions.

## Scope

**In:**

- 5 critical user flows tested
- Visual regression testing setup
- CI/CD integration for staging environment
- Test documentation

**Out:**

- Performance testing (separate work)
- Cross-browser testing (initially Chrome only)
- Mobile-specific testing (future work)

## Files / Paths

- `tests/e2e/login-flow.spec.ts` - Login flow tests (NEW)
- `tests/e2e/schedule-creation.spec.ts` - Schedule creation tests (NEW)
- `tests/e2e/time-off-approval.spec.ts` - Time-off approval tests (NEW)
- `playwright.config.ts` - Playwright configuration
- `.github/workflows/e2e.yml` - E2E CI workflow (NEW)

## Commands

```bash
# Install Playwright
pnpm add -D @playwright/test
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run in UI mode
pnpm exec playwright test --ui

# Generate test report
pnpm exec playwright show-report
```

## Acceptance Criteria

- \[ ] 5 critical flows tested
- \[ ] Visual regression testing configured
- \[ ] E2E tests integrated with CI/CD
- \[ ] Tests run on staging before production deploy
- \[ ] Documentation complete

## Success KPIs

- **Flow Coverage**: 5 critical flows tested
- **Test Reliability**: <5% flakiness rate
- **Execution Time**: <10 minutes total
- **Regression Prevention**: 0 critical UI bugs after implementation

## Definition of Done

- \[ ] CI green (E2E tests passing)
- \[ ] Docs updated
- \[ ] Visual regression configured
- \[ ] Staging integration complete
- \[ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: MEDIUM | **Effort**: 20 hours
