#!/usr/bin/env bash
# [P2][APP][CODE] Gh Setup Labels
# Tags: P2, APP, CODE
# Fresh Schedules — GitHub Labels bootstrap
# Usage:
#   ./scripts/gh-setup-labels.sh              # apply to current repo (or $GH_REPO)
#   ./scripts/gh-setup-labels.sh --dry-run    # print what would change
#
# Requires: GitHub CLI (gh) authenticated. Optionally set GH_REPO=owner/repo.

set -euo pipefail

DRY_RUN=false
if [[ "${1-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Labels to manage: name|color|description
# Colors must be 6-hex (no #). Keep names stable; edits will update color/description.
LABELS=(
  "security|b60205|Security hardening, auth, sessions, 2FA, rate limits"
  "observability|5319e7|Sentry, logs, tracing, dashboards, alerts"
  "data|0e8a16|Backups, restore drills, data retention, exports"
  "rules|0052cc|Firestore rules, access matrices, validation"
  "ui|1d76db|Design system, tokens, components, visual polish"
  "ux|c5def5|Flows, IA, interaction design, speed-to-publish"
  "e2e|5319e7|Playwright E2E, smoke tests, gating"
  "release|f7c6c7|Deploy, blue/green, rollback, promotions"
  "backend|d4c5f9|API, services, infra code"
  "frontend|f9d0c4|Next.js app, server actions, components"
  "platform|c2e0c6|Pipelines, environments, CI/CD, tooling"
  "priority-blocker|d73a4a|Blocker: must do now"
  "P1|fbca04|High priority: next up"
  "P2|0e8a16|Normal priority"
)

# Determine target repo (gh uses CWD unless GH_REPO is set)
TARGET_REPO="${GH_REPO-}"
if [[ -n "$TARGET_REPO" ]]; then
  echo "[info] Target repo: $TARGET_REPO"
else
  # show repo for confirmation
  echo "[info] Target repo (from CWD): $(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo 'UNKNOWN')"
fi

create_or_update_label () {
  local name="$1"; local color="$2"; local desc="$3"

  if $DRY_RUN; then
    printf '[dry-run] label %-14s color=%-8s desc="%s"\n' "$name" "$color" "$desc"
    return 0
  fi

  # Try create; if exists, update. Avoid noisy errors.
  if gh label create "$name" --color "$color" --description "$desc" >/dev/null 2>&1; then
    printf '[create] label %-14s (%s)\n' "$name" "$color"
  else
    gh label edit "$name" --color "$color" --description "$desc" >/dev/null
    printf '[update] label %-14s (%s)\n' "$name" "$color"
  fi
}

# Ensure gh auth is valid
if ! gh auth status >/dev/null 2>&1; then
  echo "[error] gh is not authenticated. Run: gh auth login"
  exit 1
fi

# If GH_REPO is set, ensure gh targets it
if [[ -n "$TARGET_REPO" ]]; then
  if ! gh repo set-default "$TARGET_REPO" >/dev/null; then
    echo "[error] Failed to set default repo to '$TARGET_REPO'. Please check if the repository exists and you have access."
    exit 1
  fi
fi

# Apply all labels
for row in "${LABELS[@]}"; do
  IFS='|' read -r NAME COLOR DESC <<< "$row"
  create_or_update_label "$NAME" "$COLOR" "$DESC"
done

echo "[done] Labels ensured."
if $DRY_RUN; then
  echo "[note] This was a dry run. Re-run without --dry-run to apply."
fi
