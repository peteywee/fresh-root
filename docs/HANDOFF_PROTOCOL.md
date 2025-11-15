# 🤝 Handoff Protocol — Agent Collaboration

## Overview

This document enables seamless handoff between agents (or sessions) during v15 refactoring.

---

## State Files

### `.refactor-manifest.json`

**Purpose**: Complete audit trail of all transformations  
**Location**: Repository root  
**Read by**: Any agent/session  
**Includes**:

- Files transformed
- Transformation type
- Change hashes
- Backup paths
- Rollback key
- Timestamps

**Access**:

```bash
cat .refactor-manifest.json | jq '.'
```

### `.refactor-interactive-state.json`

**Purpose**: Workflow progress persistence  
**Location**: Repository root  
**Read by**: Interactive orchestrator  
**Includes**:

- Current phase number
- Completed phases array
- Rollback key
- Start time
- Paused state

**Access**:

```bash
cat .refactor-interactive-state.json | jq '.'
```

### `.refactor-diffs.md`

**Purpose**: Human-readable proposed changes  
**Location**: Repository root  
**Read by**: Human reviewers  
**Format**: Unified diff + markdown

**Access**:

```bash
less .refactor-diffs.md
```

### `.refactor-backups/` directory

**Purpose**: Backup storage for all transformed files  
**Location**: Repository root  
**Structure**: `<fileHash>` → backup content  
**Access**:

```bash
ls -la .refactor-backups/
```

---

## Handoff Scenarios

### Scenario 1: Pause and Resume Interactive

```bash
# Session 1: Start interactive, complete phases 1-2
$ pnpm refactor:interactive
# User: [1] execute → [1] execute → [6] save & exit

# Auto-saves to: .refactor-interactive-state.json
# {
#   "currentPhase": 2,
#   "completedPhases": ["Phase 1: Plan Only", "Phase 2: Dry Run"],
#   "startTime": "2025-11-15T14:58:00.000Z",
#   "paused": true
# }

# ... Time passes, context switches ...

# Session 2: Resume from where we left off
$ pnpm refactor:interactive
# Auto-loads state, shows Phase 3 as current
# All previous phases show as ✅ COMPLETED
```

### Scenario 2: Human Review Before Apply

```bash
# Agent 1: Planning Phase
$ pnpm refactor:plan
# Generates: .refactor-diffs.md, .refactor-manifest.json

# Human: Review diffs
$ less .refactor-diffs.md
# Decision: "Changes look good, apply them"

# Agent 2: Execution Phase (different session)
$ pnpm refactor:apply
# Reads backups, applies transformations
# Updates manifest with completion timestamp
```

### Scenario 3: Rollback and Retry

```bash
# Agent 1: Apply transformations
$ pnpm refactor:apply
# Generated manifest with rollback key: abc123

# Discovery: "Something isn't right, need to roll back"

# Agent 2: Rollback phase
$ pnpm refactor:rollback
# Reads manifest, locates backups, restores files
# Clears state file for clean restart

# Agent 3: Retry with different approach
$ pnpm refactor:plan
# Re-analyzes, generates new plan
```

---

## Handoff Protocol

### State Check

Before starting, any agent should verify:

```bash
# 1. Check manifest
cat .refactor-manifest.json | jq '.summary'

# 2. Check interactive state
cat .refactor-interactive-state.json | jq '.'

# 3. Check if backups exist
ls .refactor-backups/ | wc -l

# 4. Check git status
git status
```

### Decision Tree

```text
START
  │
  ├─ Manifest exists?
  │  ├─ YES: Check completion
  │  │    ├─ All phases done?
  │  │    │  ├─ YES → v15 ready for commit
  │  │    │  └─ NO → Resume from last phase
  │  │    └─ No backups?
  │  │       └─ Clean state, re-plan
  │  │
  │  └─ NO: First run
  │     └─ Start Phase 1 (plan)
  │
  ├─ Interactive state exists?
  │  ├─ YES: Paused?
  │  │    ├─ YES → Resume from current phase
  │  │    └─ NO → Shouldn't happen, delete & restart
  │  │
  │  └─ NO: Fresh session
  │     └─ Start Phase 1
  │
  └─ READY: Choose action
     ├─ Execute phase
     ├─ Skip to next
     ├─ Jump to specific
     ├─ Rollback all
     └─ Exit & save
```

---

## Multi-Agent Workflow

### Architecture

```text
┌────────────────────────────────────────┐
│  CI/CD Pipeline Trigger                │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Agent 1: Analyzer                     │
│  • Run: pnpm refactor:plan              │
│  • Output: .refactor-manifest.json      │
│  • Output: .refactor-diffs.md           │
│  • Action: Commit files to review PR    │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Human: Code Review                    │
│  • Read: .refactor-diffs.md             │
│  • Decision: Approved ✅                │
│  • Signal: PR merge / workflow trigger  │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Agent 2: Executor                     │
│  • Read: .refactor-manifest.json        │
│  • Run: pnpm refactor:apply             │
│  • Verify: pnpm qa:full                 │
│  • Output: Updated codebase             │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Agent 3: Committer                    │
│  • Read: .refactor-manifest.json        │
│  • Action: git add . && git commit      │
│  • Signal: v15 refactoring complete     │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  All Downstream Tests                  │
│  • Pre-commit hooks auto-run            │
│  • CI pipeline validates                │
│  • Deployment proceeds                  │
└────────────────────────────────────────┘
```

### Agent Responsibilities

## Agent 1: Analyzer

```bash
# Responsibilities:
# 1. Check current state
# 2. Generate transformation plan
# 3. Create manifest and diffs
# 4. Signal completion to next agent

pnpm refactor:plan
# Generates: .refactor-manifest.json, .refactor-diffs.md
```

## Agent 2: Executor

```bash
# Responsibilities:
# 1. Verify backups before applying
# 2. Apply transformations
# 3. Generate backup registry
# 4. Create rollback capability

pnpm refactor:dry-run  # First verify
pnpm refactor:apply    # Then execute
```

## Agent 3: Verifier

```bash
# Responsibilities:
# 1. Run all quality gates
# 2. Verify no regressions
# 3. Check manifest integrity
# 4. Signal success/failure

pnpm qa:full
cat .refactor-manifest.json | jq '.changes | length'
```

## Agent 4: Committer

```bash
# Responsibilities:
# 1. Stage transformed files
# 2. Create commit message
# 3. Push to repository
# 4. Trigger downstream workflows

git add .
git commit -m "chore: v15 refactoring ($(date))"
git push origin dev
```

---

## Handoff Checklist

### Before Handoff

- [ ] Current phase is complete
- [ ] Manifest saved (.refactor-manifest.json exists)
- [ ] Backups created (or not applicable)
- [ ] No uncommitted git changes (except .refactor-\* files)
- [ ] State file updated (.refactor-interactive-state.json)
- [ ] Quality gates passing (if applicable)

### Information to Provide

```bash
# Share these with next agent:
cat .refactor-manifest.json | jq '.summary'
cat .refactor-interactive-state.json | jq 'currentPhase, completedPhases'
```

### Next Agent Actions

```bash
# 1. Check what was done
cat .refactor-manifest.json | jq '.changes[] | {filePath, type}'

# 2. Determine next step
cat .refactor-interactive-state.json | jq '.currentPhase'

# 3. Proceed
pnpm refactor:interactive
# Or: pnpm refactor:apply
# Or: pnpm qa:full
```

---

## Recovery Protocols

### If Something Goes Wrong

```bash
# 1. Check current state
git status
cat .refactor-manifest.json | jq '.summary'

# 2. Decide recovery path
if [ -f .refactor-manifest.json ]; then
  echo "Manifest exists - can rollback"
  pnpm refactor:rollback
else
  echo "No manifest - use git"
  git restore .
fi

# 3. Verify recovery
git status
pnpm qa:full

# 4. Log incident
echo "Incident: [description]" >> .refactor-recovery.log
```

### Clean Restart

```bash
# 1. Remove all refactor files
rm -rf .refactor-*

# 2. Reset git
git restore .

# 3. Verify clean state
git status  # Should be clean
ls -la | grep refactor  # Should be empty

# 4. Start fresh
pnpm refactor:plan
```

---

## Communication Template

### When Handing Off

```markdown
## v15 Refactoring Handoff

**From**: [Your Name/Agent Name]
**To**: [Next Agent/Team]
**Timestamp**: [ISO 8601]
**Status**: ✅ Ready for next phase

### Current Progress

- Phase 1: ✅ COMPLETE
- Phase 2: ✅ COMPLETE
- Phase 3: ⏳ READY
- Phase 4: ⏳ QUEUED

### Files Transformed

- 6 files (import-reorder)
- Backups: 6 created
- Rollback Key: 4eebc5352c7ee7a2d8ed0d3762b3c013

### Manifest Location

- `.refactor-manifest.json` — Full audit trail
- `.refactor-diffs.md` — Proposed changes
- `.refactor-interactive-state.json` — Progress state

### Next Steps

1. Review `.refactor-diffs.md` (optional)
2. Run `pnpm refactor:apply`
3. Run `pnpm qa:full`
4. Commit when ready

### Critical Info

- Rollback available: YES
- Memory overhead: LOW (~100MB)
- Test impact: NONE (tests passing)
- Time estimate: ~5 minutes

### Questions?

- Refer to: `docs/INTERACTIVE_WORKFLOW.md`
- Quick ref: `docs/REFACTOR_QUICKSTART.md`
```

---

## File Dependency Map

```text
.refactor-manifest.json (source of truth)
├── Read by: Any agent, CI systems, status checkers
├── Generated by: refactor:plan, refactor:dry-run, refactor:apply
└── Critical for: Rollback capability, audit trail

.refactor-interactive-state.json (session persistence)
├── Read by: Interactive orchestrator
├── Generated by: Interactive orchestrator
├── Used for: Resume workflows, track progress
└── Safe to delete: If starting fresh

.refactor-diffs.md (human review)
├── Read by: Developers, code reviewers
├── Generated by: refactor:plan, refactor:dry-run
├── Used for: Decision making, documentation
└── Safe to delete: After review

.refactor-backups/ (file recovery)
├── Read by: refactor:rollback
├── Generated by: refactor:dry-run, refactor:apply
├── Used for: Emergency rollbacks
└── Safe to delete: After v15 commit + verification
```

---

## Best Practices

1. **Always read manifest first** before starting work
2. **Commit manifest files** to repository for audit trail
3. **Use state file** for resuming interrupted workflows
4. **Keep rollback keys** safe (in manifest)
5. **Delete old backups** after successful commit
6. **Log handoffs** in team channel or PR
7. **Verify clean state** before handing off

---

**Document**: Handoff Protocol v1.0  
**Status**: Production Ready  
**Last Updated**: 2025-11-15
