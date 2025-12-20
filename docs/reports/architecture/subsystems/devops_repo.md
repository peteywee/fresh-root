# L2 — DevOps, CI/CD, and Repo Architecture

> **Status:** Draft (repo-grounded fill).

This subsystem covers the monorepo layout, build/test pipelines, automation, and security scanning.

## 1. Role in the System

- Provide reproducible builds, tests, linting, and typechecking across apps/packages.
- Enforce repo hygiene and guardrails via scripts and CI.
- Provide security scanning and governance automation.

Key repo primitives:

- pnpm workspace + lockfile (`pnpm-workspace.yaml`, `pnpm-lock.yaml`).
- Turbo pipelines (`turbo.json`, `turbo/`, `turbo.json` usage in scripts/hooks).
- CI workflows under `.github/workflows/` (including `ci.yml`, `semgrep.yml`, `repomix-ci.yml`).

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): CI is the “distributed system” here; keep builds deterministic and avoid flaky network dependencies.
- Security (Marcus): Semgrep + dependency tooling exist; ensure secrets are guarded and workflows are least-privilege.
- DDD (Ingrid): Repo boundaries (apps vs packages) should reflect domain boundaries; avoid cross-layer imports.
- Platform (Kenji): Prefer standardized scripts/tasks and shared configs; minimize bespoke per-package behavior.
- Staff Engineer (Priya): Invest in fast feedback loops; keep pre-commit checks scoped and understandable.
- Database (Omar): Infra-as-code configs (Firebase rules/indexes) must be versioned and reviewed like code.
- API Design (Sarah): DevOps automation should expose stable, documented scripts and outputs.
- Devil's Advocate (Rafael): Too many “smart” scripts can hide complexity; keep docs and escape hatches.
- Strategic/Impact (Victoria): CI is quality leverage; ensure it speeds teams up rather than blocking.

## 3. Critical Findings (Current)

No confirmed “Critical” items recorded in this doc yet.

Notable pipeline surfaces to review and keep consistent:

- `.github/workflows/ci.yml` for main CI gating.
- `.github/workflows/semgrep.yml` for static analysis.
- `.github/workflows/repomix-ci.yml` / `repomix-dashboard.yml` for repo analysis and reporting.

## 4. Architectural Notes & Invariants

- `pnpm install --frozen-lockfile` must remain the standard for CI determinism.
- Typecheck/lint/test gates should be stable and explain failures clearly.
- Generated artifacts should land in expected locations (`docs/reports/`, `docs/metrics/`) and not pollute repo root.
- Security workflows must not run untrusted code with write permissions.

## 5. Example Patterns

- **Good Pattern Example:** Dedicated CI workflows for security (`.github/workflows/semgrep.yml`).
- **Good Pattern Example:** Repo automation scripts with explicit tags and usage docs (`scripts/` headers).
- **Risky Pattern Example:** Untracked artifacts created by build steps (should be avoided or cleaned deterministically).
- **Refactored Pattern:** Consolidate repeated CI logic into reusable workflow steps or shared scripts.

## 6. Open Questions

- Which tasks are required on every PR vs only on `main` (performance vs safety tradeoff)?
- Should we standardize “ops/metrics” endpoints and metrics file formats as a first-class contract?
- What is the intended long-term deployment model (Firebase-only vs hybrid with Workers/other)?

