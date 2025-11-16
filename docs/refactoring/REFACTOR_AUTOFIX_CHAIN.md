# Refactor Autofix Chain Guide

## Overview

The refactor tasks now support automatic sequential handoff between layers. When you run an autofix task, it automatically chains through all layers and generates a final report.

---

## Quick Start

### Option 1: Run Individual Layer Autofix

Run any "Apply" task to autofix a single layer:

```bash
Ctrl+Shift+B → "Refactor: Apply (Layer 00 - Domain)"
```

This applies compliance fixes to that layer only.

### Option 2: Run Full Autofix Chain (Recommended)

```bash
Ctrl+Shift+B → "Refactor: Autofix All (Sequential Chain)"
```

This executes the complete chain:

```text
Layer 00 (Domain)
    ↓
Layer 01 (Rules)
    ↓
Layer 02 (API)
    ↓
Layer 03 (UI)
    ↓
Final Report
```

---

## Task Execution Order

When you start the **"Refactor: Autofix All (Sequential Chain)"** task:

1. **Layer 00 - Domain** starts first
   - Analyzes and applies compliance fixes
   - Command: `node scripts/refactor-all.mjs 0 --apply`

2. **Layer 01 - Rules** waits for Layer 00
   - Cannot start until Layer 00 completes
   - Command: `node scripts/refactor-all.mjs 1 --apply`
   - Depends on: `Refactor: Apply (Layer 00 - Domain)`

3. **Layer 02 - API** waits for Layer 01
   - Cannot start until Layer 01 completes
   - Command: `node scripts/refactor-all.mjs 2 --apply`
   - Depends on: `Refactor: Apply (Layer 01 - Rules)`

4. **Layer 03 - UI** waits for Layer 02
   - Cannot start until Layer 02 completes
   - Command: `node scripts/refactor-all.mjs 3 --apply`
   - Depends on: `Refactor: Apply (Layer 02 - API)`

5. **Final Report** waits for Layer 03
   - Displays first 50 lines of `refactor-plan.md`
   - Depends on: `Refactor: Apply (Layer 03 - UI)`

---

## Understanding the Output

### During Execution

Each layer will show:

```text
📚 Loading standards...           # Loading compliance standards
🔎 Discovering files...           # Finding files in layer
📊 Analyzing files...             # Analyzing for violations
✏️  Applying fixes...              # Writing changes to files
📝 Generating report...           # Creating compliance report
✅ Report written to: refactor-plan.md
```

### After Completion

The final task displays:

```text
✅ Compliance refactoring complete!

📋 Generated Report:
[First 50 lines of refactor-plan.md]
```

To see the full report, open `refactor-plan.md` in your editor.

---

## Available Tasks

| Task                                       | Purpose               | Mode                      |
| ------------------------------------------ | --------------------- | ------------------------- |
| `Refactor: Apply (Layer 00 - Domain)`      | Autofix Layer 00 only | Standalone or chain start |
| `Refactor: Apply (Layer 01 - Rules)`       | Autofix Layer 01      | Depends on Layer 00       |
| `Refactor: Apply (Layer 02 - API)`         | Autofix Layer 02      | Depends on Layer 01       |
| `Refactor: Apply (Layer 03 - UI)`          | Autofix Layer 03      | Depends on Layer 02       |
| `Refactor: Autofix All (Sequential Chain)` | Full chain + report   | Depends on Layer 03       |

---

## Workflow Examples

### Example 1: Quick Fix for One Layer

You only want to fix naming conventions in API routes:

```bash
Ctrl+Shift+B → "Refactor: Apply (Layer 02 - API)"
```

Fixes apply immediately to Layer 02. No dependencies triggered.

### Example 2: Full Compliance Refresh

You want all layers to be compliant:

```bash
Ctrl+Shift+B → "Refactor: Autofix All (Sequential Chain)"
```

All 4 layers process automatically in order, then final report appears.

### Example 3: Manual Sequential Execution

You want to control the pace:

```bash
# First, run Layer 00
Ctrl+Shift+B → "Refactor: Apply (Layer 00 - Domain)"
[Wait for completion, review changes]

# Then Layer 01
Ctrl+Shift+B → "Refactor: Apply (Layer 01 - Rules)"
[Wait for completion, review changes]

# Then Layer 02
Ctrl+Shift+B → "Refactor: Apply (Layer 02 - API)"
[Wait for completion, review changes]

# Finally Layer 03
Ctrl+Shift+B → "Refactor: Apply (Layer 03 - UI)"
[Review final changes, then see report]
```

---

## After Running Autofix

### 1. Review Generated Report

Open `refactor-plan.md` to see:

- Summary of all violations found
- Violations grouped by layer
- Count by severity (Critical, High, Medium, Low)
- Execution plan

### 2. Validate Changes

```bash
# Typecheck for TypeScript errors
pnpm -w typecheck

# Lint and format
pnpm -w lint --fix
pnpm -w format

# Run tests
pnpm test
pnpm test:rules
pnpm test:e2e
```

### 3. Commit & Push

```bash
git add .
git commit -m "chore: apply compliance refactors to all layers"
git push
```

---

## Troubleshooting

### Task Fails / Doesn't Progress

1. Check that all previous layers completed successfully
2. Look at the terminal output for specific errors
3. Verify `refactor-plan.md` was created
4. Check file permissions: `ls -la refactor-plan.md`

### No Changes Applied

- Run `Refactor: Compliance Analysis (all layers)` first to see violations
- If no violations found, all files are already compliant ✅

### Chain Stops at Specific Layer

- That layer had an error or issue
- Review the task output in the terminal
- Try running that layer individually to diagnose

---

## Related Documentation

- `.github/agents/refactor-compliance.agent.md` — Master agent configuration
- `.vscode/master-compliance-standard.md` — v14.6 standards reference
- `scripts/refactor-all.mjs` — Batch processing script
- `refactor-plan.md` — Generated compliance report (created after each run)

---

**Last Updated**: 2025-11-15  
**Status**: Ready for production use
