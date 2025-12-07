#!/bin/bash
# scripts/archive/validate-archive-candidate.sh
# Pre-archival validation tool
# Ensures files are safe to archive before execution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helpers
pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; }
info() { echo -e "${BLUE}ℹ️  INFO${NC}: $1"; }

# Default vars
FILENAME=""
CATEGORY=""
IS_MERGED=false
TARGET_FILE=""
ALL_CHECKS_PASS=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      FILENAME="$2"
      shift 2
      ;;
    -c|--category)
      CATEGORY="$2"
      shift 2
      ;;
    -m|--merged)
      IS_MERGED=true
      shift
      ;;
    -t|--target)
      TARGET_FILE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 -f FILENAME [-c CATEGORY] [-m] [-t TARGET]"
      echo ""
      echo "Options:"
      echo "  -f, --file FILE       File to validate (required)"
      echo "  -c, --category CAT    Archive category (optional, default: 'other')"
      echo "  -m, --merged          File will be merged/consolidated (optional)"
      echo "  -t, --target FILE     Target file for merge (required if -m)"
      echo ""
      echo "Examples:"
      echo "  $0 -f SESSION_SUMMARY_DEC_1_2025.md -c reports"
      echo "  $0 -f PRODUCTION_READINESS_KPI.md -m -t PRODUCTION_READINESS.md"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validation
if [ -z "$FILENAME" ]; then
  echo "Error: -f/--file is required"
  exit 1
fi

if [ "$IS_MERGED" = true ] && [ -z "$TARGET_FILE" ]; then
  echo "Error: -t/--target is required when using -m/--merged"
  exit 1
fi

if [ -z "$CATEGORY" ]; then
  CATEGORY="other"
fi

# Start validation
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Archive Validation: $FILENAME"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# CHECK 1: File exists
echo "Check 1: File Existence"
if [ -f "docs/$FILENAME" ]; then
  pass "File exists: docs/$FILENAME"
else
  fail "File not found: docs/$FILENAME"
  ALL_CHECKS_PASS=false
fi
echo ""

# CHECK 2: Active references in code
echo "Check 2: Active References in Code"
REFS=$(grep -r "$FILENAME" docs/ apps/ packages/ functions/ --exclude-dir=archive 2>/dev/null | grep -v "CLEANUP_INDEX\|SESSION_SUMMARY\|PHASE_2_DETAILED_PLAN\|PHASE_2_EXECUTION_SUMMARY\|PHASE_2_QUICK_REFERENCE\|PHASE_2_START_HERE\|ARCHITECTURAL_REVIEW\|STATE_INDEX\|CONSOLIDATION_CANDIDATES" | wc -l || true)

if [ "$REFS" -eq 0 ]; then
  pass "No active references found"
else
  warn "Found $REFS references (check if all are in cleanup/planning docs)"
  grep -r "$FILENAME" docs/ apps/ packages/ functions/ --exclude-dir=archive 2>/dev/null | head -3
  echo "..."
  # For merged files, this is OK if refs are in cleanup docs
  if [ "$IS_MERGED" = true ]; then
    pass "OK for merged file (refs in cleanup docs will be archived)"
  else
    fail "Active references found (file has dependencies)"
    ALL_CHECKS_PASS=false
  fi
fi
echo ""

# CHECK 3: README link
echo "Check 3: README Link"
if grep -q "$FILENAME" docs/README.md 2>/dev/null; then
  fail "File is linked from docs/README.md"
  grep "$FILENAME" docs/README.md
  ALL_CHECKS_PASS=false
else
  pass "Not linked from docs/README.md"
fi
echo ""

# CHECK 4: Hub document links
echo "Check 4: Hub Document Links"
HUBS="PHASE_2_START_HERE.md CLEANUP_INDEX.md STATE_INDEX.md CONSOLIDATION_CANDIDATES.md"
FOUND_IN_HUB=false

for HUB in $HUBS; do
  if [ -f "docs/$HUB" ] && grep -q "$FILENAME" "docs/$HUB" 2>/dev/null; then
    warn "Found in hub: docs/$HUB"
    FOUND_IN_HUB=true
  fi
done

if [ "$FOUND_IN_HUB" = false ]; then
  pass "Not linked from hub documents"
else
  # For files being archived (not merged), this is OK
  if [ "$IS_MERGED" = false ]; then
    pass "OK for archive (hub docs will be archived/updated)"
  else
    warn "Verify hub will be updated with consolidated doc"
  fi
fi
echo ""

# CHECK 5: Archive folder ready
echo "Check 5: Archive Folder"
ARCHIVE_PATH="archive/$CATEGORY"
if mkdir -p "$ARCHIVE_PATH" 2>/dev/null; then
  pass "Archive folder ready: $ARCHIVE_PATH"
else
  fail "Cannot create archive folder: $ARCHIVE_PATH"
  ALL_CHECKS_PASS=false
fi
echo ""

# CHECK 6: Merged file checks
if [ "$IS_MERGED" = true ]; then
  echo "Check 6: Merge Target"
  if [ -f "docs/$TARGET_FILE" ]; then
    pass "Target file exists: docs/$TARGET_FILE"
    
    # Check if content might already be merged
    SAMPLE_SIZE=100 # bytes to check
    if head -c $SAMPLE_SIZE "docs/$FILENAME" 2>/dev/null | head -c 50 > /tmp/sample.txt 2>/dev/null; then
      SAMPLE=$(head -c 50 "docs/$FILENAME")
      if grep -q "$SAMPLE" "docs/$TARGET_FILE" 2>/dev/null; then
        warn "Content might already be in target file"
      else
        pass "Target file doesn't contain source content (safe to merge)"
      fi
    fi
  else
    fail "Target file not found: docs/$TARGET_FILE"
    ALL_CHECKS_PASS=false
  fi
  echo ""

  echo "Check 6b: Consolidation References"
  CONS_REFS=$(grep -r "$FILENAME" docs/ --exclude-dir=archive 2>/dev/null | wc -l || true)
  if [ "$CONS_REFS" -le 15 ]; then # Cleanup docs typically reference these files
    pass "Manageable consolidation references: $CONS_REFS"
  else
    warn "High reference count: $CONS_REFS (many references to consolidate)"
  fi
  echo ""
fi

# CHECK 7: Git history coverage
echo "Check 7: Git History"
if git log --all -- "docs/$FILENAME" 2>/dev/null | head -1 > /dev/null; then
  COMMIT_COUNT=$(git log --all --oneline -- "docs/$FILENAME" 2>/dev/null | wc -l)
  pass "File has Git history: $COMMIT_COUNT commits"
else
  warn "File may not have Git history (new file?)"
fi
echo ""

# CHECK 8: File size
echo "Check 8: File Size"
FILE_SIZE=$(du -h "docs/$FILENAME" 2>/dev/null | cut -f1)
pass "File size: $FILE_SIZE"
echo ""

# CHECK 9: MANIFEST.json ready
echo "Check 9: MANIFEST.json"
if [ -f "archive/MANIFEST.json" ]; then
  pass "archive/MANIFEST.json exists"
else
  warn "archive/MANIFEST.json not found (will be created)"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "Validation Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$ALL_CHECKS_PASS" = true ]; then
  echo -e "${GREEN}✅ SAFE TO ARCHIVE: $FILENAME${NC}"
  echo ""
  echo "Archive path: $ARCHIVE_PATH/$FILENAME"
  
  if [ "$IS_MERGED" = true ]; then
    echo "Action: DELETE (consolidate into $TARGET_FILE)"
  else
    echo "Action: MOVE to archive"
  fi
  
  echo ""
  echo "Next steps:"
  if [ "$IS_MERGED" = true ]; then
    echo "1. Merge content into docs/$TARGET_FILE"
    echo "2. Add metadata comment showing source"
    echo "3. Run: git rm docs/$FILENAME"
  else
    echo "1. Run: git mv docs/$FILENAME $ARCHIVE_PATH/"
  fi
  echo "4. Update archive/MANIFEST.json"
  echo "5. Commit with reference to this validation"
  echo ""
  exit 0
else
  echo -e "${RED}❌ NOT SAFE TO ARCHIVE: $FILENAME${NC}"
  echo ""
  echo "Issues found:"
  echo "- Check logs above for FAIL items"
  echo "- Address all FAIL items before archiving"
  echo ""
  exit 1
fi
