# FRESH Schedules Standards Index v2.0

> This document defines the **tiered standard system** for the Fresh Schedules
> codebase and how it is enforced in CI via `scripts/validate-patterns.mjs`.

---

## 1. Tier System Overview

### Tier 0 — Security Invariants (🔴)

- Examples:
  - Missing authentication/authorization on API endpoints.
  - Rules that allow cross-tenant data access.
  - Write endpoints without input validation.
- CI behavior:
  - **Any Tier 0 violation fails CI.**
- Scoring:
  - Each Tier 0 issue: **−25 points**.

### Tier 1 — Data Integrity Invariants (🟠)

- Examples:
  - Schemas missing for entities that cross API boundary.
  - Manual DTOs instead of Zod inference.
  - Rules inconsistent with schemas (e.g., missing constraints).
- CI behavior:
  - **Any Tier 1 violation fails CI.**
- Scoring:
  - Each Tier 1 issue: **−10 points**.

### Tier 2 — Architectural Symmetry (🟡)

- Examples:
  - Files not matching their layer fingerprint.
  - Inconsistent naming conventions for similar modules.
  - Missing but non-critical tests or telemetry hooks.
- CI behavior:
  - Do not fail CI by default; log and track counts.
- Scoring:
  - Each Tier 2 issue: **−2 points**.

### Tier 3 — Style & Ergonomics (🟢)

- Examples:
  - Missing headers.
  - Minor inconsistency in comment formatting.
- CI behavior:
  - Never blocks CI on its own.
- Scoring:
  - Each Tier 3 issue: **−0.5 points**.

---

## 2. Scoring & Thresholds

The Pattern Validator uses:

- Start score: **100**
- Penalties per tier as above.
- Bonuses:
  - Each complete Triad (Schema + API + Rules): **+5**
  - 0 Tier 0 issues: **+10**
  - 0 Tier 1 issues: **+5**
- Score is floored at 0.

### Status Levels

- **EXCELLENT:** score ≥ **90**
- **PASSING:** score ≥ **70** and < 90
- **FAILING:** score < **70**

> CI defaults:
>
> - Require: **0 Tier 0**, **0 Tier 1**, and score ≥ **70**.

These thresholds are enforced by `scripts/validate-patterns.mjs` and used in `.github/workflows/ci-patterns.yml`.

---

## 3. Responsibilities Per Tier

- Tier 0 / Tier 1:
  - Must be fixed before merging to `main` or `develop`.
  - Temporary exceptions must be explicitly justified, time-boxed, and tracked separately.

- Tier 2:
  - May be deferred but should not accumulate without an explicit tech-debt plan.

- Tier 3:
  - May be fixed opportunistically.

---

## 4. Extending the Standard

When introducing a new pattern or rule:

1. Assign it a Tier.
2. Add it to:
   - This index.
   - Either:
     - `SYMMETRY_FRAMEWORK.md` (for structural patterns), or
     - `CONTEXT_MANIFEST.md` (for contextual expectations).
3. Wire it into:
   - `scripts/validate-patterns.mjs` as a new check.
   - Optional config (see `patterns.config.json`).
