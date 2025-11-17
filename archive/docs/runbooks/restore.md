# Firestore Data Restore Runbook

Tags: P1, RELIABILITY, RESTORE, FIRESTORE, BACKUP, RUNBOOK

## Overview

This runbook covers restoring Firestore data from automated backups. Use this
runbook when data corruption, accidental deletion, or other data loss incidents
occur.

## Prerequisites

- GCP project access with Firestore Admin permissions
- Access to backup bucket (`fresh-schedules-backups`)
- gcloud CLI authenticated

## Emergency Contacts

- On-call engineer: Check #incidents Slack channel
- Database admin: @db-admin

## Detection

Data loss may be detected through:

- User reports of missing data
- Application errors indicating missing documents
- Monitoring alerts for unusual data patterns

## Response Steps

### 1. Assess the Situation

```bash
# Check recent backup availability
gcloud storage ls gs://fresh-schedules-backups/firestore-backups/

# Get backup metadata
gcloud storage ls -l gs://fresh-schedules-backups/firestore-backups/ | tail -5
```

### 2. Choose Restore Point

- **Full restore**: Use latest complete backup
- **Point-in-time**: Use specific timestamp backup
- **Partial restore**: Export specific collections only

### 3. Execute Restore

**WARNING: This will overwrite existing data!**

```bash
# Set variables
PROJECT_ID="fresh-schedules-prod"
BACKUP_TIMESTAMP="20231201_020000"  # Adjust to actual backup
BACKUP_PATH="gs://fresh-schedules-backups/firestore-backups/${BACKUP_TIMESTAMP}"

# Import the backup
gcloud firestore import "${BACKUP_PATH}" \
  --project="${PROJECT_ID}" \
  --collection-ids=""  # Empty means all collections
```

### 4. Verify Restore

```bash
# Check document counts
gcloud firestore operations list --project="${PROJECT_ID}"

# Query sample data
# Use Firebase console or API to verify data integrity
```

### 5. Update Application

- Clear application caches (Redis, CDN)
- Restart application services if needed
- Monitor for errors

## Rollback

If restore causes issues:

1. Restore from previous backup
2. Or rollback to previous application deployment

## Communication

- Notify affected users via status page
- Update incident ticket with restore details
- Document lessons learned

## Prevention

- Regular backup testing (monthly)
- Multi-region replication consideration
- Application-level data validation

## Related Documents

- Backup script: `scripts/ops/backup-firestore.sh`
- Monitoring: Observability Runbook
- Incident response: Incident Response Plan
