**Copilot Instruction — Fresh Root**

Purpose: Provide a single, authoritative instruction set for Copilot/AI agents working in this repository. This file encodes the repository's HARD MUSTs, expected behaviors, enforcement steps, and escalation rules (including SR Agent & Combot). Use this as the canonical operating instruction for automated agents.

**Scope**: All automated agents, Copilot sessions, and code-generation workflows that produce or modify repository source in `fresh-root`.

**HIGHEST PRIORITIES (non-negotiable)**

- **Package manager**: Always use `pnpm`. Do not suggest `npm` or `yarn` or produce commands using them. Source: `package.json` `packageManager` and `.github` rules.
- **Zod-first**: All types crossing boundaries must originate from Zod schemas in `packages/types/src/`. Do not invent duplicate TS interfaces—create/update the canonical Zod schema and use `z.infer<typeof Schema>`.
- **Triad of Trust**: Any domain entity change must include: 1) a Zod schema, 2) an API route (SDK factory), and 3) corresponding Firestore rules updates. Run `node scripts/validate-patterns.mjs` locally before PR.
- **API pattern**: Use the SDK factory helpers in `packages/api-framework` (`createPublicEndpoint`, `createAuthenticatedEndpoint`, `createOrgEndpoint`). Legacy `withSecurity` allowed only as a temporary bridge.
- **Mutation validation**: All POST/PUT/PATCH routes MUST use `input: <ZodSchema>` so the factory validates inputs automatically.
- **File headers**: Every new source file MUST include the repository header template (priority tag, domain, category, brief description). Use `docs/standards/*` for the exact template.

**Behavior Rules (how Copilot should act)**

- When generating or editing code produce the minimal set of changes required. Prefer small, safe PRs over large sweep refactors.
- Cite source files when relying on repository conventions (e.g., reference `packages/types/src/orgs.ts` when suggesting schema changes).
- Never add new runtime secrets or credentials. If a change requires secrets, include instructions to store them in env/vault and route to a human security reviewer.
- Do not introduce new dependencies without explicit approval. When recommending a dependency, show rationale, alternatives, and exact `pnpm` install command.
- Prefer tests: include unit tests for business logic and route tests using `packages/api-framework/src/testing.ts` when adding API behavior.

**Quality Gates / Pre-PR checklist (automated agents must run locally)**

- `pnpm install --frozen-lockfile` (if dependencies changed)
- `pnpm -w typecheck` — must pass
- `pnpm test` — unit tests must pass
- `pnpm lint` and `pnpm lint:patterns` — no new failures
- `node scripts/validate-patterns.mjs` — Triad & header validation

**Response formatting & traceability**

- When proposing a change include:
  - **What** changed (short summary)
  - **Why** (link to reconciled rule or evidence)
  - **Files changed** (list with paths)
  - **Local validation steps and results** (typecheck, tests)
  - **Risk level** (low/medium/high) and rollback plan

**Personas & Escalation**

- The SR Agent (Senior Rescue): callable by humans or triggered by automated failure patterns. SR Agent may propose or apply emergency fixes but must log every action to `agents/sr-agent-audit.log` and create or update a follow-up PR unless an explicit human override approves immediate commit.
- Combot (Response Verifier): always run as the final internal reviewer. Combot must provide a confidence score and cite canonical docs; if confidence < 99% ask for more evidence or propose a safer alternative.

**Invocation shortcuts (chat commands)**

- `/call-sr-agent reason="<short reason>"` — request immediate SR Agent attention (creates an audit entry and notifies maintainers).
- `/combot-review id=<response-id> threshold=99` — request a Combot review on a specific response or code change.

**Forbidden actions**

- Never bypass `node scripts/validate-patterns.mjs` for Triad coverage.
- Never commit secrets or credential material into the codebase.
- Never modify `firestore.rules` without a security reviewer and tests.

**Examples (do / don’t)**

- Do: Propose a new Zod schema file in `packages/types/src/` and reference it in the API route with `input: NewSchema`.
- Don't: Add an ad-hoc interface in a route file and skip tests and Firestore rules.

**Where to look for guidance**

- Primary: `docs/reconciled-rulebook.md`, `docs/repo-instruction-index.md`, `.github/copilot-instructions.md`.
- Patterns & templates: `apps/web/app/api/_template/route.ts`, `docs/standards/`.

**Audit & logging**

- All agent-driven PRs must include a compact audit note in the PR body: reason, local checks run, and Combot confidence score. SR Agent direct actions must add entries to `agents/sr-agent-audit.log`.

**When in doubt**

- Favor safety, tests, and small incremental changes. If uncertain about a security or data-scope change, defer to a human security reviewer and create a draft PR with an explanation.

Created from `docs/reconciled-rulebook.md` and `docs/repo-instruction-index.md` on 2025-12-05.
