# Project Bible – v15.0.0

**Purpose**  
Define the **canonical specification** for Fresh Schedules v15, covering:

- Domain model (entities, relationships, invariants)
- Layered architecture (00–04) and allowed dependencies
- Data model (Firestore structure + indexes)
- Core flows (onboarding, scheduling, attendance)
- Security & tenancy (RBAC, isolation)
- Role-centric attendance: **user + shift + role**

This document describes **how v15 must behave**. Code, rules, and UI must conform to this spec.

---

## 1. System Overview

Fresh Schedules is a **multi-tenant scheduling and attendance PWA** for organizations that:

- Operate one or more venues/locations.
- Schedule staff into shifts.
- Track who actually worked, in which role, and when.

### 1.1 Tenant & Data Isolation

Tenancy is modeled as:

```text
Network
  └── Org
        └── Venue
              ├── Staff/User
              ├── Shift
              ├── Role
              └── Attendance
```

**Isolation rule:**
Data belonging to one org must never be visible or writable by another org’s users, except where explicit cross-org functionality is defined (none in v15).

---

## 2. Architecture – Layer Model (v15)

### 2.1 Layers

- **Layer 00 – Domain Kernel**
  - Location: `packages/types/src/**`
  - Responsibility: domain entities, Zod schemas, pure types, invariants.

- **Layer 01 – Infrastructure**
  - Location:
    - `services/api/src/**`
    - `apps/web/src/lib/env*.ts`
    - `apps/web/src/lib/firebase.server.ts`
    - `apps/web/src/lib/logger.ts`
    - `apps/web/src/lib/otel.ts`
    - `firestore.rules`, `storage.rules`

  - Responsibility: Firebase, env, logging, telemetry, rules.

- **Layer 02 – Application Libraries**
  - Location: `apps/web/src/lib/**` (excluding env/firebase server)
  - Responsibility: business use-cases, onboarding, authorization helpers, scheduling logic.

- **Layer 03 – API Edge**
  - Location:
    - `apps/web/app/api/**`
    - `apps/web/app/api/_shared/**`
    - `apps/web/middleware.ts`
    - `services/api/src/index.ts`

  - Responsibility: HTTP boundary (Next.js routes), request validation, response mapping.

- **Layer 04 – UI/UX**
  - Location:
    - `apps/web/app/**` (pages/layouts)
    - `apps/web/components/**`

  - Responsibility: screens, UI interactions, presentation.

### 2.2 Dependency Direction (Hard Rule)

```text
04 → 03 → 02 → 01 → 00
```

- No imports from higher to lower layer:
  - Domain (00) must not know about infra/app/API/UI.
  - Infra (01) must not import UI or API routes.
  - App libs (02) must not import React or Next APIs directly.
  - API (03) must not define business rules beyond orchestration.
  - UI (04) must not use raw infra SDKs (Firebase Admin, etc.).

---

## 3. Domain Model (Canonical v15)

### 3.1 Core Entities

**All canonical domain entities live in `@fresh-schedules/types` (Layer 00)** as Zod schemas and inferred TS types.

#### 3.1.1 Network

- Represents a top-level grouping of orgs (e.g. franchise group).
- Key fields (conceptual):
  - `id: NetworkId`
  - `name: string`
  - `createdAt`, `updatedAt`

- Firestore (suggested): `/networks/{networkId}`

#### 3.1.2 Org

- Tenant unit (company/brand).
- Fields:
  - `id: OrgId`
  - `networkId: NetworkId | null`
  - `name: string`
  - `timeZone: string` (IANA)
  - `createdAt`, `updatedAt`

- Firestore: `/orgs/{orgId}`

#### 3.1.3 Venue

- Physical location within an org.
- Fields:
  - `id: VenueId`
  - `orgId: OrgId`
  - `name: string`
  - `timeZone: string` (defaults to org’s if unset)
  - `createdAt`, `updatedAt`

- Firestore (v15 decision):
  - Preferred: `/orgs/{orgId}/venues/{venueId}`
  - Alternative `/venues/{venueId}` must be explicitly documented if used.

#### 3.1.4 User / Staff

- A person that can log in and be scheduled.
- Fields:
  - `id: UserId`
  - `email: string`
  - `displayName: string`
  - `orgMemberships: OrgMembership[]` (role, status)
  - `createdAt`, `updatedAt`

- Firestore: `/users/{userId}`

#### 3.1.5 Role (Scheduling Role)

- The **position** on a shift (Server, Cook, MOD).
- Defined in detail in `ENTITY_ROLE_v15.md`.
- Key points:
  - Entity: `Role`
  - Fields: `id`, `orgId`, (optional `venueId`), `name`, `shortName`, `color`, `isActive`, timestamps.
  - Firestore (canonical v15): `/orgs/{orgId}/roles/{roleId}`.
  - Used by `Shift` requirements and `Attendance`.

#### 3.1.6 RBAC Role

- System-level permissions (admin vs manager vs staff).
- Separate from scheduling Role.
- Lives in `rbac.ts` and in claims/rules, not in scheduling data.

#### 3.1.7 Shift

- A scheduled work block at a venue.
- Fields (conceptual):
  - `id: ShiftId`
  - `orgId: OrgId`
  - `venueId: VenueId`
  - `start: ISO string`
  - `end: ISO string`
  - `roles: ShiftRoleRequirement[]` (see below)
  - `createdAt`, `updatedAt`

- `ShiftRoleRequirement`:
  - `roleId: RoleId`
  - `minStaff: number`
  - `maxStaff: number | null`

- Firestore (v15 canonical):
  - `/orgs/{orgId}/venues/{venueId}/shifts/{shiftId}`

#### 3.1.8 Attendance

- A record that a **user fulfilled a Role on a Shift**.
- v15 structure:
  - `id: AttendanceId`
  - `orgId: OrgId`
  - `venueId: VenueId`
  - `shiftId: ShiftId`
  - `userId: UserId`
  - `roleId: RoleId` **(mandatory)**
  - `status: AttendanceStatus` (e.g. scheduled, on_time, late, no_show, etc.)
  - `clockInAt`, `clockOutAt` (ISO strings, optional)
  - `createdAt`, `updatedAt`

- Firestore (pattern):
  - `/orgs/{orgId}/venues/{venueId}/attendance/{attendanceId}`
    OR
  - `/orgs/{orgId}/venues/{venueId}/shifts/{shiftId}/attendance/{attendanceId}`
    (Choose and codify; all code must be consistent.)

---

### 3.2 Invariants

- `Attendance.roleId` must always reference a valid `Role` for the same `orgId` (and `venueId` if applicable).
- `Shift.roles[].roleId` must always reference a valid `Role`.
- A `User` may be a member of multiple orgs but Attendance is always tied to **one** org/venue/shift/role.
- All domain changes must be reflected in Zod schemas under `@fresh-schedules/types` before being used elsewhere.

---

## 4. Data Model – Firestore

### 4.1 Collections & Paths (v15 Canonical)

**Org & Venue:**

- `/orgs/{orgId}`
- `/orgs/{orgId}/venues/{venueId}`

**Users:**

- `/users/{userId}`

**Roles (Scheduling Roles):**

- `/orgs/{orgId}/roles/{roleId}`

**Shifts:**

- `/orgs/{orgId}/venues/{venueId}/shifts/{shiftId}`

**Attendance:**

- Option A (recommended, shift-subcollection):
  - `/orgs/{orgId}/venues/{venueId}/shifts/{shiftId}/attendance/{attendanceId}`

- Option B (venue-level collection):
  - `/orgs/{orgId}/venues/{venueId}/attendance/{attendanceId}` (must still carry shiftId+roleId).

v15 must select **one pattern** and enforce it consistently in:

- Domain schemas.
- Infra implementation.
- Rules.
- Application libs.
- UI.

### 4.2 Index Strategy (Minimum)

- Roles:
  - Composite index on `(orgId, isActive)` for role pickers.

- Shifts:
  - `(orgId, venueId, start)` for schedule queries.

- Attendance:
  - `(orgId, venueId, shiftId, userId)` or `(orgId, userId, shiftId)` depending on path.

### 4.3 Firestore Rules (High-Level)

- Users may only read/write data for orgs they are members of.
- Role modifications restricted to admins/managers.
- Attendance writes:
  - Must validate `shiftId` + `roleId` + `userId` belong to same org/venue.
  - Only authorized users can clock in/out (self or manager override).

- Shifts and roles cannot be modified in ways that violate data integrity (e.g., removing a role that has unresolved active shifts/attendance without handling it).

---

## 5. Core Flows

### 5.1 Onboarding Flow (Org Creation / Join)

**Actors:**

- New user (no org membership yet).
- Existing managers/admins.

**High-level steps:**

1. User signs up / logs in.
2. System checks `orgMemberships`:
   - If none:
     - Provide:
       - Option A: create new org.
       - Option B: join existing org via invite code or email-based invite.

3. Org creation:
   - Creates:
     - `Org`
     - Optional default `Venue`
     - Optional default `Roles` (e.g. “Manager”, “Staff”).

4. Membership is recorded in user’s `orgMemberships` and relevant org membership collections (if used).

**All onboarding logic lives in Layer 02**, with API and UI acting as adapters.

---

### 5.2 Scheduling Flow

**Goal:** Create shifts with attached role requirements.

**Steps:**

1. Manager selects org and venue.
2. Manager selects:
   - Date / time range
   - Roles needed for this shift (Role IDs from `/orgs/{orgId}/roles`).
   - For each role:
     - `minStaff`
     - `maxStaff` (optional)

3. App libs (Layer 02) validate:
   - Role existence and activeness.
   - Temporal correctness (start < end).

4. Shift is written to Firestore with `roles: ShiftRoleRequirement[]`.

---

### 5.3 Attendance Flow

**Goal:** Record that a user fulfilled a role on a shift.

**v15 key rule: role is mandatory.**

**Clock-in steps (example):**

1. Staff member opens PWA.
2. UI fetches upcoming shift(s) for that user/org/venue.
3. If the user only has one role on that shift:
   - Default that role.

4. If multiple roles exist:
   - UI prompts: “Which role are you clocking in as?”

5. On submit, API:
   - Validates:
     - `shiftId`, `userId`, `roleId`.
     - That this user is allowed that role.

   - Creates or updates `AttendanceRecord` with `roleId` and `status`.

**Clock-out steps:**

- Update the same attendance record with `clockOutAt` and update `status` to appropriate final state.

---

## 6. Security & Tenancy

### 6.1 RBAC

- RBAC roles (e.g., `OWNER`, `ADMIN`, `MANAGER`, `STAFF`) define what operations are allowed:
  - Role creation, shift creation, attendance override.

- RBAC modeling:
  - In domain: `rbac.ts`.
  - In infra: auth claims + Firestore rules.
  - Application libs should expose helpers such as:
    - `requireOrgMembership`
    - `requireRole(allowedRoles)`

### 6.2 Firestore Rules (Policy)

At a minimum:

- Users can read/write only within their orgs.
- Roles:
  - Only admins/managers can create/update/delete.
  - Staff can read active roles.

- Shifts:
  - Only admins/managers can create/update/delete.
  - Staff can read shifts relevant to them.

- Attendance:
  - Staff can:
    - Clock themselves in/out under allowed conditions.

  - Managers can:
    - Edit/override attendance for staff in their venues.

---

## 7. Layer-specific Expectations

### 7.1 Layer 00 – Domain Kernel

- All entities (Network, Org, Venue, User, Role, Shift, Attendance) have:
  - Zod schemas.
  - Inferred TS types.

- No external side effects.
- No imports from `apps/**` or `services/**`.

### 7.2 Layer 01 – Infrastructure

- Centralized initialization of:
  - Firebase Admin
  - Firestore client
  - Rules + emulator config
  - Env handling and validation

- No React/Next imports.

### 7.3 Layer 02 – Application Libraries

- Implement all business flows:
  - Onboarding
  - Role CRUD
  - Shift creation with role requirements
  - Attendance creation with roleId

- No direct HTTP types (`NextRequest`, etc.).
- No UI or rendering.

### 7.4 Layer 03 – API Edge

- Only:
  - Parse/validate requests.
  - Call app libraries.
  - Format responses.

- Full Zod validation at the edge.
- No business rules duplicated here.

### 7.5 Layer 04 – UI/UX

- Implements:
  - Onboarding screens.
  - Role management screens.
  - Shift editor (with roles).
  - Attendance/clock-in flows.

- No direct access to infra; uses API or app-layer clients.

---

## 8. v15 vs v13.5/v14 Summary

### 8.1 Major v15 Changes

- Role is a first-class entity between Shift and Attendance.
- Attendance now requires `roleId`.
- Strict layering enforced (00–04), with explicit docs.
- Migration docs and plan exist and are binding:
  - `Project_Bible_v15_MIGRATION_PLAN.md`
  - `docs/migration/v15/**`

---

## 9. Linked Documents

- Migration:
  - `docs/migration/v15/00_INDEX.md`
  - `docs/migration/v15/01_ENTITY_INVENTORY.md`
  - `docs/migration/v15/02_GAP_MATRIX.md`
  - `docs/migration/v15/03_LAYER_ASSIGNMENT.md`
  - `docs/migration/v15/PHASE1_PATTERN_MAP.md`
  - `docs/migration/v15/STATUS_CHECKLIST.md`

- Layers:
  - `docs/layers/LAYER_00_DOMAIN_KERNEL.md`
  - `docs/layers/LAYER_01_INFRASTRUCTURE.md`
  - `docs/layers/LAYER_02_APPLICATION_LIBS.md`
  - `docs/layers/LAYER_03_API_EDGE.md`
  - `docs/layers/LAYER_04_UI_UX.md`

- Entities:
  - `docs/bible/ENTITY_ROLE_v15.md`

---

## 10. Change Log

| Date       | Author         | Change                                |
| ---------- | -------------- | ------------------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15.0.0 canonical Bible draft |
| EOF        |                |                                       |

::contentReference[oaicite:0]{index=0}
