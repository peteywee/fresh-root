#!/usr/bin/env bash
# [P1][OBS][LOGGING] Configure Cloud Logging retention and export sink
# Tags: P1, OBS, LOGGING, GCLOUD, OPS
set -euo pipefail

# Requirements:
# - gcloud authenticated with Project Owner/Logging Admin
# - Enable APIs: logging.googleapis.com
#
# Usage:
#   PROJECT_ID=my-project \
#   LOG_BUCKET_ID=logs-shortretention \
#   RETENTION_DAYS=7 \
#   SINK_NAME=logs-to-bucket \
#   STORAGE_BUCKET=gs://my-log-archive \
#   ./scripts/ops/logging-setup.sh

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
LOG_BUCKET_ID="${LOG_BUCKET_ID:-logs-shortretention}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
SINK_NAME="${SINK_NAME:-logs-to-bucket}"
STORAGE_BUCKET="${STORAGE_BUCKET:?set STORAGE_BUCKET (e.g., gs://my-log-archive)}"

echo "[logging] Project: ${PROJECT_ID}"
echo "[logging] Creating logging bucket: ${LOG_BUCKET_ID} (retention=${RETENTION_DAYS}d)"

gcloud logging buckets create "${LOG_BUCKET_ID}" \
  --project="${PROJECT_ID}" \
  --location=global \
  --retention-days="${RETENTION_DAYS}" \
  --quiet || echo "[logging] Bucket may already exist; proceeding"

echo "[logging] Creating sink '${SINK_NAME}' to route all logs to ${STORAGE_BUCKET}"
# This sink uses a broad filter; tailor as needed
FILTER='severity>=DEFAULT'

gcloud logging sinks create "${SINK_NAME}" "${STORAGE_BUCKET}" \
  --project="${PROJECT_ID}" \
  --log-filter="${FILTER}" \
  --use-partitioned-tables \
  --quiet || echo "[logging] Sink may already exist; updating destination"

gcloud logging sinks update "${SINK_NAME}" "${STORAGE_BUCKET}" \
  --project="${PROJECT_ID}" \
  --quiet || true

echo "[logging] Granting writer permissions to sink service account"
SVC_ACCT=$(gcloud logging sinks describe "${SINK_NAME}" --project="${PROJECT_ID}" --format='value(writerIdentity)')

gcloud storage buckets add-iam-policy-binding "${STORAGE_BUCKET}" \
  --member="${SVC_ACCT}" \
  --role="roles/storage.objectCreator" \
  --quiet

echo "[logging] Done. Verify logs are flowing into ${STORAGE_BUCKET}."
