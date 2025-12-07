#!/bin/bash
# [P0][GOVERNANCE] Protect main, dev, and docs-tests-logs branches
# Tags: P0, GOVERNANCE, BRANCH-PROTECTION
# Run on GitHub with: gh api ... (see commands below)

set -e

echo "🔒 Branch Protection Configuration"
echo "===================================="
echo ""
echo "This script documents the required branch protection rules."
echo "Run the gh commands below to protect each branch."
echo ""

# Main branch - Most restrictive
echo "1️⃣  MAIN BRANCH (Production)"
echo "---"
echo "gh api repos/{owner}/{repo}/branches/main/protection \\"
echo "  --input - << 'EOF'"
cat << 'EOF'
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
echo "gh api repos/{owner}/{repo}/branches/dev/protection \\"
echo "  --input - << 'EOF'"
cat << 'EOF'
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
echo "gh api repos/{owner}/{repo}/branches/docs-tests-logs/protection \\"
echo "  --input - << 'EOF'"
cat << 'EOF'
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

echo "📋 Summary:"
echo "==========="
echo "✅ main           - Strict: 2 required checks, code review required, no force push"
echo "✅ dev            - Moderate: 1 required check, code review required, no force push"
echo "✅ docs-tests-logs - Light: No checks, archive-only, no force push"
echo ""
echo "🔑 To execute:"
echo "1. Replace {owner}/{repo} with: peteywee/fresh-root"
echo "2. Run each gh api command"
echo "3. Or use: bash scripts/protect-branches.sh (if implemented)"
echo ""
