#!/usr/bin/env bash
# [P2][OPS][CLEANUP] Full Cleanup Script
# Removes legacy/cached directories and temporary files
# Preserves: docs/v14, docs/TODO-v14, core source, tests

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  Cleanup will remove legacy/cached directories${NC}"
echo "This will DELETE:"
echo "  • docs/archive (archived documentation)"
echo "  • docs/blocks (v14 block implementations)"
echo "  • tmp (temporary files)"
echo "  • emulator-data (local Firebase emulator data)"
echo ""
echo "This will PRESERVE:"
echo "  • docs/v14 (v14 documentation)"
echo "  • docs/TODO-v14 (v14 todos)"
echo "  • All source code and tests"
echo ""
read -r -p "Continue? (y/n) " CONFIRM
[[ $CONFIRM != "y" ]] && echo "Aborted." && exit 0

echo -e "${YELLOW}Starting cleanup...${NC}"

# Array of directories to delete
DIRS_TO_DELETE=(
  "docs/archive"
  "docs/blocks"
  "tmp"
  "emulator-data"
)

# Delete each directory with confirmation
for dir in "${DIRS_TO_DELETE[@]}"; do
  if [ -d "$dir" ]; then
    echo -n "Deleting $dir ... "
    rm -rf "$dir"
    echo -e "${GREEN}✓${NC}"
  else
    echo "Skipping $dir (not found)"
  fi
done

# Remove specific files
FILES_TO_DELETE=(
  "BLOCK3_COMPLETION_REPORT.sh"
)

for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    echo -n "Deleting $file ... "
    rm -f "$file"
    echo -e "${GREEN}✓${NC}"
  fi
done

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo "Retained: docs/v14, docs/TODO-v14, all source code"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Commit cleanup: git add -A && git commit -m 'chore: remove legacy v14 artifacts'"
echo "  3. Push: git push origin dev"
