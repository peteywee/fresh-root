# Archive Management Scripts

Tools for managing the documentation archive system.

## Available Scripts

### `validate-archive-candidate.sh`

Pre-archival validation tool. Ensures a file is safe to archive before execution.

**Usage:**

```bash
# Basic validation (check if safe to archive)
./scripts/archive/validate-archive-candidate.sh -f FILENAME.md -c category

# Validate a file that will be merged/consolidated
./scripts/archive/validate-archive-candidate.sh -f FILENAME.md -m -t TARGET.md

# Get help
./scripts/archive/validate-archive-candidate.sh -h
```

**Options:**

- `-f, --file FILE` — File to validate (required)
- `-c, --category CAT` — Archive category (default: "other")
- `-m, --merged` — File will be merged into parent doc
- `-t, --target FILE` — Target file for merge (required with -m)

**Examples:**

```bash
# Archive SESSION_SUMMARY_DEC_1_2025.md to archive/reports/
./scripts/archive/validate-archive-candidate.sh \
  -f SESSION_SUMMARY_DEC_1_2025.md \
  -c reports

# Validate PRODUCTION_READINESS_KPI.md consolidation
./scripts/archive/validate-archive-candidate.sh \
  -f PRODUCTION_READINESS_KPI.md \
  -m \
  -t PRODUCTION_READINESS.md
```

**What It Checks:**

1. **File Existence** — Does the file exist in docs/?
2. **Active References** — Are there code references outside cleanup docs?
3. **README Link** — Is file linked from docs/README.md?
4. **Hub Links** — Is file linked from hub documents?
5. **Archive Folder** — Is target archive folder ready?
6. **Merge Target** (if -m) — Does target file exist?
7. **Git History** — Is file tracked in Git?
8. **File Size** — What is the file size?
9. **MANIFEST.json** — Is metadata file ready?

**Output:**

```
✅ PASS - Green check when validation passes
❌ FAIL - Red X when validation fails (don't archive)
⚠️  WARN - Yellow warning (usually OK, but verify)
ℹ️  INFO - Blue info message
```

**Exit Codes:**

- `0` — Safe to archive (all checks pass)
- `1` — Not safe to archive (one or more checks fail)

---

## Archive Directory Structure

```
archive/
├── README.md                    ← Index & recovery guide
├── MANIFEST.json               ← Machine-readable metadata
├── cleanup/                     ← Phase 1 planning artifacts
├── reports/                     ← Session notes & staging reports
├── phase-work/                  ← Phase 2 planning & execution
├── strategic/                   ← Long-term architectural input
└── version-history/             ← Superseded version docs
```

---

## Workflow

### Before Each Wave

1. **Validate candidates** using the script:

   ```bash
   for file in CLEANUP_INDEX.md SESSION_SUMMARY_DEC_1_2025.md; do
     ./scripts/archive/validate-archive-candidate.sh -f "$file" -c reports
   done
   ```

2. **Review output** — If all show ✅ SAFE, proceed to execution

3. **Execute wave** — Follow steps in `docs/ARCHIVE_EXECUTION_TIMELINE.md`

### After Each Wave

1. **Verify** — Check files moved successfully:

   ```bash
   ls archive/[category]/FILENAME.md
   ```

2. **Update MANIFEST.json** — Add metadata entries

3. **Commit** — With reference to validation results

---

## Recovery

### Find Archived File

```bash
# List all archived files
ls -la archive/*/

# Find specific file
find archive/ -name "*FILENAME*"

# Search archive content
grep -r "search term" archive/
```

### Recover from Archive

```bash
# Move back to docs/
git mv archive/[category]/FILENAME.md docs/FILENAME.md
git commit -m "chore: restore FILENAME from archive"
```

### Recover from Git History (If Deleted)

```bash
# Find commit that deleted it
git log --diff-filter=D --summary -- docs/FILENAME.md

# Restore from commit before deletion
git show <commit>^:docs/FILENAME.md > docs/FILENAME.md
git commit -m "chore: restore FILENAME from git history"
```

---

## Documentation

- `docs/ARCHIVE_STRUCTURE_DESIGN.md` — Full design document
- `docs/ARCHIVE_EXECUTION_TIMELINE.md` — Wave-by-wave execution steps
- `docs/ARCHIVE_SUMMARY.md` — Executive overview

---

## Questions

See the documentation files listed above, or open an issue.
