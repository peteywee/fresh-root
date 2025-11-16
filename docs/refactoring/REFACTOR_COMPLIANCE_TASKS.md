# Refactor Compliance Agent - VS Code Tasks

Quick reference for using the Refactor Compliance Agent through VS Code tasks.

## Available Tasks

All tasks are accessible via **Terminal → Run Task** (Ctrl+Shift+B on Linux/Windows, Cmd+Shift+B on Mac).

### Analysis Tasks

#### Refactor: Compliance Analysis (all layers)

Analyzes all 4 architectural layers for standards compliance.

- **Command**: `node scripts/refactor-all.mjs all`
- **Output**: Generates `refactor-plan.md` with all violations
- **Use when**: You want a complete baseline of all compliance issues

#### Refactor: Compliance Analysis (Layer 00 - Domain)

Detailed analysis of Layer 00 (types, schemas, constants, core models).

- **Command**: `node scripts/refactor-all.mjs 0 --verbose`
- **Files analyzed**: ~57 files
- **Focus**: Domain models, type definitions, constants

#### Refactor: Compliance Analysis (Layer 01 - Rules)

Detailed analysis of Layer 01 (Firestore rules, validators, policies).

- **Command**: `node scripts/refactor-all.mjs 1 --verbose`
- **Files analyzed**: ~19 files
- **Focus**: Security rules, validation logic

#### Refactor: Compliance Analysis (Layer 02 - API)

Detailed analysis of Layer 02 (API routes, server actions, middleware).

- **Command**: `node scripts/refactor-all.mjs 2 --verbose`
- **Files analyzed**: ~42 files
- **Focus**: Route handlers, server logic

#### Refactor: Compliance Analysis (Layer 03 - UI)

Detailed analysis of Layer 03 (React components, pages, layouts).

- **Command**: `node scripts/refactor-all.mjs 3 --verbose`
- **Files analyzed**: ~51 files
- **Focus**: Components, pages, layouts

### Preview Tasks

#### Refactor: Preview Changes (dry-run all)

Preview all proposed compliance refactors without applying any changes.

- **Command**: `node scripts/refactor-all.mjs all --dry-run`
- **Safety**: No files will be modified
- **Use when**: You want to see what changes will be made before applying

### Apply Tasks

#### Refactor: Apply (Layer 00 - Domain)

Apply compliance refactors to Layer 00.

- **Command**: `node scripts/refactor-all.mjs 0 --apply`
- **Recommended**: Run **after** previewing with dry-run
- **Follow up**: Run `pnpm -w typecheck` to validate

#### Refactor: Apply (Layer 01 - Rules)

Apply compliance refactors to Layer 01.

- **Command**: `node scripts/refactor-all.mjs 1 --apply`
- **Recommended**: Apply after Layer 00
- **Follow up**: Run `pnpm test:rules` to validate

#### Refactor: Apply (Layer 02 - API)

Apply compliance refactors to Layer 02.

- **Command**: `node scripts/refactor-all.mjs 2 --apply`
- **Recommended**: Apply after Layer 01
- **Follow up**: Run `pnpm test` to validate

#### Refactor: Apply (Layer 03 - UI)

Apply compliance refactors to Layer 03.

- **Command**: `node scripts/refactor-all.mjs 3 --apply`
- **Recommended**: Apply last
- **Follow up**: Run `pnpm test:e2e` to validate

## Typical Workflow

### 1. Initial Analysis

```text
Run task: "Refactor: Compliance Analysis (all layers)"
↓
Review generated refactor-plan.md
↓
Understand violations by severity and layer
```

### 2. Layer-by-Layer Analysis (optional, for details)

```text
Run task: "Refactor: Compliance Analysis (Layer 00 - Domain)"
↓
Review detailed violations in console
↓
Repeat for Layers 01, 02, 03
```

### 3. Preview Changes (recommended before applying)

```text
Run task: "Refactor: Preview Changes (dry-run all)"
↓
Verify proposed changes look correct
↓
No files are modified in dry-run mode
```

### 4. Apply Refactors (layer by layer)

```text
Run task: "Refactor: Apply (Layer 00 - Domain)"
↓
pnpm -w typecheck  (validate TypeScript)
↓
Run task: "Refactor: Apply (Layer 01 - Rules)"
↓
pnpm test:rules  (validate rules)
↓
Run task: "Refactor: Apply (Layer 02 - API)"
↓
pnpm test  (validate API)
↓
Run task: "Refactor: Apply (Layer 03 - UI)"
↓
pnpm test:e2e  (validate UI)
```

### 5. Final Validation

```bash
pnpm -w typecheck      # All TypeScript valid
pnpm -w lint --fix     # All code formatted
pnpm test              # All unit tests pass
pnpm test:rules        # All security rules pass
pnpm test:e2e          # All E2E tests pass
```

## Understanding the Output

### refactor-plan.md

The main output file containing:

- **Summary**: Total files and violations by severity
- **By Layer**: Breakdown of violations per layer
- **Execution Plan**: Recommended order for applying refactors
- **Validation Checklist**: Steps to verify compliance

### Console Output

Real-time feedback during task execution:

```text
📚 Loading standards...           # Loading 6 standards files
🔎 Discovering files...           # Finding files in layer(s)
📊 Analyzing files...             # Analyzing each file
📝 Generating report...           # Creating report
✅ Report written to: refactor-plan.md
```

### Violation Severity

- 🔴 **Critical**: Build-breaking or security issues
- 🟠 **High**: Architecture violations or permission issues
- 🟡 **Medium**: Consistency and pattern violations
- 🔵 **Low**: Style and formatting issues

## Tips & Tricks

### Quick Layer Analysis

For a quick analysis of just one layer:

1. Press Ctrl+Shift+B
2. Type "Layer 02" to filter tasks
3. Select the layer you want
4. Press Enter

### Combine Tasks in Sequence

Create a compound task in VS Code to run analysis → apply → validate:

**In terminal**:

```bash
# Layer by layer
for layer in 0 1 2 3; do
  echo "=== Layer $layer ==="
  node scripts/refactor-all.mjs $layer --apply
  pnpm -w typecheck
done
```

### Monitor Progress

Keep an eye on the console output to see:

- How many files are discovered in each layer
- Real-time file analysis progress
- Summary statistics (files with violations, violation counts by severity)

## Related Files

- **Agent Configuration**: `.github/agents/refactor-compliance.agent.md`
- **Batch Script**: `scripts/refactor-all.mjs`
- **Standards**: `docs/standards/` (6 authoritative documents)
- **Generated Report**: `refactor-plan.md`

## Troubleshooting

### "No files found to analyze"

- Check that the file patterns in `scripts/refactor-all.mjs` match your codebase
- Verify files exist in the expected paths for the layer
- Layer detection may need adjustment for custom paths

### Task not appearing in list

- Reload VS Code (F1 → "Developer: Reload Window")
- Ensure `.vscode/tasks.json` is saved
- Check JSON syntax is valid

### Changes not as expected

- Always run **dry-run** first to preview
- Check the generated `refactor-plan.md` for specific violations
- Review individual layer analysis with `--verbose` flag

---

**Last Updated**: 2025-11-15
**Agent Version**: v15.0
**Status**: Ready for production use
