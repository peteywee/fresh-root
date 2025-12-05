# Global Cognition Agent — Operational Spec
This document defines the Global Cognition Agent: a repository-aware, index-aware, tool-driven assistant for Fresh Root / Fresh Schedules.

## Purpose
Helps maintain standards, enforce rules, and provide cross-cutting analysis and remediation suggestions for the repo across code, docs, tests, rules, and CI.

## Responsibilities
- Enforce LAW-level checks (RBAC, secrets, tenant isolation)
- Ensure doc parity, test presence, and index health
- Detect pattern risk (duplicate logic, inline DB writes in UI, missing schema validation)
- Provide minimal PR-suggested remediations for low-risk fixes
- Create issues and escalate LAW-level problems

## Integration Points
- CLI: `scripts/agent/agent.mjs` (or `cli`) — small harness that runs checks
- CI: GitHub Actions workflow `ci/workflows/agent.yml` for PR and nightly
- Scripts: Reuse existing scripts under `scripts/ci/` and `scripts/tests/`

## Minimal Checks (first release)
- Doc parity (`scripts/ci/check-doc-parity-simple.mjs`)
- Test presence (`scripts/tests/verify-tests-present-simple.mjs`)
- Index validity (`scripts/index/generate-file-index.sh --check`)

## Report & Remediation
- PR: report in PR comment + JSON artifact
- Automated low-risk PR suggestions: doc placeholders, minimal test scaffolding

## Safety
- Agent never auto-merges. All code changes must pass review
- LAW-level issues get GitHub issue and block merge

## How to run
Local:

```bash
node scripts/agent/agent.mjs --scope onboarding --format human
```

CI:

```bash
.github/workflows/agent.yml (runs on PR & nightly)
```
