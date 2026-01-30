# L3 Prompts Deprecation & Archive: Complete

**Date**: January 15, 2026  
**Status**: ✅ COMPLETE

---

## Summary

Successfully removed and unindexed all **13 migrated L3 prompt files** from the active codebase to
eliminate search clutter. Files are preserved in archive for historical reference.

---

## What Was Done

### 1. ✅ Moved Files to Archive

**13 L3 prompt files moved** from `.github/prompts/` to `/archive/l3-prompts-deprecated/`:

```
archive/l3-prompts-deprecated/
├── audit.prompt.md
├── create-implementation-plan.prompt.md
├── deploy.prompt.md
├── document.prompt.md
├── documentation-writer.prompt.md
├── github-copilot-starter.prompt.md
├── implement.prompt.md
├── iterate.prompt.md
├── plan.prompt.md
├── red-team.prompt.md
├── review-and-refactor.prompt.md
├── review.prompt.md
├── test.prompt.md
└── README.md (manifest)
```

### 2. ✅ Created Deprecation Notice

**File**: `.github/prompts/README_DEPRECATED.md`

- Explains why L3 is deprecated
- Lists which agents migrated to L4a
- Points to new agent registry
- Shows how to access archived files if needed

### 3. ✅ Created Archive Manifest

**File**: `/archive/l3-prompts-deprecated/README.md`

- Documents all archived files
- Maps old → new agent locations
- Explains migration rationale
- Shows invocation patterns for new agents

### 4. ✅ Updated Search Exclusions

**File**: `.vscode/settings.json`

- Added `archive/l3-prompts-deprecated` to `search.exclude`
- Archived files **will not appear in workspace searches**
- New agents in `.claude/agents/` are searchable

### 5. ✅ Updated Indexes

**File**: `.github/instructions/INDEX.md`

- Removed reference to deprecated L3 prompts
- Updated to link to L4a Agent Registry
- Added reference to `.claude/agents/`

---

## Files Remaining in `.github/prompts/`

**Active** (4 files):

- ✅ `PROMPTS_SESSION_SUMMARY.md` — Session logging
- ✅ `remember-enhanced.prompt.md` — Remember system
- ✅ `plan-copilotInstruction.prompt.md` — Legacy support
- ✅ `ui-ux-agent.md` — UI/UX specialist persona
- ✅ `README_DEPRECATED.md` — Deprecation notice

**All other files archived**.

---

## Search Impact

### Before

- ❌ 13 L3 prompt files appeared in workspace searches
- ❌ Confusion between L3 (deprecated) and L4a (active)
- ❌ Users might reference old L3 files

### After

- ✅ **Zero L3 prompt files in workspace searches**
- ✅ Only active agents (L4a) appear in searches
- ✅ Clear migration path for anyone looking at archives

---

## Migration Mapping

| Old L3 Prompt                          | New L4a Agent        | Location                                     |
| -------------------------------------- | -------------------- | -------------------------------------------- |
| `audit.prompt.md`                      | Security Red Teamer  | `.claude/agents/security-red-teamer/`        |
| `create-implementation-plan.prompt.md` | Create Plan Agent    | `.claude/agents/create-plan-agent/`          |
| `deploy.prompt.md`                     | (Specialized)        | Archived                                     |
| `document.prompt.md`                   | Document Agent       | `.claude/agents/document-agent/`             |
| `documentation-writer.prompt.md`       | Documentation Writer | `.claude/agents/documentation-writer-agent/` |
| `github-copilot-starter.prompt.md`     | Copilot Starter      | `.claude/agents/copilot-starter-agent/`      |
| `implement.prompt.md`                  | (Specialized)        | Archived                                     |
| `iterate.prompt.md`                    | (Specialized)        | Archived                                     |
| `plan.prompt.md`                       | Plan Agent           | `.claude/agents/plan-agent/`                 |
| `red-team.prompt.md`                   | Security Red Teamer  | `.claude/agents/security-red-teamer/`        |
| `review-and-refactor.prompt.md`        | Code Review Expert   | `.claude/agents/code-review-expert/`         |
| `review.prompt.md`                     | Code Review Expert   | `.claude/agents/code-review-expert/`         |
| `test.prompt.md`                       | Test Engineer        | `.claude/agents/test-engineer/`              |

---

## Verification Checklist

✅ **File Operations**

- [x] 13 files moved to archive
- [x] Archive directory created with README
- [x] All archived files intact
- [x] `.github/prompts/` cleaned up

✅ **Documentation**

- [x] Deprecation notice created
- [x] Archive manifest created
- [x] Migration mapping documented
- [x] Search impact documented

✅ **Search Configuration**

- [x] VS Code search.exclude updated
- [x] Archive directory excluded from searches
- [x] Active agents remain searchable

✅ **Index Updates**

- [x] Instructions INDEX updated
- [x] L3 → L4a references corrected
- [x] Cross-references verified
- [x] No broken links

---

## Commands for Reference

### View Archived Files

```bash
ls archive/l3-prompts-deprecated/
```

### Read Archive Manifest

```bash
cat archive/l3-prompts-deprecated/README.md
```

### View Deprecation Notice

```bash
cat .github/prompts/README_DEPRECATED.md
```

### Search Active Agents

All agents now in `.claude/agents/`:

```bash
ls .claude/agents/
```

---

## Hierarchy Status

```
L0: Canonical Governance ✅
L1: Amendments ✅
L2: Instructions ✅
L3: Prompts ⚠️ DEPRECATED (archived, not removed)
L4a: Agent Registry ✅ ACTIVE (use this)
L4b: Documentation ✅
```

**L3 is now deprecated**. All agents should be invoked through L4a registry:

- `@agent-name` for discovery
- `Use the agent to...` for orchestration

---

## Impact Summary

| Item                               | Before | After | Impact                  |
| ---------------------------------- | ------ | ----- | ----------------------- |
| L3 files in search                 | 13     | 0     | ✅ Reduced clutter      |
| Active agents in `.claude/agents/` | 12     | 12    | ✅ Fully discoverable   |
| Search exclusions                  | 5      | 6     | ✅ Archive excluded     |
| Deprecation notices                | 0      | 2     | ✅ Clear migration path |

---

## Next Steps (Optional)

### Future Cleanup

- Consider running `git rm --cached` on old files (if committing)
- Update CI exclusions to ignore `archive/` directory
- Add deprecation warning to any remaining L3 references

### Monitoring

- Check search usage analytics
- Verify no new references to `archive/l3-prompts-deprecated/`
- Monitor L4a agent adoption

---

## Related Documentation

- [L4a Agent Registry](/.claude/agents/INDEX.md) — Active agents (use these)
- [Archive Manifest](/archive/l3-prompts-deprecated/README.md) — What was archived
- [Deprecation Notice](/.github/prompts/README_DEPRECATED.md) — Why L3 is deprecated
- [Instructions INDEX](/.github/instructions/INDEX.md) — Updated hierarchy

---

**Status**: ✅ COMPLETE  
**Impact**: Zero search clutter, clear migration path  
**Date**: January 15, 2026
