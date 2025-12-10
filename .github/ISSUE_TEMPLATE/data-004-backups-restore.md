## # Objective

name: DATA-004 Backups & Restore Drill
about: Automate daily Firestore export and validate a restore drill to a scratch project
title: "\[DATA-004] Backups & Restore"
labels: \["data", "platform", "P1"]
assignees: \["peteywee"]

---

## Objective

Ensure **data safety** with scheduled exports and a proven restore.

## Scope

- Daily Firestore export; documented restore drill quarterly.

## Deliverables

- `scripts/ops/backup-firestore.sh`
- `docs/runbooks/restore.md`

## Tasks

- \[ ] Write export script (auth, bucket, prefix).
- \[ ] Schedule via systemd/GitHub Actions/Cloud Scheduler.
- \[ ] Perform restore to scratch project; verify checksums.
- \[ ] Document step-by-step runbook.

## Acceptance Criteria

- Restore completes with checksum validation.

## KPIs

- 100% success on quarterly restore.

## Definition of Done

- Evidence (logs/screens) attached; schedule visible in platform.
