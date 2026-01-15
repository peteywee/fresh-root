# Issue #202: Firestore Rules Test Coverage
## Labels
- P0: HIGH
- Area: Testing, Security

## Objective
Achieve 80%+ test coverage for Firestore security rules to prevent authorization vulnerabilities and ensure tenant isolation is properly enforced.

## Scope
**In:**

- Permission boundary tests (unauthenticated access prevention)
- Tenant isolation tests (cross-organization data access prevention)
- Role-based access control tests (RBAC enforcement)
- Soft-delete behavior tests
- Regression tests for known security issues

**Out:**

- Performance testing of rules
- Rules optimization (future work)
- Client SDK testing (separate from rules testing)

## Files / Paths
- `firestore.rules` - Security rules definition
- `packages/rules-tests/src/schedules.test.ts` - Schedule rules tests (NEW)
- `packages/rules-tests/src/shifts.test.ts` - Shift rules tests (NEW)
- `packages/rules-tests/src/organizations.test.ts` - Organization rules tests (NEW)
- `packages/rules-tests/src/users.test.ts` - User rules tests (NEW)
- `packages/rules-tests/package.json` - Test scripts configuration
- `.github/workflows/ci.yml` - CI integration for rules testing

## Commands
```bash
# Set up Firebase emulator for testing
firebase emulators:start --only firestore

# Run Firestore rules tests
pnpm --filter @rules/firestore test

# Generate coverage report
firebase emulators:exec --only firestore \
  'npm --prefix packages/rules-tests test -- --coverage'

# Verify 80%+ coverage achieved
```

## Acceptance Criteria
- \[ ] Permission boundary tests written and passing
- \[ ] Tenant isolation tests written and passing
- \[ ] Role-based access tests written and passing
- \[ ] Soft-delete tests written and passing
- \[ ] 80%+ rule coverage achieved
- \[ ] All tests integrated into CI/CD pipeline
- \[ ] Tests block PRs when failing

## Success KPIs
- **Coverage**: ≥80% of Firestore rules tested
- **Test Count**: ≥30 test cases covering all critical paths
- **CI Integration**: 100% - all PRs run rules tests
- **Security**: 0 authorization bypass vulnerabilities

## Definition of Done
- \[ ] CI green (rules tests passing)
- \[ ] Docs updated (testing guide added)
- \[ ] Tests ≥ 85% (80% rules coverage + comprehensive test suite)
- \[ ] Security audit clear (no authorization bypasses)
- \[ ] Linked in roadmap (STRATEGIC\_AUDIT\_TODOS.md updated)

**Status**: NOT STARTED | **Priority**: HIGH | **Effort**: 8 hours
