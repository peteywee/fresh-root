#!/usr/bin/env bash
# [P1][OBS][UPTIME] Create Monitoring Uptime Check for a URL
# Tags: P1, OBS, UPTIME, MONITORING
set -euo pipefail

# Requirements:
# - gcloud authenticated with Monitoring Admin
# - API: monitoring.googleapis.com enabled
#
# Usage:
#   PROJECT_ID=my-project \
#   DISPLAY_NAME="Web Home" \
#   CHECK_URL="https://your-app.example.com/health" \
#   PERIOD=300s \
#   TIMEOUT=10s \
#   ./scripts/ops/create-uptime-check.sh

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
DISPLAY_NAME="${DISPLAY_NAME:-FreshRoot Web}"
CHECK_URL="${CHECK_URL:?set CHECK_URL (https://...)}"
PERIOD="${PERIOD:-300s}"
TIMEOUT="${TIMEOUT:-10s}"

# Create uptime check config
cat > /tmp/uptime-check.json <<JSON
{
  "displayName": "${DISPLAY_NAME}",
  "monitoredResource": {
    "type": "uptime_url",
    "labels": { "host": "$(echo ${CHECK_URL} | sed -E 's#^https?://([^/]+).*$#\1#')" }
  },
  "httpCheck": { "path": "$(echo ${CHECK_URL} | sed -E 's#^https?://[^/]+(/.*)?$#\1#')", "useSsl": true },
  "period": "${PERIOD}",
  "timeout": "${TIMEOUT}"
}
JSON

echo "[uptime] Creating uptime check for ${CHECK_URL}"
gcloud monitoring uptime-checks create --project="${PROJECT_ID}" --config-from-file=/tmp/uptime-check.json

echo "[uptime] Done. View in Monitoring > Uptime checks."
