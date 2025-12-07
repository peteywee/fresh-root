#!/usr/bin/env bash

set -euo pipefail
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI 'gh' is not installed. Please install it to run this script." >&2
    echo "Installation instructions: https://cli.github.com/" >&2
    exit 1
fi
# --- Configuration ---
# You can replace the defaults or pass the owner and repo as arguments to the script.
OWNER=${1:-"peteywee"}
REPO=${2:-"fresh-root"}
# ---------------------

# Function to apply branch protection rules.
apply_protection() {
    local branch_name=$1
    local description=$2
    echo "🛡️  Applying protection for '$branch_name' branch ($description)..."
    
    # The GitHub API for branch protection requires a PUT request.
    if ! gh api "repos/$OWNER/$REPO/branches/$branch_name/protection" \
      --method PUT \
      --silent \
      --input -; then
        echo "❌ Failed to apply protection for '$branch_name' branch." >&2
        exit 1
    fi
    echo "✅ Protection applied for '$branch_name' branch."
}

echo "🔒 Branch Protection Configuration for $OWNER/$REPO"
echo "=================================================="
echo ""

# Main branch - Most restrictive
echo "1️⃣  MAIN BRANCH (Production)"
echo "---"
apply_protection "main" "Most restrictive" << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["series-a-ci.yml", "playwright.yml"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": {
    "users": [],
    "teams": [],
    "apps": []
  },
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
echo ""

# Dev branch - Moderate
echo "2️⃣  DEV BRANCH (Development)"
echo "---"
apply_protection "dev" "Moderate" << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["series-a-ci.yml"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
echo ""

# Docs-tests-logs - Archive
echo "3️⃣  DOCS-TESTS-LOGS BRANCH (Archive/Documentation)"
echo "---"
apply_protection "docs-tests-logs" "Archive/Documentation" << 'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": []
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
echo ""

echo "📋 Summary of rules applied:"
echo "============================"
echo "✅ main           - Strict: 2 required checks, code review required, no force push"
echo "✅ dev            - Moderate: 1 required check, code review required, no force push"
echo "✅ docs-tests-logs - Light: No checks, archive-only, no force push"
echo ""

echo "🔑 To execute:"
echo "Run: bash scripts/protect-branches.sh [owner] [repo]"
echo "Example: bash scripts/protect-branches.sh peteywee fresh-root"
echo ""
