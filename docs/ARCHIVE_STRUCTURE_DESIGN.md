# Archive Structure Design — Comprehensive Organization System

**Role:** Archive Manager  
**Date:** December 6, 2025  
**Status:** Research & Design (Not Implemented)  
**Total Data:** ~300K across 14 files in 3 waves

---

## Executive Summary

This document designs a discoverable archive system for ~300K of historical documentation that will be removed from the active `docs/` directory across 3 waves. The system balances **discoverability** (30-second recovery), **maintainability** (clear folder structure), and **compliance** (Git history preservation).

**Key Decisions:**

- ✅ **Structure:** Option A (semantic folders) — Most discoverable
- ✅ **Naming:** Keep original names, add date prefixes for historical/session docs
- ✅ **Merged Files:** Delete + cross-reference (rely on Git history)
- ✅ **Discoverability:** archive/README.md + archive/MANIFEST.json
- ✅ **Validation:** Pre-archival checklist (grep-based)

---

## 1. ARCHIVE STRUCTURE DESIGN

### Selected Option: A — Semantic Folder Layout

```
archive/
├── README.md                    (Index & recovery guide)
├── MANIFEST.json               (Machine-readable metadata)
├── 
├── phase-work/                 (Wave 2: Phase 2 planning docs)
│   ├── PHASE_2_DETAILED_PLAN.md            (20K) — Planning doc
│   ├── PHASE_2_EXECUTION_SUMMARY.md        (12K) — Status summary
│   └── PHASE_2_QUICK_REFERENCE.md          (12K) — Quick lookup
│
├── reports/                    (Wave 1: Session & status reports)
│   ├── SESSION_SUMMARY_DEC_1_2025.md       (12K) — Date-stamped session
│   └── PR_STAGING_SUMMARY.md               (12K) — Staging notes
│
├── strategic/                  (Wave 3: Long-term strategic input)
│   ├── ARCHITECTURAL_REVIEW_PANEL_INPUTS.md (68K) — Architectural review
│   └── CODEBASE_ARCHITECTURAL_INDEX.md     (40K) — Architectural index
│
├── cleanup/                    (Wave 1: Cleanup planning artifacts)
│   └── CLEANUP_INDEX.md                     (28K) — Cleanup planning doc
│
└── version-history/            (Wave 1: Legacy version docs)
    └── VERSION_v14.5.md                    (4K)  — Superseded version
```

### Rationale for Option A (vs. Alternatives)

| Criterion | Option A (Semantic) | Option B (Flat/Prefixed) | Option C (Year/Month) |
|-----------|-------------------|------------------------|-----------------------|
| **Discoverability** | ⭐⭐⭐⭐⭐ "archived phase work" | ⭐⭐⭐ Flat, harder to scan | ⭐⭐⭐ Temporal, not semantic |
| **Maintainability** | ⭐⭐⭐⭐⭐ Clear purpose | ⭐⭐⭐ Good for flat | ⭐⭐⭐ Good if archiving regularly |
| **Grouping** | By purpose/lifecycle | By naming convention | By date |
| **30-sec recovery** | ✅ "phase work" obvious | ✅ Prefix tells story | ⚠️ Have to know date |
| **Growth** | Scales well (5+ years) | Becomes unwieldy (100s files) | Scales by month |
| **Analogy** | Library sections | Filing cabinet w/ labels | Newspaper archives |

**Why A Wins:**

1. **Semantic grouping** — "phase-work" immediately tells you what it is
2. **Temporal info preserved** — Filenames keep original dates (SESSION_SUMMARY_DEC_1_2025)
3. **Mixed-age friendly** — Can house files from different years in same category
4. **Low cognitive load** — No need to know archive prefixes or date ranges
5. **Scales to 5+ years** — Doesn't explode like Option B

---

## 2. FILE NAMING CONVENTION

### Decision: Keep Original Names + Date Prefix for Session/Report Docs

**Rule:**

- **Strategic/Cleanup/Phase docs:** Keep exact original name
  - `CLEANUP_INDEX.md` → `archive/cleanup/CLEANUP_INDEX.md`
  - `PHASE_2_DETAILED_PLAN.md` → `archive/phase-work/PHASE_2_DETAILED_PLAN.md`

- **Session/Report docs:** Add date prefix for clarity
  - `SESSION_SUMMARY_DEC_1_2025.md` → `archive/reports/SESSION_SUMMARY_DEC_1_2025.md` (date already in name)
  - `PR_STAGING_SUMMARY.md` → `archive/reports/PR_STAGING_SUMMARY_2025-12-06.md` (add date)

**File Naming Examples:**

| Original | Archived Path | Rationale |
|----------|---------------|-----------|
| `CLEANUP_INDEX.md` | `archive/cleanup/CLEANUP_INDEX.md` | Clear purpose, no date needed |
| `SESSION_SUMMARY_DEC_1_2025.md` | `archive/reports/SESSION_SUMMARY_DEC_1_2025.md` | Temporal date already in name |
| `PR_STAGING_SUMMARY.md` | `archive/reports/PR_STAGING_SUMMARY_2025-12-06.md` | Add timestamp for clarity |
| `PHASE_2_DETAILED_PLAN.md` | `archive/phase-work/PHASE_2_DETAILED_PLAN.md` | Phase is specific, no date needed |
| `VERSION_v14.5.md` | `archive/version-history/VERSION_v14.5.md` | Version number is identifier |
| `ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` | `archive/strategic/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` | Strategic doc, no date needed |

### Rationale

- **Preserves Git blame:** Original filenames searchable in `git log`
- **Minimal disruption:** Developers don't need to learn new names
- **Context-aware dating:** Only add dates where humans need temporal context
- **Consistency:** Same naming style across docs in each folder

---

## 3. REFERENCE STRATEGY FOR MERGED FILES

### Context: Files Being Consolidated

| Original File | Target | Type | Content Disposition |
|---|---|---|---|
| `PRODUCTION_READINESS_KPI.md` | `PRODUCTION_READINESS.md` | Merge | Content integrated into parent |
| `PRODUCTION_READINESS_SIGN_OFF.md` | `PRODUCTION_READINESS.md` | Merge | Content integrated into parent |
| `ERROR_PREVENTION_PATTERNS.md` | `CODING_RULES_AND_PATTERNS.md` | Merge | Content integrated into parent |
| `PRODUCTION_DOCS_INDEX.md` | (None - consolidate) | Archive | Redundant; no active doc links it |

### Decision Matrix: For Each Merged File

**Option Comparison:**

- **A: Delete** — Remove file, rely on `git history`
- **B: Stub Redirect** — Leave minimal redirect file pointing to new location
- **C: Archive** — Move to `archive/merged/` with cross-reference

#### PRODUCTION_READINESS_KPI → PRODUCTION_READINESS

**Decision: DELETE** ✅

```
Status:      DELETED (no file remains)
Git History: ✅ Preserved — can be recovered via git show <commit>:docs/PRODUCTION_READINESS_KPI.md
References:  0 active references after merge (9 refs found, all in cleanup docs)
New Link:    Content appears in PRODUCTION_READINESS.md section "KPI Tracking"
```

**Rationale:**

- No active references in code (9 refs all in cleanup/phase planning docs)
- Content is subset of PRODUCTION_READINESS (not standalone info)
- When developer searches, they'll find consolidated version first
- Git history covers any historical need

**Example Git Recovery:**

```bash
# If needed later:
git show HEAD~5:docs/PRODUCTION_READINESS_KPI.md > temp.md
```

---

#### PRODUCTION_READINESS_SIGN_OFF → PRODUCTION_READINESS

**Decision: DELETE** ✅

```
Status:      DELETED (no file remains)
Git History: ✅ Preserved — can be recovered via git show
References:  0 active references after merge
New Link:    Content appears in PRODUCTION_READINESS.md section "Sign-Off Checklist"
```

**Rationale:**

- Final checklist should be in parent doc (single source of truth)
- No active code references this file
- Easier for developers: one file to check, not two
- Temporary artifact from Phase 2 work

---

#### ERROR_PREVENTION_PATTERNS → CODING_RULES_AND_PATTERNS

**Decision: DELETE** ✅

```
Status:      DELETED (no file remains)
Git History: ✅ Preserved — can be recovered via git show
References:  12 refs found (all in planning/session docs, merge these refs into CODING_RULES)
New Link:    Content appears in CODING_RULES_AND_PATTERNS.md section "Error Prevention Patterns"
Metadata:    Add comment in CODING_RULES showing merged-from location
```

**Rationale:**

- 12 references (mostly in cleanup docs) will be consolidated when CODING_RULES is referenced
- Error prevention is a pattern category, belongs in rules doc
- Search for "error prevention" → finds CODING_RULES immediately
- Maintains single source of truth for patterns

**Implementation Detail:**
Add metadata comment in CODING_RULES after merge:

```markdown
<!-- MERGED: This section incorporates content from docs/ERROR_PREVENTION_PATTERNS.md (deleted 2025-12-20) -->
## Error Prevention Patterns

[Content from ERROR_PREVENTION_PATTERNS.md]
```

---

#### PRODUCTION_DOCS_INDEX → (Consolidation)

**Decision: DELETE** ✅

```
Status:      DELETED (no file remains)
Git History: ✅ Preserved
References:  0 active references
New Link:    None — redundant with PRODUCTION_READINESS.md navigation
Alternative: Link structure in main README instead
```

**Rationale:**

- 0 active references (orphaned doc)
- Index content is redundant with PRODUCTION_READINESS.md headings
- Navigation should happen via README or docs hub, not index file
- Removes maintenance burden (no need to keep index in sync)

---

### Summary: Merged Files Strategy

| File | Action | Reason | Recovery Method |
|------|--------|--------|-----------------|
| PRODUCTION_READINESS_KPI | Delete | Subset of parent; 0 active refs | `git show` + search |
| PRODUCTION_READINESS_SIGN_OFF | Delete | Temporary; content merges cleanly | `git show` + search |
| ERROR_PREVENTION_PATTERNS | Delete | Pattern category; 12 refs → CODING_RULES | `git show` + search |
| PRODUCTION_DOCS_INDEX | Delete | Orphaned; redundant navigation | `git show` + search |

**Key Principle:** Merged files are **NOT archived** — they're **deleted** with Git history coverage. This is cleaner than stub files or archive copies, because:

- ✅ Single source of truth (no duplicate content)
- ✅ Git blame shows original author & context
- ✅ No maintenance burden (no stubs to update)
- ✅ Developers naturally find consolidated version

---

## 4. DISCOVERABILITY PLAN

### Goal: Make Any Archived File Findable in 30 Seconds

#### 4a. archive/README.md Structure

```markdown
# Archive Index

**Last Updated:** December 6, 2025
**Total Size:** ~300K across 14 files

The docs/ directory grows over time with planning artifacts, session notes, and 
strategic input. This archive preserves historical documentation while keeping 
active docs lean. All archived files remain available via Git history.

## Quick Navigation

| Category | Files | Size | Status | Recovery |
|----------|-------|------|--------|----------|
| **Phase Work** | 3 | 44K | Phase 2 complete | Search `archive/phase-work/` |
| **Reports** | 2 | 24K | Session/staging notes | Search `archive/reports/` |
| **Strategic** | 2 | 108K | Long-term input | Search `archive/strategic/` |
| **Cleanup** | 1 | 28K | Planning artifact | Search `archive/cleanup/` |
| **Version History** | 1 | 4K | Superseded | Search `archive/version-history/` |

## By File (Alphabetical)

### Phase Work (Archive)
- `PHASE_2_DETAILED_PLAN.md` (20K) — Comprehensive Phase 2 planning document
- `PHASE_2_EXECUTION_SUMMARY.md` (12K) — Phase 2 execution tracking
- `PHASE_2_QUICK_REFERENCE.md` (12K) — Phase 2 quick lookup

### Reports (Archive)
- `SESSION_SUMMARY_DEC_1_2025.md` (12K) — Session notes from Dec 1 session
- `PR_STAGING_SUMMARY_2025-12-06.md` (12K) — PR staging/review notes

### Strategic (Archive)
- `ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` (68K) — Architectural review input
- `CODEBASE_ARCHITECTURAL_INDEX.md` (40K) — Architecture index

### Cleanup (Archive)
- `CLEANUP_INDEX.md` (28K) — Phase 1 cleanup planning document

### Version History (Archive)
- `VERSION_v14.5.md` (4K) — Version v14.5 release notes

## Merged Files (Consolidated into Active Docs)

These files were consolidated into active docs and **deleted** (not archived). 
Content is preserved via Git history and visible in the target document.

| Original File | Consolidated Into | Date | Recovery |
|---|---|---|---|
| `PRODUCTION_READINESS_KPI.md` | `docs/PRODUCTION_READINESS.md` | 2025-12-20 | `git show HEAD~N:docs/PRODUCTION_READINESS_KPI.md` |
| `PRODUCTION_READINESS_SIGN_OFF.md` | `docs/PRODUCTION_READINESS.md` | 2025-12-20 | `git show HEAD~N:docs/PRODUCTION_READINESS_SIGN_OFF.md` |
| `ERROR_PREVENTION_PATTERNS.md` | `docs/CODING_RULES_AND_PATTERNS.md` | 2025-12-20 | `git show HEAD~N:docs/ERROR_PREVENTION_PATTERNS.md` |
| `PRODUCTION_DOCS_INDEX.md` | (Deleted - redundant) | 2025-12-06 | `git show HEAD:docs/PRODUCTION_DOCS_INDEX.md` |

## How to Recover an Archived File

### Via Directory

```bash
# Browse in VS Code or editor
code archive/phase-work/PHASE_2_DETAILED_PLAN.md

# Or from CLI
cat archive/phase-work/PHASE_2_DETAILED_PLAN.md
```

### Via Git History (If Accidentally Deleted)

```bash
# List commits that deleted a file
git log --diff-filter=D --summary | grep "delete.*FILENAME"

# Recover a deleted file
git show <commit>^:docs/FILENAME.md > docs/FILENAME.md

# Example: Recover ERROR_PREVENTION_PATTERNS
git show abc1234^:docs/ERROR_PREVENTION_PATTERNS.md > docs/ERROR_PREVENTION_PATTERNS.md
```

### Via Git Search

```bash
# Search for content across all commits
git log -p -S "search term" -- docs/

# Find when a file was deleted
git log --all -- docs/SESSION_SUMMARY_DEC_1_2025.md
```

## Archive Organization Principles

1. **Semantic Grouping** — Organized by purpose (phase-work, reports, strategic)
2. **Temporal Preservation** — Original filenames keep dates where relevant
3. **Git as Source** — Archive is convenience; Git history is authoritative
4. **Minimal Maintenance** — No indexing overhead; just organized folders
5. **Clear Deprecation** — Merged files show target document in commit message

## When to Archive vs. Merge

- **Archive** — Useful context/history but not actively referenced (reports, planning)
- **Delete/Merge** — Content should live in active doc; duplication is problematic

## Contributing to Archive

- Don't add to archive directly; request via issue
- Archive decisions require approval (likely linked to cleanup phase)
- Update MANIFEST.json when adding files

---

**Questions?** See `MANIFEST.json` for machine-readable metadata or open an issue.

```

---

#### 4b. archive/MANIFEST.json

```json
{
  "archive_metadata": {
    "created": "2025-12-06",
    "last_updated": "2025-12-20",
    "total_size_bytes": 307200,
    "total_files": 14,
    "purpose": "Historical documentation and planning artifacts"
  },
  "waves": {
    "wave_1": {
      "status": "executed",
      "date": "2025-12-06",
      "description": "Immediate cleanup of planning & session artifacts",
      "files": [
        {
          "name": "CLEANUP_INDEX.md",
          "original_size_bytes": 28672,
          "archived_path": "archive/cleanup/CLEANUP_INDEX.md",
          "purpose": "Phase 1 cleanup planning index",
          "active_references": 0,
          "merged": false,
          "git_history": true
        },
        {
          "name": "SESSION_SUMMARY_DEC_1_2025.md",
          "original_size_bytes": 12288,
          "archived_path": "archive/reports/SESSION_SUMMARY_DEC_1_2025.md",
          "purpose": "Session notes and decisions",
          "active_references": 0,
          "merged": false,
          "git_history": true
        },
        {
          "name": "VERSION_v14.5.md",
          "original_size_bytes": 4096,
          "archived_path": "archive/version-history/VERSION_v14.5.md",
          "purpose": "Superseded version notes",
          "active_references": 0,
          "merged": false,
          "git_history": true
        },
        {
          "name": "PR_STAGING_SUMMARY.md",
          "original_size_bytes": 12288,
          "archived_path": "archive/reports/PR_STAGING_SUMMARY_2025-12-06.md",
          "purpose": "PR staging and review notes",
          "active_references": 6,
          "references_from": ["PHASE_2_DETAILED_PLAN.md", "CLEANUP_INDEX.md"],
          "merged": false,
          "git_history": true
        },
        {
          "name": "PHASE_2_START_HERE.md",
          "original_size_bytes": 12288,
          "archived_path": "archive/phase-work/PHASE_2_START_HERE.md",
          "purpose": "Phase 2 entry point document",
          "active_references": 0,
          "merged": false,
          "git_history": true
        }
      ]
    },
    "wave_2": {
      "status": "pending",
      "planned_date": "2025-12-20",
      "description": "Phase 2 planning documents after phase completion",
      "trigger": "Phase 2 work officially complete",
      "files": [
        {
          "name": "PHASE_2_DETAILED_PLAN.md",
          "original_size_bytes": 20480,
          "archived_path": "archive/phase-work/PHASE_2_DETAILED_PLAN.md",
          "purpose": "Detailed Phase 2 task planning",
          "active_references": 5,
          "references_from": ["PHASE_2_START_HERE.md", "README.md"],
          "merged": false,
          "git_history": true
        },
        {
          "name": "PHASE_2_EXECUTION_SUMMARY.md",
          "original_size_bytes": 12288,
          "archived_path": "archive/phase-work/PHASE_2_EXECUTION_SUMMARY.md",
          "purpose": "Phase 2 execution tracking",
          "active_references": 2,
          "merged": false,
          "git_history": true
        },
        {
          "name": "PHASE_2_QUICK_REFERENCE.md",
          "original_size_bytes": 12288,
          "archived_path": "archive/phase-work/PHASE_2_QUICK_REFERENCE.md",
          "purpose": "Quick lookup for Phase 2 tasks",
          "active_references": 1,
          "merged": false,
          "git_history": true
        }
      ]
    },
    "wave_3": {
      "status": "pending",
      "planned_date": "2026-01-15",
      "description": "Strategic input documents after post-Phase 2 review",
      "trigger": "Strategic review period complete",
      "files": [
        {
          "name": "ARCHITECTURAL_REVIEW_PANEL_INPUTS.md",
          "original_size_bytes": 69632,
          "archived_path": "archive/strategic/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md",
          "purpose": "Architectural review input and feedback",
          "active_references": 0,
          "merged": false,
          "git_history": true
        },
        {
          "name": "CODEBASE_ARCHITECTURAL_INDEX.md",
          "original_size_bytes": 40960,
          "archived_path": "archive/strategic/CODEBASE_ARCHITECTURAL_INDEX.md",
          "purpose": "Architecture index and component map",
          "active_references": 0,
          "merged": false,
          "git_history": true
        }
      ]
    },
    "consolidation": {
      "status": "pending",
      "planned_date": "2025-12-20",
      "description": "Merge files into active docs (files deleted, not archived)",
      "files": [
        {
          "name": "PRODUCTION_READINESS_KPI.md",
          "consolidated_into": "PRODUCTION_READINESS.md",
          "action": "delete",
          "archived": false,
          "merge_date": "2025-12-20",
          "git_history": true
        },
        {
          "name": "PRODUCTION_READINESS_SIGN_OFF.md",
          "consolidated_into": "PRODUCTION_READINESS.md",
          "action": "delete",
          "archived": false,
          "merge_date": "2025-12-20",
          "git_history": true
        },
        {
          "name": "ERROR_PREVENTION_PATTERNS.md",
          "consolidated_into": "CODING_RULES_AND_PATTERNS.md",
          "action": "delete",
          "archived": false,
          "merge_date": "2025-12-20",
          "git_history": true
        },
        {
          "name": "PRODUCTION_DOCS_INDEX.md",
          "consolidated_into": null,
          "action": "delete",
          "archived": false,
          "reason": "Redundant with navigation structure",
          "deletion_date": "2025-12-06",
          "git_history": true
        }
      ]
    }
  },
  "statistics": {
    "total_archived_files": 10,
    "total_deleted_files": 4,
    "archived_size_bytes": 224256,
    "deleted_size_bytes": 40960,
    "largest_file": {
      "name": "ARCHITECTURAL_REVIEW_PANEL_INPUTS.md",
      "size_bytes": 69632
    },
    "most_referenced_deleted": {
      "name": "ERROR_PREVENTION_PATTERNS.md",
      "reference_count": 12
    }
  },
  "recovery_instructions": {
    "archived_file": "See archive/README.md or use: ls archive/",
    "deleted_file": "git show <commit>:docs/FILENAME.md",
    "search_all_history": "git log -p -S 'search_term' -- docs/"
  }
}
```

**Why MANIFEST.json?**

- ✅ Machine-readable for scripts/tools
- ✅ Single source of truth for archive metadata
- ✅ Tracks reference counts before consolidation
- ✅ Enables automation (e.g., link validator)
- ✅ Documents reasoning for each decision

---

#### 4c. Metadata Comments in Merged-Into Docs

**In PRODUCTION_READINESS.md, add after merge:**

```markdown
<!-- CONSOLIDATED: This section incorporates content from two previous docs
     Files: PRODUCTION_READINESS_KPI.md, PRODUCTION_READINESS_SIGN_OFF.md
     Merged: 2025-12-20
     Git History: Can recover via git show <commit>:docs/PRODUCTION_READINESS_KPI.md
-->

## KPI Tracking & Metrics

[Content merged from PRODUCTION_READINESS_KPI.md]
...

## Sign-Off Checklist

[Content merged from PRODUCTION_READINESS_SIGN_OFF.md]
...
```

**In CODING_RULES_AND_PATTERNS.md, add after merge:**

```markdown
<!-- CONSOLIDATED: This section incorporates content from ERROR_PREVENTION_PATTERNS.md
     File: ERROR_PREVENTION_PATTERNS.md
     Merged: 2025-12-20
     Git History: Can recover via git show <commit>:docs/ERROR_PREVENTION_PATTERNS.md
-->

## Error Prevention Patterns

[Content merged from ERROR_PREVENTION_PATTERNS.md]
...
```

---

### 4d. Cross-Reference Table in archive/README.md

Already included in 4a above, but key insight:

```markdown
## Merged Files (Consolidated into Active Docs)

| Original File | Consolidated Into | Date | Recovery |
|---|---|---|---|
| `PRODUCTION_READINESS_KPI.md` | `docs/PRODUCTION_READINESS.md` | 2025-12-20 | `git show HEAD~N:docs/...` |
...
```

This table appears in every archive README so developers know:

- ✅ Where content went
- ✅ When it was merged
- ✅ How to recover it if needed

---

## 5. VALIDATION CHECKLIST

### Pre-Archival Verification Process

Before archiving any file, use this checklist to ensure safe archival:

```markdown
# Pre-Archival Validation Checklist

File: ____________________  
Date: ____________________

## References & Dependencies

- [ ] **Ref Check (PASS/FAIL):** Run grep for all references in active codebase
  ```bash
  grep -r "FILENAME" docs/ apps/ packages/ functions/ --exclude-dir=archive
  ```

- Expected result: 0 references (OK if only in cleanup/planning docs)
- If > 0 active refs: ❌ DO NOT ARCHIVE — must update references first

- [ ] **README Check (PASS/FAIL):** File is NOT linked from main docs/README.md

  ```bash
  grep "FILENAME" docs/README.md
  ```

  - Expected: No match
  - If found: ❌ DO NOT ARCHIVE — update README first

- [ ] **Hub Check (PASS/FAIL):** File is NOT linked from any doc hub
  - Manually check: PHASE_2_START_HERE.md, CLEANUP_INDEX.md, STATE_INDEX.md
  - Look for markdown links: `[text](docs/FILENAME.md)` or similar
  - Expected: No active hub links
  - If found: ❌ DO NOT ARCHIVE — remove link first

## Consolidation Checks (if merged file)

- [ ] **Replacement Exists (PASS/FAIL):** Target document exists and has been updated
  - File: `docs/TARGET_FILE.md`
  - Content integrated: ✅ YES / ❌ NO
  - If NO: ❌ DO NOT ARCHIVE — merge first

- [ ] **Duplicate Check (PASS/FAIL):** Content doesn't appear in multiple active docs

  ```bash
  grep -r "CONTENT_SAMPLE" docs/ --exclude-dir=archive
  ```

  - Expected: Only in target file and being-deleted file
  - If multiple: ❌ DO NOT ARCHIVE — resolve duplication first

## Final Checks

- [ ] **Git History (ALWAYS YES):** File will be recoverable via Git
  - Status: ✅ Always true (git preserves all history)
  - How to recover: `git show <commit>:docs/FILENAME.md`

- [ ] **Archival Path Ready (PASS/FAIL):** Target archive folder exists
  - Folder: `archive/[category]/`
  - Expected: Folder created or exists
  - If not: ❌ Create folder first: `mkdir -p archive/[category]`

- [ ] **MANIFEST Updated (PASS/FAIL):** Entry added to archive/MANIFEST.json
  - File entry added: ✅ YES / ❌ NO
  - If NO: ❌ DO NOT ARCHIVE — update MANIFEST first

## Safety Summary

### ✅ SAFE TO ARCHIVE IF ALL ABOVE ARE

- Ref Check: PASS (0 active refs)
- README Check: PASS (not linked)
- Hub Check: PASS (not linked from hubs)
- Replacement Exists: PASS (if merged file)
- Git History: YES (always true)
- Archive Path Ready: PASS
- MANIFEST Updated: PASS

### ❌ DO NOT ARCHIVE IF ANY OF

- Ref Check: FAIL (active references exist)
- README Check: FAIL (linked from README)
- Hub Check: FAIL (linked from hub document)
- Replacement Exists: FAIL (merged file without target)
- Archive Path Ready: FAIL (folder doesn't exist)
- MANIFEST Updated: FAIL (metadata not recorded)

---

## Example: CLEANUP_INDEX.md Validation

```bash
# 1. Check references
$ grep -r "CLEANUP_INDEX" docs/ apps/ packages/ functions/ --exclude-dir=archive
docs/PHASE_2_DETAILED_PLAN.md:See docs/CLEANUP_INDEX.md for full details."
docs/SESSION_SUMMARY_DEC_1_2025.md:(mentions CLEANUP_INDEX)
# ✅ Only planning docs reference it; safe to archive

# 2. Check README
$ grep "CLEANUP_INDEX" docs/README.md
# ✅ No match; safe to archive

# 3. Check hubs
$ grep "CLEANUP_INDEX" docs/PHASE_2_START_HERE.md docs/STATE_INDEX.md
# ✅ No matches; safe to archive

# 4. Verify archive folder
$ ls -la archive/cleanup/ || mkdir -p archive/cleanup/
# ✅ Folder ready

# 5. Update MANIFEST.json
# ✅ Entry added

# RESULT: ✅ SAFE TO ARCHIVE
```

---

## Example: ERROR_PREVENTION_PATTERNS.md Validation

```bash
# 1. Check references
$ grep -r "ERROR_PREVENTION_PATTERNS" docs/ apps/ packages/ functions/ --exclude-dir=archive
docs/CLEANUP_INDEX.md:...
docs/SESSION_SUMMARY_DEC_1_2025.md:...
(12 refs total, all in cleanup/planning docs)
# ⚠️ Has 12 references, but all in docs being archived/consolidated
# ✅ Safe to archive AND delete (since target CODING_RULES.md exists)

# 2. Check if target exists
$ ls docs/CODING_RULES_AND_PATTERNS.md
docs/CODING_RULES_AND_PATTERNS.md
# ✅ Target exists and content merged

# 3. Verify no active refs outside cleanup docs
$ grep -r "ERROR_PREVENTION_PATTERNS" docs/ apps/ packages/ functions/ --exclude="CLEANUP_INDEX*" --exclude="SESSION_SUMMARY*" --exclude-dir=archive
# ✅ No matches; all refs are in cleanup docs

# RESULT: ✅ SAFE TO DELETE & CONSOLIDATE
```

---

# Executable Validation Script

```bash
#!/bin/bash
# validate-archive-candidate.sh
# Usage: ./validate-archive-candidate.sh FILENAME

FILENAME=$1
if [ -z "$FILENAME" ]; then
  echo "Usage: $0 FILENAME"
  exit 1
fi

echo "Validating: $FILENAME"
echo ""

# Check 1: Active references
echo "Check 1: Active References"
REFS=$(grep -r "$FILENAME" docs/ apps/ packages/ functions/ --exclude-dir=archive 2>/dev/null | wc -l)
if [ $REFS -eq 0 ]; then
  echo "✅ PASS: 0 active references"
else
  echo "❌ FAIL: $REFS references found"
  grep -r "$FILENAME" docs/ apps/ packages/ functions/ --exclude-dir=archive 2>/dev/null | head -5
fi

# Check 2: README link
echo ""
echo "Check 2: README Link"
if grep -q "$FILENAME" docs/README.md 2>/dev/null; then
  echo "❌ FAIL: File is linked from docs/README.md"
else
  echo "✅ PASS: Not linked from docs/README.md"
fi

# Check 3: Archive path
echo ""
echo "Check 3: Archive Path Ready"
CATEGORY=$2
if [ -z "$CATEGORY" ]; then
  CATEGORY="other"
fi
if [ -d "archive/$CATEGORY" ] || mkdir -p "archive/$CATEGORY" 2>/dev/null; then
  echo "✅ PASS: archive/$CATEGORY/ ready"
else
  echo "❌ FAIL: Cannot create archive/$CATEGORY/"
fi

echo ""
echo "---"
echo "Run: git log --all -- docs/$FILENAME (to verify Git history coverage)"
```

---

```

