---
title: "VS Code Tasks Configuration"
description: "Guide to configuring and running VS Code tasks for development workflows"
keywords:
  - vscode
  - tasks
  - automation
  - development
category: "guide"
status: "active"
audience:
  - developers
related-docs:
  - QUICK_START.md
  - SETUP.md
---

# VS Code Tasks Configuration

This document describes the available VS Code tasks for the Fresh-Root project.

## Using Tasks in VS Code

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and search for "Tasks: Run Task" to see all
available tasks.

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

| Task                    | Command                                        | Purpose                                                       |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| **Build (all)**         | `pnpm -w build`                                | Build all packages and apps                                   |
| **Docs: Markdown Lint** | Markdown linting with auto-fix                 | Validate and fix markdown formatting (`pnpm run docs:md-fix`) |
| **Tag: Auto-tag Files** | `node scripts/tag-files.mjs`                   | Auto-tag files with priority/area/component headers           |
| **Audit: Nesting**      | `node scripts/audit/nesting-audit.mjs`         | Prevent double-nesting import errors                          |
| **Index: File Index**   | `scripts/index/generate-file-index.sh --write` | Generate and update file index                                |

### New: Cleanup

| Task                                 | Command                                | Purpose                                                          |
| ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| **Cleanup: Remove Legacy Artifacts** | `bash scripts/cleanup/full-cleanup.sh` | Remove v14 legacy files, emulator data, temp files (interactive) |

### New: Quality Gates

| Task                              | Command                                       | Purpose                                                           |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| **Quality: Check Doc Parity**     | `node scripts/ci/check-doc-parity.mjs`        | Validate all API routes and schemas have docs and TEST SPEC links |
| **Quality: Verify Tests Present** | `node scripts/tests/verify-tests-present.mjs` | Ensure API routes and core modules have test coverage             |

### New: Documentation

| Task                                       | Command                                       | Purpose                                                      |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------ |
| **Docs: Generate Mini-Index (Schemas)**    | `node scripts/migration/gen-mini-indexes.mjs` | Generate mini-index for Zod schemas (consolidated reference) |
| **Docs: Generate Mini-Index (API Routes)** | `node scripts/migration/gen-mini-indexes.mjs` | Generate mini-index for API routes (consolidated reference)  |

### New: Migration Tools

| Task                                 | Command                                       | Purpose                                                  |
| ------------------------------------ | --------------------------------------------- | -------------------------------------------------------- |
| **Migration: Check v15 Readiness**   | `node scripts/migration/migration-status.mjs` | Validate v15 migration readiness (7 quality checks)      |
| **Migration: Generate Mini-Indexes** | `node scripts/migration/gen-mini-indexes.mjs` | Generate schema and API route mini-indexes for migration |

## Setup: Adding Tasks to VS Code

The tasks are configured in `.vscode/tasks.json` (which is `.gitignore`d). All new tasks are
automatically included:

- ✅ Quality Gate Tasks (Doc Parity, Test Coverage)
- ✅ Migration Tools (v15 Readiness, Mini-Indexes)
- ✅ Cleanup Tasks (Legacy Artifacts)

To manually add a task, press `Ctrl+Shift+D` (or `Cmd+Shift+D`), click "Configure Task", and add to
the `tasks` array in `.vscode/tasks.json`.

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
# Type checking
pnpm -w typecheck

# Unit tests
pnpm test

# Firebase rules tests
pnpm -w test:rules

# E2E tests
pnpm -w test:e2e

# Quality gates (via VS Code tasks or CLI)
node scripts/ci/check-doc-parity.mjs
node scripts/tests/verify-tests-present.mjs

# Generate/update mini-indexes
node scripts/migration/gen-mini-indexes.mjs

# Migration readiness check
node scripts/migration/migration-status.mjs

# Optional: cleanup legacy files
bash scripts/cleanup/full-cleanup.sh
```

## Available Helper Scripts

| Script                                   | Purpose                                               |
| ---------------------------------------- | ----------------------------------------------------- |
| `scripts/ci/check-doc-parity.mjs`        | Validate API routes/schemas have docs and TEST SPECs  |
| `scripts/tests/verify-tests-present.mjs` | Check test file coverage (onboarding, rules, schemas) |
| `scripts/migration/migration-status.mjs` | Validate v15 migration readiness (7 checks)           |
| `scripts/migration/gen-mini-indexes.mjs` | Generate schema and API route mini-indexes            |
| `scripts/lint/lean.sh`                   | Lean ESLint pass (skips legacy/vendor)                |
| `scripts/cleanup/full-cleanup.sh`        | Remove legacy v14 artifacts                           |
| `scripts/audit/nesting-audit.mjs`        | Audit for import nesting errors                       |

---

**For more info on tasks.json configuration**, see:

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- `.vscode/tasks.json` (local workspace configuration)
