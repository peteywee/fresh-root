#!/usr/bin/env bash
# [P2][APP][CODE] Strip Legacy Vendors
# Tags: P2, APP, CODE
# [MEDIUM][INFRA][CLEANUP]
# Tags: git, cleanup, legacy, vendor-management
# Purpose: Remove already-tracked legacy/vendor bloat from the index while keeping local files.
# Safe: non-destructive to your working copy. It only untracks matching paths.

set -euo pipefail

# Glob set matches the guard & ignore rules.
PATTERNS=(
  "_legacy/**/node_modules"
  "_legacy/**/.pnpm"
  "_legacy/**/.turbo"
  "_legacy/**/dist"
  "_legacy/**/build"
  "docs/archive"
  "docs/archive/**/node_modules"
  "docs/archive/**/.pnpm"
  "docs/archive/**/.turbo"
  "docs/archive/**/dist"
  "docs/archive/**/build"
  "docs/**/node_modules"
  "docs/**/.pnpm"
  "docs/**/dist"
  "docs/**/build"
)

echo "==> Ensuring .gitignore/.eslintignore are present"
test -f .gitignore || { echo "Missing .gitignore"; exit 2; }
test -f .eslintignore || { echo "Missing .eslintignore"; exit 2; }

echo "==> Updating index to untrack forbidden paths (files remain on disk)"
for p in "${PATTERNS[@]}"; do
  # Use git ls-files to find tracked matches, then untrack them
  MATCHES=$(git ls-files -z -- "$p" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo "Untracking matches for: $p"
    git ls-files -z -- "$p" 2>/dev/null | xargs -0 git rm -r --cached -f || true
  fi
done

echo "==> Done. Review 'git status' and commit."
