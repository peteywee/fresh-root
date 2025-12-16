# Instructions Index (L2: Implementation Layer)

> **Location**: L2 (Agent Implementation Layer)  
> **Purpose**: Detailed instructions for AI agents implementing governance rules  
> **Last Updated**: 2025-12-16

---

## Quick Navigation

- [Core Instructions (01-05)](#core-instructions-01-05) - **Binding for all agents**
- [Memory Files](#memory-files-pattern-learnings) - Lessons learned from recurring issues
- [Domain-Specific](#domain-specific-instructions) - Technology-specific guidance
- [Best Practices](#best-practices) - General guidelines
- [Tag Lookup](#quick-tag-lookup) - Find by topic
- [Rule Index](#repository-instruction-index) - Canonical rules reference

---

## Hierarchy Position

```
L0: Canonical Governance (.github/governance/01-12)
  ↓
L1: Amendments (.github/governance/amendments/)
  ↓
L2: Instructions (.github/instructions/) ← YOU ARE HERE
  ↓
L3: Prompts (.github/prompts/)
  ↓
L4: Documentation (docs/)
```

**Authority**: Instructions implement L0/L1 governance rules. Conflicts resolved by escalating to canonical docs.

---

## Core Instructions (01-05)

**These files are binding for all agents.** They implement the Master Directive hierarchy.

| File | Scope | Priority | Purpose |
|------|-------|----------|---------|
| [01_MASTER_AGENT_DIRECTIVE.instructions.md](./01_MASTER_AGENT_DIRECTIVE.instructions.md) | `**` | P0 | **Binding for all operations** - Tool usage, hierarchy, production standards |
| [02_CODE_QUALITY_STANDARDS.instructions.md](./02_CODE_QUALITY_STANDARDS.instructions.md) | `**/*.{ts,tsx,js,jsx}` | P1 | Code quality enforcement, linting, formatting |
| [03_SECURITY_AND_SAFETY.instructions.md](./03_SECURITY_AND_SAFETY.instructions.md) | `*` | P0 | OWASP Top 10, security patterns, AI safety |
| [04_FRAMEWORK_PATTERNS.instructions.md](./04_FRAMEWORK_PATTERNS.instructions.md) | `apps/**,packages/**` | P1 | Next.js, Firebase, Tailwind, monorepo patterns |
| [05_TESTING_AND_REVIEW.instructions.md](./05_TESTING_AND_REVIEW.instructions.md) | `**/*.{test,spec}.{ts,tsx},tests/**` | P1 | Vitest, Playwright, code review |

---

## Memory Files (Pattern Learnings)

Memory files capture lessons learned from recurring issues. Created when error pattern detected 3+ times.

| File | Domain | Tags | Purpose |
|------|--------|------|---------|
| [api-framework-memory.instructions.md](./api-framework-memory.instructions.md) | API | api, typing, zod | SDK factory typing strategies, Zod integration |
| [code-quality-memory.instructions.md](./code-quality-memory.instructions.md) | Quality | quality, eslint, patterns | ESLint safeguard rule creation |
| [firebase-typing-and-monorepo-memory.instructions.md](./firebase-typing-and-monorepo-memory.instructions.md) | Firebase | firebase, typing, monorepo | Firebase SDK v12 typing, dependency management |
| [orchestration-memory.instructions.md](./orchestration-memory.instructions.md) | Agents | agents, orchestration, crewops | Dynamic personality switching, error protocols |
| [triage-batch-memory.instructions.md](./triage-batch-memory.instructions.md) | API | batch, testing, endpoints | Triage/batch endpoint patterns, testing |
| [typescript-schema-pattern-memory.instructions.md](./typescript-schema-pattern-memory.instructions.md) | Types | zod, schema, validation | Zod schema patterns, type inference |

---

## Domain-Specific Instructions

Instructions for specific technologies, frameworks, and workflows.

### Frontend

| File | Scope | Tags |
|------|-------|------|
| [nextjs-tailwind.instructions.md](./nextjs-tailwind.instructions.md) | Next.js + Tailwind | nextjs, tailwind, ui |
| [nextjs.instructions.md](./nextjs.instructions.md) | Next.js | nextjs, routing, ssr |

### Testing

| File | Scope | Tags |
|------|-------|------|
| [playwright-typescript.instructions.md](./playwright-typescript.instructions.md) | E2E tests | playwright, e2e, testing |

### Languages

| File | Scope | Tags |
|------|-------|------|
| [typescript-5-es2022.instructions.md](./typescript-5-es2022.instructions.md) | TypeScript | typescript, ts5, es2022 |

---

## Best Practices

| File | Scope | Purpose |
|------|-------|---------|
| [ai-prompt-engineering-safety-best-practices.instructions.md](./ai-prompt-engineering-safety-best-practices.instructions.md) | `*` | Prompt engineering, AI safety |
| [github-actions-ci-cd-best-practices.instructions.md](./github-actions-ci-cd-best-practices.instructions.md) | `*` | CI/CD workflow patterns |
| [object-calisthenics.instructions.md](./object-calisthenics.instructions.md) | `**/*.{cs,ts,java}` | Code organization principles |
| [performance-optimization.instructions.md](./performance-optimization.instructions.md) | `*` | Performance patterns |
| [security-and-owasp.instructions.md](./security-and-owasp.instructions.md) | `*` | Security implementation |
| [self-explanatory-code-commenting.instructions.md](./self-explanatory-code-commenting.instructions.md) | All code | Comment standards |

---

## Meta Instructions

| File | Purpose |
|------|---------|
| [code-review-generic.instructions.md](./code-review-generic.instructions.md) | Code review standards |
| [production-development-directive.instructions.md](./production-development-directive.instructions.md) | Production development philosophy |
| [taming-copilot.instructions.md](./taming-copilot.instructions.md) | Copilot behavior guidelines |

---

## Quick Tag Lookup

Find instructions by topic:

| Tag | Files |
|-----|-------|
| `api` | 01_MASTER, 04_FRAMEWORK, api-framework-memory, triage-batch-memory |
| `security` | 01_MASTER, 03_SECURITY, security-and-owasp, ai-prompt-engineering |
| `testing` | 05_TESTING, playwright-typescript, triage-batch-memory |
| `firebase` | 04_FRAMEWORK, firebase-typing-and-monorepo-memory |
| `zod` | api-framework-memory, typescript-schema-pattern-memory |
| `patterns` | 02_CODE_QUALITY, code-quality-memory, object-calisthenics |
| `agents` | 01_MASTER, orchestration-memory |
| `nextjs` | 04_FRAMEWORK, nextjs-tailwind, nextjs |
| `typescript` | typescript-5-es2022, typescript-schema-pattern-memory |
| `crewops` | orchestration-memory |

---

## Related Indexes

- [Governance Index](../governance/INDEX.md) - Canonical rules (L0/L1)
- [Documentation Index](../../docs/INDEX.md) - Human guides (L4)
- [Prompts](../prompts/) - Slash command templates (L3)

---

# Repository Instruction Index

This section collects canonical, high-priority directives extracted from the repository governance
documents and agent instructions. Each entry includes the exact quoted directive (when available), a
short interpretation, tags (MUST / SHOULD / RECOMMENDED), and one or more authoritative source
references in the repo.

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

- Exact quote: "All types that cross boundaries (API, database, UI) MUST originate from Zod
  schemas."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (Zod-First sections)
  - `packages/types/src/` (schema files, e.g. `orgs.ts`, `shifts.ts`)
  - `packages/types/src/index.ts`
- Notes: Do not duplicate types; use `z.infer<typeof Schema>`; API inputs and important domain
  models must derive from Zod schemas.

## 3) Triad of Trust (Schema + API + Rules)

- Exact quote: "**CRITICAL PRINCIPLE**: Every domain entity that crosses system boundaries MUST have
  all three:" (followed by the three elements)
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` ("The Triad of Trust")
  - `scripts/validate-patterns.mjs` (validator used to check triad coverage)
  - `firestore.rules`
- Notes: If you add or modify a domain entity, update the Zod schema, the API route, and the
  Firestore rules. Run `node scripts/validate-patterns.mjs` to verify coverage.

## 4) API route pattern: SDK factory

- Exact quote: "**RULE**: All API routes MUST use SDK factory or `withSecurity` wrapper."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (SDK Factory pattern, examples)
  - `packages/api-framework/src/index.ts` (factory implementations: `createPublicEndpoint`,
    `createAuthenticatedEndpoint`, `createOrgEndpoint`)
  - Example routes in `apps/web/app/api/*/route.ts`
- Notes: Prefer `createOrgEndpoint` / `createAuthenticatedEndpoint` / `createPublicEndpoint` for new
  routes; legacy `withSecurity` wrapper allowed only as a fallback for legacy code.

## 5) Input validation for mutations (POST/PUT/PATCH)

- Exact quote: "**RULE**: All POST/PUT/PATCH routes MUST validate input via Zod."
- Tag: MUST
- Sources:
  - `docs/CODING_RULES_AND_PATTERNS.md` (Input Validation rule)
  - `packages/api-framework` (`input: Schema` automatic validation examples)
  - Example: `apps/web/app/api/*/route.ts` showing `input: CreateXSchema`
- Notes: When defining mutation endpoints, include `input: Schema` in SDK factory config so
  validation happens before handler execution.

## 6) Universal file header

- Exact quote: "**RULE**: Every source file MUST have a header:" (header template shown in docs)
- Tag: MUST
- Sources:
  - `docs/standards/00_STANDARDS_INDEX.md`
  - `docs/standards/` (Universal File Header and header examples)
  - `scripts/validate-patterns.mjs` (pattern checks)
- Notes: Add the standardized header block (priority tags, domain/category, brief description) to
  all new source files per repo standard.

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

- This index intentionally captures the highest-priority directives that a Copilot instruction must
  include. Next steps: (1) expand this index to include other MUST/SHOULD items discovered in
  `.github/instructions/` and agent docs; (2) reconcile any conflicting recommendations and produce
  a single authoritative Copilot instruction file that encodes these rules and cites these sources.

Created by automated extraction on 2025-12-05.

## Lower-level authoritative references (linked)

The following files and directories are lower-level but still important authoritative sources.
Include these as references when implementing the higher-level rules above. Where appropriate,
follow the specific guidance inside each file (they are ordered by likely relevance).

- **GitHub agent & instruction files**
  - `.github/copilot-instructions.md` — Primary Copilot-agent guidance and examples for agent
    behavior.
  - `.github/instructions/` — Collection of instruction fragments and agent-facing policies
    (contains `production-development-directive.instructions.md`, `taming-copilot.instructions.md`,
    `security-and-owasp.instructions.md`, etc.).
  - `.github/prompts/` — Reusable prompts and templates for automated agents.

- **Agent manifests & runbooks**
  - `AGENTS.md` — High-level repository agent guidelines and operating model.
  - `agents/` — Agent-specific briefings, activation guides and domain manifests (e.g.,
    `crewops.md`, `CREWOPS_ACTIVATION.md`).

- **Standards & patterns**
  - `docs/CODING_RULES_AND_PATTERNS.md` — Comprehensive coding rules (Zod-first, Triad, SDK factory
    examples).
  - `docs/standards/` — File header templates, symmetry framework, and fingerprint rules (e.g.,
    `00_STANDARDS_INDEX.md`, `SYMMETRY_FRAMEWORK.md`).
  - `docs/mega-book/` — Deep-dive chapters and migration playbooks (use when implementing large
    refactors).

- **Type & API packages**
  - `packages/types/src/` — Canonical Zod schemas (single source of truth for types).
  - `packages/api-framework/src/index.ts` — SDK factory code and helpers (`createPublicEndpoint`,
    `createAuthenticatedEndpoint`, `createOrgEndpoint`).
  - `packages/api-framework/src/testing.ts` — Mock builders and test helpers to validate endpoints.

- **Security & rules**
  - `firestore.rules` — Firestore security rules that must stay in sync with API permissions.
  - `scripts/validate-patterns.mjs` — Validator that checks Triad coverage and file header presence.
  - `packages/*/rules-tests/` or `tests/rules/` — Firestore rules tests and emulation-based checks.

- **Scripts, CI, and enforcement**
  - `scripts/enforce-pnpm.js` (or similar enforcement scripts) — pnpm enforcement and pre-commit
    checks.
  - `package.json` (root) — `packageManager` field and workspace scripts (CI scripts use pnpm
    commands listed here).
  - `.github/workflows/` (CI) — The GitHub Actions workflows that run `pnpm -w typecheck`,
    `pnpm test`, `pnpm lint:patterns`.

- **Examples & templates**
  - `apps/web/app/api/_template/route.ts` — API route template using SDK factory.
  - `docs/mega-book/*/examples/` — Migration and route examples; useful when migrating legacy
    `withSecurity` routes.

---

If you want, I can expand each link with the most relevant quoted passages (exact lines) from each
file and append them under each bullet for traceability. Would you like the expanded, quoted
references appended now?
