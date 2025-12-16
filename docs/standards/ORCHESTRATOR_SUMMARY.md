**Orchestrator Summary**

- **Purpose**: Maps pipeline families/variants to gate order and provides the exact commands CI/local developers should run.
- **Location**: Canonical governance moved to `.github/governance/` per governance plan.

Pipeline → Gates (summary):

- Feature.FAST: STATIC
- Feature.STANDARD: STATIC → CORRECTNESS
- Feature.HEAVY: STATIC → CORRECTNESS → SAFETY → PERF
- Bug.FAST: STATIC
- Bug.STANDARD: STATIC → CORRECTNESS
- Bug.HEAVY: STATIC → CORRECTNESS → SAFETY
- Schema.STANDARD: STATIC → CORRECTNESS → SAFETY
- Schema.HEAVY: STATIC → CORRECTNESS → SAFETY → PERF
- Refactor.HEAVY: STATIC → CORRECTNESS → SAFETY → PERF → AI
- Security.STANDARD: STATIC → CORRECTNESS → SAFETY
- Security.HEAVY: STATIC → CORRECTNESS → SAFETY → PERF → AI

Gate definitions & commands:

- STATIC (blocking, parallel): `pnpm lint:check`, `pnpm format:check`, `pnpm typecheck`
- CORRECTNESS (blocking): `pnpm test:unit`, `pnpm test:e2e`, `pnpm test:rules`
- SAFETY (blocking): `pnpm validate:patterns`, `pnpm validate:secrets`, `pnpm audit --audit-level=high`
- PERF (advisory/conditional): `pnpm analyze:bundle`, run for HEAVY pipelines
- AI (advisory): `pnpm validate:ai-context`

Pipeline auto-detection rules (implementation notes):

- Security patterns (triggers): `firestore.rules`, `.env`, `auth`, `security`, `packages/api-framework` → map to `Security.STANDARD`.
- Schema patterns (triggers): `packages/types/src/schemas`, `*.schema.ts` → map to `Schema.STANDARD`.
- File-count heuristic: 1 file → `Feature.FAST`; <=5 files and single package → `Feature.STANDARD`; else `Feature.HEAVY`.

How to run locally (examples):

```
pnpm orchestrate Feature.STANDARD
pnpm orchestrate --auto --fix
pnpm orchestrate Security.HEAVY --verbose
```

CI mapping: `.github/workflows/orchestrate.yml` implements the same gate order and uses the classify step to select pipelines; CI jobs run gates in this order and produce a summary step that blocks on failing STATIC/CORRECTNESS/SAFETY gates.

Notes / recommended local checks:

- Run `pnpm lint:fix` and `pnpm format:fix` in `--fix` mode locally before committing.
- Run `pnpm validate:patterns` to ensure `API_001/API_002/API_003/SEC_001/SEC_002/SEC_003` are satisfied.
- If making Firestore or API changes, run `pnpm test:rules` locally (emulators may be required).

Acceptance checklist for orchestrator alignment:

- [ ] Orchestrator commands match `11_GATES.md` and `QUICK_REFERENCE.md` (STATIC→CORRECTNESS→SAFETY→PERF→AI).
- [ ] `pnpm validate:patterns` blocks on critical pattern violations (score < 90 or critical IDs).
- [ ] CI workflow triggers on `dev`/`main` and writes `.orchestrator-result.json` in CI mode for consumers.

Reference files moved to `.github/governance/` for canonical access.

Generated: 2025-12-15
