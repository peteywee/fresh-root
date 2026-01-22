# SR Agent Invocation — Immediate Attention Required

Date: 2025-12-05 Invoker: Automated Copilot Assistant (repo scan)

Severity: CRITICAL — Secrets exposed in repository; Tier-0 security violations detected by pattern
validator.

## Summary

This file is a formal SR Agent invocation. The automated QA run detected committed secrets in
`./.env.local` and many Tier-0 security violations reported by `scripts/validate-patterns.mjs`
(numerous API routes missing required security wrappers and lacking Zod validation). TypeScript
typecheck could not complete because the install failed due to lockfile mismatch.

Key artifacts (created / located in repo):

- `docs/qa-report.md` — QA summary (secret scan, validator output, remediation steps)
- Pattern validator run (terminal): many Tier-0 violations (security wrappers, write validation) —
  run reproduced by `node scripts/validate-patterns.mjs` (see `docs/qa-report.md`)
- Sensitive file: `./.env.local` (contains `NEXT_PUBLIC_FIREBASE_API_KEY`, `SESSION_SECRET`,
  `BACKUP_CRON_TOKEN`, etc.) — **treat as compromised** if values are real.

## Immediate Actions Required (SR Agent)

1. Rotate and revoke all possibly-exposed credentials immediately:
   - Firebase API keys (rotate if used for privileged operations), session secrets, service account
     keys.
   - Replace and rotate any tokens found in `./.env.local` and the environment of running
     deployments. Update secrets stored in the secrets manager (GitHub Actions secrets, Vault,
     etc.).

1. Remove the committed secrets from the repository and prevent re-commit:
   - Remove file from repo and add to `.gitignore`:

     ```bash
     git rm --cached .env.local || true
     echo ".env.local" >> .gitignore
     git add .gitignore
     git commit -m "chore(secrets): remove .env.local from repo and ignore it"
     ```

   - If the secrets are present in historical commits, coordinate an immediate history-rewrite with
     the team (use `git filter-repo` or BFG). Preserve backups and inform all contributors.

1. Escalation & Human Approval:
   - Open an urgent GitHub issue with the title
     `[SR-AGENT] URGENT: Secrets Exposed — Rotations & History Rewrite Required` and assign to
     Security/Oncall.
   - Notify the on-call channel (Slack/MSTeams) with a link to the issue and `docs/qa-report.md`.

1. After rotations, validate and re-run local CI tasks:
   - Run dependency install (note: prior attempt failed with frozen-lockfile). Use:

     ```bash
     pnpm -w install --no-frozen-lockfile
     pnpm -w typecheck
     node scripts/validate-patterns.mjs
     ```

   - If choosing to preserve lockfile, update `packages/markdown-fixer/package.json` to match the
     lockfile or coordinate a lockfile update via CI with a dedicated PR.

1. Remediate Tier-0 validator issues (security wrappers & Zod input validation):
   - Prioritize the following representative routes and add the SDK factory or `withSecurity`
     wrappers and Zod validation:
     - `apps/web/app/api/shifts/route.ts`
     - `apps/web/app/api/schedules/route.ts`
     - `apps/web/app/api/session/route.ts`
   - Re-run `node scripts/validate-patterns.mjs` and iterate until Tier-0 fixes are resolved.

## Operational Notes for SR Agent

- Evidence and outputs are in `docs/qa-report.md`. Do NOT print or copy secret values into chat or
  issue comments.
- All actions that modify history must be coordinated with repository owners and the release
  manager.
- Prefer preparing a fix branch and creating a PR for non-urgent code fixes; urgent secret removal
  may require immediate history rewrite.

## Combot Verification Request

After human actions, request a Combot review with `/combot-review` (see
`agents/combot-integration.md`) to run an automated high-confidence pass checking that:

- Secrets are removed and not present in commits (grep across history as needed)
- `node scripts/validate-patterns.mjs` returns zero Tier-0 violations
- `pnpm -w typecheck` completes successfully

## Contact / Escalation

- Primary: repo owner `@peteywee` (GitHub)
- Secondary: Security lead (see team roster)

## Invocation Record

- Invocation created by Copilot Assistant after pattern validator run on 2025-12-05.
- Files referenced: `docs/qa-report.md`, `repomix-output.xml` (packed repomix exists in repo root),
  `scripts/validate-patterns.mjs`.

End of file.
