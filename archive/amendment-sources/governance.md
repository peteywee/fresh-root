# Fresh Schedules Governance — Implementation Plan (Draft)

> **Status**: DRAFT (for refinement)
>
> **Inputs**: `docs/standards/files/*` (Definitions → Documentation, Agents, Pipelines, CI/CD,
> Branch Rules, Gates, Orchestrator)
>
> **Intent**: Convert the new governance directives into enforceable, repo-wide behavior (code
> patterns + CI + branch protections) without introducing conflicting tooling.

---

## 0) Context & Constraints

### Canonical sources (already in repo)

- `docs/standards/files/01_DEFINITIONS.md`
- `docs/standards/files/02_PROTOCOLS.md`
- `docs/standards/files/03_DIRECTIVES.md`
- `docs/standards/files/04_INSTRUCTIONS.md`
- `docs/standards/files/05_BEHAVIORS.md`
- `docs/standards/files/06_AGENTS.md`
- `docs/standards/files/07_PROMPTS.md`
- `docs/standards/files/08_PIPELINES.md`
- `docs/standards/files/09_CI_CD.md`
- `docs/standards/files/10_BRANCH_RULES.md`
- `docs/standards/files/11_GATES.md`
- `docs/standards/files/12_DOCUMENTATION.md`
- Supporting: `docs/standards/files/orchestrate.ts`, `docs/standards/files/orchestrate.yml`,
  `docs/standards/files/orchestrator.ts`, `docs/standards/files/agent-contracts.ts`,
  `docs/standards/files/PROTOCOL_DIRECTIVE_IMPROVEMENTS.md`,
  `docs/standards/files/QUICK_REFERENCE.md`

### Important repo reality check

- This repository currently has `dev` as the working branch and `main` as default.
- Governance standards should refer to `dev` as the pre-production integration branch.
- This plan is authored in `docs/governance.md` intentionally (per request) and should drive a later
  decision:
  - either **move/copy governance sources** to `.github/governance/`, or
  - **treat `docs/standards/files` as canonical** and update instructions accordingly.

---

## 1) Goals

### Primary

- Make all **MANDATORY** directives in `03_DIRECTIVES.md` enforceable (merge-blocking when
  required).
- Ensure enforcement is **non-interfering**, aligned with `11_GATES.md` and `08_PIPELINES.md`.

### Secondary

- Reduce ambiguity: give developers an unmissable “happy path” (templates + commands) and a clear
  “fail-closed” protocol.
- Establish reliable automation: orchestration in CI and locally (pipeline selection + gate order).

### Non-goals (for this pass)

- Re-architecting product functionality.
- Adding new features unrelated to governance enforcement.

---

## 2) Governance “Operating Model” (from the docs)

### Core values (priority order)

From `01_DEFINITIONS.md`:

1. Security First
2. Type Safety
3. Minimal Blast Radius
4. Evidence Over Intuition
5. Reversibility

### Classification protocol

From `02_PROTOCOLS.md` and `QUICK_REFERENCE.md`:

- **Fail-closed**: if uncertain → **NON-TRIVIAL**.
- Any security/rules/auth touches → **CRITICAL** and/or Security pipeline.

### Gate order (mandatory)

From `02_PROTOCOLS.md` + `11_GATES.md` + `docs/standards/files/copilot-instructions.md`:

`STATIC → CORRECTNESS → SAFETY → PERF → AI`

### Pipelines

From `08_PIPELINES.md` + `orchestrate.yml`:

- Family: Feature | Bug | Schema | Refactor | Security
- Variant: FAST | STANDARD | HEAVY
- Selection uses changed file count + security/schema detection.

---

## 3) Implementation Phases

### Phase A — Normalize governance locations (decision + minimal changes)

**Goal**: Remove confusion about where “canonical governance” lives.

Deliverables:

- Decide and document one canonical location:
  - Option A: `.github/governance/` (matches `docs/standards/files/copilot-instructions.md`)
  - Option B: `docs/standards/files/` (matches current folder and repo usage)
- Update whichever instructions/indexes conflict.

Acceptance criteria:

- Copilot/agent entry instructions point to the same canonical governance directory used by the
  team.

---

### Phase B — Make directives enforceable via gates (tooling + CI)

**Goal**: Convert “MANDATORY directives” into automation that blocks merges appropriately.

#### B1) STATIC gate enforcement (TypeScript + ESLint + Prettier)

Source: `11_GATES.md`

- Ensure commands exist and are used consistently:
  - `pnpm typecheck`
  - `pnpm lint:check`
  - `pnpm format:check`

Acceptance criteria:

- CI has a single, authoritative static check path.
- Local developers can run the same checks.

#### B2) CORRECTNESS gate enforcement (unit/rules/e2e)

Source: `11_GATES.md` and `09_CI_CD.md`

- Ensure commands exist:
  - `pnpm test:unit`
  - `pnpm test:rules`
  - `pnpm test:e2e` (conditional for HEAVY)

Acceptance criteria:

- Rules tests are mandatory for rules changes (Directive D01.2 + D04.3).

#### B3) SAFETY gate enforcement (patterns + secrets + advisory audit)

Source: `11_GATES.md`, `QUICK_REFERENCE.md`, `orchestrate.ts`, `orchestrate.yml`

- Implement/ensure:
  - `pnpm validate:patterns` blocks on critical violations and score < 90.
  - `pnpm validate:secrets` (or equivalent) blocks on secret patterns.
  - `pnpm audit --audit-level=high` is advisory or blocks only on critical (align with gate spec).

Acceptance criteria:

- Pattern IDs listed in `QUICK_REFERENCE.md` become machine-validated.
- “API_001 / API_002 / API_003 / SEC_001 / SEC_002 / SEC_003” have checks that actually detect
  violations.

#### B4) PERF + AI gates (conditional / advisory)

Source: `11_GATES.md`

- PERF: only enforce for HEAVY/perf-sensitive changes; do not slow down FAST.
- AI: advisory only.

Acceptance criteria:

- PERF does not unexpectedly block lightweight work.

---

### Phase C — Implement Directive 01 (Security)

Source: `03_DIRECTIVES.md`

#### C1) API route enforcement (D01.1 + D05.1)

Rules:

- Org-scoped routes must use `createOrgEndpoint()`.
- Network-scoped routes must use `createNetworkEndpoint()`.
- Inputs validated with Zod.
- Standard response format.

Work items:

- Define/confirm the **standard response envelope** (success/data/error shape) used by wrappers.
- Sweep `apps/web/app/api/**/route.ts`:
  - Replace raw handlers with endpoint wrappers.
  - Add schema validation where missing.
  - Ensure orgId comes from context and that the authenticated user is a member of that org.
  - Ensure orgId is never accepted from the client payload.

Acceptance criteria:

- Pattern validation catches any API route not using endpoint wrappers.
- No route queries Firestore without org scoping and user membership validation.

#### C2) Firestore rules enforcement (D01.2)

Rules:

- All org-scoped collections require `sameOrg()`.
- Network data requires `isNetworkMember()`.
- Writes require RBAC via `hasRole()` / `hasAnyRole()`.
- No permissive `allow read, write: if true`.

Work items:

- Sweep `firestore.rules`:
  - Ensure org paths are used (`organizations/{orgId}/...`).
  - Deny list by default where appropriate (`allow list: if false`), matching `QUICK_REFERENCE.md`.
- Expand rules tests in `tests/rules/`:
  - Verify cross-org access is denied.
  - Verify role-based writes.

Acceptance criteria:

- `pnpm test:rules` is green.
- Rules tests cover at least one positive + one negative per protected collection.

#### C3) Secret management enforcement (D01.3)

Work items:

- Ensure secrets are not committed; ensure scanning exists.
- Confirm client-safe env vars are `NEXT_PUBLIC_` only.

Acceptance criteria:

- Secret scan blocks obvious secrets.

---

### Phase D — Implement Directive 02 (Type Safety)

Source: `03_DIRECTIVES.md`

Rules:

- No `any`.
- Prefer `unknown` + guards.
- Types derived from Zod (`z.infer<typeof Schema>`).

Work items:

- Add/strengthen lint rule: `@typescript-eslint/no-explicit-any: error`.
- Tighten TS config where appropriate (align with `11_GATES.md` examples: `noImplicitAny`, `strict`,
  etc.).
- Sweep for:
  - `any`
  - unsafe casts
  - duplicated interface + schema definitions

Acceptance criteria:

- `pnpm typecheck` passes.
- `pnpm lint:check` passes.
- Pattern tooling (if used) flags `any` and schema/type mismatches.

---

### Phase E — Implement Directives 03–08 (Branch/Test/API/Organization/Performance/Error Handling)

Source: `03_DIRECTIVES.md`

#### E1) Branch management (Directive 03) vs current branches

Source: `10_BRANCH_RULES.md`

- Standardized model: `main` + `dev` with feature/fix/refactor/chore branches; `hotfix/*` path.

Work items:

- Ensure branch protection + workflow triggers consistently treat `dev` as the pre-production
  integration branch.
- Ensure GitHub branch protections match the decided model.

Acceptance criteria:

- Branch protection rules match documented workflow.

#### E2) Testing directive (Directive 04)

- Ensure minimum test expectations are enforced by pipelines.
- Ensure naming conventions and rules tests are standardized.

Acceptance criteria:

- Rules changes always require rules tests.

#### E3) API design directive (Directive 05)

- Standard response format
- HTTP method conventions
- Status codes policy

Acceptance criteria:

- API wrapper(s) enforce default response and errors.

#### E4) Code organization (Directive 06)

- Import order
- File naming
- Export rules

Acceptance criteria:

- ESLint rules match the directive.

#### E5) Performance directive (Directive 07)

- Bundle size budgets
- Data fetching patterns
- Rendering guidance

Acceptance criteria:

- PERF gate runs only when required.

#### E6) Error handling directive (Directive 08)

- Never swallow errors
- Error boundaries
- User-facing error policy

Acceptance criteria:

- Patterns/tooling discourage silent catches and leaking internals.

---

## 4) Orchestrator Alignment

### CI orchestrator

Source: `docs/standards/files/orchestrate.yml`

- Confirm it maps cleanly to the pipeline family/variant definitions in `08_PIPELINES.md`.
- Ensure it triggers on the right target branches for this repo (`dev`/`main`).

### Local orchestrator

Source: `docs/standards/files/orchestrate.ts`

- Ensure it matches gate order and commands from `11_GATES.md`.
- Ensure it can run “fix mode” safely (format → lint fix → typecheck, per `12_DOCUMENTATION.md`).

Acceptance criteria:

- A developer can run a single command locally to get the same pass/fail as CI.

---

## 5) Agent System Alignment (optional but recommended)

Source: `06_AGENTS.md`, `agent-contracts.ts`, `05_BEHAVIORS.md`, `07_PROMPTS.md`, `orchestrator.ts`

Work items:

- Ensure contracts are the single source of truth for agent behaviors.
- Ensure orchestrator routing patterns match documented triggers.
- Ensure “guard” criteria aligns with directives and gates.

Acceptance criteria:

- Agent outputs are consistent, predictable, and auditable.

---

## 6) Acceptance Criteria (Definition of Done)

### Repo-level

- Branch protections + workflows match the documented branch model.
- CI consistently enforces: `STATIC` then `CORRECTNESS` then `SAFETY` (with PERF/AI as configured).

### Directive compliance

- API routes: wrappers required + Zod validation + standard response.
- Firestore rules: org isolation + RBAC + tests.
- Type safety: no `any`, schema-derived types.

### Tooling

- Pattern validation exists, is run in CI, and blocks on critical issues.
- Secret scanning blocks obvious leaks.

---

## 7) Open Questions (must be resolved to execute cleanly)

1. Canonical governance directory: `.github/governance/` vs `docs/standards/files/`?
2. What is the exact standard API response envelope and error shape to enforce?
3. What is the minimal rules-test matrix per collection (read/write/list) we expect?

---

## 8) Suggested Execution Order (lowest-risk first)

1. Normalize docs pointers (no code change risk).
2. Ensure gates exist and run locally.
3. Wire CI/orchestrate to the correct branches.
4. Implement pattern validation (API_001 etc) so violations are discoverable.
5. Sweep API routes and rules incrementally (small PRs, minimal blast radius).
6. Tighten TS/lint only after most violations are resolved (avoid big-bang breaks).
