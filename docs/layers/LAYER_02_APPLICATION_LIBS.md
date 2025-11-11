# LAYER_02_APPLICATION_LIBS

**Purpose**  
Implements all domain-level use-cases: onboarding, scheduling, attendance, role management, and validation orchestration.

---

## 1. Scope

`apps/web/src/lib/**`  
(excluding `env*.ts` and `firebase.server.ts`)

---

## 2. Responsibilities

- Business logic orchestration (pure functions).
- Validation using Zod schemas from Layer 00.
- Interaction with infra adapters (Layer 01).
- Provide clean APIs to Layer 03.

---

## 3. Inputs

- Domain schemas (00).
- Infra clients (01).

---

## 4. Outputs

- Typed use-case functions.
- Consistent error objects.

---

## 5. Dependencies

- `zod`
- `@fresh-schedules/types`
- `@firebase/*` via infra adapters
- `p-retry` / `p-map` (optional)

---

## 6. Consumers

- Layer 03 (API Edge)
- Layer 04 (UI clients via API wrappers)

---

## 7. Invariants

- No Next or React imports.
- No direct HTTP handlers.
- Deterministic, testable functions.

---

## 8. Core Use-Cases

| File                             | Description                  |
| -------------------------------- | ---------------------------- |
| `onboarding/createOrg.ts`        | Org creation                 |
| `roles/createRole.ts`            | Role CRUD                    |
| `roles/listRoles.ts`             | Role listing                 |
| `scheduling/createShift.ts`      | Shift with Role requirements |
| `attendance/recordAttendance.ts` | Attendance with roleId       |
| `error/normalize.ts`             | Consistent error objects     |
| `api/request.ts`                 | Fetch helpers (client only)  |

---

## 9. Validation Checklist

- [ ] All functions return typed Result or throw structured error.
- [ ] No business logic in API routes.
- [ ] Unit tests for each use-case pass.

---

## 10. Change Log

| Date       | Author         | Change            |
| ---------- | -------------- | ----------------- |
| YYYY-MM-DD | Patrick Craven | Initial L02 guide |

# LAYER_02_APPLICATION_LIBS

**Purpose**
Application Libraries implement the **core behavior of the app**: onboarding, scheduling, attendance logic, authorization, rate limiting, and error handling, in a way that is independent of HTTP routes and UI components.

This layer turns:

- Domain types (Layer 00)
- Infrastructure capabilities (Layer 01)

into **concrete use-cases** like:

- “Create a network and org”
- “Calculate allowed labor for a week”
- “Record attendance safely”
- “Enforce org membership and roles”

---

**Scope**

This layer includes (non-exhaustive):

- `apps/web/src/lib/api/**`
  - `session.ts`
  - `authorization.ts`
  - `csrf.ts`
  - `redis.ts`, `redis-rate-limit.ts`
  - `index.ts` (API helpers barrel)

- `apps/web/src/lib/onboarding/**`
  - `createNetworkOrg.ts`
  - `userOnboarding.ts`
  - `adminFormDrafts.ts`

- `apps/web/src/lib/error/**`
  - `ErrorContext.tsx` (if present and logic-focused)
  - `reporting.ts`

- `apps/web/src/lib/storage/**`
  - `kv.ts` (if used as generic storage)

- `apps/web/src/lib/store.ts` (shared state/store, if used across app logic)

- Any other non-React, non-route logic under `apps/web/src/lib/**` that composes domain + infra into reusable behaviors.

Not in scope:

- Next.js route handlers under `app/api/**` (Layer 03).
- React components or pages under `app/**` and `components/**` (Layer 04).

---

**Inputs**

Application Libraries consume:

- **Domain Kernel**:
  - Types and schemas from `@fresh-schedules/types`

- **Infrastructure**:
  - Firebase server adapters (`firebase.server.ts`)
  - Env accessors (`env.server.ts`, `env.ts`)
  - Redis adapters, storage utilities, logger, telemetry hooks

- **Context from API layer** (as arguments, not imports):
  - Authenticated user/session info
  - Org/venue identifiers
  - Request payloads already validated against Zod schemas

They do **not** consume `NextRequest`, `NextResponse`, or React components directly.

---

**Outputs**

Application Libraries produce:

1. **Use-case Functions**
   - Example:
     - `createNetworkOrg(input, context)`
     - `getUserOnboardingState(userId)`
     - `recordAttendance(input, context)`
   - These functions encapsulate a full business operation.

2. **Authorization Utilities**
   - Helpers such as `requireOrgMembership`, `requireRole`, `requireSession` (exported via `apps/web/src/lib/api/index.ts`), which enforce RBAC and membership based on domain types + infra.

3. **Rate Limiting / Security Utilities**
   - `createRateLimiter(config)`
   - CSRF helpers
   - Redis-based throttle logic

4. **Error Handling Primitives**
   - Functions for reporting errors
   - Domain-specific error types or wrappers

All outputs are designed to be **called** from Layer 03 (API) and indirectly from Layer 04 (UI) through service hooks.

---

**Dependencies**

Allowed dependencies:

- `@fresh-schedules/types` (Layer 00)
- Infrastructure adapters in Layer 01:
  - `apps/web/src/lib/env*.ts`
  - `apps/web/src/lib/firebase.server.ts`
  - `apps/web/src/lib/logger.ts`
  - `apps/web/src/lib/otel.ts`
  - Infra utilities exposed from `services/api` when needed
- Utility libraries (date/time, math, etc.)

Forbidden dependencies:

- `apps/web/app/**` (no direct route imports)
- `apps/web/components/**` (no React component imports)
- `next/*` (no direct NextRequest/NextResponse usage here)

Application logic must be framework-agnostic and testable without spinning up Next.js.

---

**Consumers**

Application Libraries are consumed by:

- **Layer 03 – API Edge**
  - API routes call application functions to perform business actions.

- **Layer 04 – UI/UX**
  - UI imports app libs (directly or via hooks) to perform client-initiated actions (e.g., submit onboarding, create schedule, fetch data).

This layer sits in the middle and should not be skipped. Any business operation should pass through it.

---

**Invariants**

1. **No Framework Entanglement**
   - No imports from React, `next/*`, or `app/api/**` files.
   - Logic is pure TS/JS + domain + infra.

2. **Single Responsibility per Function**
   - Each exported function represents a clear use-case, not a grab bag.

3. **Domain-Driven APIs**
   - Function signatures use domain types (`OrgId`, `VenueId`, `AttendanceRecordInput`) rather than raw `any` or untyped objects.

4. **Isolation of Side Effects**
   - All I/O (Firestore, Redis, etc.) is handled via Layer 01 adapters.
   - Application libs do not embed raw SDK calls; they use infra helpers.

5. **Testability**
   - Functions can be tested by mocking:
     - Domain types
     - Infra adapters
   - No direct dependency on runtime/environment or HTTP.

6. **Security-by-Default**
   - Authorization helpers (e.g., `requireOrgMembership`) must default to **deny** on missing/invalid context.
   - No function should assume a user is allowed; permission checks are explicit.

---

**Change Log**

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 layer definition |

# LAYER_02_APPLICATION_LIBS

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
