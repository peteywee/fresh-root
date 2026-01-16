Plan: Create a single authoritative Copilot instruction for this repository

Overview

This file is a concise plan for producing a single, authoritative Copilot instruction derived from
all agent files, instruction documents, and other governance materials in the repository (e.g.,
files under `.github/instructions/`, `AGENTS.md`, `.github/copilot-instructions.md`, `AGENTS.md`,
`docs/*`, and any other files that define policy or developer expectations). The intent is to
produce a single, prescriptive instruction that downstream Copilot-style coding agents will follow
when working in this repo.

Tasks (same as TODOs)

1. Read & index repository (in-progress)

- Goal: Produce a machine- and human-readable index of repository governance and instruction files.
  The index should list each relevant file path, a 1–2 line summary of its purpose, tags (security,
  testing, build, style, deployment, agent, etc.), and any explicit hard rules or file-header
  requirements found.
- Acceptance: JSON or Markdown index mapping `file -> summary + tags + key constraints`.
- Notes: Start with known locations: `.github/`, `.github/instructions/`, `AGENTS.md`,
  `.github/copilot-instructions.md`, `docs/`, `packages/*/`, and any README or top-level policy
  files.

1. Extract agent & instruction directives (not-started)

- Goal: From the indexed files, extract authoritative directives and constraints (for example: "use
  pnpm only", "Zod-first schema rules", "SDK factory pattern", file header rules, test gating
  commands"). Capture exact phrasing where possible and the file origin for traceability.
- Acceptance: Structured list of directives grouped by category (Security, Tools, Testing, API
  patterns, CI, Commit/PR rules, File headers, Comments rules, etc.) with source references.

1. Reconcile and prioritize rules (not-started)

- Goal: Identify contradictions or duplicates and resolve them into a single precedence model. Mark
  rules that are "hard/mandatory" vs "recommended" and note when additional validation
  (scripts/tests) are required to enforce a rule.
- Acceptance: Reconciled rulebook with preconditions and precedence (e.g., "Hard rules: pnpm;
  Zod-first; Triad-of-Trust. Recommended: code style details").

1. Draft single authoritative Copilot instruction (not-started)

- Goal: Synthesize the reconciled rulebook into one Copilot instruction document. It should:
  - Be written as a prescriptive instruction for an AI assistant (Copilot) working in this repo.
  - Prioritize safety, production readiness, and the "Triad of Trust" (Zod schemas + API route +
    Firestore rules) where applicable.
  - Include required tool usage (use `manage_todo_list` first, always preface tool calls, declare
    intent for tool usage), and any mandatory workflows (pnpm, test sequence, header patterns).
  - Provide concise examples of required patterns (file header, endpoint structure) where helpful.
  - Explain how to run validations locally (typecheck, lint, tests, rules tests) and when to stop
    and ask for human review.
- Acceptance: A single file (Markdown) with clear sections (Scope, Hard Rules, Tooling Expectations,
  Directory and File Conventions, Example Patterns, QA checklist).

1. Review & QA the draft (not-started)

- Goal: Validate the draft against repository hard rules and ensure no sensitive secrets were
  leaked. Run quick automated checks where possible and surface any outstanding ambiguities that
  need human decision.
- Acceptance: Checklist marked complete and minor fixes applied.

1. Write plan file for refinement (this file) (not-started)

- Goal: Present the plan to the user for refinement and sign-off before indexing and drafting the
  authoritative instruction.
- Acceptance: File exists in workspace and matches the plan above.

Deliverables

- `untitled:plan-copilotInstruction.prompt.md` (this file) — plan for approval and refinement.
- `copilot-instruction-draft.md` — draft of the single authoritative Copilot instruction (produced
  later).
- `repo-instruction-index.json` (or `.md`) — an indexed map of instruction/governance files and
  extracted directives.
- `reconciled-rulebook.md` — reconciled rules with precedence metadata.

Timeline & Next Steps

1. Confirm the plan (you may request edits to these steps or change the file naming convention).
2. After confirmation, proceed to Step 1 (index the repo). I will: search known instruction
   directories, read the attached `.github/instructions/*` files, `AGENTS.md`,
   `.github/copilot-instructions.md`, `docs/*` policy docs, and the `packages` folder for patterns.
1. Produce the index and share it for review.
2. Extract directives and reconcile into the draft instruction.

Questions / Choices for you

- Confirm filename: `untitled:plan-copilotInstruction.prompt.md` is acceptable? (Already used.)
- Proceed to index the repo now? (recommended)

Notes

- I will follow repository rules in the attachments (e.g., always use `pnpm`, Zod-first validation,
  triad-of-trust). I will also follow the agent guidance: use the `manage_todo_list` tool first and
  preface tool calls with concise intent statements.
- This plan is intentionally minimal and focused on producing a single authoritative instruction
  document that is fully traceable back to source governance files.

End of plan.
