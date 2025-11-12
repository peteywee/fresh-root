# VS Code Tasks Configuration

This document describes the available VS Code tasks for the Fresh-Root project.

## Using Tasks in VS Code

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and search for "Tasks: Run Task" to see all available tasks.

## Available Tasks

### Core Development

| Task                  | Command                             | Purpose                                         |
| --------------------- | ----------------------------------- | ----------------------------------------------- |
| **Install (frozen)**  | `pnpm -w install --frozen-lockfile` | Install dependencies with exact versions        |
| **Deps: Check**       | `pnpm -w install --frozen-lockfile` | Verify no deprecated or unmet peer dependencies |
| **Typecheck**         | `pnpm -w typecheck`                 | Run TypeScript type checking across workspaces  |
| **Lint (auto-fix)**   | `pnpm -w lint --fix`                | Run ESLint with auto-fix enabled                |
| **Format (Prettier)** | `pnpm -w format`                    | Format all code with Prettier                   |

### Testing

| Task                       | Command                      | Purpose                              |
| -------------------------- | ---------------------------- | ------------------------------------ |
| **Test (watch)**           | `pnpm test`                  | Run tests in watch mode (background) |
| **Test (run once)**        | `pnpm vitest run`            | Run all tests once and exit          |
| **Test (coverage)**        | `pnpm vitest run --coverage` | Generate coverage report             |
| **Test: Rules (Firebase)** | `pnpm -w test:rules`         | Test Firestore and Storage rules     |
| **Test: E2E (Playwright)** | `pnpm -w test:e2e`           | Run end-to-end tests with Playwright |

### Build & Quality

| Task                    | Command                                        | Purpose                                             |
| ----------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **Build (all)**         | `pnpm -w build`                                | Build all packages and apps                         |
| **Docs: Markdown Lint** | Markdown linting with auto-fix                 | Validate and fix markdown formatting                |
| **Tag: Auto-tag Files** | `node scripts/tag-files.mjs`                   | Auto-tag files with priority/area/component headers |
| **Audit: Nesting**      | `node scripts/audit/nesting-audit.mjs`         | Prevent double-nesting import errors                |
| **Index: File Index**   | `scripts/index/generate-file-index.sh --write` | Generate and update file index                      |

### New: Cleanup

| Task                                 | Command                                | Purpose                                                          |
| ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| **Cleanup: Remove Legacy Artifacts** | `bash scripts/cleanup/full-cleanup.sh` | Remove v14 legacy files, emulator data, temp files (interactive) |

## Setup: Adding Tasks to VS Code

The tasks are configured in `.vscode/tasks.json` (which is `.gitignore`d). To add the cleanup task manually:

1. Press `Ctrl+Shift+D` (or `Cmd+Shift+D`)
2. Click "Configure Task"
3. Select "Create tasks.json from template"
4. Add the following task before the closing `]`:

```json
{
  "label": "Cleanup: Remove Legacy Artifacts",
  "type": "shell",
  "command": "bash scripts/cleanup/full-cleanup.sh",
  "detail": "Remove v14 legacy files, emulator data, and temp files (interactive with confirmation)",
  "isBackground": false,
  "problemMatcher": []
}
```

## Running Tasks from Command Line

All tasks can also be run directly from the terminal:

```bash
# Install dependencies
pnpm -w install --frozen-lockfile

# Run typecheck
pnpm -w typecheck

# Run tests
pnpm test

# Run cleanup
bash scripts/cleanup/full-cleanup.sh
```

## Pre-Commit Hooks

The following checks run automatically before each commit (via Husky):

- ✅ File auto-tagging
- ✅ TypeScript type checking
- ✅ Prettier code formatting

**Note**: ESLint has been moved to GitHub Actions CI for faster local commits.

## Quality Gates Checklist

Before pushing to GitHub, run:

```bash
pnpm -w typecheck       # Type checking
pnpm test               # Unit tests
pnpm -w test:rules      # Firebase rules tests
pnpm -w test:e2e        # E2E tests
bash scripts/cleanup/full-cleanup.sh  # Optional: cleanup legacy files
```

## Available Helper Scripts

| Script                                   | Purpose                                |
| ---------------------------------------- | -------------------------------------- |
| `scripts/ci/check-doc-parity.mjs`        | Validate API routes/schemas have docs  |
| `scripts/tests/verify-tests-present.mjs` | Check test file coverage               |
| `scripts/lint/lean.sh`                   | Lean ESLint pass (skips legacy/vendor) |
| `scripts/cleanup/full-cleanup.sh`        | Remove legacy v14 artifacts            |
| `scripts/audit/nesting-audit.mjs`        | Audit for import nesting errors        |

---

**For more info on tasks.json configuration**, see:

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- `.vscode/tasks.json` (local workspace configuration)
