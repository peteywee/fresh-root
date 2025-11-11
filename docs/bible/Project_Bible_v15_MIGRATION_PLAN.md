# Project Bible v15 – Migration Plan (13.5 → 14 → 15)

**Purpose**
Define an **explicit, technical, step-by-step migration plan** to move Fresh Schedules from:

- v13.5 → v14 → v15

across:

- Domain model (`@fresh-schedules/types`)
- Firestore data model + rules
- Infrastructure adapters (Firebase, env, logging)
- Application libraries (`apps/web/src/lib/**`)
- API layer (`apps/web/app/api/**`, `services/api/src/**`)
- UI/UX (`apps/web/app/**`, `apps/web/components/**`)

This is an **operations manual**, not a narrative. The goal is that a competent engineer could follow this document and reproduce the migration without guesswork.

---

## 1. Scope

### 1.1 In Scope

- All behavior and flows described in:
  - `Project_Bible_v13.5.md` (network/corp/org/venue, early onboarding).
  - `Project_Bible_v14.0.0.md` (Blocks 1–3, GAPS).
- All implemented code in `fresh-root-main`, specifically:
  - `packages/types/**`
  - `services/api/src/**`
  - `apps/web/src/lib/**`
  - `apps/web/app/**`
  - `firestore.rules`, `storage.rules`
- All Firestore schemas and data access patterns currently in use.

### 1.2 Out of Scope for v15

- AI assistant scheduling features.
- Deep analytics and BI exports.
- Native wrappers (Capacitor/Expo) and mobile app store distributions.
- Large new features not already specified in v13.5/v14 (these go to v15.1+).

---

## 2. Migration Phases Overview

The migration is broken into four phases:

1. **Phase 1 – Document & Discover**
   - Inventory existing docs, code, rules, and tests.
   - Identify patterns already in use and decide what is “frozen skeleton” vs “flexible clay”.
2. **Phase 2 – Crosswalk & Plan Lock**
   - Map concepts and schemas from v13.5 → v14 → v15.
   - Decide what to keep, change, and kill.
   - Produce a precise backlog of migration tasks tied to code paths.
3. **Phase 3 – Code & Data Migration**
   - Update code and rules to match v15 Bible and layer specs.
   - Implement data migrations where schemas have changed.
   - Ensure all tests pass on the new behavior.
4. **Phase 4 – Hardening & Freeze**
   - Performance tuning, PWA checks, security review.
   - Lock scope and tag v15.0.0 as a freeze-point.

**Hard change in v15:**

- v14: `Attendance` = `userId + shiftId [+ status]`
- v15: `Attendance` = `userId + shiftId + roleId [+ status]`

Every attendance record **must** carry a `roleId`. This is not optional.

---

## 3. Phase 1 – Document & Discover

- All schema/code changes must be applied in order:
  1. Local + emulators
  2. Dev/stage
  3. Prod (only when fully validated)

- For Firestore:
  - Use emulator for rules/dev.
  - Plan data migrations for prod collections separately.

---

## 4. Phase 2 – Crosswalk & Plan Lock

### 4.1 Objectives

- Convert v13.5 + v14 + code reality into a **single, explicit plan** for v15.
- For every major concept, answer:
  - What did 13.5 say?
  - What did 14 say?
  - What does the code currently do?
  - What will v15 do?

### 4.2 Artifacts

- `docs/migration/v15/PHASE2_SPEC_CROSSWALK.md`
- `docs/migration/v15/PHASE2_SCHEMA_CROSSWALK.md`

### 4.3 Acceptance Criteria

- `docs/migration/v15/PHASE1_CODE_INVENTORY.txt` exists.
- It contains all `.ts` / `.tsx` code files under `apps/`, `packages/`, `services/`.
- The command is recorded in:
  - `docs/migration/v15/00_INDEX.md` (already done).

---

## 5. Phase 3 – Code & Data Migration

### 5.1 Objectives

- Bring implementation into strict alignment with v15.
- Ensure no part of the running system is still “thinking” in 13.5 or 14 semantics.

### 5.2 Workstreams

1. For each entity row (Network, Org, Venue, User/Staff, Role, RBAC Role, Shift, Attendance, etc.):
   - Fill **Bible Refs**:
     - Section references in v13.5, v14, and v15 (once written).

   - Fill **Types File(s)**:
     - Confirm exact file path under `packages/types/src/**`.

   - Fill **Firestore Collection / Path**:
     - Confirm exact Firestore collection/subcollection paths.

2. Add **any missing entities** that appear in:
   - `glump.txt`
   - `docs/schema-map.md`
   - `docs/schema-network.md`
   - Existing Firestore data (if known).

**Acceptance criteria:**

- No entity used anywhere in code or Firebase is missing from this table.
- Each row has at least:
  - a types file OR “TBD”
  - a Firestore path OR “TBD”.

- Role row explicitly states it sits between Shift and Attendance and is required for Attendance.

---

## 6. Phase 4 – Hardening & Freeze

### 6.1 Objectives

- Make v15 **safe to ship**:
  - Security, performance, operational readiness.

- Verify directory → layer mapping in section 1.1.
- Confirm that tenant hierarchy and Role insertion are correct.
- Ensure tags (`[P0/P1/P2]`) + domain labels correspond to actual comments in code (update code comments where needed).

- Performance tuning (Lighthouse, bundle sizes, DB query patterns).
- PWA checks (installability, offline stance).
- Security and privacy review (rules, logs, data retention).
- Documentation updates:
  - `Project_Bible_v15.0.0.md` reconciled with actual state.
  - Layers docs and migration docs marked as complete.

- Every major directory (`packages/types`, `services/api/src`, `apps/web/src/lib`, `apps/web/app/api`, `apps/web/app`, `apps/web/components`) is assigned to exactly **one** layer.
- The “Network → Org → Venue → Staff → Shift → Role → Attendance” hierarchy is clearly documented and matches:
  - Entity inventory
  - Role entity spec

---

## 2. Phase 2 – Need vs Have (Crosswalk & Final Decisions)

### 2.1 Spec GAP Matrix

**Document:** `docs/migration/v15/02_GAP_MATRIX.md`

**Goal:** For each key concept, decide v15: KEEP / CHANGE / KILL.

**Process (per row):**

1. Read v13.5 and v14 Bible sections (when available).
2. Inspect code using `PHASE1_CODE_INVENTORY.txt` and actual files.
3. Summarize current behavior.
4. Decide v15:
   - KEEP – v14+code okay, v15 adopts.
   - CHANGE – v15 modifies semantics or shape.
   - KILL – v15 removes concept.

**Required rows include at minimum:**

- Tenant model
- Role model (RBAC roles vs scheduling roles)
- Onboarding flow
- Shift creation semantics
- Attendance structure
- PWA expectations
- Security model (rules and RBAC)
- Any major feature flagged in Bibles.

**Acceptance criteria:**

- No major concept in Bibles is unrepresented in the GAP matrix.
- Every row has a v15 decision.
- Contradictions (spec vs code) are flagged with actions.

---

### 2.2 Layer Assignment Map

**Document:** `docs/migration/v15/03_LAYER_ASSIGNMENT.md`

**Goal:** Enforce that every major module has a home layer and conforms.

**Tasks:**

1. Complete the **Directory → Layer Map**:
   - Ensure every `apps/web/src/lib/*`, `services/api/src/*`, and `apps/web/app/api/*` folder is assigned.

2. Complete the **Entity → Layer Responsibilities** for:
   - Network, Org, Venue, Staff, Role, Shift, Attendance.

3. Add any missing modules discovered during review.

**Acceptance criteria:**

- No important code area is “unassigned” to a layer.
- Each entity has a clear notion of where it is:
  - Defined (00)
  - Stored (01)
  - Used (02)
  - Exposed (03)
  - Displayed (04).

---

### 2.3 v15 Canon Decisions

**Document:** `docs/bible/Project_Bible_v15.0.0.md` (not written yet, but this plan drives it).

**Goal:** Turn the Phase 2 decisions into a **canonical spec**.

**Tasks:**

- Document, explicitly:
  - Tenant model chain (with Role).
  - Schema shapes for each entity.
  - Role semantics (scheduling vs RBAC).
  - Which features are v15 vs v15.x.

**Acceptance criteria:**

- For any question of “how X should work in v15”, the Bible has one clear answer that matches the GAP matrix decisions.

---

## 3. Phase 3 – Implementation (By Layer)

This is where you actually move code.

### 3.1 Domain Kernel (Layer 00)

**Files involved (minimum):**

- `packages/types/src/index.ts`
- `packages/types/src/roles.ts` (new)
- `packages/types/src/attendance.ts`
- `packages/types/src/schedules.ts`

**Tasks:**

1. **Create `roles.ts`**
   - File: `packages/types/src/roles.ts`

   - Content must match `ENTITY_ROLE_v15.md` spec:

   - Must export at least:
     - `RoleIdSchema`, `RoleSchema`
     - `RoleId`, `Role` types

2. **Export Roles from Barrel**
   - In `packages/types/src/index.ts`:

     ```ts
     export * from "./roles";
     ```

3. **Update Shift Schema**
   - In `schedules.ts`, define:

     ```ts
     export const ShiftRoleRequirementSchema = z.object({
       roleId: RoleIdSchema,
       minStaff: z.number().int().nonnegative().default(0),
       maxStaff: z.number().int().nonnegative().optional(),
     });

     export type ShiftRoleRequirement = z.infer<typeof ShiftRoleRequirementSchema>;
     ```

   - Add to `ShiftSchema`:

     ```ts
     roles: z.array(ShiftRoleRequirementSchema).default([]),
     ```

4. **Update Attendance Schema**
   - In `attendance.ts`, ensure `AttendanceRecordSchema` includes `roleId`:

     ```ts
     roleId: RoleIdSchema,
     ```

   - This field is **required**, not optional.

**Acceptance criteria:**

- TypeScript compiles (`pnpm lint` / `pnpm typecheck`).
- Consumers can import `Role` & `RoleId` via `@fresh-schedules/types`.
- All unit tests under `packages/types/src/__tests__` extended to cover Roles and run successfully.

---

### 3.2 Infrastructure (Layer 01)

**Files involved (examples):**

- `services/api/src/firebase.ts`
- `services/api/src/env.ts`
- `apps/web/src/lib/env*.ts`
- `apps/web/src/lib/firebase.server.ts`
- `firestore.rules`
- `storage.rules`
- `packages/rules-tests/**`

**Tasks:**

1. **Decide Role Storage Path**
   - Pick exactly one (and codify it):
     - Option A (recommended):
       - `/orgs/{orgId}/roles/{roleId}`

     - Option B:
       - `/venues/{venueId}/roles/{roleId}`

   - Update `docs/schema-map.md` and `ENTITY_ROLE_v15.md` with the chosen path.

2. **Update Firestore Rules**
   - Enforce:
     - Only authorized org admins/managers can create/update/delete roles.
     - Staff can read roles relevant to their org/venue.

   - Ensure attendance rules require `roleId` and validate:
     - That the `roleId` belongs to the same org/venue as `shiftId`.

3. **Rules Tests**
   - Add tests in `packages/rules-tests/**` to cover:
     - Role creation allowed for org admins, denied for regular staff.
     - Attendance writes fail if `roleId` is invalid or not in org/venue.
     - Role visibility matches RBAC expectations.

**Acceptance criteria:**

- Firestore rules compile with no errors.
- Rule tests are green.
- No runtime usage of roles conflicts with rules.

---

### 3.3 Application Libraries (Layer 02)

**Files involved (examples):**

- `apps/web/src/lib/api/index.ts`
- `apps/web/src/lib/api/authorization.ts`
- `apps/web/src/lib/onboarding/**`
- `apps/web/src/lib/attendance/**` (if exists)
- `apps/web/src/lib/roles.ts` or similar (you will create)

**Tasks:**

1. **Role Use-Case Functions**

   Create application-level functions (pure use-cases):
   - `createRole(input, context)`
   - `updateRole(roleId, input, context)`
   - `archiveRole(roleId, context)`
   - `listRoles(context)`

   Where:
   - `input` is validated with `RoleSchema` or dedicated create/update schemas.
   - `context` holds:
     - `orgId`
     - user identity and roles
     - optionally `venueId`

2. **Shift Use-Cases**
   - Update any shift creation/update logic to:
     - Accept an array of role requirements.
     - Validate that role IDs exist and belong to the org (and venue if venue-scoped).

   - Ensure `Shift` includes `roles: ShiftRoleRequirement[]`.

3. **Attendance Use-Cases**
   - All functions that create or update attendance must:
     - Require `roleId`.
     - Verify the role is valid for the shift’s org/venue.
     - Use updated `AttendanceRecordSchema`.

**Acceptance criteria:**

- Application-level functions in Layer 02 do not import `NextRequest` or `NextResponse`.
- They use domain types (`Role`, `ShiftRoleRequirement`, `AttendanceRecord`) instead of `any`.
- Tests (unit/integration) added or updated to cover Role-based flows.

---

### 3.4 API Edge (Layer 03)

Files involved (examples):

- `apps/web/app/api/roles/route.ts` (new)
- `apps/web/app/api/attendance/route.ts` (existing)
- `apps/web/app/api/_shared/validation.ts`
- `apps/web/app/api/_shared/middleware.ts`

**Tasks:**

1. **Role API Endpoints**

   Implement at minimum:
   - `POST /api/roles`:
     - Validates payload with Role create schema.
     - Calls `createRole`.
     - Returns created Role.

   - `GET /api/roles`:
     - Uses org context.
     - Calls `listRoles`.
     - Returns list.

   - `PATCH /api/roles/{roleId}`:
     - Validates payload.
     - Calls `updateRole`.

   - `DELETE` or `POST /api/roles/{roleId}/archive`:
     - Calls `archiveRole`.

   All routes must:
   - Use `requireSession`, `requireOrgMembership`, and `requireRole` (RBAC).
   - Handle errors consistently (badRequest, unauthorized, serverError helpers).

2. **Attendance API Update**
   - Ensure attendance endpoints:
     - Expect `roleId` in request body.
     - Validate `roleId` via `RoleIdSchema`.
     - Pass `roleId` to Layer 02 use-cases.

**Acceptance criteria:**

- All Role endpoints respond with correct HTTP status codes and structures.
- Attendance routes reject requests missing `roleId` with a clear 400 error.
- No business logic (e.g., role/shift validation) is duplicated in the route; it lives in Layer 02.

---

### 3.5 UI/UX (Layer 04)

**Files involved (examples):**

- `apps/web/app/(app)/roles/**` (new) – Role management UI.
- `apps/web/app/(app)/shifts/**` – Shift editor.
- `apps/web/app/(app)/attendance/**` – Attendance / clock-in/out.
- `apps/web/components/**` – generic UI.

**Tasks:**

1. **Role Management UI**
   - Role list view:
     - Each role: name, description, active state, color.

   - Create / edit role form:
     - Fields as defined in `RoleSchema`.

   - Archive / activate toggles.

2. **Shift Editing UI**
   - Role assignment UI:
     - When editing a Shift, allow attaching roles + min/max staff.

   - Display assigned roles in schedule views.

3. **Attendance UI**
   - If user has more than one eligible role on a shift:
     - Prompt to choose role when clocking in.

   - Display role alongside shift in attendance history and manager views.

**Acceptance criteria:**

- Role management works end-to-end on dev:
  - Create role → attach role to shift → record attendance with role.

- No UI file directly imports infra modules (`firebase-admin`, etc.).
- All data types used in props and state are derived from `@fresh-schedules/types` or documented DTOs.

---

## 4. Phase 4 – Hardening & Freeze

### 4.1 Testing

**Tasks:**

- Domain:
  - Add/verify tests for Role, ShiftRoleRequirement, Attendance with roleId.

- Infra:
  - Run rules tests; confirm Role + Attendance rules behave correctly.

- E2E:
  - Script golden path test:
    1. Create org & venue.
    2. Create roles.
    3. Create shift with roles.
    4. Assign staff.
    5. Record attendance with role.
    6. Verify data in Firestore and UI.

**Acceptance criteria:**

- All tests green in CI.
- No major blockers from golden path scenario.

---

### 4.2 Performance & PWA

**Tasks:**

- Run Lighthouse or similar on main flows.
- Confirm PWA registration is working if applicable.
- Confirm that role-enabled flows don’t introduce obvious performance regressions.

**Acceptance criteria:**

- Performance / PWA scores acceptable for current scope.
- No obvious perf regressions introduced by role-based features.

---

### 4.3 v15 Freeze Criteria

**To mark v15 as frozen:**

- All items in:
  - `STATUS_CHECKLIST.md` for Phases 1–4 are **checked** or explicitly deferred to v15.x (with notes).

- `Project_Bible_v15.0.0.md`:
  - Updated with final, accurate specs matching the live code.

- Git:
  - Tag created: `v15.0.0-freeze`.

After freeze:

- No breaking domain changes to v15 without bumping to v16.
- Only backward-compatible patches or v15.x additions are allowed.

---

## 5. Linked Documents (for navigation)

- `docs/migration/v15/00_INDEX.md`
- `docs/migration/v15/01_ENTITY_INVENTORY.md`
- `docs/migration/v15/02_GAP_MATRIX.md`
- `docs/migration/v15/03_LAYER_ASSIGNMENT.md`
- `docs/migration/v15/PHASE1_CODE_INVENTORY.txt`
- `docs/migration/v15/PHASE1_PATTERN_MAP.md`
- `docs/migration/v15/STATUS_CHECKLIST.md`
- `docs/layers/LAYER_00_DOMAIN_KERNEL.md`
- `docs/layers/LAYER_01_INFRASTRUCTURE.md`
- `docs/layers/LAYER_02_APPLICATION_LIBS.md`
- `docs/layers/LAYER_03_API_EDGE.md`
- `docs/layers/LAYER_04_UI_UX.md`
- `docs/bible/ENTITY_ROLE_v15.md`

---

## 6. Change Log

| Date       | Author         | Change                                         |
| ---------- | -------------- | ---------------------------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 migration plan (technical version) |
| EOF        |                |                                                |
