# QA Report — Repo Scan & Pattern Validation

Date: 2025-12-05
Scope: secret-pattern scan, TypeScript typecheck attempt, repository pattern validator (Triad/policies)

Summary
-------

- Secret-pattern scan: FOUND potential secrets in tracked files. Notable files with sensitive values or commented examples:
  - `./.env.local` — contains `NEXT_PUBLIC_FIREBASE_API_KEY` and `SESSION_SECRET` values (committed). **Immediate action required**.
  - Multiple `.env.example` and `apps/web/.env.example` files contain placeholder keys (expected) and commented guidance. These are fine as long as they do not contain real secrets.
  - `.github/copilot-instructions.md` and docs contain sample env var placeholders and examples — these are documentation, not secrets.

- TypeScript typecheck: FAILED to run due to missing local install/build artifacts (turbo not found; `node_modules` likely not installed). See remediation steps below.

- Pattern validator (`scripts/validate-patterns.mjs`): RAN and FAILED with critical Tier-0 violations. Primary issues:
  - Many API routes are missing the required security wrapper (e.g., `withSecurity` / org membership/session enforcement) and thus violate access-control expectations.
  - Many write/mutation API routes are missing Zod-based input validation (POST/PUT/PATCH should validate via Zod before use).
  - Triad-of-Trust: Some core entities are complete, but many API routes still violate the "API" and "write validation" requirements.

Findings (secrets)
------------------

- The scan reported actual secrets in `./.env.local` (non-empty `NEXT_PUBLIC_FIREBASE_API_KEY` and `SESSION_SECRET` among others).
- The repository should NOT contain environment files with production secrets. If those values are real, rotate immediately and remove them from the repository history.

Immediate Remediation (secrets)
-------------------------------

1. Rotate exposed secrets now (Firebase API key, any session or service account credentials). Treat them as compromised.
2. Remove the files containing secrets from the repository and add them to `.gitignore`:

   ```bash
   # remove from working tree and prevent new commits
   git rm --cached .env.local
   echo ".env.local" >> .gitignore
   git commit -m "chore(secrets): remove .env.local from repo and ignore it"
   ```

3. Erase secrets from Git history if they were committed in previous commits:
   - Recommended: use `git filter-repo` or the BFG Repo-Cleaner. Example with `git filter-repo`:

   ```bash
   # Install if necessary; careful and follow backup instructions before rewriting history
   pip install git-filter-repo
   git clone --mirror git@github.com:peteywee/fresh-root.git
   cd fresh-root.git
   git filter-repo --invert-paths --paths .env.local
   # push rewritten history (force) to a new branch or coordinate with the team
   git push --force --all
   ```

   Note: Rewriting history requires coordination; create a backup and notify collaborators.

4. After rotation and history cleaning, re-deploy rotated credentials and update any secrets manager (Vault/Secrets Manager/GitHub Secrets).

Remediation (developer workflow & CI)
------------------------------------

- Ensure `.env.local` and similar local secret files are in the repository-level `.gitignore` and not committed.
- Use a secrets manager for production secrets and set safe dev default values in `.env.example` (placeholders only).

TypeScript Typecheck Fix
------------------------

The typecheck failed because `turbo` was not found and local dependencies are missing. To run typecheck locally:

```bash
# install dependencies (monorepo) — run once locally
pnpm -w install --frozen-lockfile

# then run typecheck across workspaces
pnpm -w typecheck
```

If you prefer not to install full dependencies on CI, consider running a lightweight typecheck in CI containers with the necessary tools preinstalled.

Pattern Validator (Triad) Fix Plan
---------------------------------

The `scripts/validate-patterns.mjs` run reported many Tier-0 violations (security + write validation). High-level steps to remediate:

1. Prioritize Tier-0 issues: fix routes missing security wrappers. For each route reported, wrap the handler with the appropriate security layer (SDK factory pattern or `withSecurity`) per the project guidelines.
2. For each write/mutation route reported, add Zod input schemas and wire them into the SDK factory or validation middleware.
3. Re-run the validator, iterate until Tier-0 violations are resolved.

Suggested developer workflow to fix the top items (example):

```bash
# 1. Install deps locally
pnpm -w install --frozen-lockfile

# 2. Run validator to get fresh list
node scripts/validate-patterns.mjs > pattern-output.txt

# 3. Fix top files reported (open and update routes to use createOrgEndpoint or withSecurity)
# 4. Re-run validator until clean
node scripts/validate-patterns.mjs
```

SR-Agent / Combot Invocation
----------------------------

Per the reconciled rulebook: if remediation is blocked, or if SR-level security incidents (committed secrets, evidence of compromise) are detected, invoke the SR Agent (human-in-the-loop) and the Combot for high-confidence audit.

- To escalate: create an issue with `[SR-AGENT]` in the title and ping on the team's channel. Attach `docs/qa-report.md`.
- For urgent secret exposure: rotate credentials immediately and notify SR Agent.

Next Steps (recommended, ordered)
--------------------------------

1. Rotate and revoke any exposed credentials (Firebase, session secrets). MARK AS URGENT.
2. Remove `.env.local` from the repo and rewrite history if those secrets are in older commits.
3. Add `.env.local` to `.gitignore` and ensure `.env.example` contains placeholders only.
4. Run `pnpm -w install --frozen-lockfile` locally or on CI runner to enable typecheck and other scripts.
5. Run `pnpm -w typecheck` and fix any TypeScript errors.
6. Fix Tier-0 validator findings (security wrappers & input validation) iteratively and re-run `node scripts/validate-patterns.mjs`.
7. Once green, run full CI (lint, tests, validator) before merging further changes.

Artifacts & Outputs
-------------------

- This file: `docs/qa-report.md` — summary and remediation steps.
- Raw secret-scan output was produced in terminal; DO NOT copy secret values into issues or chat. Use file paths/line references only.
- Pattern validator output captured during the run; reproduce locally with `node scripts/validate-patterns.mjs`.

If you want, I can:

- Create a minimal PR that removes `.env.local` and adds it to `.gitignore` (I will NOT include secret values),
- Or run `pnpm -w install --frozen-lockfile` and re-run `pnpm -w typecheck` and the validator here, if you'd like me to proceed.

— QA Bot
