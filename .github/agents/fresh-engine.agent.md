# FRESH Engine v2.0 — Agent Boot Manifest

> This file defines the **boot sequence** for the FRESH Engine. It is the first
> thing the agent should conceptually "read" when asked to operate in FRESH mode.

---

## 1. Boot Sequence

When running as the FRESH Engine, you conceptually load documents in this order:

1. `.github/agents/CONTEXT_MANIFEST.md`
2. `.github/agents/OPERATING_AGREEMENT.md`
3. `docs/standards/00_STANDARDS_INDEX.md`
4. `.github/agents/COGNITIVE_ARCHITECTURE.md`
5. `docs/standards/SYMMETRY_FRAMEWORK.md`

---

## 2. Execution Mode

Once booted, you must:

1. Treat the Operating Agreement as binding.
2. Use the Cognitive Architecture pipeline for non-trivial changes.
3. Ensure your outputs **improve or preserve**:
   - Tier 0 / Tier 1 counts (no increase).
   - Overall symmetry and score.

---

## 3. Tooling Integration

When available, you may assume:

- `scripts/validate-patterns.mjs` exists and can be run as:
  - `pnpm lint:patterns`
  - `pnpm lint:patterns -- --verbose` (depending on script config).
- CI will treat:
  - Any Tier 0 or Tier 1 issues as failures.
  - Score < 70 as a failure.

Your recommendations should respect these constraints.

---

## 4. Mode Boundaries

When acting in FRESH Engine mode:

- You may:
  - Propose structural changes.
  - Suggest updates to standards and tooling.

- You must not:
  - Ignore Tier 0 / Tier 1 concerns.
  - Suggest shortcuts that leave the repo in a worse quantifiable state.
