# Issue #203: API Endpoint Test Coverage

## Labels

- P0: MEDIUM
- Area: Testing, API

## Objective

Achieve 60%+ test coverage for API routes to prevent regression bugs and ensure proper authorization checks.

## Scope

**In:**

- CRUD operation tests for all major endpoints
- Authorization edge case tests
- Input validation tests (Zod schemas)
- Security tests (CSRF, rate limiting)
- Error handling tests

**Out:**

- Performance/load testing (separate work)
- Integration with external services
- Frontend component testing

## Files / Paths

- `apps/web/app/api/schedules/__tests__/route.test.ts` - Schedule API tests (NEW)
- `apps/web/app/api/shifts/__tests__/route.test.ts` - Shift API tests (NEW)
- `apps/web/app/api/users/__tests__/route.test.ts` - User API tests (NEW)
- `apps/web/app/api/organizations/__tests__/route.test.ts` - Organization API tests (NEW)
- `apps/web/app/api/__tests__/test-utils.ts` - Shared test utilities (NEW)
- `vitest.config.ts` - Coverage configuration
- `.github/workflows/ci.yml` - CI coverage reporting

## Commands

```bash
# Run API tests with coverage
pnpm test:coverage

# Run specific API route tests
pnpm test apps/web/app/api/schedules/__tests__

# Generate coverage report
pnpm test:coverage -- --reporter=html

# View coverage report
open coverage/index.html
```

## Acceptance Criteria

- [ ] Core CRUD operations tested for all major endpoints
- [ ] Authorization edge cases tested (401, 403 scenarios)
- [ ] Input validation tested (invalid input rejection)
- [ ] Security features tested (CSRF, rate limiting)
- [ ] 60%+ API route coverage achieved
- [ ] Coverage integrated into CI/CD
- [ ] PRs blocked with <60% coverage

## Success KPIs

- **Coverage**: ≥60% of API routes tested
- **Test Count**: ≥50 test cases covering critical paths
- **CI Integration**: 100% - all PRs check coverage
- **Regression Prevention**: 0 security regressions after implementation

## Definition of Done

- [ ] CI green (all API tests passing)
- [ ] Docs updated (API testing guide)
- [ ] Tests ≥ 60% coverage
- [ ] Security audit clear
- [ ] Linked in roadmap

**Status**: NOT STARTED | **Priority**: MEDIUM | **Effort**: 12 hours
