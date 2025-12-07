Plan: Unblock TypeScript typecheck and validate repository patterns

Goal
----

Fix the failing `pnpm -w typecheck` by resolving the lockfile mismatch, installing dependencies, re-running the typecheck, and verifying Triad-of-Trust pattern validator is green. Then run the Combot verification and produce a final QA report.

Assumptions
-----------

- You approved updating the lockfile locally with `--no-frozen-lockfile`.
- Changes to `pnpm-lock.yaml` will be committed in a dedicated PR if necessary.
- Urgent secret-remediation (handled previously) is done or in-progress by SR Agent.

Steps
-----

1) Install dependencies (allow lockfile update)
   - Command: `pnpm -w install --no-frozen-lockfile`
   - Outcome: node_modules present, `pnpm-lock.yaml` may be updated.
   - Capture: stdout/stderr, `git status --porcelain` and lockfile diff.

2) Run TypeScript typecheck
   - Command: `pnpm -w typecheck`
   - Outcome: passes or produce error list. If errors, capture top errors and prioritize fixes.

3) Re-run pattern validator
   - Command: `node scripts/validate-patterns.mjs`
   - Outcome: confirm Tier-0 violations reduced or resolved.

4) Prepare minimal PRs for representative fixes (if validator still reports Tier-0)
   - Files: `apps/web/app/api/shifts/route.ts`, `apps/web/app/api/schedules/route.ts`
   - Changes: wrap with SDK factory (`createOrgEndpoint` or `createAuthenticatedEndpoint`) and add Zod input schema usage for write operations.
   - Create a branch `fix/typecheck-and-validator-<date>` and push PR.

5) Call Combot verification
   - Create `agents/combot-invocations/<timestamp>-combot-request.md` with context and request to run high-confidence checks.
   - Combot checks: secrets removed from repo, validator Tier-0 = 0, `pnpm -w typecheck` passes.

6) Produce `docs/qa-postfix-report.md`
   - Include commands run, outputs, lockfile diff, PR links, and next steps.

Rollback and Safety
-------------------

- If lockfile update is not desired, revert by resetting `pnpm-lock.yaml` and `node_modules` and open an issue to coordinate lockfile update centrally.
- Do not commit secrets or secret values during any step. If a secret is accidentally printed, sanitize outputs before saving to repo.

Deliverables
------------

- `docs/qa-postfix-report.md` with full logs and diffs
- Representative PR(s) fixing SDK factory & Zod validation for sample routes
- `agents/combot-invocations/*` record requesting verification

