# Backup Scheduler (Cloud Scheduler → Internal Endpoint)

This runbook configures a daily Cloud Scheduler job that calls an internal
Next.js API endpoint to trigger a Firestore export using the Firestore Admin REST API.

## Prerequisites

- gcloud CLI authenticated with Cloud Scheduler Admin
- APIs enabled: cloudscheduler.googleapis.com, firestore.googleapis.com
- Your server must have credentials for the Firestore Admin API (service account via GOOGLE_APPLICATION_CREDENTIALS_JSON or Workload Identity).

## Steps

1. Set server env and deploy:

- `FIREBASE_PROJECT_ID` — your GCP project id
- `BACKUP_BUCKET` — target GCS bucket for exports (must exist)
- `BACKUP_CRON_TOKEN` — a random secret used to secure the endpoint

The endpoint is `POST /api/internal/backup` and requires header
`x-backup-token: $BACKUP_CRON_TOKEN`.

2. Create the Cloud Scheduler job:

```bash
PROJECT_ID=my-project \
LOCATION=us-central1 \
JOB_NAME=firestore-backup-daily \
TARGET_URL=https://your-app.example.com/api/internal/backup \
BACKUP_CRON_TOKEN=supersecret \
SCHEDULE="0 2 * * *" \
./scripts/ops/create-backup-scheduler.sh
```

3. Test:

```bash
gcloud scheduler jobs run firestore-backup-daily \
  --location=us-central1 \
  --project=my-project
```

## Notes

- The backup job calls the Firestore Admin REST API with scope `datastore`. It does not shell out to `gcloud`.
- You may pass `?collections=colA,colB` to export a subset; omit for all collections.
- Exports are stored under `gs://$BACKUP_BUCKET/firestore-backups/YYYY-MM-DDTHH-MM-SSZ/`.
