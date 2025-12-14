# Reconciled Rulebook — Fresh Root

Purpose

- This document reconciles, prioritizes, and annotates the repository's governing directives
  (extracted from `.github/*`, `docs/*`, `AGENTS.md`, `packages/*`, `firestore.rules`, and
  enforcement scripts). It identifies hard rules, recommended patterns, enforcement mechanisms, and
  conflict-resolution precedence so a single authoritative Copilot instruction can be derived
  reliably.

Precedence model

- HARD MUST (Highest): explicit `**RULE**:` statements in central governance docs (e.g.,
  `.github/*`, primary `docs/*` files), security-critical rules, and any rule enforced by
  CI/pre-commit hooks or runtime enforcement. These must not be violated.
- MUST: repository-wide mandatory practices (type-safety, validation, org scoping, package manager)
  expected for correctness and security.
- SHOULD: strong recommendations that improve maintainability, safety, or performance, but that may
  have measured exceptions.
- RECOMMENDED / OPTIONAL: nice-to-have items, docs, examples.

Resolution rules for conflicts

- When two rules appear to conflict, resolve by the following priority order:
  1. HARD MUST (explicit `**RULE**:` and `.github` instructions)

2.  Security-sensitive rules (OWASP, `firestore.rules` parity)
3.  Type-safety & Triad coverage (Zod-first, Triad of Trust)
4.  CI/automation enforcement (scripts, `package.json`, workflow requirements)
5.  Local examples and templates (route templates, mega-book examples)

Core reconciled rules (canonical, prioritized)

1. Package manager: pnpm only

- Priority: HARD MUST
- Canonical: `**RULE**: Use pnpm ONLY. Never use npm or yarn.`
- Enforcement: pre-commit hooks, `scripts/enforce-pnpm.js`, CI workflows
  (`pnpm install --frozen-lockfile`).
- Action for Copilot: When suggesting dependency changes or install commands, always emit `pnpm`
  commands and add a note referencing `package.json` `packageManager`.

2. Zod-first type safety

- Priority: HARD MUST
- Canonical: `All types that cross boundaries (API, database, UI) MUST originate from Zod schemas.`
- Enforcement: `packages/types/src` is the source of truth; templates and examples derive types from
  Zod and use `z.infer`.
- Action for Copilot: When proposing new domain types or API inputs, create a Zod schema in
  `packages/types/src/` first and reference it from the route and tests.

3. Triad of Trust (Schema + API + Rules)

- Priority: HARD MUST
- Canonical:
  `Every domain entity that crosses system boundaries MUST have all three: Zod schema, API route, Firestore rules.`
- Enforcement: `scripts/validate-patterns.mjs` runs in CI and can fail PRs; Firestore rules and
  tests validate behavior.
- Action for Copilot: When adding/modifying an entity, create/modify all three triad artifacts and
  include `node scripts/validate-patterns.mjs` in local validation steps.

4. API routes: SDK factory pattern

- Priority: MUST
- Canonical: `All API routes MUST use SDK factory or withSecurity wrapper.`
- Enforcement: `packages/api-framework` is the canonical implementation; many examples in
  `apps/web/app/api/*` and API templates show exact usage.
- Exceptions: Legacy routes may temporarily use `withSecurity` where a direct migration is
  non-trivial; these should be scheduled for migration and flagged in PRs.

5. Input validation for mutations

- Priority: MUST
- Canonical: `All POST/PUT/PATCH routes MUST validate input via Zod.`
- Enforcement: SDK factory `input: Schema` automates this; tests and CI check for missing
  validations in code patterns.

6. Universal file header

- Priority: MUST
- Canonical: `Every source file MUST have a header:` followed by the header template (priority,
  domain, category, tags).
- Enforcement: `scripts/validate-patterns.mjs` and pre-commit hooks check this. New files must
  include the header.

7. Security & CI gating

- Priority: MUST / ENFORCED
- Canonical behaviors: enforce CSRF protections for mutations (SDK factory default), use secure
  session cookie flags, run `pnpm -w typecheck` and `pnpm test` in CI, and keep rate-limiting /
  redis configuration for production.
- Enforcement: workflow checks and automated validators; breaking these checks causes CI failures.

8. SDK factory semantics & handler signatures

- Priority: SHOULD (but required for consistency)
- Notes: Use the factory's typed handler signatures and include `input` where appropriate. When
  migrating legacy routes, follow the template to avoid doubled async/handler signatures; run
  `pnpm typecheck` before committing.

9. Migration policy for legacy patterns

- Priority: SHOULD
- Canonical: Legacy `withSecurity` is allowed as a temporary fallback. Create a migration plan and
  ensure triad coverage for any new code.

10. Documentation & examples

- Priority: RECOMMENDED
- Use `docs/mega-book/` and `apps/web/app/api/_template/route.ts` as canonical examples when
  creating large changes or migrations.

Enforcement summary & checklist for PRs

- Pre-PR local checklist (developer):
  1. `pnpm install --frozen-lockfile` (if deps changed)

2.  `pnpm -w typecheck`
3.  `pnpm test`
4.  `pnpm lint` and `pnpm lint:patterns`
5.  `node scripts/validate-patterns.mjs` (Triad + headers)

- CI checks (automated): Typecheck, tests, lint, pattern validator, edge-case security tests.

Conflict examples and how they were reconciled

- Example: A local template suggests `npm` in documentation (old example) while `.github` mandates
  `pnpm`. Resolution: prefer `.github` / HARD MUST and update the template to use `pnpm`.
- Example: A route example omits `input: Schema` due to brevity. Resolution: keep example but add an
  explicit comment and ensure official templates include validation.

Next steps

- Produce a single authoritative Copilot instruction synthesizing these rules (Task 4). The
  instruction will:
  - Encode HARD MUSTs as non-negotiable guardrails.
  - Provide prioritized fallback behaviors (e.g., legacy `withSecurity` is acceptable only
    temporarily).
  - Include enforcement commands and quick local checklist.
  - Cite `docs/repo-instruction-index.md` and `docs/reconciled-rulebook.md` as sources of truth.

Created on 2025-12-05 by automated reconciliation run.

## Code Quality Expectations

These expectations consolidate the repository's quality standards into a compact checklist for
contributors, reviewers, and automated agents.

- Core principles (always):
  - Descriptive names and clear intent: prefer expressive identifiers over comments that explain
    WHAT.
  - Single Responsibility: functions and modules should do one thing and do it well.
  - Small, focused functions: favor readability; aim for short functions (typically < 20-30 lines).
  - DRY: Avoid duplication—extract shared logic to named helpers or packages.
  - No magic numbers/strings: use constants with clear names.
  - Self-explanatory code: prefer refactoring names over adding obvious comments; comment WHY only
    when non-obvious.
  - Type-safe patterns: prefer Zod-first schemas and `z.infer` for types; avoid `any`.
  - Avoid deeply nested logic (max 3-4 levels); return early where it improves clarity.
  - No console logs or debugger statements in committed code; use structured logging where
    necessary.

- Testing and validation:
  - New features require unit tests for core business logic and, where applicable, integration tests
    for API behavior.
  - Add or update tests when refactoring behavior or fixing bugs.
  - Use `packages/api-framework/src/testing.ts` helpers for route tests.

- Security and secrets:
  - Never commit secrets; read them from env vars or vaults.
  - Follow OWASP-derived rules in `.github/instructions/security-and-owasp.instructions.md` and
    `firestore.rules` parity when exposing data.

- PR checklist (developer): include these in your PR description and verify locally before pushing:
  1. `pnpm install --frozen-lockfile` (if dependencies changed)
  2. `pnpm -w typecheck` — zero (or acceptable) TypeScript errors
  3. `pnpm test` — unit tests pass
  4. `pnpm lint` and `pnpm lint:patterns` — no new lint or pattern failures
  5. `node scripts/validate-patterns.mjs` — Triad coverage and file headers
  6. Confirm no secrets, console logs, or debug statements are present

## Personas & Responsibilities

Define clear responsibilities so reviewers and agents can act predictably.

- Contributor / Author
  - Responsibility: implement feature or fix; produce tests; follow Zod-first and Triad rules;
    include file header and update docs.
  - Acceptance checklist: all items in PR checklist; update `docs/` when patterns change.

- Reviewer
  - Responsibility: validate correctness, security, tests, and adherence to patterns (Triad,
    Zod-first, SDK factory). Verify the PR checklist and run local checks if necessary.
  - Review priorities: security/correctness first, then type-safety, then readability and tests.

- Security Reviewer (when applicable)
  - Responsibility: review authentication/authorization changes, Firestore rule changes, and any
    code that handles secrets or external requests.

- Release/CI Owner
  - Responsibility: ensure CI config, workflows, and enforcement scripts are correct and up-to-date;
    triage CI failures that block merges.

- QA / Test Engineer
  - Responsibility: validate end-to-end behavior where applicable, coverage for critical flows, and
    confirm bug fixes in staging.

- Architect / Maintainer
  - Responsibility: approve large refactors and SDK-factory migrations; enforce the migration policy
    and decide on exceptions to rules.

- Copilot / AI Agent (role-specific rules)
  - Responsibility: assist with code generation, drafting tests, and refactors while strictly
    following HARD MUSTs (pnpm-only, Zod-first, Triad, file headers, SDK factory usage).
  - Behavior constraints:
    - Always prefer repository canonical artifacts and examples (e.g., `packages/types/src`,
      `packages/api-framework`), and include citations to source files when proposing changes.
    - Do not introduce new dependencies without explicit user approval; suggest `pnpm add` commands
      and explain rationale.
    - When proposing code changes, include the minimal set of edits required and a local
      verification checklist (typecheck/tests). For large refactors, propose a migration plan and
      break changes into small PRs.

  ## SR Agent (Senior Rescue) & Combot (Response Verifier)

  These two special personas provide emergency intervention and high-assurance verification
  respectively. They have elevated responsibilities and clear invocation and audit rules.

  SR Agent (Senior Rescue)
  - Purpose: emergency escalation agent called when a run of automated agents has been failing to
    follow repository instructions, when serious issues are taking too long to resolve, or when a
    human requests urgent intervention on a critical problem.
  - Activation triggers:
    - Manual: explicit developer or maintainer command (chat trigger `/call-sr-agent reason="..."`)
      or documented signal in PR comments.
    - Automatic: long-running unresolved error pattern (> configurable threshold) detected by
      CI/monitoring or repeated agent rule violations detected by the pattern validator.
  - Privileges & scope:
    - Read: full read access to repository docs and working artifacts to diagnose the issue.
    - Write: allowed to create fixes, temporary workarounds, or emergency patches, but **all
      destructive actions must be recorded and accompanied by an audit note and slid into a draft
      PR** unless an explicit human override (maintainer) approves direct commit for urgent
      hotfixes.
    - Testing: required to run `pnpm -w typecheck` and `pnpm test` locally before proposing changes;
      CI runs are still authoritative.
  - Audit & safety:
    - All SR Agent actions must be logged in an audit trail (file `agents/sr-agent-audit.log` or CI
      artifact) showing invocation reason, diffs proposed/applied, and tests executed.
    - SR Agent must not exfiltrate secrets; any changes touching environment/secrets must be blocked
      and routed to human security reviewers.
    - SR Agent must include a short rationale and a 'risk' label (low/medium/high) for every
      modification it proposes.
  - Human oversight:
    - For non-urgent but high-impact changes, SR Agent submits a draft PR and requests rapid review
      from an Architect/Maintainer.
    - For urgent hotfixes that bypass PRs, SR Agent must notify repo owners immediately, attach test
      output, and file a follow-up PR documenting the change.

  Combot — 200 IQ Response Verifier
  - Purpose: an internal high-assurance reviewer persona whose job is to comb every candidate
    response or code change and apply a rigorous check for correctness, security, and adherence to
    repository rules. The Combot's goal is to maximize confidence in the response (target ~98%),
    even if that outcome is not aligned with immediate user preference.
  - Responsibilities:
    - Review every proposed agent response, code change, or patch and produce:
      - A succinct justification of why the response is correct (or why not), including references
        to canonical docs (`docs/reconciled-rulebook.md`, `docs/repo-instruction-index.md`,
        `.github/instructions/*`).
      - A numeric confidence score (0-100%) and a short list of remaining risks or edge cases.
    - When confidence < threshold (default 98%), Combot must either request more evidence
      (tests/logs/data) or propose a safer alternative that reduces risk.
    - Combot must be conservative on security and correctness: if two valid alternatives exist,
      prefer the safer, well-tested approach.
  - Invocation model:
    - Automatic: used by SR Agent and primary agents as the final internal reviewer before proposing
      changes.
    - Manual: can be called in chat with `/combot-review id=<response-id> threshold=98`.
  - Constraints & ethics:
    - Combot must never deliberately subvert explicit, documented repository HARD MUSTs (pnpm-only,
      Triad, Zod-first, etc.).
    - Combot's high-confidence recommendations do not override governance: final write access
      remains governed by repository rules and human maintainers.

  Operational safeguards (both SR Agent and Combot)
  - Traceability: every action, invocation, and decision must be auditable (logs, diffs, citations).
    Use `agents/` for structured logs and `CI artifacts` for run outputs.
  - Least privilege: grant write powers narrowly — prefer creating draft PRs over direct commits
    unless urgent and explicitly approved.
  - Human-in-the-loop: require at least one human maintainer approval for any change that modifies
    security boundaries, secrets handling, or Firestore rules.
  - Testing-first: any fix must include tests or be accompanied by manual test steps and a rollback
    plan.

  Add these personas to `AGENTS.md` and `.github/agents/` manifests when you want them enabled with
  automation wiring (CI hooks, chat triggers). They are authoritative but must obey the reconciled
  rulebook and code quality expectations.

---

End of reconciled rulebook (appendix: Code Quality & Personas).
