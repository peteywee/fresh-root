# QA Post-Fix Report — 2025-12-05

Summary
-------

This report summarizes actions taken to unblock the failing `pnpm -w typecheck`, the Combot verification results, and recommended next remediation steps for Tier-0 validator failures.

Actions performed
-----------------

1. Installed dependencies (allowed lockfile update):

```bash
pnpm -w install --no-frozen-lockfile
```

- `pnpm-lock.yaml` was updated locally. Review required before committing.

2. Ran `pnpm -w typecheck` and fixed minimal TypeScript errors in three files:

- `apps/web/app/api/attendance/route.ts` — coerced scheduled times to `Number()` before arithmetic to fix `unknown` type errors.
- `apps/web/src/lib/imports/_template.import.ts` — fixed `z.record` usage to `z.record(z.string(), z.any())` to match Zod API.
- `apps/web/src/lib/onboarding/createNetworkOrg.ts` — added safe casts for loosely-typed payload fields and coerced `formToken` to string when calling `consumeAdminFormDraft`.

After these fixes, `pnpm -w typecheck` completed successfully.

3. Re-ran Triad/pattern validator:

```bash
node scripts/validate-patterns.mjs
```

- Validator result: FAIL — 49 Tier-0 security violations remain (missing security wrappers and write validation in many API routes).

4. Called Combot verification (automated summary written to `combot/verification-2025-12-05.json` and `.log`). Key results:

- Secrets: FAIL — tracked `.env.local` present in repo (contains `NEXT_PUBLIC_FIREBASE_API_KEY`, `SESSION_SECRET`, etc.).
- Typecheck: PASS — typecheck completed with no errors after fixes.
- Pattern validator: FAIL — Tier-0 violations remain.
- Lockfile: PASS (changed) — `pnpm-lock.yaml` was modified by install; review required.

Artifacts produced
------------------

- `docs/qa-report.md` (initial report)
- `docs/qa-postfix-report.md` (this file)
- `combot/verification-2025-12-05.json` and `.log`
- `agents/combot-invocations/2025-12-05-combot-request.md` (request)
- `.github/agents/SR_AGENT_INVOCATION.md` and `agents/sr-agent-calls/2025-12-05-call-1.md`
- Small code fixes applied (see git diff for modified files)

Next steps (recommended, prioritized)
------------------------------------

1. Immediate secret remediation (critical):
   - Remove `.env.local` from the repository, rotate any exposed secrets, and add `.env.local` to `.gitignore`. If secrets are in history, perform an authorized history rewrite.

2. Reduce Tier-0 validator violations (high priority):
   - Create a focused backlog and PRs to update API routes to use the SDK factory pattern or `withSecurity` wrappers and to add Zod input validation for POST/PUT/PATCH routes.
   - Prioritize by exposure/risk: `internal/*`, `session/*`, `onboarding/*`, `organizations/*`, `shifts/*`, `schedules/*`.

3. Prepare representative fixes and tests:
   - Implement the pattern changes in a small set of representative endpoints (`shifts`, `schedules`, `join-tokens`), run validator to confirm rule recognition, then roll out the pattern across remaining endpoints.

4. Lockfile & CI:
   - Review `pnpm-lock.yaml` changes; if acceptable, create a PR with lockfile update. If lockfile should not be updated locally, revert and handle via CI with owner approval.

5. Re-run Combot verification after fixes and secret remediation.

Commands & quick runbook
------------------------

Remove `.env.local` (example):

```bash
# Remove local env from git and ignore
git rm --cached .env.local || true
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore(secrets): remove .env.local and ignore it"
```

Run validator after fixes:

```bash
pnpm -w install --no-frozen-lockfile
pnpm -w typecheck
node scripts/validate-patterns.mjs
```

Contact / Escalation
--------------------

- Repo owner: `@peteywee`
- SR Agent (oncall): See `.github/agents/SR_AGENT_INVOCATION.md`

