# Archive Management — Master Checklist

**Role:** Archive Manager  
**Status:** Ready for Execution (after approval)  
**Last Updated:** December 6, 2025

---

## Pre-Execution: Design Review (This Week)

### Stakeholder Review

- [ ] **Archive Manager/Doc Owner**
  - [ ] Read: `docs/ARCHIVE_SUMMARY.md`
  - [ ] Review: Structure choice (Option A approved?)
  - [ ] Review: Naming convention (acceptable?)
  - [ ] Review: Merged file strategy (delete approved?)
  - [ ] Decision: APPROVE / REQUEST CHANGES / REJECT

- [ ] **Project Lead**
  - [ ] Read: `docs/ARCHIVE_SUMMARY.md` + `docs/ARCHIVE_EXECUTION_TIMELINE.md`
  - [ ] Review: Timeline (Wave 1 Dec 6, Wave 2 Dec 20, Wave 3 Jan 15?)
  - [ ] Review: Resource requirements (2hr, 4hr, 1hr per wave?)
  - [ ] Review: Risk levels (LOW, MEDIUM, LOW acceptable?)
  - [ ] Decision: APPROVE / REQUEST CHANGES / REJECT

- [ ] **Phase 2 Lead** (for Wave 2 validation)
  - [ ] Confirm: Phase 2 completion trigger is clear?
  - [ ] Confirm: Consolidation approach makes sense?
  - [ ] Confirm: Dec 20 is realistic for Phase 2 end?
  - [ ] Decision: APPROVE / REQUEST CHANGES / REJECT

- [ ] **Architecture Lead** (for Wave 3 validation)
  - [ ] Confirm: Strategic review will conclude by Jan 15?
  - [ ] Confirm: mega-book is canonical architecture source?
  - [ ] Confirm: CODEBASE_ARCHITECTURAL_INDEX can be archived?
  - [ ] Decision: APPROVE / REQUEST CHANGES / REJECT

### Design Approval (Required Before Wave 1)

**All decisions approved?**
- [ ] YES → Proceed to Wave 1 Preparation
- [ ] NO → Document feedback, re-submit design

---

## Wave 1 Preparation (Before Dec 6)

### Setup

- [ ] **Create archive folder structure**
  ```bash
  mkdir -p archive/{cleanup,reports,phase-work,strategic,version-history}
  ```

- [ ] **Verify folder structure**
  ```bash
  ls -la archive/
  # Expected: cleanup/, reports/, phase-work/, strategic/, version-history/
  ```

- [ ] **Make script executable**
  ```bash
  chmod +x scripts/archive/validate-archive-candidate.sh
  ```

- [ ] **Verify script works**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -h
  # Expected: Shows usage help
  ```

### Team Communication

- [ ] **Notify team:** Share summary + timeline
  - [ ] Post: `docs/ARCHIVE_SUMMARY.md`
  - [ ] Explain: What's happening & why
  - [ ] Link: Recovery procedures in `archive/README.md`

- [ ] **Document:** Any team concerns/questions
  - [ ] Note: Questions asked
  - [ ] Note: Answers/clarifications provided

---

## Wave 1 Execution (Dec 6) — ~2 Hours

### Pre-Execution Checklist

- [ ] **Git status is clean**
  ```bash
  git status
  # Expected: On dev branch, nothing uncommitted
  ```

- [ ] **All Wave 1 files exist**
  ```bash
  test -f docs/CLEANUP_INDEX.md && echo "✅"
  test -f docs/SESSION_SUMMARY_DEC_1_2025.md && echo "✅"
  test -f docs/PR_STAGING_SUMMARY.md && echo "✅"
  test -f docs/VERSION_v14.5.md && echo "✅"
  test -f docs/PHASE_2_START_HERE.md && echo "✅"
  test -f docs/PRODUCTION_DOCS_INDEX.md && echo "✅"
  ```

### Validation (Use Script)

- [ ] **CLEANUP_INDEX.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f CLEANUP_INDEX.md -c cleanup
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **SESSION_SUMMARY_DEC_1_2025.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f SESSION_SUMMARY_DEC_1_2025.md -c reports
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PR_STAGING_SUMMARY.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PR_STAGING_SUMMARY.md -c reports
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **VERSION_v14.5.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f VERSION_v14.5.md -c version-history
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PHASE_2_START_HERE.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PHASE_2_START_HERE.md -c phase-work
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PRODUCTION_DOCS_INDEX.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PRODUCTION_DOCS_INDEX.md
  # Expected: ✅ SAFE TO ARCHIVE (will be deleted, not moved)
  ```

### Archival Execution (Git Commands)

- [ ] **Move CLEANUP_INDEX.md**
  ```bash
  git mv docs/CLEANUP_INDEX.md archive/cleanup/
  ```

- [ ] **Move SESSION_SUMMARY_DEC_1_2025.md**
  ```bash
  git mv docs/SESSION_SUMMARY_DEC_1_2025.md archive/reports/
  ```

- [ ] **Move and rename PR_STAGING_SUMMARY.md**
  ```bash
  git mv docs/PR_STAGING_SUMMARY.md archive/reports/PR_STAGING_SUMMARY_2025-12-06.md
  ```

- [ ] **Move VERSION_v14.5.md**
  ```bash
  git mv docs/VERSION_v14.5.md archive/version-history/
  ```

- [ ] **Move PHASE_2_START_HERE.md**
  ```bash
  git mv docs/PHASE_2_START_HERE.md archive/phase-work/
  ```

- [ ] **Delete PRODUCTION_DOCS_INDEX.md**
  ```bash
  git rm docs/PRODUCTION_DOCS_INDEX.md
  ```

### Create Archive Documentation

- [ ] **Create archive/README.md**
  - [ ] Use template from `docs/ARCHIVE_STRUCTURE_DESIGN.md` section 4a
  - [ ] Or create new from design

- [ ] **Create archive/MANIFEST.json**
  - [ ] Use template from `docs/ARCHIVE_STRUCTURE_DESIGN.md` section 4b
  - [ ] Or populate manually with Wave 1 entries

- [ ] **Verify archive files**
  ```bash
  ls archive/cleanup/
  ls archive/reports/
  ls archive/phase-work/
  ls archive/version-history/
  ```

### Commit

- [ ] **Stage all changes**
  ```bash
  git add archive/ docs/
  git status
  # Expected: 5 files moved, 1 deleted, archive/ created
  ```

- [ ] **Commit with message**
  ```bash
  git commit -m "chore: archive Phase 1 cleanup docs (Wave 1)

- Move CLEANUP_INDEX.md → archive/cleanup/
- Move SESSION_SUMMARY_DEC_1_2025.md → archive/reports/
- Move PR_STAGING_SUMMARY.md → archive/reports/ (with date)
- Move VERSION_v14.5.md → archive/version-history/
- Move PHASE_2_START_HERE.md → archive/phase-work/
- Delete PRODUCTION_DOCS_INDEX.md (redundant navigation)
- Add archive/README.md for discoverability
- Add archive/MANIFEST.json for metadata

Files archived: 5 (58K)
Files deleted: 1 (8K)
Total space freed: 66K from docs/

Validation: All files checked via ./scripts/archive/validate-archive-candidate.sh
Git history: All files recoverable via git show <commit>:docs/FILENAME.md

See docs/ARCHIVE_STRUCTURE_DESIGN.md for rationale."
  ```

### Post-Execution Verification

- [ ] **Verify structure created**
  ```bash
  ls -la archive/
  # Expected: cleanup/ reports/ phase-work/ strategic/ version-history/ README.md MANIFEST.json
  ```

- [ ] **Verify files moved**
  ```bash
  ls archive/cleanup/CLEANUP_INDEX.md
  ls archive/reports/SESSION_SUMMARY_DEC_1_2025.md
  ls archive/reports/PR_STAGING_SUMMARY_2025-12-06.md
  ls archive/version-history/VERSION_v14.5.md
  ls archive/phase-work/PHASE_2_START_HERE.md
  # All should exist
  ```

- [ ] **Verify files deleted from docs/**
  ```bash
  test ! -f docs/PRODUCTION_DOCS_INDEX.md && echo "✅ Deleted"
  test ! -f docs/CLEANUP_INDEX.md && echo "✅ Deleted from docs"
  # Verify all 6 files gone from docs/
  ```

- [ ] **Verify docs/ directory cleaner**
  ```bash
  ls docs/ | wc -l  # Should be ~25 (was ~31)
  ```

- [ ] **Verify git history**
  ```bash
  git log --oneline | head -1
  # Should show "archive Phase 1 cleanup docs" message
  ```

- [ ] **Verify no broken references**
  ```bash
  grep -r "CLEANUP_INDEX\|SESSION_SUMMARY\|PR_STAGING_SUMMARY\|VERSION_v14\|PHASE_2_START_HERE\|PRODUCTION_DOCS_INDEX" docs/ --exclude-dir=archive 2>/dev/null || echo "✅ No dangling refs"
  ```

- [ ] **Verify no uncommitted changes**
  ```bash
  git status
  # Expected: "On branch dev, nothing to commit, working tree clean"
  ```

### Wave 1 Success Criteria

- [ ] ✅ All 5 files moved to archive/
- [ ] ✅ PRODUCTION_DOCS_INDEX deleted
- [ ] ✅ archive/README.md created
- [ ] ✅ archive/MANIFEST.json created
- [ ] ✅ Git commit succeeds
- [ ] ✅ No broken references in active docs
- [ ] ✅ Verification tests pass
- [ ] ✅ Git history preserved for all files

---

## Wave 2 Preparation (Before Dec 20)

### Phase 2 Completion Trigger

- [ ] **Confirm Phase 2 officially complete**
  - [ ] Phase 2 Lead: "Phase 2 work is done"
  - [ ] All tasks closed or transitioned
  - [ ] Ready to archive phase docs

### Consolidation Prep

- [ ] **Review PRODUCTION_READINESS_KPI.md**
  ```bash
  cat docs/PRODUCTION_READINESS_KPI.md | head -50
  ```

- [ ] **Review PRODUCTION_READINESS_SIGN_OFF.md**
  ```bash
  cat docs/PRODUCTION_READINESS_SIGN_OFF.md | head -50
  ```

- [ ] **Review ERROR_PREVENTION_PATTERNS.md**
  ```bash
  cat docs/ERROR_PREVENTION_PATTERNS.md | head -50
  ```

- [ ] **Verify merge targets exist**
  ```bash
  test -f docs/PRODUCTION_READINESS.md && echo "✅"
  test -f docs/CODING_RULES_AND_PATTERNS.md && echo "✅"
  ```

- [ ] **Plan merge sections** (document where content goes)
  - [ ] KPI → PRODUCTION_READINESS.md, new section "## KPI Tracking & Metrics"
  - [ ] Sign-Off → PRODUCTION_READINESS.md, new section "## Sign-Off Checklist"
  - [ ] Error Prevention → CODING_RULES_AND_PATTERNS.md, new section "## Error Prevention Patterns"

### Team Communication

- [ ] **Notify team:** Phase 2 consolidation happening
  - [ ] Explain: What's being consolidated & why
  - [ ] Explain: Where to find merged content
  - [ ] Link: Recovery procedures

---

## Wave 2 Execution (Dec 20) — ~4 Hours

### Pre-Execution Checklist

- [ ] **Git status is clean**
  ```bash
  git status
  # Expected: On dev branch, nothing uncommitted
  ```

- [ ] **All Wave 2 archive files exist**
  ```bash
  test -f docs/PHASE_2_DETAILED_PLAN.md && echo "✅"
  test -f docs/PHASE_2_EXECUTION_SUMMARY.md && echo "✅"
  test -f docs/PHASE_2_QUICK_REFERENCE.md && echo "✅"
  ```

- [ ] **All files to merge exist**
  ```bash
  test -f docs/PRODUCTION_READINESS_KPI.md && echo "✅"
  test -f docs/PRODUCTION_READINESS_SIGN_OFF.md && echo "✅"
  test -f docs/ERROR_PREVENTION_PATTERNS.md && echo "✅"
  ```

### Validation (Use Script)

- [ ] **PHASE_2_DETAILED_PLAN.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PHASE_2_DETAILED_PLAN.md -c phase-work
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PHASE_2_EXECUTION_SUMMARY.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PHASE_2_EXECUTION_SUMMARY.md -c phase-work
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PHASE_2_QUICK_REFERENCE.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PHASE_2_QUICK_REFERENCE.md -c phase-work
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PRODUCTION_READINESS_KPI.md (for merge)**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PRODUCTION_READINESS_KPI.md -m -t PRODUCTION_READINESS.md
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **PRODUCTION_READINESS_SIGN_OFF.md (for merge)**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f PRODUCTION_READINESS_SIGN_OFF.md -m -t PRODUCTION_READINESS.md
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **ERROR_PREVENTION_PATTERNS.md (for merge)**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f ERROR_PREVENTION_PATTERNS.md -m -t CODING_RULES_AND_PATTERNS.md
  # Expected: ✅ SAFE TO ARCHIVE
  ```

### Content Merge (Manual)

- [ ] **Merge KPI into PRODUCTION_READINESS.md**
  - [ ] Open both files
  - [ ] Copy relevant content from KPI
  - [ ] Create new section in PRODUCTION_READINESS: "## KPI Tracking & Metrics"
  - [ ] Add metadata comment:
    ```markdown
    <!-- CONSOLIDATED: Content merged from PRODUCTION_READINESS_KPI.md
         Merged: 2025-12-20
         Recovery: git show <commit>^:docs/PRODUCTION_READINESS_KPI.md
    -->
    ```

- [ ] **Merge Sign-Off into PRODUCTION_READINESS.md**
  - [ ] Copy relevant content from Sign-Off
  - [ ] Create new section in PRODUCTION_READINESS: "## Sign-Off Checklist"
  - [ ] Add metadata comment (same format as above)

- [ ] **Merge Error Prevention into CODING_RULES_AND_PATTERNS.md**
  - [ ] Copy relevant content from ERROR_PREVENTION_PATTERNS
  - [ ] Create new section: "## Error Prevention Patterns"
  - [ ] Add metadata comment

- [ ] **Verify merged content**
  ```bash
  grep -q "KPI Tracking" docs/PRODUCTION_READINESS.md && echo "✅ KPI merged"
  grep -q "Sign-Off" docs/PRODUCTION_READINESS.md && echo "✅ Sign-Off merged"
  grep -q "Error Prevention" docs/CODING_RULES_AND_PATTERNS.md && echo "✅ Error Prevention merged"
  ```

### Archival Execution

- [ ] **Move phase docs to archive**
  ```bash
  git mv docs/PHASE_2_DETAILED_PLAN.md archive/phase-work/
  git mv docs/PHASE_2_EXECUTION_SUMMARY.md archive/phase-work/
  git mv docs/PHASE_2_QUICK_REFERENCE.md archive/phase-work/
  ```

- [ ] **Delete merged files** (content now in parents)
  ```bash
  git rm docs/PRODUCTION_READINESS_KPI.md
  git rm docs/PRODUCTION_READINESS_SIGN_OFF.md
  git rm docs/ERROR_PREVENTION_PATTERNS.md
  ```

- [ ] **Update MANIFEST.json** with Wave 2 entries

### Commit

- [ ] **Stage all changes**
  ```bash
  git add docs/ archive/
  git status
  ```

- [ ] **Commit with comprehensive message**
  ```bash
  git commit -m "chore: consolidate Phase 2 work into archive (Wave 2)

ARCHIVED (3 files → archive/phase-work/):
- PHASE_2_DETAILED_PLAN.md (20K)
- PHASE_2_EXECUTION_SUMMARY.md (12K)
- PHASE_2_QUICK_REFERENCE.md (12K)

CONSOLIDATED & DELETED (3 files → parent docs):
- PRODUCTION_READINESS_KPI.md → PRODUCTION_READINESS.md
  + Added section: \"KPI Tracking & Metrics\"
- PRODUCTION_READINESS_SIGN_OFF.md → PRODUCTION_READINESS.md
  + Added section: \"Sign-Off Checklist\"
- ERROR_PREVENTION_PATTERNS.md → CODING_RULES_AND_PATTERNS.md
  + Added section: \"Error Prevention Patterns\"

Files archived: 3 (44K)
Files consolidated: 3 (28K merged into parent docs)
Space freed from docs/: 72K

Consolidated docs now include:
- docs/PRODUCTION_READINESS.md (~36K, contains KPI + Sign-Off)
- docs/CODING_RULES_AND_PATTERNS.md (~32K, contains error patterns)

All consolidated files include metadata comments showing:
- Original source document
- Consolidation date
- Recovery instructions via git history

Updated: archive/MANIFEST.json with Wave 2 consolidation metadata"
  ```

### Post-Execution Verification

- [ ] **Verify phase docs moved**
  ```bash
  ls archive/phase-work/PHASE_2_DETAILED_PLAN.md
  ls archive/phase-work/PHASE_2_EXECUTION_SUMMARY.md
  ls archive/phase-work/PHASE_2_QUICK_REFERENCE.md
  # All should exist
  ```

- [ ] **Verify merged docs deleted**
  ```bash
  test ! -f docs/PRODUCTION_READINESS_KPI.md && echo "✅ KPI deleted"
  test ! -f docs/PRODUCTION_READINESS_SIGN_OFF.md && echo "✅ Sign-Off deleted"
  test ! -f docs/ERROR_PREVENTION_PATTERNS.md && echo "✅ Error Prevention deleted"
  ```

- [ ] **Verify content in parent docs**
  ```bash
  grep -q "KPI Tracking" docs/PRODUCTION_READINESS.md && echo "✅ Content in READINESS"
  grep -q "Sign-Off" docs/PRODUCTION_READINESS.md && echo "✅ Sign-Off in READINESS"
  grep -q "Error Prevention Patterns" docs/CODING_RULES_AND_PATTERNS.md && echo "✅ Content in RULES"
  ```

- [ ] **Verify metadata comments exist**
  ```bash
  grep "CONSOLIDATED:" docs/PRODUCTION_READINESS.md | wc -l  # Should be 2
  grep "CONSOLIDATED:" docs/CODING_RULES_AND_PATTERNS.md | wc -l  # Should be 1
  ```

- [ ] **Verify no dangling references**
  ```bash
  grep -r "PRODUCTION_READINESS_KPI\|PRODUCTION_READINESS_SIGN_OFF\|ERROR_PREVENTION_PATTERNS" docs/ --exclude-dir=archive 2>/dev/null || echo "✅ No dangling refs"
  ```

### Wave 2 Success Criteria

- [ ] ✅ 3 phase docs moved to archive/phase-work/
- [ ] ✅ 3 docs consolidated with no content loss
- [ ] ✅ Metadata comments added to consolidated docs
- [ ] ✅ Git commit succeeds
- [ ] ✅ No dangling references in active docs
- [ ] ✅ MANIFEST.json updated
- [ ] ✅ All verification tests pass

---

## Wave 3 Preparation (Before Jan 15)

### Strategic Review Completion

- [ ] **Confirm strategic review officially concluded**
  - [ ] Architecture Lead: "Strategic review is done"
  - [ ] Decisions documented in active docs
  - [ ] mega-book confirmed as canonical source

### Pre-Execution

- [ ] **Verify Wave 1 & 2 completed**
  ```bash
  ls archive/cleanup/ | wc -l  # Should be 1
  ls archive/phase-work/ | wc -l  # Should be 3 (from Wave 2)
  ```

- [ ] **Verify files still in docs/**
  ```bash
  test -f docs/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md && echo "✅"
  test -f docs/CODEBASE_ARCHITECTURAL_INDEX.md && echo "✅"
  ```

---

## Wave 3 Execution (Jan 15) — ~1 Hour

### Pre-Execution Checklist

- [ ] **Git status is clean**
  ```bash
  git status
  ```

### Validation (Use Script)

- [ ] **ARCHITECTURAL_REVIEW_PANEL_INPUTS.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f ARCHITECTURAL_REVIEW_PANEL_INPUTS.md -c strategic
  # Expected: ✅ SAFE TO ARCHIVE
  ```

- [ ] **CODEBASE_ARCHITECTURAL_INDEX.md**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f CODEBASE_ARCHITECTURAL_INDEX.md -c strategic
  # Expected: ✅ SAFE TO ARCHIVE
  ```

### Archival Execution

- [ ] **Move strategic docs**
  ```bash
  git mv docs/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md archive/strategic/
  git mv docs/CODEBASE_ARCHITECTURAL_INDEX.md archive/strategic/
  ```

- [ ] **Update MANIFEST.json** with Wave 3 entries

### Commit

- [ ] **Stage and commit**
  ```bash
  git add archive/ docs/
  git commit -m "chore: archive strategic documentation (Wave 3)

ARCHIVED (2 files → archive/strategic/):
- ARCHITECTURAL_REVIEW_PANEL_INPUTS.md (68K)
- CODEBASE_ARCHITECTURAL_INDEX.md (40K)

Rationale:
- Architectural review period complete
- Decisions documented in active architecture docs
- mega-book structure is canonical source
- Strategic input archived for historical reference

Files archived: 2 (108K)
Total space freed: 108K from docs/

See docs/ARCHIVE_STRUCTURE_DESIGN.md for recovery."
  ```

### Post-Execution Verification

- [ ] **Verify files archived**
  ```bash
  ls archive/strategic/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md
  ls archive/strategic/CODEBASE_ARCHITECTURAL_INDEX.md
  ```

- [ ] **Verify files deleted from docs/**
  ```bash
  test ! -f docs/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md && echo "✅"
  test ! -f docs/CODEBASE_ARCHITECTURAL_INDEX.md && echo "✅"
  ```

### Wave 3 Success Criteria

- [ ] ✅ 2 strategic docs moved to archive/strategic/
- [ ] ✅ Git commit succeeds
- [ ] ✅ MANIFEST.json updated
- [ ] ✅ All verification tests pass

---

## Final Verification (After All Waves)

### Archive Structure Complete

- [ ] **All folders exist**
  ```bash
  ls -la archive/
  # Expected: cleanup/ phase-work/ reports/ strategic/ version-history/ README.md MANIFEST.json
  ```

- [ ] **All files in correct locations**
  ```bash
  find archive/ -type f | wc -l  # Should be 10 files + 2 docs = 12
  ```

- [ ] **MANIFEST.json complete**
  ```bash
  jq '.statistics.total_archived_files' archive/MANIFEST.json  # Should be 10
  ```

### docs/ Directory Cleaner

- [ ] **Verify active docs count**
  ```bash
  ls docs/ | wc -l  # Should be ~22 (was ~31)
  ```

- [ ] **Verify no orphaned references**
  ```bash
  grep -r "CLEANUP_INDEX\|SESSION_SUMMARY\|PHASE_2_DETAILED_PLAN\|..." docs/ --exclude-dir=archive || echo "✅ Clean"
  ```

### Git History Integrity

- [ ] **Verify commit messages clear**
  ```bash
  git log --oneline | grep -i archive | head -3
  ```

- [ ] **Verify recovery works**
  ```bash
  git show HEAD~N:docs/CLEANUP_INDEX.md | head  # Should show content
  ```

### Team Notification

- [ ] **Announce completion**
  - [ ] Message: "All waves complete"
  - [ ] Link: `archive/README.md`
  - [ ] Explain: How to find & recover files

---

## Ongoing Maintenance

### Regular Checks (Quarterly)

- [ ] **Verify MANIFEST.json up-to-date**
- [ ] **Check for orphaned references**
  ```bash
  grep -r "CLEANUP_INDEX\|SESSION_SUMMARY\|..." docs/ --exclude-dir=archive
  ```
- [ ] **Test recovery procedure**
  ```bash
  git show HEAD:docs/CLEANUP_INDEX.md | head
  ```

### If New Files Need Archiving

- [ ] **Use validation script**
  ```bash
  ./scripts/archive/validate-archive-candidate.sh -f FILENAME -c category
  ```

- [ ] **Update MANIFEST.json**
- [ ] **Follow same git workflow**

---

## Recovery Procedures (If Needed)

### Restore from Archive

```bash
git mv archive/[category]/FILENAME.md docs/FILENAME.md
git commit -m "chore: restore FILENAME from archive"
```

### Restore from Git History

```bash
git show <commit>^:docs/FILENAME.md > docs/FILENAME.md
git add docs/FILENAME.md
git commit -m "chore: restore FILENAME from git history"
```

---

**Archive Management System — Master Checklist**
**Version:** 1.0 | **Date:** December 6, 2025
