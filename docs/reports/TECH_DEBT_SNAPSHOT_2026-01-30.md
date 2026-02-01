---

title: "Tech Debt Snapshot"
description: "Repo-wide tech debt markers identified from current code and documentation"
keywords:
- tech-debt
- snapshot
- report
- todo
- legacy
- migration
- validation
- testing
category: "report"
status: "active"
tags:
- tech-debt
- todo
audience:
- developers
- operators
- ai-agents
related-docs:
- ../INDEX.md
- ../standards/CODING_RULES_AND_PATTERNS.md
createdAt: "2026-01-31T07:19:02Z"
lastUpdated: "2026-01-31T07:19:02Z"

---

# Tech Debt Snapshot — 2026-01-30

> **Generated**: 2026-01-30 **Scope**: Current repo markers (TODO/FIXME/legacy/deprecated) + recent
> audit docs

## Executive Summary

This snapshot lists **observed debt markers** in code and documentation. Items sourced from 2025
reports should be **re-validated** before scheduling work.

## High Priority (Runtime/Infra)

1. **Rate limiting uses in-memory fallback** (needs Redis for multi-instance) — TODO in core API
   framework.
   - Evidence: `packages/api-framework/src/index.ts`
     (`TODO: Replace with Redis for multi-instance deployments`)
1. **API framework Route Factory** — TODO in core API framework.
   - Evidence: `packages/api-framework/src/index.ts` (`TODO: Add Route Factory pattern here next`)

## Medium Priority (Security/Legacy Compatibility)

1. **Legacy membership compatibility** still referenced in RBAC types and rules tests.
   - Evidence: `packages/types/src/rbac.ts` (legacy membership-like shape)
   - Evidence: `tests/rules/auth-boundaries.test.ts` and `tests/rules/tenant-isolation.test.ts`

## Medium Priority (Test Coverage Gaps)

1. **Schema test coverage TODOs** across domain docs.
   - Evidence: `docs/schemas/INDEX.md`, `docs/schemas/auth.md`, `docs/schemas/scheduling.md`
1. **API route test coverage TODOs** across domain docs.
   - Evidence: `docs/api/INDEX.md`, `docs/api/auth.md`, `docs/api/scheduling.md`

## Suggested Next Steps

1. **Confirm current runtime state** of rate limiting and OTEL setup, then update implementation
   notes.
2. **Decide legacy policy** for RBAC compatibility (keep, migrate, or deprecate).
3. **Backfill tests** for the schema and API coverage gaps listed above.
