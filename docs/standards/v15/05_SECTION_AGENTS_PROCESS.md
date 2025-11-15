# Section 5: Agents, Automation & Process Standards (11 Standards)

## 29. 📄 AGENTS_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** Defines the hierarchical, sequential, and transparent thought process of the Master Compliance Agent (FRESH Engine), establishing the Prime Directive that governs all other standards.

### The Prime Directive: Safeguards Against Data Loss (NON-NEGOTIABLE)

My highest directive is to **never lose user-generated code or content**. My operations are governed by these unbreakable safeguards:

1. **AST-Based Operations**: All code modifications are performed on an Abstract Syntax Tree (AST). This ensures only specific, violating nodes are altered, while all other code, comments, and structure are perfectly preserved.
2. **Diff/Patch Previews**: All proposed changes are first presented as a `git diff`-style preview. No change is applied without an explicit preview.
3. **Atomic Writes**: Changes are written to a temporary file (`file.ts.tmp`) and then atomically renamed to replace the original file. This prevents file corruption from interrupted writes.
4. **Change Threshold Sanity Check**: Any automated change affecting over 80% of a file is flagged as a high-risk operation requiring manual confirmation.

---

## 30. 📄 MIGRATION_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To provide a structured, tag-based system for tracking the compliance status of every file in the codebase as it is migrated to the v15.0 standards.

### Principles

1. **Everything is Tracked:** Every file must have a known state.
2. **State is Explicit:** A file's compliance status is declared via a metadata tag.
3. **Progression is Linear:** Files progress through a defined lifecycle.

### The Migration Tags

| Tag                           | Description                                                     | Next Action by Agent                                       |
| ----------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| `Status: Untagged`            | Initial state. File has not been assessed.                      | Assess, add header, set to `Pending`.                      |
| `Status: Pending`             | Header added, but not fully analyzed for violations.            | Run full analysis, set to `Needs-Refactor` or `Ready`.     |
| `Status: Needs-Refactor`      | The file has known violations that are safe to autofix.         | Run autofix script upon request (`--apply`).               |
| `Status: Needs-Manual-Review` | The file has complex violations (e.g., tenancy gap).            | Report detailed findings for a human developer to resolve. |
| `Status: Ready`               | The file is 100% compliant with all applicable v15.0 standards. | Monitor for regressions.                                   |
| `Status: Legacy`              | The file is part of a system scheduled for deprecation.         | Ignore during refactoring runs.                            |

---

## 31. 📄 REFACTOR_AUTOFIX_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To explicitly define which compliance violations are "safe" for the Master Compliance Agent to fix automatically.

### Principles

1. **Safety First:** An automatic fix must have a near-zero probability of changing runtime behavior.
2. **High Confidence Only:** Any ambiguity prevents an autofix.
3. **AST-Based:** All autofixes MUST be AST transformations.

### The "Safe to Autofix" List

- ✅ **Import Ordering & `import type` Promotion**
- ✅ **Adding a Missing File Header**
- ✅ **Variable Casing and Canonical ID Renaming** (`tenantId` -> `networkId`)
- ✅ **Zod Schema Suffix Addition**
- ✅ **Wrapping API Handlers** (e.g., adding `withTelemetry`)
- ✅ **Standardizing Error Responses** (replacing manual `Response.json` in `catch` blocks)
- ✅ **Removing Unused Imports**
- ✅ **Replacing Hardcoded Role Strings** with imported constants

### The "Manual Review Required" List (Do NOT Autofix)

- ❌ **Tenancy Gaps** (e.g., missing `.where('networkId', ...)` clause)
- ❌ **RBAC Logic Flaws**
- ❌ **Cross-Layer Boundary Violations** (requires moving files)
- ❌ **Illegal Barrel File Removal** (requires refactoring all importers)
- ❌ **Missing Audit Trail Calls**

---

## 32. 📄 FILETAG_METADATA_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define the exact format for metadata tags within a file's header block, making them reliably parsable.

### The Standard Tag Format

Tags are embedded within the main JSDoc file header under a `@meta` annotation:

```typescript
/**
 * @fileoverview ...
 * @layer ...
 *
 * @meta
 *   // -- Migration & Compliance Tags --
 *   Status: Ready
 *   Last-Checked: 2025-11-20T10:00:00Z
 *   Checked-By: FRESH-Engine-v15.0
 *
 *   // -- Contextual Tags --
 *   Owner: team-api-core
 *   Risk: Low
 */
```

- **Format:** `Key: Value`. The key is case-insensitive, followed by a colon.
- **Required Tags:**
  - `Status:` Must be from `MIGRATION_STANDARD`.
  - `Last-Checked:` An ISO 8601 timestamp.
  - `Checked-By:` The agent name and version.

---

## 33. 📄 MANIFEST_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define the structure of `migration-manifest.csv`, the master dashboard for the codebase compliance effort.

### Principles

1. **Single Source of Truth:** The manifest provides an at-a-glance view of project-wide compliance.
2. **Agent-Managed:** The manifest is owned by the agent. Humans should not edit it.
3. **Machine-Readable:** Simple CSV format for easy parsing and import into spreadsheets.

### The Standard CSV Format

The file `migration-manifest.csv` MUST contain these columns:

1. `file_path`
2. `file_hash` (SHA-256 of file content)
3. `layer` (integer `0-3`, or `-1` for pending)
4. `status` (e.g., `Ready`, `Needs-Refactor`)
5. `violation_count_critical` (integer)
6. `violation_count_high` (integer)
7. `last_checked_by`
8. `last_checked_at` (ISO 8601 timestamp)

---

## 34. 📄 AGENT_HANDOFF_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define the contract for how the Master Compliance Agent "hands off" its findings to other systems (humans or machines).

### Principles

1. **Actionability:** Handoff artifacts must be easy to understand and act upon.
2. **Self-Contained:** A report should contain all necessary context to understand a problem.
3. **Formats for Purpose:** Markdown for humans, JSON for machines.

### The Standard Handoff Artifacts

#### A. For Human Review: `refactor-plan.md`

- **Structure:**
  1. **Executive Summary:** High-level statistics.
  2. **Violations by Severity:** Files grouped by highest violation severity (Criticals first).
  3. **Detailed File Reports:** For each violating file, a list of its violations, each with the standard it breaks, its severity, and a precise `diff` block showing the proposed fix.

#### B. For Machine Consumption: `refactor-plan.json` (optional)

- A structured JSON output of all findings, intended for CI/CD integration or custom dashboards.

#### C. For Tracking: `migration-manifest.csv`

- The updated manifest is the persistent record of the project's compliance state.

---

## 35. 📄 PR_GUARDRAILS_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define automated, non-negotiable checks that every Pull Request must pass before merging.

### Principles

1. **Automation is King:** Machines handle syntax, style, and regression testing.
2. **No Red, No Merge:** A failing status check is a hard blocker.
3. **Clarity of Failure:** The agent's PR comment must provide a clear reason and a link to the failing log.

### The Rules: Required Status Checks

Every PR against `main` MUST have these GitHub status checks pass:

1. ✅ `ci-pipeline / lint-and-build`
2. ✅ `ci-pipeline / unit-tests-and-coverage`
3. ✅ `ci-pipeline / firebase-rules-validation`
4. ✅ `ci-pipeline / dependency-cycle-check`
5. ✅ **`fresh-guard / tenancy-and-security-preview`**: A dedicated, lightweight agent run on the diff.

---

## 36. 📄 CI_PIPELINE_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define the structure and jobs of the Continuous Integration (CI) pipeline, ensuring every commit is validated through a consistent, repeatable process.

### Principles

1. **Fail Fast:** Cheaper checks run first.
2. **Parallelize:** Run independent jobs in parallel.
3. **Deterministic:** The CI environment must be containerized.

### The Standard Pipeline Structure (`.github/workflows/ci.yml`)

- **Trigger:** `on: [push, pull_request]`
- **Job Graph:**
  1. `install-deps` (runs first)
  2. `lint-and-build` (depends on `install`)
  3. `unit-tests-and-coverage`, `firebase-rules-validation`, `dependency-cycle-check` (run in parallel, depend on `lint-and-build`)
  4. `e2e-tests` (runs last, only on PRs against `main`)

---

## 37. 📄 BRANCH_PROTECTION_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To programmatically enforce quality and security on our most important branches (`main` and `develop`) via repository settings.

### Principles

1. **`main` is Production:** The `main` branch must always be deployable. Direct pushes are forbidden.
2. **Review is Mandatory:** No code merges without at least one other human's review.
3. **Machines Validate First:** Human review is only possible after all automated checks pass.

### The Rules: Branch Protection Settings for `main`

- `Require a pull request before merging`: **ENABLED**
  - `Require approvals`: **1**
  - `Dismiss stale approvals when new commits are pushed`: **ENABLED**
- `Require status checks to pass before merging`: **ENABLED**
  - `Require branches to be up to date before merging`: **ENABLED**
  - `Status checks that are required`: MUST list all checks from `PR_GUARDRAILS_STANDARD`, especially `fresh-guard / tenancy-and-security-preview`.
- `Include administrators`: **ENABLED**. No one can bypass these rules.

---

## 38. 📄 VERSIONING_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process  
**Purpose:** To define a strict, automated process for versioning, releasing, and generating changelogs.

### Principles

1. **Semantic Versioning (SemVer):** We follow `MAJOR.MINOR.PATCH`.
2. **Conventional Commits:** All PR titles (squash-and-merge) MUST follow the Conventional Commits specification.
3. **Automation, Not Opinion:** The decision to bump a version and the content of the changelog are determined automatically by commit history.

### The Rules

- **Commit Message Format:** `type(scope): description`
  - `feat`: a new feature -> `MINOR` bump.
  - `fix`: a bug fix -> `PATCH` bump.
  - `BREAKING CHANGE:` in footer -> `MAJOR` bump.
  - Other types (`docs`, `style`, `refactor`, `test`, `chore`) do not trigger a release.
- **Release Process:** A CI job (`on push to main`) uses `semantic-release` to:
  1. Analyze commits since the last release.
  2. Determine the next version number.
  3. Generate/update `CHANGELOG.md`.
  4. Create a new Git tag (e.g., `v15.1.0`).
  5. Create a GitHub Release for that tag.

---

**This completes Section 5: Agents, Automation & Process Standards (11 standards). All 38 standards are now complete.**
