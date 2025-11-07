# Logging Retention and Export

This runbook describes how to configure Cloud Logging retention and export logs to Cloud Storage for longer-term retention.

## Prerequisites

- gcloud CLI authenticated with Project Owner/Logging Admin
- APIs enabled: logging.googleapis.com, storage.googleapis.com
- An existing GCS bucket for archives (e.g., `gs://my-log-archive`)

## Steps

1. Configure a short-retention Logging Bucket and export sink:

```bash
PROJECT_ID=my-project \
LOG_BUCKET_ID=logs-shortretention \
RETENTION_DAYS=7 \
SINK_NAME=logs-to-bucket \
STORAGE_BUCKET=gs://my-log-archive \
./scripts/ops/logging-setup.sh
```

2. Verify logs are appearing in your GCS bucket and that the sink service account has
  `roles/storage.objectCreator`.

3. Optional: Create lifecycle rules on the GCS bucket to auto-delete archived logs after N days.

```json
{
  "rule": [{ "action": { "type": "Delete" }, "condition": { "age": 180 } }]
}
```

Apply with:

```bash
gsutil lifecycle set lifecycle.json gs://my-log-archive
```

## Notes

- The default `_Default` logging bucket may have longer retention; this script creates a separate bucket with shorter retention.
- Tailor the sink `--log-filter` in `logging-setup.sh` to control which logs are exported.
