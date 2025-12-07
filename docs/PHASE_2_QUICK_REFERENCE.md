# Phase 2 Quick Reference

**Status**: Ready for Execution  
**Created**: December 6, 2025  
**Audience**: Quick lookup during execution

---

## The 5 Tracks at a Glance

### Track 1: Documentation Consolidation (5 tasks, ~45 min)

```
1.1 PRODUCTION_READINESS_KPI.md + PRODUCTION_READINESS_SIGN_OFF.md → PRODUCTION_READINESS.md
1.2 ERROR_PREVENTION_PATTERNS.md → CODING_RULES_AND_PATTERNS.md
1.3 Archive: CODEBASE_ARCHITECTURAL_INDEX.md, ARCHITECTURAL_REVIEW_PANEL_INPUTS.md
1.4 Archive: SESSION_SUMMARY_DEC_1_2025.md, PR_STAGING_SUMMARY.md
1.5 PNPM_ENFORCEMENT.md → QUICK_START.md
```

### Track 2: Instruction Governance (2 tasks, ~20 min)

```
2.1 Create .github/instructions/README.md (index all instructions)
2.2 Consolidate overlapping instructions (or decide to keep separate)
```

### Track 3: Subdirectory Consolidation (3 tasks, ~30 min)

```
3.1 Merge docs/agents/ → docs/crewops/
3.2 Verify docs/migration/ and docs/mega-report/ status
3.3 Organize docs/tests/ (decide keep/merge/archive)
```

### Track 4: Archive Verification (2 tasks, ~20 min)

```
4.1 Create archive/docs/README.md (structure + index)
4.2 Create cross-reference map (active docs → archive)
```

### Track 5: Navigation Restructure (3 tasks, ~30 min)

```
5.1 Update QUICK_START.md (add canonical refs, archive links)
5.2 Create docs/STRUCTURE.md (explicit hierarchy guide)
5.3 Verify README.md links (update/verify all)
```

---

## Quick Command Reference

### Git Operations

**Check status before starting**

```bash
git status
git log --oneline -5
```

**After each task**

```bash
git add [files]
git commit -m "docs: [clear message]"
git log --oneline -1  # verify commit created
```

**If you need to undo**

```bash
git revert HEAD  # Reverts last commit
git revert [commit-hash]  # Reverts specific commit
```

### File Operations

**Merge files**

```bash
# Read both files, merge manually, then delete original
cat docs/FILE_TO_MERGE.md >> docs/TARGET_FILE.md
git rm docs/FILE_TO_MERGE.md
```

**Move files to archive**

```bash
git mv docs/FILE.md archive/docs/SUBDIR/
```

**Check for broken references**

```bash
grep -r "filename" docs/ apps/ packages/
```

**List directory contents**

```bash
ls -lh docs/  # See files and sizes
find docs/ -type f | wc -l  # Count files
```

---

## Verification Commands (Run After Each Task)

```bash
# 1. Verify file exists/deleted
ls -la docs/FILE.md  # Should exist or NOT exist

# 2. Verify archive structure
find archive/docs -type f | sort

# 3. Check for broken references
grep -r "OLD_FILENAME" docs/ || echo "✓ Clean"

# 4. Count active docs
find docs/ -maxdepth 1 -type f | wc -l

# 5. Verify git commit
git log --oneline -1
```

---

## Task Execution Template

Use this for each task:

```
[ ] Task X.Y: [Task Name]
    
    [ ] Read source files
    [ ] Make changes (merge/move/delete)
    [ ] Verify no broken references
    [ ] Create git commit
    [ ] Confirm commit created (git log)
    [ ] Mark task complete
```

---

## File Operations Checklist

### For Merge Operations

```
1. [ ] Read source file (understand content)
2. [ ] Read target file (understand structure)
3. [ ] Identify unique content in source
4. [ ] Add to target (appropriate section)
5. [ ] Delete source file
6. [ ] Search codebase for references to deleted file
7. [ ] Verify no orphaned references
8. [ ] Create atomic commit
```

### For Move Operations

```
1. [ ] Review file being moved
2. [ ] Verify target directory exists
3. [ ] Use git mv to move
4. [ ] Search codebase for references
5. [ ] Update any references (if needed)
6. [ ] Create atomic commit
```

### For New File Operations

```
1. [ ] Create file with content
2. [ ] Add to git
3. [ ] Link from navigation (QUICK_START, README)
4. [ ] Create atomic commit
```

---

## Decision Points (During Execution)

### Task 2.2: Overlapping Instructions

**Decision**: Merge or Cross-Reference?

Compare these pairs:

- `github-actions-ci-cd-best-practices.md` vs `production-development-directive.md`
- `self-explanatory-code-commenting.md` vs `code-review-generic.md`

**Options**:

- **Merge**: Consolidate into primary instruction, delete duplicate
- **Cross-Reference**: Keep separate, add link from one to other in README

**Recommendation**: Keep separate (each has distinct scope), update README with cross-references

---

### Task 3.2: Directory Status

**Questions to Answer**:

1. **docs/migration/**
   - Q: Is this tracking active migrations?
   - A: If yes → keep with README explaining purpose
   - A: If no → move to archive/docs/migrations/

2. **docs/mega-report/**
   - Q: Is this distinct from docs/mega-book/?
   - A: If yes → keep, clarify purpose in README
   - A: If no → consolidate with mega-book or archive

---

### Task 3.3: Tests Directory

**Questions to Answer**:

1. **Purpose**: What documentation lives in docs/tests/?
2. **Value**: Does it provide unique value not in CODING_RULES?
3. **Decision**:
   - Keep + create README if valuable
   - Merge into CODING_RULES if redundant
   - Move to archive if historic

---

## Metrics to Track

After Phase 2 completion, you should see:

```
✓ Consolidated files: 5 (PRODUCTION_READINESS, CODING_RULES, QUICK_START + others)
✓ Archived files: 4 (strategic + date-stamped)
✓ Active docs: 21-22 (down from 26 after Phase 1)
✓ Archive docs: 26 (organized in 6 subdirs)
✓ Commits created: ~15 atomic commits
✓ New navigation docs: 3 (STRUCTURE.md, archive/README.md, instructions/README.md)
✓ Broken references: 0
✓ Success rate: 100%
```

---

## Execution Progress Tracker

Use this to track which tasks you've completed:

```
TRACK 1: Documentation Consolidation
  [1.1] [ ] [x] [x] PRODUCTION_READINESS merge
  [1.2] [ ] [ ] [ ] ERROR_PREVENTION merge
  [1.3] [ ] [ ] [ ] Archive strategic
  [1.4] [ ] [ ] [ ] Archive date-stamped
  [1.5] [ ] [ ] [ ] PNPM merge

TRACK 2: Instruction Governance
  [2.1] [ ] [ ] [ ] Create instructions index
  [2.2] [ ] [ ] [ ] Consolidate overlapping

TRACK 3: Subdirectory Consolidation
  [3.1] [ ] [ ] [ ] Merge agents
  [3.2] [ ] [ ] [ ] Verify directories
  [3.3] [ ] [ ] [ ] Organize tests

TRACK 4: Archive Verification
  [4.1] [ ] [ ] [ ] Verify structure
  [4.2] [ ] [ ] [ ] Cross-reference map

TRACK 5: Navigation Restructure
  [5.1] [ ] [ ] [ ] Update QUICK_START
  [5.2] [ ] [ ] [ ] Create STRUCTURE.md
  [5.3] [ ] [ ] [ ] Verify README links

FINAL: Success Criteria
  [ ] All tasks complete
  [ ] All commits created
  [ ] Navigation working
  [ ] No broken references
  [ ] Metrics confirmed
```

---

## Common Gotchas & Solutions

| Problem | Solution |
|---------|----------|
| Can't delete file with git | Use `git rm` instead of `rm` |
| Can't move file with git | Use `git mv` instead of `mv` |
| Broken link after move | Search codebase for old path, update references |
| Merge lost content | Always read both files first, verify no loss |
| Commit doesn't appear | Run `git log --oneline -1` to verify |
| File appears deleted but still exists | Run `git status` to see staged vs committed |

---

## When to Ask for Help

**Stop and ask if**:

- You see grep results showing broken references
- A commit doesn't create as expected
- You're unsure whether to merge or archive
- A file won't delete (permission error)
- You need to decide on a decision point

---

## Success Criteria (Final Check)

Run these commands after Phase 2:

```bash
# 1. Count active docs (should be 21-22)
find docs/ -maxdepth 1 -type f | wc -l

# 2. Count archived docs (should be 26+)
find archive/docs -type f | wc -l

# 3. Verify no broken references
grep -r "PRODUCTION_READINESS_KPI\|ERROR_PREVENTION_PATTERNS\|PNPM_ENFORCEMENT" docs/ apps/ packages/ || echo "✓ Clean"

# 4. Check git commits (should see many recent)
git log --oneline -20

# 5. Verify key files exist
ls -la docs/STRUCTURE.md docs/QUICK_START.md archive/docs/README.md .github/instructions/README.md
```

**All green? Phase 2 is complete! ✓**

---

## Files to Have Open During Execution

Recommended open in editor:

1. `docs/PHASE_2_DETAILED_PLAN.md` (reference for each task)
2. `docs/PHASE_2_EXECUTION_SUMMARY.md` (status tracking)
3. File being merged (read content)
4. Terminal (git operations)

---

**Remember**: Atomic commits. One task = one commit. Easy to revert if needed.

**Good luck!** 🚀
