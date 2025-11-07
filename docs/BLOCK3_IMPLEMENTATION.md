# Block 3 Implementation Summary

> **Note:** Block 3 represents the **Integrity Core** baseline (complete as of v1.1.0).
> **Bible v14.0.0** introduces **Network tenancy** as the production-level multi-tenant architecture.
> Future implementations will migrate org-scoped paths to network-scoped paths (`/networks/{networkId}/...`).
> See [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md) and [TODO v14](./TODO-v14.md) for details.

## Overview

Block 3 (**Integrity Core**) hardens the system around a single idea:

> **Every write goes through a schema and every read goes through rules that are proven.**

This block is responsible for:

- Centralizing **domain schemas** in `packages/types`.
- Enforcing **Zod validation** at the API boundary for all write routes.
- Locking down **Firestore rules** for all org-scoped collections.
- Backing those rules with a **rules test suite** and a **schema–rules parity check**.
- Wiring **pre-commit** and **CI** so that integrity is _enforced_, not just documented.

The work described here is **complete** and is enforced via tests, rules, and tooling.

---

## Files Created

### Zod Schemas (`packages/types/src/`)

These are the canonical domain schemas.

1. **`memberships.ts`**
   - Membership record with:
     - `orgId`, `userId`, `status`
     - Roles: `OrgRole` enum (`"org_owner"`, `"admin"`, `"manager"`, `"scheduler"`, `"corporate"`, `"staff"`)
   - CRUD schemas:
     - `CreateMembershipSchema`
     - `UpdateMembershipSchema`
     - `MembershipQuerySchema` (where applicable)

2. **`positions.ts`**
   - Position details:
     - `orgId`, `name`, `description`
     - `type` (e.g., `"front_of_house"`, `"back_of_house"`, `"support"`)
     - `skillLevel`, `isActive`
   - CRUD schemas:
     - `CreatePositionSchema`
     - `UpdatePositionSchema`

3. **`shifts.ts`**
   - Shift record:
     - `orgId`, `scheduleId`, `venueId`, `zoneId`
     - `start`, `end`, `status` (`"draft"`, `"published"`, `"canceled"`)
     - `assignedUserId`/`openShift` semantics
   - CRUD schemas:
     - `CreateShiftSchema`
     - `UpdateShiftSchema`
   - Time validation (start < end, etc.).

4. **`venues.ts`**
   - Venue details:
     - `orgId`, `name`, `address`, `city`, `state`, `postalCode`, `country`
     - Optional `lat`, `lng` for geolocation
     - `timezone`, `isActive`
   - CRUD schemas:
     - `CreateVenueSchema`
     - `UpdateVenueSchema`

5. **`zones.ts`**
   - Zone within a venue:
     - `orgId`, `venueId`, `name`, `description`
   - CRUD schemas:
     - `CreateZoneSchema`
     - `UpdateZoneSchema`

6. **`attendance.ts`**
   - Attendance records:
     - `orgId`, `shiftId`, `userId`
     - `checkInAt`, `checkOutAt`, `status`
     - Optional geolocation for check-in/out
   - CRUD schemas:
     - `CreateAttendanceRecordSchema`
     - `UpdateAttendanceRecordSchema`

7. **`join-tokens.ts`**
   - Join tokens for invitations:
     - `orgId`, `token`, `role`, `expiresAt`, `maxUses`, `remainingUses`
   - CRUD schemas:
     - `CreateJoinTokenSchema`
     - `UpdateJoinTokenSchema`

8. **`orgs.ts`**
   - Organization details:
     - `name`, `slug`, `ownerId`
     - `size`, `status`, `subscriptionTier`
     - `settings` (timezone, week start, self-scheduling, etc.)
   - CRUD schemas:
     - `OrganizationSchema`
     - `CreateOrganizationSchema`
     - `UpdateOrganizationSchema`

9. **`rbac.ts`**
   - Role enums and related helpers:
     - `OrgRole` (`"org_owner"`, `"admin"`, `"manager"`, `"scheduler"`, `"corporate"`, `"staff"`)
     - Any shared RBAC schemas used across the app.

10. **`schedules.ts`**
    - Schedules:
      - `orgId`, `name`, `startDate`, `endDate`, `status` (`"draft"`, `"published"`)
    - CRUD schemas:
      - `CreateScheduleSchema`
      - `UpdateScheduleSchema`

11. **`index.ts`**
    - Barrel export so all schemas can be imported via `@fresh-schedules/types`.

---

### Schema Tests (`packages/types/src/__tests__/`)

Schema tests assert that validation rules match expectations.

- `attendance.test.ts`
- `join-tokens.test.ts`
- `memberships.test.ts`
- `organizations.test.ts`
- `orgs.test.ts`
- `positions.test.ts`
- `schedules.test.ts`
- `shifts.test.ts`
- `venues.test.ts`
- `zones.test.ts`

Each test suite covers:

- ✅ Valid payloads (happy paths)
- ❌ Required field omissions
- ❌ Type mismatches (string vs. number, invalid enums, etc.)
- ❌ Boundary violations (e.g., invalid dates, negative limits)

---

### API-Level Validation (`apps/web/app/api/**/route.ts`)

All write routes use Zod validation on the request body before performing any writes.

Representative routes:

- `apps/web/app/api/organizations/route.ts`
- `apps/web/app/api/organizations/[id]/route.ts`
- `apps/web/app/api/organizations/[id]/members/route.ts`
- `apps/web/app/api/organizations/[id]/members/[memberId]/route.ts`
- `apps/web/app/api/positions/route.ts`
- `apps/web/app/api/positions/[id]/route.ts`
- `apps/web/app/api/schedules/route.ts`
- `apps/web/app/api/schedules/[id]/route.ts`
- `apps/web/app/api/shifts/route.ts`
- `apps/web/app/api/shifts/[id]/route.ts`
- `apps/web/app/api/venues/route.ts`
- `apps/web/app/api/zones/route.ts`
- `apps/web/app/api/attendance/route.ts`
- `apps/web/app/api/join-tokens/route.ts`
- `apps/web/app/api/users/profile/route.ts`
- `apps/web/app/api/session/route.ts`
- `apps/web/app/api/auth/mfa/setup/route.ts`
- `apps/web/app/api/auth/mfa/verify/route.ts`
- `apps/web/app/api/publish/route.ts`

All of these:

- Import the relevant schema(s) from `@fresh-schedules/types`.
- Use a shared parser (e.g. `parseJson`, `parseWithZod`) from `apps/web/app/api/_shared/validation.ts`.
- Return `400/422` with structured error details on invalid payloads.
- Never write directly from `request.json()` without validation.

---

### Firestore Rules (`firestore.rules`)

`firestore.rules` implements:

- **Tenant isolation by org**:
  - `sameOrg(orgId)` using custom claims (`orgId` in token or membership).
- **Role-based access**:
  - `hasAnyRole(['org_owner', 'admin', 'manager', 'scheduler', 'staff'])`
  - Legacy membership checks (`hasAnyRoleLegacy`) while migrating to claims-only.
- **Collection-specific guards** for:
  - `/users/{userId}`
  - `/orgs/{orgId}` and `/organizations/{orgId}` (alias)
  - `/memberships/{membershipId}`
  - `/positions/{positionId}` and `/positions/{orgId}/positions/{positionId}`
  - `/schedules/{scheduleId}` and `/schedules/{orgId}/schedules/{scheduleId}`
  - `/schedules/{scheduleId}/shifts/{shiftId}` and `/shifts/{orgId}/shifts/{shiftId}`
  - `/venues/{orgId}/venues/{venueId}`
  - `/zones/{orgId}/zones/{zoneId}`
  - `/attendance_records/{orgId}/records/{recordId}`
  - `/join_tokens/{tokenId}` and `/join_tokens/{orgId}/join_tokens/{tokenId}`
  - Messaging-related collections:
    - `/messages/{messageId}`
    - `/receipts/{receiptId}`

Rules are written to:

- Deny all unspecified paths by default.
- Use `get` instead of wide `read` for non-listable collections.
- Prohibit `list` on sensitive collections (users, orgs, memberships, join_tokens).

---

### Rules Tests (`tests/rules/**`)

Rules are tested using the Firestore emulator and `@firebase/rules-unit-testing`.

Test files:

- `tests/rules/_setup.ts` – Shared test environment setup.
- `tests/rules/firestore.spec.ts` – Sanity tests for the rules file.
- `tests/rules/organizations.spec.ts`
- `tests/rules/memberships.spec.ts`
- `tests/rules/positions.spec.ts`
- `tests/rules/schedules.spec.mts`
- `tests/rules/shifts.spec.mts`
- `tests/rules/venues.spec.mts`
- `tests/rules/zones.spec.mts`
- `tests/rules/attendance.spec.mts`
- `tests/rules/join-tokens.spec.mts`
- `tests/rules/users.test.ts`
- `tests/rules/mfa.spec.ts`
- `tests/rules/messages_receipts.spec.ts`
- `tests/rules/storage.fixed.spec.ts`
- `tests/rules/vitest.config.ts`
- `tests/rules/README.md`

Each collection-focused spec includes:

- At least **one allow** case for the happy path (correct org + sufficient role).
- Multiple **deny** cases:
  - Unauthenticated user
  - Authenticated but wrong org
  - Authenticated but insufficient role
  - Attempts to list non-listable collections

---

### Tooling & CI

- **Pre-commit hook** (`.husky/pre-commit`):
  - Tags changed files.
  - Runs `pnpm typecheck`.
  - Runs `pnpm lint`.
  - Runs schema tests / parity where configured.

- **CI workflow** (`.github/workflows/ci.yml`):
  - Installs dependencies.
  - Runs typecheck, lint, tests.
  - Runs **rules tests** via `pnpm test:rules:ci` against Firebase emulator.
  - Fails the build on any schema/rules/validation drift.

- **Schema–Rules Parity Script**:
  - Script referenced in docs (e.g. `scripts/ops/validate-schema-rules-parity.ts`).
  - Ensures:
    - Rules paths have corresponding schemas.
    - Schemas are referenced by API validation.
    - Collections are documented in `docs/schema-map.md`.

---

## Block 3 Completion Status

- [x] Expand `packages/types/` with Zod schemas for orgs, memberships, positions, schedules, shifts ✅
- [x] Add unit tests for Zod validators ✅
- [x] Add migration-check script validating schema parity vs rules ✅
- [x] Create schema index doc (`docs/schema-map.md`) listing collections ↔ schemas ✅
- [x] Add pre-commit hook enforcing `pnpm typecheck` && `pnpm lint` ✅
- [x] Add API-level Zod validation for every write route (422 on invalid payload) ✅
- [x] Write rules test matrix (≥ 1 allow + 3 denies per collection; see summary below) ✅

**Overall Progress:** **7/7** Block 3 tasks complete (**100%**)

**Remaining Work:** None for Block 3 – Integrity Core. All integrity tasks are complete and enforced via CI + pre-commit.

---

## Rules Test Matrix (Summary)

This matrix summarizes how each major collection is covered by schemas, rules, and rules tests.

| Collection            | Firestore Path Example                                    | Schema File                                 | Rules Test File                         |
| --------------------- | --------------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| Organizations         | `/orgs/{orgId}` / `/organizations/{orgId}`                | `packages/types/src/orgs.ts`                | `tests/rules/organizations.spec.ts`     |
| Memberships           | `/memberships/{membershipId}`                             | `packages/types/src/memberships.ts`         | `tests/rules/memberships.spec.ts`       |
| Positions (top-level) | `/positions/{positionId}`                                 | `packages/types/src/positions.ts`           | `tests/rules/positions.spec.ts`         |
| Positions (per-org)   | `/positions/{orgId}/positions/{positionId}`               | `packages/types/src/positions.ts`           | `tests/rules/positions.spec.ts`         |
| Venues                | `/venues/{orgId}/venues/{venueId}`                        | `packages/types/src/venues.ts`              | `tests/rules/venues.spec.mts`           |
| Zones                 | `/zones/{orgId}/zones/{zoneId}`                           | `packages/types/src/zones.ts`               | `tests/rules/zones.spec.mts`            |
| Schedules (top-level) | `/schedules/{scheduleId}`                                 | `packages/types/src/schedules.ts`           | `tests/rules/schedules.spec.mts`        |
| Schedules (per-org)   | `/schedules/{orgId}/schedules/{scheduleId}`               | `packages/types/src/schedules.ts`           | `tests/rules/schedules.spec.mts`        |
| Shifts (sub-schedule) | `/schedules/{scheduleId}/shifts/{shiftId}`                | `packages/types/src/shifts.ts`              | `tests/rules/shifts.spec.mts`           |
| Shifts (per-org)      | `/shifts/{orgId}/shifts/{shiftId}`                        | `packages/types/src/shifts.ts`              | `tests/rules/shifts.spec.mts`           |
| Attendance records    | `/attendance_records/{orgId}/records/{recordId}`          | `packages/types/src/attendance.ts`          | `tests/rules/attendance.spec.mts`       |
| Join tokens (global)  | `/join_tokens/{tokenId}`                                  | `packages/types/src/join-tokens.ts`         | `tests/rules/join-tokens.spec.mts`      |
| Join tokens (per-org) | `/join_tokens/{orgId}/join_tokens/{tokenId}`              | `packages/types/src/join-tokens.ts`         | `tests/rules/join-tokens.spec.mts`      |
| Users                 | `/users/{userId}`                                         | `packages/types/src/orgs.ts` / `users` use  | `tests/rules/users.test.ts`             |
| MFA                   | `/mfa/{uid}` and related MFA paths                        | `packages/types/src/orgs.ts` / `users` use  | `tests/rules/mfa.spec.ts`               |
| Messages              | `/messages/{messageId}`                                   | (Uses message payload schemas where needed) | `tests/rules/messages_receipts.spec.ts` |
| Message receipts      | `/receipts/{receiptId}` or `/messages/{id}/receipts/{id}` | (Uses attendance/message schema where used) | `tests/rules/messages_receipts.spec.ts` |
| Storage (avatars)     | Storage bucket paths for `users/{uid}/avatars/{fileName}` | N/A (storage metadata only)                 | `tests/rules/storage.fixed.spec.ts`     |

> Each rules test file enforces:
>
> - At least one **allow** case for authorized users in the correct org.
> - Multiple **deny** cases: unauthenticated, wrong org, and insufficient role.

For more detailed, per-collection behavior, see `docs/schema-map.md` and the inline comments in `firestore.rules`.

---

## Quality Standards Met

- ✓ All schemas follow consistent naming conventions
- ✓ All schemas have JSDoc comments
- ✓ All schemas use TypeScript inference (no manual duplication of types)
- ✓ All test files have proper tagging headers (`[P1][INTEGRITY]`, etc.)
- ✓ All files pass lint/format checks
- ✓ Schema–rules parity is validated by the migration-check script
- ✓ Pre-commit hook and CI enforce integrity gates on every change

---

**Created:** Block 3 Implementation  
**Last Updated:** 2025-11-07  
**Status:** 100% Complete (7/7 core tasks done)
