#!/usr/bin/env bash
# [P2][APP][CODE] Purge History Vendors
# Tags: P2, APP, CODE
# [HIGH][INFRA][DESTRUCTIVE]
# Tags: git, history-rewrite, legacy, vendor-management
# DANGER: Permanently rewrites git history to remove legacy/vendor blobs.
# Use ONLY if the repo is already polluted and size is a problem.
# Requires: pipx install git-filter-repo  (or brew install git-filter-repo)

set -euo pipefail

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo is required. Install with:"
  echo "  pipx install git-filter-repo  # or 'brew install git-filter-repo'"
  exit 2
fi

echo "==> Verifying clean working tree"
test -z "$(git status --porcelain)" || { echo "Working tree not clean"; exit 3; }

echo "==> BACKUP: creating mirror clone under ../repo-backup-$(basename "$PWD")"
cd ..
cp -a "$(basename "$OLDPWD")" "repo-backup-$(basename "$OLDPWD")"
cd "$OLDPWD"

# Build path-specs file for removal
cat > /tmp/strip_paths.txt <<'EOF'
_legacy/
docs/archive/
docs/**/node_modules/
docs/**/.pnpm/
docs/**/dist/
docs/**/build/
EOF

echo "==> Rewriting history to remove vendored/legacy paths"
git filter-repo --force --invert-paths --paths-from-file /tmp/strip_paths.txt

echo "==> Force-pushing rewritten history (manual step suggested!)"
echo "Run after verification:"
echo "  git push --force-with-lease origin --all"
echo "  git push --force-with-lease origin --tags"
