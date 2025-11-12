# Phase 2 – Schema Crosswalk (13.5 → 14 → 15)

**Purpose**  
Map Firestore schemas and domain types from legacy designs (13.5/14) to the **v15 canonical schema** so data migration can be automated and safe.

This file is where we decide **exactly** how old docs are transformed.

---

## 1. Columns

Each row covers one Firestore collection or logical entity:

- **Entity / Collection** – e.g., `orgs`, `venues`, `shifts`, `attendance`.  
- **Legacy Schema** – Fields and types as used in 13.5/14 or older code.  
- **v15 Schema** – Fields and types as defined in `@fresh-schedules/types` and v15 Bible.  
- **Migration Strategy** – How to transform old docs into v15 docs.  
- **Script / Tool** – Script name/path or function that performs migration.  
- **Notes** – Edge cases, defaults, or data quality concerns.

---

## 2. Schema Crosswalk Table

```md
| Entity / Collection   | Legacy Schema                                                                 | v15 Schema (from @fresh-schedules/types)                                          | Migration Strategy                                                                                                                           | Script / Tool                           | Notes |
|-----------------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|-------|
| networks              | `id`, `name`, maybe `ownerUserId`; optional metadata.                         | `id`, `name`, `ownerUserId`, `createdAt`, `updatedAt`, optional `settings` object | Add timestamps if missing; ensure `ownerUserId` is set via first org/corp owner if absent.                                                  | `scripts/migrate_networks_v15.ts`       | Validate network IDs used in corps/orgs/venues; orphaned networks should be flagged. |
| corps                 | Often missing; some orgs directly under network.                              | `id`, `networkId`, `name`, `settings`, `createdAt`, `updatedAt`                   | For orgs with no corp: create a default corp per network; set `networkId` based on org; assign existing owner as corp owner.                | `scripts/migrate_corps_v15.ts`          | This may be a synthetic layer; consider naming like “Default Corp for <Network>”. |
| orgs                  | `id`, `name`, `networkId?`, `ownerUserId`, miscellaneous flags.               | `id`, `networkId`, `corpId`, `name`, `ownerUserId`, `settings`, timestamps        | Ensure every org has `networkId`; set `corpId` by joining to corps; normalize `settings` into nested object; add timestamps if missing.     | `scripts/migrate_orgs_v15.ts`           | Any org without clear network should be manually reviewed. |
| venues                | `id`, `orgId`, `name`, maybe `timezone`, inconsistent fields for budget.      | `id`, `orgId`, `name`, `timezone`, `laborBudgetPercent`, `forecastMethod`, timestamps | Rename/normalize fields for budget; default `laborBudgetPercent` from org if absent; default `timezone` from org or a project default.      | `scripts/migrate_venues_v15.ts`         | Any venue without orgId should be logged as an error. |
| staff                 | `id`, `orgId`, `userId`, `role` (string), sometimes `venueId` or `locationId` | `id`, `orgId`, `homeVenueId`, `userId`, `roles` (array/enum), `status`, timestamps | Map `role` string to RBAC enum; rename `venueId`/`locationId` → `homeVenueId`; set default `status` = active; add timestamps if missing.    | `scripts/migrate_staff_v15.ts`          | Verify `userId` refers to valid auth user; consider deactivating orphaned staff. |
| shifts                | `id`, `orgId`, `venueId`, `staffId?`, `start`, `end`, `role?`, loose metadata | `id`, `orgId`, `venueId`, optional `staffId`, `start`, `end`, `position`, timestamps, `state` | Normalize datetime fields; map old `role` into `position`; set `state` = draft/published based on existing flags; add timestamps.            | `scripts/migrate_shifts_v15.ts`         | Ensure timezone correctness; default to venue timezone when converting. |
| attendance            | `id`, `orgId?`, `userId`, `shiftId?`, `status` (string), `timestamp`          | `id`, `orgId`, `venueId`, `staffId`, `shiftId?`, `status` (AttendanceStatus enum), `occurredAt`, timestamps | Map `userId` → `staffId` (join on staff), set `orgId`/`venueId` via staff/shift; rename `timestamp` → `occurredAt`; validate status enum. | `scripts/migrate_attendance_v15.ts`     | Records that cannot be matched to staff/shift should be moved to an “orphaned_attendance” collection. |
| orgTokens / invites   | `id`, `orgId`, `email`, `role`, `status`, `expiresAt?`                        | `id`, `orgId`, `email`, `roles` (array), `state` (issued/pending/accepted/expired), `expiresAt`, timestamps | Map `status` to new `state` enum; ensure `expiresAt` is set (default from createdAt + configured TTL); convert single `role` → array.       | `scripts/migrate_org_tokens_v15.ts`     | Expired or used tokens can be archived or deleted as part of cleanup. |
| userProfiles (if any) | `id`, `userId`, `displayName`, `photoUrl?`, `orgIds?`                        | `id`, `userId`, `displayName`, `photoUrl?`, derived OR separate link to memberships | Ensure each auth user has a corresponding profile; strip or normalize `orgIds` into membership/links collection if v15 prefers that model. | `scripts/migrate_user_profiles_v15.ts`  | This may be an optional migration depending on actual usage. |
```

3. Implementation Notes

All migration scripts should:

Run against the emulator first.

Be idempotent where possible (safe to re-run).

Log and collect any records that cannot be migrated cleanly.

Migration steps should be tracked in:

PHASE3_DATA_MIGRATION_CHECKLIST.md

GitHub issues labeled type:migration and milestone:v15.

4. Acceptance Criteria

Every collection used in production has at least one row in the table.

v15 Schema column refers to concrete types / Zod schemas.

Migration Strategy is clear enough to implement without guessing.

Migration scripts listed here exist under scripts/ and are tested in the emulator.
