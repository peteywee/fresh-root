#!/bin/bash
# [P1][RELIABILITY][BACKUP] Daily Firestore backup script using gcloud exports
# Tags: P1, RELIABILITY, BACKUP, FIRESTORE, GCLOUD, OPS
set -euo pipefail

# Configuration
PROJECT_ID="${FIREBASE_PROJECT_ID:-fresh-schedules-prod}"
BUCKET_NAME="${BACKUP_BUCKET:-fresh-schedules-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="gs://${BUCKET_NAME}/firestore-backups/${TIMESTAMP}"

echo "[backup] Starting Firestore backup for project: ${PROJECT_ID}"
echo "[backup] Exporting to: ${BACKUP_PATH}"

# Export all Firestore data
gcloud firestore export "${BACKUP_PATH}" \
  --project="${PROJECT_ID}" \
  --collection-ids=""  # Empty means all collections

echo "[backup] Export completed successfully"

# Optional: Clean up old backups (keep last 30 days)
echo "[backup] Cleaning up backups older than 30 days..."
gcloud storage ls -l "gs://${BUCKET_NAME}/firestore-backups/" | \
  grep -E " [0-9]{8}_[0-9]{6} " | \
  awk 'BEGIN { FS = " "; OFS = " " } { print $2, $1 }' | \
  sort -r | \
  tail -n +31 | \
  while read -r path; do
    echo "[backup] Deleting old backup: ${path}"
    gcloud storage rm "${path}" || true
  done

echo "[backup] Backup and cleanup completed"
