# LAYER_00_DOMAIN_KERNEL# LAYER_00_DOMAIN_KERNEL


**Purpose**  **Purpose**

This layer defines the **pure, framework-agnostic domain kernel** for Fresh Schedules.  The Domain Kernel defines the **canonical business model** of Fresh Schedules.

It is the single source of truth for entity structure, invariants, and validation logic.It is responsible for expressing _what the world is_ (networks, orgs, venues, shifts, staff, attendance, tokens, roles) as **pure types and schemas**, independent of UI, Firebase, Next.js, or any framework.


---This layer is the **source of truth** for:


## 1. Scope- All domain entities and enums (e.g. AttendanceStatus, ShiftType, Role)

- All Zod schemas for input validation and document shape.

Includes only:- All derived TypeScript types inferred from those schemas.


- Zod schemas and inferred TypeScript types.If something is “what the data _is_ or _should be_”, it belongs here.

- Cross-layer constants (enums, status values).

- Pure validation and transformation utilities.---


Located in:**Scope**

This layer includes:


- `packages/types/src/index.ts`

packages/types/src/**- `packages/types/src/*.ts` such as:

- `attendance.ts`

- `orgs.ts`

Barrel export via:  - `schedules.ts`

- `network.ts`

- `users.ts`

- `rbac.ts`

packages/types/src/index.ts  - `tokens.ts`

- `billing.ts` (if present)

- Any **pure** helper types defined under `packages/types/src/**` (e.g., error codes, branded IDs, opaque IDs).

---- Domain-related test files under `packages/types/src/__tests__/**` (their purpose is to validate this layer only).


## 2. Inputs**Not** in scope


- Human specifications from Project Bible v15.0.0.md and ENTITY_* docs.- Any Firebase Admin calls.

- No runtime or external SDKs.- Any Firestore SDK calls.

- Any Next.js imports.

---- Any HTTP or UI-specific types.


## 3. Outputs---


- Zod schemas (Zod ≥ 3.23).**Inputs**

- TypeScript interfaces and types used by all higher layers.

- Optional lightweight validators (pure functions).The Domain Kernel consumes:


---- **Product and spec intent**, primarily from:

- `docs/bible/Project_Bible_v14.0.0.md`

## 4. Dependencies  - `docs/Biblev14.md`

- Future: `docs/bible/Project_Bible_v15.0.0.md`

- `zod` only.- **Data model requirements** from:

- No imports from `apps/**`, `services/**`, or any external APIs.  - `docs/schema-map.md`

  - `docs/schema-network.md`

---  - (Legacy) `glump.txt` / data model notes.

- External libraries:

## 5. Consumers  - `zod` (for validation and schema definition)

- Minimal standard library (`Date`, `string`, `number`, etc.).

- Infrastructure (Layer 01): reads schemas to shape Firestore rules.

- Application Libraries (Layer 02): consumes schemas for validation.It does **not** take runtime inputs (no HTTP requests, no Firestore docs). It models them abstractly as types/schemas.

- API Edge (Layer 03): uses schemas to validate incoming/outgoing data.

- UI/UX (Layer 04): derives props and form constraints from types.---


---**Outputs**


## 6. InvariantsThe Domain Kernel produces


- Pure, deterministic, side-effect-free code.1. **Zod Schemas**

- Only Zod, TS, or constants; no framework code.   - Example:

- Every schema must infer a strongly typed TS interface via `z.infer`.     - `CreateAttendanceRecordSchema`

- Every entity in Bible v15 must exist here with a file:     - `AttendanceRecordSchema`

  - `network.ts`     - `OrgSchema`

  - `orgs.ts`     - `NetworkSchema`

  - `venues.ts`     - `ShiftSchema`

  - `users.ts`     - `RoleSchema`

  - `roles.ts`   - These schemas describe the exact shape of valid inputs and stored entities.

  - `schedules.ts`

  - `attendance.ts`2. **TypeScript Types** inferred from schemas:

  - `rbac.ts`   - `type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>`

  - `type Org = z.infer<typeof OrgSchema>`

---   - `type Network = z.infer<typeof NetworkSchema>`


## 7. File Map (Minimum)3. **Enums and Union Types**

- Example:

| File | Responsibility |     - `AttendanceStatus = z.enum(["scheduled","early","late","no_show",...])`

|------|----------------|     - Role/permission unions.

| `index.ts` | Barrel re-export |

| `network.ts` | Network entity schema |4. **Domain Contracts**

| `orgs.ts` | Org schema |   - These are importable via the alias:

| `venues.ts` | Venue schema |     - `@fresh-schedules/types`

| `users.ts` | User/staff schema |

| `roles.ts` | Scheduling Role schema (see ENTITY_ROLE_v15.md) |All higher layers (Infra, App Libs, API, UI) rely on these outputs for **correctness and consistency**.

| `schedules.ts` | Shift + ShiftRoleRequirement schemas |

| `attendance.ts` | AttendanceRecordSchema including `roleId` |---

| `rbac.ts` | System RBAC definitions (admin, manager, staff) |

**Dependencies**

---

Allowed dependencies:

## 8. Change Log

- `zod`

| Date | Author | Change |- Local sibling files within `packages/types/src/**`

|------|---------|--------|- TypeScript and standard language features.

| YYYY-MM-DD | Patrick Craven | Initial L00 technical guide |

Forbidden dependencies:

- `firebase-admin`, `firebase/*`
- `next/*`
- Any file under `apps/**`, `services/**`, or `docs/**`
- Any network I/O or side-effecting library.

This layer must be able to compile and run **in isolation** with only `zod` and TypeScript.

---

**Consumers**

The Domain Kernel is consumed by:

- **Layer 01 – Infrastructure**
  - For Firestore rules, security tests, and adapter types.

- **Layer 02 – Application Libraries**
  - For business logic, onboarding flows, scheduling logic, and validation.

- **Layer 03 – API Edge**
  - For validating request/response payloads (`CreateAttendanceRecordSchema`, etc.).

- **Layer 04 – UI/UX**
  - For typing props, forms, and client-side validation where appropriate.

No layer **below** Layer 00 exists; this is the bottom of the stack.

---

**Invariants**

The following must always hold true in the Domain Kernel:

1. **Purity**
   - No side effects.
   - No network calls.
   - No file system access.
   - No logging.

2. **Isolation**
   - No imports from:
     - `apps/**`
     - `services/**`
     - `firebase*`
     - `next/*`
   - It must be usable by any runtime (Node, browser, worker) without modification.

3. **Single Responsibility**
   - Every file defines domain concepts only:
     - Entities
     - Value objects
     - Errors
     - Domain enums

4. **Validation First**
   - All external-facing types are derived from Zod schemas.
   - There are no “naked” structural types for key entities without a Zod schema backing them.

5. **Stability**
   - Schema changes are considered **breaking changes** and must be reflected in:
     - Bible v15
     - Migration docs
     - Data migration scripts

6. **Alias Consistency**
   - All consumers import via `@fresh-schedules/types`, never via relative paths like `../../packages/types/src/...`.

---

**Change Log**

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 layer definition |

# LAYER_00_DOMAIN_KERNEL

**Purpose**
Describe exactly why this layer exists and what problems it solves.

**Scope**
Which directories, modules, or files belong to it.

**Inputs**
What it consumes (events, requests, data types).

**Outputs**
What it produces (domain entities, responses, UI state).

**Dependencies**
Which other layers or systems it depends on (always downward only).

**Consumers**
Which layers depend on this layer.

**Invariants**
Rules that must never break inside this layer.

**Change Log**

| Date       | Author         | Change        |
| ---------- | -------------- | ------------- |
| YYYY-MM-DD | Patrick Craven | Initial draft |
