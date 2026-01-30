# CREWOPS Batch Teams — Parallel Deep Dive Protocol

**Status**: ✅ ACTIVE (Project-specific extension)\
**Purpose**: Run focused audits in parallel without scope collisions

---

## Core Principle

Split large audits into **parallel batches** with crisp ownership and a single handoff contract per
team. Each team produces **findings + fixes + tests**.

---

## Team Map (Specialized Agents)

### 1) **API & Auth Team**

**Scope**: API routes, auth/session, CSRF, rate limits, RBAC enforcement.  
**Inputs**: `apps/web/app/api/**`, `packages/api-framework/**`  
**Outputs**:

- Findings list (severity + file refs)
- Fix PR patch set
- Tests for auth/CSRF/rate limit regressions

### 2) **Data Consistency Team**

**Scope**: Firestore writes, transactional logic, schema usage.  
**Inputs**: `functions/src/**`, `apps/web/src/lib/firebase/**`, `packages/types/**`  
**Outputs**:

- Schema ↔ usage drift report
- Transaction/consistency fixes
- Test updates or new tests

### 3) **UI & Client Logic Team**

**Scope**: Client pages, state, data fetching, render correctness.  
**Inputs**: `apps/web/app/**`, `apps/web/src/**`  
**Outputs**:

- Logic/regression fixes
- UI correctness tests (unit/e2e targets)

### 4) **Tooling & Ops Team**

**Scope**: internal tooling APIs, scripts, CI hooks.  
**Inputs**: `apps/web/app/api/files`, `apps/web/app/api/terminal`, `scripts/**`  
**Outputs**:

- Security/logic hardening
- Runtime config fixes
- Smoke tests for tooling endpoints

### 5) **Test Intelligence Team**

**Scope**: test coverage gaps, flaky suites, contract tests.  
**Inputs**: `apps/web/app/api/**/__tests__`, `tests/**`  
**Outputs**:

- Missing coverage list
- Deterministic test additions
- Cloud validation checklist

---

## Parallel Batch Protocol

1. **Assign** each team a directory slice + outcome.
2. **Run** scans and triage (use `rg`, `repomix`, or targeted file reads).
3. **Fix** only within team scope to avoid overlaps.
4. **Test** team-owned changes.
5. **Handoff** results with file refs and test commands.

---

## Handoff Checklist (Required)

- Findings list with severity and file references
- Fix list with rationale
- Tests added/updated
- Commands to validate
- Known risks or deferred items

---

## Batch Scheduling Template

```
Batch A — API & Auth
Batch B — Data Consistency
Batch C — UI & Client
Batch D — Tooling & Ops
Batch E — Test Intelligence
```

**Parallel rule**: no batch edits files owned by another batch without explicit handoff.
