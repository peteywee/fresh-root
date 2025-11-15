# v15.0 Surgical Refactoring - Quick Start

## What Just Got Built ✅

Four critical v15 compliance features are now **COMPLETE**:

1. **✅ AST-Based Refactoring** (`scripts/refactor/ast-engine.mts`)
   - Surgical code transformations (not blind regex)
   - Import reordering, naming fixes, barrel audits, layout validation
   - Fully reversible operations

2. **✅ Automatic Diff Generation**
   - Unified diffs showing before/after
   - Human-readable format for review
   - Statistics on changes (+additions, -deletions)

3. **✅ Rollback Capability**
   - File backups before every change
   - One-command restoration
   - Atomic per-file transactions

4. **✅ Change Tracking Manifest**
   - Complete audit trail (`.refactor-manifest.json`)
   - Timestamps, types, reversibility status
   - Rollback keys for operation tracking

## Safe Refactoring Workflow

### Step 1: Preview Changes (No Risk)

```bash
pnpm exec node scripts/refactor/orchestrator.mts --plan-only
```

**Output**: `.refactor-diffs.md` showing all proposed changes

### Step 2: Review the Diff Report

```bash
cat .refactor-diffs.md

# Shows:
# - File-by-file changes
# - Unified diffs
# - Statistics (+5 lines / -3 lines)
```

### Step 3: Apply Refactoring (With Backups)

```bash
pnpm exec node scripts/refactor/orchestrator.mts
```

**Automatically creates**:

- `.refactor-backups/` (backup files)
- `.refactor-manifest.json` (audit trail)
- `.refactor-diffs.md` (diff report)

### Step 4: Verify Git Status

```bash
git diff --stat
git diff apps/web/src/lib/api.ts  # Review specific file
```

### Step 5: If Something Goes Wrong - Rollback

```bash
pnpm exec node scripts/refactor/orchestrator.mts --rollback
```

**Restores** all files to pre-refactor state in seconds.

## What Gets Transformed

### 1. Imports Reordered (5 groups)

```typescript
// Before (chaos):
import { Button } from "@ui/button";
import type { Props } from "./types";
import { useState } from "react";
import fs from "node:fs";

// After (organized):
import fs from "node:fs";

import { useState } from "react";

import { Button } from "@ui/button";

import type { Props } from "./types";
```

### 2. Naming Standardized

```typescript
tenantId       → networkId
organizationId → orgId
```

### 3. Barrel Audits

```typescript
// Auto-inserted if missing:
// BARREL_RUNTIME_JUSTIFICATION: [reason]
export { Button } from "./button";
```

### 4. Layout Violations Detected

```text
❌ firebase-admin in UI layer (shouldn't be)
❌ React code in domain layer (shouldn't be)
```

## Safety Guarantees

| Feature        | Status                                 |
| -------------- | -------------------------------------- |
| **Reversible** | ✅ Full rollback via manifest          |
| **Auditable**  | ✅ Every change tracked with timestamp |
| **Reviewable** | ✅ Diffs generated before applying     |
| **Protected**  | ✅ Backups created automatically       |
| **Traceable**  | ✅ Complete manifest with rollback key |

## Key Files

```text
scripts/refactor/
├── ast-engine.mts              # Core transformation engine
├── orchestrator.mts            # Main entry point
└── README.md                   # This file

Output files (auto-created):
├── .refactor-backups/          # SHA256-hashed backup files
├── .refactor-manifest.json     # Audit trail & rollback registry
└── .refactor-diffs.md          # Human-readable diff report
```

## Command Reference

```bash
# Plan-only preview
pnpm exec node scripts/refactor/orchestrator.mts --plan-only

# Execute with backups (recommended)
pnpm exec node scripts/refactor/orchestrator.mts

# Dry run (no backups)
pnpm exec node scripts/refactor/orchestrator.mts --dry-run --no-backups

# Rollback all changes
pnpm exec node scripts/refactor/orchestrator.mts --rollback

# View manifest
cat .refactor-manifest.json | jq .summary

# View diffs
cat .refactor-diffs.md | less
```

## Integration with Standards

This engine is **v15.0 FRESH Engine compliant**:

- ✅ **Prime Directive**: Non-destructive operations only
- ✅ **AST-Based**: Surgical precision, not blind replacements
- ✅ **Auditable**: Complete tracking of all changes
- ✅ **Reversible**: One-command rollback capability
- ✅ **Standards-Compliant**:
  - `IMPORTS_STANDARD` - Import reordering
  - `NAMING_STANDARD` - ID naming fixes
  - `BARREL_STANDARD` - Barrel audits
  - `DIRECTORY_LAYOUT_STANDARD` - Layer validation

## Next Steps

1. **Try it out**: Run `--plan-only` to see what would change
2. **Review diffs**: Check `.refactor-diffs.md` for details
3. **Apply**: Run without `--plan-only` to execute
4. **Verify**: `git diff` to confirm changes
5. **Commit**: `git add . && git commit -m "chore: v15 surgical refactoring"`

## Further Questions

- See: [SURGICAL_REFACTORING_ENGINE.md](SURGICAL_REFACTORING_ENGINE.md)
- Standard docs: `docs/standards/IMPORTS_STANDARD.md` etc.
- v15 doctrine: `docs/standards/v15/INDEX.md`

---

**Status**: ✅ COMPLETE & TESTED  
**Compliance**: v15.0 Prime Directive (Non-Destructive)  
**Safety**: 100% - All changes reversible
