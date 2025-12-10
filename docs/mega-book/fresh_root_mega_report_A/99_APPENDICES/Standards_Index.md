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
  - Critical endpoints without rate limiting (availability = integrity).
- CI behavior:
  - **Any Tier 1 violation fails CI.**
- Scoring:
  - Each Tier 1 issue: **−10 points**.

### Tier 2 — Architectural Symmetry (🟡)

- Examples:
  - Files not matching their layer fingerprint.
  - Inconsistent naming conventions for similar modules.
  - Missing but non-critical tests or telemetry hooks.
  - Missing tracing spans on critical logic paths.
  - Critical operations without observability instrumentation.
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

---

## 5. Available Standards

### Core Standards

| Standard                             | Tier     | Purpose                                         | Location                                                                       |
| ------------------------------------ | -------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| **File Header Standard**             | Tier 3   | Consistent file headers and documentation       | [FILE_HEADER_STANDARD.md](FILE_HEADER_STANDARD.md)                             |
| **Import Standard**                  | Tier 3   | Import organization and alias usage             | [IMPORT_STANDARD.md](IMPORT_STANDARD.md)                                       |
| **Schema Catalog Standard**          | Tier 1   | Domain schema definitions and validation        | [SCHEMA_CATALOG_STANDARD.md](SCHEMA_CATALOG_STANDARD.md)                       |
| **Route API Standard**               | Tier 0/1 | API endpoint structure and security             | [ROUTE_API_STANDARD.md](ROUTE_API_STANDARD.md)                                 |
| **Route Standard**                   | Tier 1   | Next.js App Router conventions                  | [ROUTE_STANDARD.md](ROUTE_STANDARD.md)                                         |
| **Testing Standard**                 | Tier 2   | Test coverage and quality requirements          | [TESTING_STANDARD.md](TESTING_STANDARD.md)                                     |
| **Symmetry Framework**               | Tier 2   | Structural consistency across codebase          | [SYMMETRY_FRAMEWORK.md](SYMMETRY_FRAMEWORK.md)                                 |
| **Observability & Tracing Standard** | Tier 1/2 | OpenTelemetry instrumentation and rate limiting | [OBSERVABILITY_AND_TRACING_STANDARD.md](OBSERVABILITY_AND_TRACING_STANDARD.md) |

### Standard Tier Breakdown

**Tier 0 (Security)**: Route API Standard (auth/authz requirements)

**Tier 1 (Data Integrity)**:

- Schema Catalog Standard
- Route Standard
- Route API Standard (validation requirements)
- Observability & Tracing Standard (rate limiting requirements)

**Tier 2 (Architectural Symmetry)**:

- Testing Standard
- Symmetry Framework
- Observability & Tracing Standard (tracing requirements)

**Tier 3 (Style & Ergonomics)**:

- File Header Standard
- Import Standard

---

## 6. Quick Reference: When to Consult Which Standard

| If you are...                   | Consult this standard...                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Creating a new API endpoint     | [ROUTE_API_STANDARD.md](ROUTE_API_STANDARD.md), [OBSERVABILITY_AND_TRACING_STANDARD.md](OBSERVABILITY_AND_TRACING_STANDARD.md) |
| Defining a domain schema        | [SCHEMA_CATALOG_STANDARD.md](SCHEMA_CATALOG_STANDARD.md)                                                                       |
| Adding tracing or rate limiting | [OBSERVABILITY_AND_TRACING_STANDARD.md](OBSERVABILITY_AND_TRACING_STANDARD.md)                                                 |
| Writing tests                   | [TESTING_STANDARD.md](TESTING_STANDARD.md)                                                                                     |
| Creating a new module/file      | [FILE_HEADER_STANDARD.md](FILE_HEADER_STANDARD.md), [IMPORT_STANDARD.md](IMPORT_STANDARD.md)                                   |
| Refactoring for consistency     | [SYMMETRY_FRAMEWORK.md](SYMMETRY_FRAMEWORK.md)                                                                                 |
| Setting up Next.js routes       | [ROUTE_STANDARD.md](ROUTE_STANDARD.md)                                                                                         |
