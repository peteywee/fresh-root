#!/usr/bin/env bash
# [P1][OBS][ALERTS] Create an Uptime alert policy from JSON
# Tags: P1, OBS, ALERTS, GCLOUD, OPS
set -euo pipefail

# Requirements:
# - gcloud authenticated with Monitoring Admin
# - Enable APIs: monitoring.googleapis.com
# - You must create an Uptime Check separately (UI or CLI) targeting your URL
# - Create notification channels (Slack webhook or Email) and obtain their IDs
#
# Usage:
#   PROJECT_ID=my-project \
#   POLICY_FILE=scripts/ops/uptime-alert-policy.json \
#   CHANNEL_ID=1234567890 \
#   ./scripts/ops/create-uptime-alert.sh

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
POLICY_FILE="${POLICY_FILE:-scripts/ops/uptime-alert-policy.json}"
CHANNEL_ID="${CHANNEL_ID:?set CHANNEL_ID (Monitoring notification channel ID)}"

echo "[alerts] Using project: ${PROJECT_ID}"

echo "[alerts] Injecting project/channel into policy file"
TMP=$(mktemp)
sed "s/PROJECT_ID/${PROJECT_ID}/g; s/CHANNEL_ID/${CHANNEL_ID}/g" "${POLICY_FILE}" > "${TMP}"

echo "[alerts] Creating alert policy"
gcloud monitoring policies create \
  --project="${PROJECT_ID}" \
  --policy-from-file="${TMP}"

echo "[alerts] Done. Verify the policy in Cloud Monitoring > Alerting."
