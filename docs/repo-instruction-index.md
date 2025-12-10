# Repository Instruction Index

This file collects canonical, high-priority directives extracted from the repository governance documents and agent instructions. Each entry includes the exact quoted directive (when available), a short interpretation, tags (MUST / SHOULD / RECOMMENDED), and one or more authoritative source references in the repo.

---

## 1) Package manager: pnpm only

- Exact quote: "**RULE**: Use pnpm ONLY. Never use npm or yarn."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (package manager section)
  - `package.json` (`packageManager": "pnpm@9.12.1")`
  - CI workflows / `.github/**` (uses `pnpm install --frozen-lockfile`, `pnpm -w typecheck`)
- Notes: Enforced by pre-commit hooks and CI; follow `pnpm` commands in docs.

## 2) Zod-first type safety

- Exact quote: "All types that cross boundaries (API, database, UI) MUST originate from Zod schemas."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (Zod-First sections)
  - `packages/types/src/` (schema files, e.g. `orgs.ts`, `shifts.ts`)
  - `packages/types/src/index.ts`
- Notes: Do not duplicate types; use `z.infer<typeof Schema>`; API inputs and important domain models must derive from Zod schemas.

## 3) Triad of Trust (Schema + API + Rules)

- Exact quote: "**CRITICAL PRINCIPLE**: Every domain entity that crosses system boundaries MUST have all three:" (followed by the three elements)
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` ("The Triad of Trust")
  - `scripts/validate-patterns.mjs` (validator used to check triad coverage)
  - `firestore.rules`
- Notes: If you add or modify a domain entity, update the Zod schema, the API route, and the Firestore rules. Run `node scripts/validate-patterns.mjs` to verify coverage.

## 4) API route pattern: SDK factory

- Exact quote: "**RULE**: All API routes MUST use SDK factory or `withSecurity` wrapper."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (SDK Factory pattern, examples)
  - `packages/api-framework/src/index.ts` (factory implementations: `createPublicEndpoint`, `createAuthenticatedEndpoint`, `createOrgEndpoint`)
  - Example routes in `apps/web/app/api/*/route.ts`
- Notes: Prefer `createOrgEndpoint` / `createAuthenticatedEndpoint` / `createPublicEndpoint` for new routes; legacy `withSecurity` wrapper allowed only as a fallback for legacy code.

## 5) Input validation for mutations (POST/PUT/PATCH)

- Exact quote: "**RULE**: All POST/PUT/PATCH routes MUST validate input via Zod."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (Input Validation rule)
  - `packages/api-framework` (`input: Schema` automatic validation examples)
  - Example: `apps/web/app/api/*/route.ts` showing `input: CreateXSchema`
- Notes: When defining mutation endpoints, include `input: Schema` in SDK factory config so validation happens before handler execution.

## 6) Universal file header

- Exact quote: "**RULE**: Every source file MUST have a header:" (header template shown in docs)
- Tag: MUST
- Sources:
  - `docs/standards/00_STANDARDS_INDEX.md`
  - `docs/standards/` (Universal File Header and header examples)
  - `scripts/validate-patterns.mjs` (pattern checks)
- Notes: Add the standardized header block (priority tags, domain/category, brief description) to all new source files per repo standard.

## 7) Security & CI gating (summary)

- Canonical constraints (examples):
  - Run `pnpm -w typecheck` before PRs
  - Run `pnpm test`, `pnpm lint`, `pnpm lint:patterns`
  - Use session cookie flags and CSRF protections in server endpoints (SDK factory applies defaults)
- Tag: MUST / ENFORCED
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (Security and CI sections)
  - `packages/api-framework` (CSRF, rate limiting, cookie handling)
  - `firestore.rules` (security rules references)

---

Notes on usage:

- This index intentionally captures the highest-priority directives that a Copilot instruction must include. Next steps: (1) expand this index to include other MUST/SHOULD items discovered in `.github/instructions/` and agent docs; (2) reconcile any conflicting recommendations and produce a single authoritative Copilot instruction file that encodes these rules and cites these sources.

Created by automated extraction on 2025-12-05.

## Lower-level authoritative references (linked)

The following files and directories are lower-level but still important authoritative sources. Include these as references when implementing the higher-level rules above. Where appropriate, follow the specific guidance inside each file (they are ordered by likely relevance).

- **GitHub agent & instruction files**
  - `.github/copilot-instructions.md` — Primary Copilot-agent guidance and examples for agent behavior.
  - `.github/instructions/` — Collection of instruction fragments and agent-facing policies (contains `production-development-directive.instructions.md`, `taming-copilot.instructions.md`, `security-and-owasp.instructions.md`, etc.).
  - `.github/prompts/` — Reusable prompts and templates for automated agents.

- **Agent manifests & runbooks**
  - `AGENTS.md` — High-level repository agent guidelines and operating model.
  - `agents/` — Agent-specific briefings, activation guides and domain manifests (e.g., `crewops.md`, `CREWOPS_ACTIVATION.md`).

- **Standards & patterns**
  - `docs/CODING_RULES_AND_PATTERNS.md` — Comprehensive coding rules (Zod-first, Triad, SDK factory examples).
  - `docs/standards/` — File header templates, symmetry framework, and fingerprint rules (e.g., `00_STANDARDS_INDEX.md`, `SYMMETRY_FRAMEWORK.md`).
  - `docs/mega-book/` — Deep-dive chapters and migration playbooks (use when implementing large refactors).

- **Type & API packages**
  - `packages/types/src/` — Canonical Zod schemas (single source of truth for types).
  - `packages/api-framework/src/index.ts` — SDK factory code and helpers (`createPublicEndpoint`, `createAuthenticatedEndpoint`, `createOrgEndpoint`).
  - `packages/api-framework/src/testing.ts` — Mock builders and test helpers to validate endpoints.

- **Security & rules**
  - `firestore.rules` — Firestore security rules that must stay in sync with API permissions.
  - `scripts/validate-patterns.mjs` — Validator that checks Triad coverage and file header presence.
  - `packages/*/rules-tests/` or `tests/rules/` — Firestore rules tests and emulation-based checks.

- **Scripts, CI, and enforcement**
  - `scripts/enforce-pnpm.js` (or similar enforcement scripts) — pnpm enforcement and pre-commit checks.
  - `package.json` (root) — `packageManager` field and workspace scripts (CI scripts use pnpm commands listed here).
  - `.github/workflows/` (CI) — The GitHub Actions workflows that run `pnpm -w typecheck`, `pnpm test`, `pnpm lint:patterns`.

- **Examples & templates**
  - `apps/web/app/api/_template/route.ts` — API route template using SDK factory.
  - `docs/mega-book/*/examples/` — Migration and route examples; useful when migrating legacy `withSecurity` routes.

---

If you want, I can expand each link with the most relevant quoted passages (exact lines) from each file and append them under each bullet for traceability. Would you like the expanded, quoted references appended now?
