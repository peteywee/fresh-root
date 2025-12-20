# L2 — AI / Automation Layer

> **Status:** Draft (repo-grounded fill).
>
> This document replaces the original placeholder with a first-pass, codebase-backed map of the
> automation/agent surface area in this repository. It is not yet a completed “9-panel” review.

## 1. Role in the System

This subsystem covers automation that maintains the repo, docs, and operational signals.

Primary responsibilities:

- Keep documentation current and pruned (dated docs retention, sync, visuals generation).
- Produce machine-readable artifacts (reports/metrics logs) used by tooling and the Ops dashboard.
- Provide “agent” instruction surfaces that shape automated work patterns.

Key locations:

- `scripts/` automation entrypoints (e.g. `docs-auto-update`, `docs-sync`, `generate-visuals`).
- `.github/` automation surfaces (workflow jobs; repo prompts/instructions).
- `agents/` and `.claude/agents/` instruction/prompt material.
- `packages/repomix/` (AI analysis packaging and library wrapper).

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Primarily CI-driven and file-based; watch for network calls and flaky dependencies in CI scripts.
- Security (Marcus): Automation often requires tokens (GitHub, Firebase); ensure secrets are never logged and permissions are scoped.
- DDD (Ingrid): Keep “automation tooling” separate from core product domain modules; avoid coupling scripts to app internals.
- Platform (Kenji): Idempotency and deterministic outputs matter most; scripts should be safe to rerun in CI.
- Staff Engineer (Priya): Centralize shared helpers (paths, logging, error handling) and avoid one-off script divergence.
- Database (Omar): Artifacts are mostly filesystem-based logs; treat `docs/metrics/` as append-only where possible.
- API Design (Sarah): Prefer small, typed interfaces for “automation outputs” (JSON/JSONL) with stable schemas.
- Devil's Advocate (Rafael): Automation can silently rewrite docs and create churn; define ownership and guardrails.
- Strategic/Impact (Victoria): High leverage for quality + onboarding, but only if the outputs remain trustworthy.

## 3. Critical Findings (Current)

No confirmed “Critical” issues recorded in this doc yet.

High-priority review targets (based on repo scan):

- Docs mutation in CI:
  - `scripts/docs-auto-update.mjs` manages dated docs retention under `docs/dev/`.
  - `scripts/docs-sync.mjs` and `scripts/generate-visuals.mjs` generate/sync docs artifacts.
- Metrics/log artifacts:
  - `scripts/telemetry/repomix-metrics.mjs` writes logs under `docs/metrics/`.
- Report outputs should remain out of the repo root (prefer `docs/reports/` and `docs/metrics/`).

## 4. Architectural Notes & Invariants

- Automation output locations are stable and predictable (avoid “random” new root files).
- CI automation must be rerunnable and safe (no destructive operations without explicit flags).
- Any script that needs tokens must:
  - Use the minimum required scopes,
  - Avoid logging raw tokens/headers,
  - Fail with actionable error messages when secrets are missing.

## 5. Example Patterns

- **Good Pattern Example:** Dated docs retention with dry-run support (`scripts/docs-auto-update.mjs`).
- **Good Pattern Example:** Metrics logs stored under `docs/metrics/` and read by ops tooling.
- **Risky Pattern Example:** Scripts that write build artifacts to the repo root or depend on local, untracked state.
- **Refactored Pattern:** Prefer structured, machine-readable outputs (JSON/JSONL) with stable schemas, checked into `docs/reports/` or `docs/metrics/`.

## 6. Open Questions

- Which automation outputs are intended to be committed vs generated only in CI/deploy?
- Should there be a single “automation runtime” convention (Node version, env validation, logging format)?
- Where should “agent prompts/instructions” live long-term: `agents/`, `.claude/`, or `.github/prompts/`?

