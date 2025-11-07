# Schema Map

<!-- markdownlint-disable MD013 MD024 -->

This document maps all Firestore collections to their TypeScript schemas and security rules.

## Overview

This is the comprehensive schema map for Fresh Schedules v13. All collections use **Zod schemas** for validation and **Firestore security rules** for access control.

**Collection Naming Convention:**

- Primary paths use singular/plural based on context
- Alternative paths are documented
- All paths enforce org-scoped tenant isolation

## Collections

### Organizations

**Firestore Paths:**

- `/organizations/{orgId}`
- `/orgs/{orgId}` (alias)

**Schema:** `packages/types/src/orgs.ts`

- `OrganizationSchema` - Full document
- `CreateOrganizationSchema` - POST payload
- `UpdateOrganizationSchema` - PATCH payload

**Rules:** Lines 39-47 and 69-76 in `firestore.rules`

**Access Control:**

- **Read:** Organization members (via orgId custom claim or membership doc)
- **Create:** Any authenticated user
- **Update:** org_owner, admin, or manager roles
- **Delete:** org_owner only
- **List:** Forbidden (no enumeration)

**API Endpoints:**

- `POST /api/organizations` - Create org
- `GET /api/organizations/{id}` - Get org
- `PATCH /api/organizations/{id}` - Update org
- `DELETE /api/organizations/{id}` - Delete org

---

### Memberships

**Firestore Path:**

- `/memberships/{uid}_{orgId}`

**Schema:** `packages/types/src/memberships.ts`

- `MembershipSchema` - Full document
- `CreateMembershipSchema` - POST payload
- `UpdateMembershipSchema` - PATCH payload

**Rules:** Lines 97-103 in `firestore.rules`

**Access Control:**

- **Read:** Self (uid match) or managers
- **Create:** Self or managers (for same org)
- **Update/Delete:** Managers only (same org)
- **List:** Forbidden

**API Endpoints:**

- `POST /api/memberships` - Create membership
- `GET /api/memberships/{id}` - Get membership
- `PATCH /api/memberships/{id}` - Update membership
- `DELETE /api/memberships/{id}` - Delete membership

---

### Positions

**Firestore Path:**

- `/positions/{orgId}/{positionId}`

**Schema:** `packages/types/src/positions.ts`

- `PositionSchema` - Full document
- `CreatePositionSchema` - POST payload
- `UpdatePositionSchema` - PATCH payload

**Rules:** Lines 117-121 in `firestore.rules`

**Access Control:**

- **Read:** Org members
- **Write:** Managers only (org_owner, admin, manager)
- **List:** Forbidden

**API Endpoints:**

- `POST /api/positions` - Create position
- `GET /api/positions?orgId={orgId}` - List positions
- `GET /api/positions/{id}` - Get position
- `PATCH /api/positions/{id}` - Update position
- `DELETE /api/positions/{id}` - Delete position

---

### Schedules

**Firestore Paths:**

- `/schedules/{orgId}/{scheduleId}`
- `/orgs/{orgId}/schedules/{scheduleId}` (subcollection)

**Schema:** `packages/types/src/schedules.ts`

- `ScheduleSchema` - Full document
- `CreateScheduleSchema` - POST payload
- `UpdateScheduleSchema` - PATCH payload
- `PublishScheduleSchema` - Publish action
- `CloneScheduleSchema` - Clone action

**Rules:** Lines 49-53 and 123-127 in `firestore.rules`

**Access Control:**

- **Read:** Org members
- **Write:** Managers and schedulers (org_owner, admin, manager, scheduler)
- **List:** Forbidden

**API Endpoints:**

- `POST /api/schedules` - Create schedule
- `GET /api/schedules?orgId={orgId}` - List schedules
- `GET /api/schedules/{id}` - Get schedule
- `PATCH /api/schedules/{id}` - Update schedule
- `POST /api/schedules/{id}/publish` - Publish schedule
- `POST /api/schedules/{id}/clone` - Clone schedule
- `DELETE /api/schedules/{id}` - Delete schedule

---

### Shifts

**Firestore Paths:**

- `/shifts/{orgId}/{scheduleId}/{shiftId}`
- `/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}` (subcollection)

**Schema:** `packages/types/src/shifts.ts`

- `ShiftSchema` - Full document
- `CreateShiftSchema` - POST payload
- `UpdateShiftSchema` - PATCH payload
- `AssignShiftSchema` - Assignment action

**Rules:** Lines 55-59 and 130-134 in `firestore.rules`

**Access Control:**

- **Read:** Org members
- **Write:** Managers and schedulers
- **List:** Forbidden

**API Endpoints:**

- `POST /api/shifts` - Create shift
- `GET /api/shifts?scheduleId={id}` - List shifts
- `GET /api/shifts/{id}` - Get shift
- `PATCH /api/shifts/{id}` - Update shift
- `POST /api/shifts/{id}/assign` - Assign staff
- `DELETE /api/shifts/{id}` - Delete shift

---

### Venues

**Firestore Path:**

- `/venues/{orgId}/{venueId}`

**Schema:** `packages/types/src/venues.ts`

- `VenueSchema` - Full document
- `CreateVenueSchema` - POST payload
- `UpdateVenueSchema` - PATCH payload

**Rules:** Lines 106-110 in `firestore.rules`

**Access Control:**

- **Read:** Org members
- **Write:** Managers only
- **List:** Forbidden

**API Endpoints:**

- `POST /api/venues` - Create venue
- `GET /api/venues?orgId={orgId}` - List venues
- `GET /api/venues/{id}` - Get venue
- `PATCH /api/venues/{id}` - Update venue
- `DELETE /api/venues/{id}` - Delete venue

---

### Zones

**Firestore Path:**

- `/zones/{orgId}/{zoneId}`

**Schema:** `packages/types/src/zones.ts`

- `ZoneSchema` - Full document
- `CreateZoneSchema` - POST payload
- `UpdateZoneSchema` - PATCH payload

**Rules:** Lines 112-116 in `firestore.rules`

**Access Control:**

- **Read:** Org members
- **Write:** Managers only
- **List:** Forbidden

**API Endpoints:**

- `POST /api/zones` - Create zone
- `GET /api/zones?orgId={orgId}&venueId={id}` - List zones
- `GET /api/zones/{id}` - Get zone
- `PATCH /api/zones/{id}` - Update zone
- `DELETE /api/zones/{id}` - Delete zone

---

### Attendance Records

**Firestore Path:**

- `/attendance_records/{orgId}/{recordId}`

**Schema:** `packages/types/src/attendance.ts`

- `AttendanceRecordSchema` - Full document
- `CreateAttendanceRecordSchema` - POST payload
- `CheckInSchema` - Check-in action
- `CheckOutSchema` - Check-out action
- `UpdateAttendanceRecordSchema` - Admin override

**Rules:** Lines 137-147 in `firestore.rules`

**Access Control:**

- **Read:** Org members or record owner (staffUid)
- **Create/Update:** Managers or self (for own records)
- **Delete:** Forbidden (append-only ledger)
- **List:** Forbidden

**API Endpoints:**

- `POST /api/attendance` - Create record
- `GET /api/attendance?orgId={orgId}` - List records
- `GET /api/attendance/{id}` - Get record
- `POST /api/attendance/{id}/check-in` - Check in
- `POST /api/attendance/{id}/check-out` - Check out
- `PATCH /api/attendance/{id}` - Admin override

---

### Join Tokens

**Firestore Paths:**

- `/join_tokens/{orgId}/{tokenId}`
- `/orgs/{orgId}/join_tokens/{tokenId}` (subcollection)

**Schema:** `packages/types/src/join-tokens.ts`

- `JoinTokenSchema` - Full document
- `CreateJoinTokenSchema` - POST payload
- `UpdateJoinTokenSchema` - PATCH payload
- `RedeemJoinTokenSchema` - Redemption action

**Rules:** Lines 62-66 and 150-154 in `firestore.rules`

**Access Control:**

- **Read:** Managers only (same org)
- **Write:** Managers only (same org)
- **List:** Forbidden (security by obscurity for tokens)

**API Endpoints:**

- `POST /api/join-tokens` - Create token
- `GET /api/join-tokens?orgId={orgId}` - List tokens
- `GET /api/join-tokens/{id}` - Get token
- `PATCH /api/join-tokens/{id}` - Update token
- `POST /api/join-tokens/redeem` - Redeem token
- `DELETE /api/join-tokens/{id}` - Delete token

---

### Users

**Firestore Path:**

- `/users/{userId}`

**Schema:** Built-in Firebase Auth user + custom claims

**Rules:** Lines 36-40 in `firestore.rules`

**Access Control:**

- **Read/Create/Update:** Self only (uid match)
- **List:** Forbidden (privacy protection)

**API Endpoints:**

- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile

---

## Schema Validation Flow

```text
1. Client submits data → API endpoint
2. API validates against Create/Update schema (Zod)
3. Returns 422 if invalid (with error details)
4. If valid, API writes to Firestore
5. Firestore rules check access control
6. Returns 403 if unauthorized
7. Document stored with timestamp fields added
```

## Custom Claims

Custom claims are set on user tokens and checked in rules:

- `orgId` - Current organization context
- `roles` - Array of role strings: `["org_owner"]`, `["manager", "scheduler"]`, etc.
- `mfa` - Boolean indicating MFA status (checked by middleware, not rules)

**Setting Claims:** Via Admin SDK in API endpoints (POST /api/auth/set-custom-claims)

## Testing Coverage

All collections require:

1. **Schema tests:** `packages/types/src/__tests__/{collection}.test.ts`
2. **Rules tests:** `tests/rules/{collection}.spec.ts` with ≥1 allow + 3 denies per operation
3. **API tests:** `apps/web/src/__tests__/api-{collection}.spec.ts` (when API exists)

## Migration Check Script

Run `pnpm tsx scripts/ops/validate-schema-rules-parity.ts` to verify:

- All rules paths have corresponding schemas
- All schema types are used in API validation
- All collections are documented in this file

## Related Documentation

- **Firestore Rules:** `/firestore.rules`
- **Storage Rules:** `/storage.rules`
- **Security Architecture:** `/docs/security.md`
- **RBAC Guide:** `/docs/rbac.md` (when created)
- **API Reference:** `/docs/api/ (when created)

---

**Last Updated:** Block 3 Implementation (v13 Plan C)
**Maintained By:** patrick craven
