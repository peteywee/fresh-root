#!/usr/bin/env bash
# [P1][OPS][SCHEDULER] Create Cloud Scheduler job to trigger Firestore backup
# Tags: P1, OPS, SCHEDULER, FIRESTORE
set -euo pipefail

# Requirements:
# - gcloud authenticated with roles/cloudscheduler.admin and run.invoker (if Cloud Run)
# - API enabled: cloudscheduler.googleapis.com
# - BACKUP_CRON_TOKEN must be set in Cloud Scheduler header and server env
#
# Usage:
#   PROJECT_ID=my-project \
#   LOCATION=us-central1 \
#   JOB_NAME=firestore-backup-daily \
#   TARGET_URL=https://your-app.example.com/api/internal/backup \
#   BACKUP_CRON_TOKEN=supersecret \
#   SCHEDULE="0 2 * * *" \
#   ./scripts/ops/create-backup-scheduler.sh

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
LOCATION="${LOCATION:-us-central1}"
JOB_NAME="${JOB_NAME:-firestore-backup-daily}"
TARGET_URL="${TARGET_URL:?set TARGET_URL (public HTTPS endpoint)}"
BACKUP_CRON_TOKEN="${BACKUP_CRON_TOKEN:?set BACKUP_CRON_TOKEN (same value as server env)}"
SCHEDULE="${SCHEDULE:-0 2 * * *}"
TIMEZONE="${TIMEZONE:-UTC}"

# Create or update the job with HTTP target and header token
EXISTS=$(gcloud scheduler jobs describe "${JOB_NAME}" --location="${LOCATION}" --project="${PROJECT_ID}" --format='value(name)' 2>/dev/null || true)

if [[ -z "${EXISTS}" ]]; then
  echo "[scheduler] Creating job ${JOB_NAME}"
  gcloud scheduler jobs create http "${JOB_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${LOCATION}" \
    --schedule="${SCHEDULE}" \
    --time-zone="${TIMEZONE}" \
    --uri="${TARGET_URL}" \
    --http-method=POST \
    --headers="x-backup-token=${BACKUP_CRON_TOKEN}" \
    --attempt-deadline=600s
else
  echo "[scheduler] Updating job ${JOB_NAME}"
  gcloud scheduler jobs update http "${JOB_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${LOCATION}" \
    --schedule="${SCHEDULE}" \
    --time-zone="${TIMEZONE}" \
    --uri="${TARGET_URL}" \
    --http-method=POST \
    --headers="x-backup-token=${BACKUP_CRON_TOKEN}" \
    --attempt-deadline=600s
fi

echo "[scheduler] Done. Test run:"
echo "gcloud scheduler jobs run ${JOB_NAME} --location=${LOCATION} --project=${PROJECT_ID}"
