#!/bin/bash
# safe branch cleanup script
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# 1. Ensure we are on dev and up to date
echo "Checking out dev and updating..."
git checkout dev
git pull origin dev
git fetch --prune

echo "------------------------------------------------"
echo "Starting cleanup of merged branches..."
echo "------------------------------------------------"

# 2. List of candidate branches to clean
branches_to_clean=$(cat <<BRANCHES
chore/docs-consolidation
consolidate/all-open-prs
copilot/sub-pr-130
feature/triad-remediation-sync
fix/resolve-conflicts
fix/triad-remediation
pr-133
BRANCHES
)

# 3. Iterate
for branch in $(echo "$branches_to_clean" | sed '/^\s*$/d'); do
  # Trim
  branch=$(echo "$branch" | xargs)
  # Skip comments
  [[ -z "$branch" || "$branch" =~ ^# ]] && continue

  # SAFEGUARD
  if [[ "$branch" == "main" || "$branch" == "dev" ]]; then
    echo "SKIPPING PROTECTED BRANCH: $branch"
    echo "---"
    continue
  fi

  echo "Processing: $branch"

  # Delete local branch safely
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Deleting local branch: $branch"
    git branch -D "$branch"
  else
    echo "Local branch $branch does not exist (skipping deletion)."
  fi

  # Check if there's an open PR using this branch as head
  pr_count=$(gh pr list --state open --json number --head "$branch" -R peteywee/fresh-root | jq 'length') || pr_count=0
  if [[ "$pr_count" -gt 0 ]]; then
    echo "Found $pr_count open PR(s) for branch $branch — skipping remote delete."
    echo "---"
    continue
  fi

  # Delete remote branch only if exists and no open PR
  if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    echo "Deleting remote branch: origin/$branch"
    git push origin --delete "$branch" || echo "Failed to delete origin/$branch — it may be protected or already deleted."
  else
    echo "Remote branch origin/$branch does not exist (skipping)."
  fi

  echo "---"
done

echo "------------------------------------------------"
echo "Cleanup complete. Current branch status:"
git branch -v
