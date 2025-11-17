# Phase 3 – Data Migration Checklist (v15)

**Purpose**
Plan and track all steps needed to migrate existing Firestore data into the **v15 canonical schema** without corruption or silent data loss.

---

## 1. Preconditions

- `PHASE2_SCHEMA_CROSSWALK.md` is filled out for:
  - `networks`, `corps`, `orgs`, `venues`, `staff`, `shifts`, `attendance`, `orgTokens`, and any other active collections.
- Migration scripts have been sketched or stubbed under `scripts/`.

---

## 2. Environment Strategy

- [ ] Confirm list of Firestore environments:
  - [ ] Emulator (local dev)
  - [ ] Dev
  - [ ] Staging
  - [ ] Production
- [ ] Define migration order:
  - Emulator → Dev → Staging → Production.
- [ ] Ensure backup/export strategy for each environment:
  - [ ] Firestore export prior to migration.
  - [ ] Ability to restore if migration fails.

---

## 3. Script Checklist

For each entity listed in `PHASE2_SCHEMA_CROSSWALK.md`:

- [ ] `scripts/migrate_networks_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_corps_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_orgs_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_venues_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_staff_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_shifts_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_attendance_v15.ts` written and tested in emulator.
- [ ] `scripts/migrate_org_tokens_v15.ts` written and tested in emulator.
- [ ] Any additional scripts (user profiles, etc.) documented and tested.

For each script:

- [ ] Logs meaningful progress and errors.
- [ ] Can be run in “dry-run” mode (no writes) if feasible.
- [ ] Can be safely re-run (idempotent or guarded).

---

## 4. Emulator Dry-Run

- [ ] Seed emulator with a representative dataset that mimics production structures.
- [ ] Run each migration script in order.
- [ ] Verify:
  - [ ] Document counts before vs after (taking into account expected changes).
  - [ ] New schema fields exist and are correct.
  - [ ] Orphaned or problematic records are captured in a dedicated collection/log.
- [ ] Update `PHASE2_SCHEMA_CROSSWALK.md` Notes column with any discovered edge cases.

---

## 5. Dev / Staging Migrations

For each non-prod environment:

- [ ] Take a Firestore export/backup.
- [ ] Run migration scripts in a controlled window.
- [ ] Run application-level tests against migrated environment:
  - Onboarding, scheduling, attendance.
- [ ] Compare:
  - [ ] Data shape vs emulator expectations.
  - [ ] Any anomalies logged and addressed.

---

## 6. Production Migration Plan

- [ ] Choose a migration window and communicate downtime expectations if any.
- [ ] Ensure monitoring and logging are in place.
- [ ] Take a final Firestore export before migration.
- [ ] Run scripts in the agreed order.
- [ ] Run smoke tests on the live application:
  - Login, onboarding, viewing schedules, creating a simple schedule, recording attendance.
- [ ] Document:
  - Start and end time of migration.
  - Success/failure of each script.
  - Any manual fixes applied.

---

## 7. Rollback Strategy

- [ ] Define what “rollback” means for your case:
  - Full restore from export, or
  - Partial rollback of certain collections.
- [ ] Confirm the process to restore from backup has been tested at least once in a non-prod environment.

---

## 8. Completion Criteria

Data migration is considered complete when:

- All scripts have been run in each environment in the defined order.
- v15 schema is in effect across all active collections.
- No known data inconsistencies remain unexplained.
- The app behaves correctly against the migrated data in production.
