# LAYER_01_INFRASTRUCTURE

**Purpose**  
Implements vendor integrations, runtime configuration, logging, and Firestore rules that realize the domain kernel in production.

---

## 1. Scope

- `services/api/src/**`
- `apps/web/src/lib/env*.ts`
- `apps/web/src/lib/firebase.server.ts`
- `apps/web/src/lib/logger.ts`
- `apps/web/src/lib/otel.ts`
- `firestore.rules`, `storage.rules`

---

## 2. Responsibilities

- Initialize Firebase Admin SDK and clients.
- Load and validate environment variables.
- Provide telemetry/logging utilities.
- Define and test security rules.
- Expose low-level adapters (no business logic).

---

## 3. Inputs

- Domain schemas from Layer 00.
- .env values validated via `zod`.
- Service credentials.

---

## 4. Outputs

- Singleton Firebase clients.
- Rule definitions and compiled files.
- Typed env accessors.
- Structured logs and traces.

---

## 5. Dependencies

- `firebase-admin`
- `firebase-functions`
- `zod`
- `pino` / `otel`  
  _(no React, no Next)_

---

## 6. Consumers

- Layer 02: uses initialized SDKs and env accessors.
- Layer 03: indirectly via Layer 02.

---

## 7. Invariants

- One init per service (guarded singleton).
- No cross-org data leakage in rules.
- Rules enforce:
  - Attendance requires valid roleId.
  - Role writes restricted to admins/managers.

---

## 8. File Map

| File                           | Purpose                      |
| ------------------------------ | ---------------------------- |
| `firebase.server.ts`           | Firebase Admin init          |
| `env.server.ts`                | Env loader w/ Zod            |
| `logger.ts`                    | Pino logger                  |
| `otel.ts`                      | OpenTelemetry init           |
| `services/api/src/firebase.ts` | Shared admin instance        |
| `firestore.rules`              | Org/Role/Attendance policies |
| `storage.rules`                | File access control          |

---

## 9. Validation Checklist

- [ ] Emulator tests green.
- [ ] Rule tests cover Role + Attendance paths.
- [ ] `env.server.ts` throws on missing vars.
- [ ] No imports from UI or Next.

---

## 10. Change Log

| Date       | Author         | Change            |
| ---------- | -------------- | ----------------- |
| YYYY-MM-DD | Patrick Craven | Initial L01 guide |

# LAYER_01_INFRASTRUCTURE

**Purpose**
Layer 01 – Infrastructure provides concrete **adapters to external systems**: Firebase, Firestore, Storage, Redis, environment variables, logging, and observability.
It exists to connect the **pure Domain Kernel** to the real world while keeping the rest of the codebase insulated from vendor specifics.

This is where we configure and initialize:

- Firebase Admin
- Firestore database connection
- Storage rules
- Environment handling
- Logging and telemetry

---

**Scope**

This layer includes:

- Backend infrastructure modules:
  - `services/api/src/env.ts`
  - `services/api/src/firebase.ts`
  - `services/api/src/obs/**` (OTel / tracing / logging)
  - `services/api/src/mw/rbac.ts` (if it encodes infra-level role claims)

- Web app infra adapters:
  - `apps/web/src/lib/env.ts`
  - `apps/web/src/lib/env.server.ts`
  - `apps/web/src/lib/firebase.server.ts`
  - `apps/web/src/lib/otel.ts`
  - `apps/web/src/lib/logger.ts`
  - `apps/web/src/lib/storage/kv.ts` (if backed by external storage)

- Configuration & rules:
  - `firebase.json`, `firebase.*.json`
  - `.firebaserc`
  - `storage.rules`
  - `firestore.rules`
  - `packages/rules-tests/**` (tests for Firestore rules)

**Not** in scope:

- Business logic (e.g., “how to create a schedule”).
- UI-facing helpers.
- HTTP route handlers.

---

**Inputs**

Infrastructure consumes:

- **Domain types** from `@fresh-schedules/types`:
  - To shape Firestore document expectations and auth claims.

- **Environment variables**, such as:
  - Firebase project ID
  - Google credentials JSON
  - Redis connection strings
  - Logging / telemetry configuration

- **External SDKs**:
  - `firebase-admin`
  - Firestore client APIs
  - Redis client (if used)
  - Observability libraries (OTel, Sentry, etc.)

- **Config files**:
  - `firebase.json`, `storage.rules`, `firestore.rules`

---

**Outputs**

Infrastructure produces:

1. **Initialized SDK Clients**
   - Firebase Admin instance
   - Firestore database instance
   - Storage configuration
   - Redis adapter

2. **Environment Accessors**
   - Functions to safely read and validate env vars:
     - `getServerEnv()`
     - `loadEnv()`

3. **Rule Enforcement**
   - Firestore & Storage rules compiled and deployed.
   - Rules tests validating expected behavior.

4. **Observability Hooks**
   - Logger interfaces
   - Tracing setup
   - Error reporting endpoints (for higher layers to call)

These outputs are consumed by application libraries (Layer 02) and occasionally directly by the API Edge (Layer 03) when necessary.

---

**Dependencies**

Allowed dependencies:

- **Domain Kernel**:
  - `@fresh-schedules/types` (for shaping stored documents and auth claims)
- **External SDKs / Services**:
  - `firebase-admin`
  - Firestore / Storage SDKs
  - Redis client
  - Observability/logging libraries
- **Runtime**:
  - Node.js standard library (fs, process, etc.) where appropriate

Forbidden dependencies:

- `apps/web/app/**`
- `apps/web/components/**`
- Any UI or React primitive
- Any direct use of Next.js server/app components

This layer should work without any knowledge of routing or presentation.

---

**Consumers**

Infrastructure is consumed by:

- **Layer 02 – Application Libraries**
  - For onboarding flows, scheduling, attendance recording, etc. that require persistence.

- **Layer 03 – API Edge**
  - For some lower-level routes or middleware that may need direct infra access (e.g., health checks).

No layer above is allowed to bypass this layer to talk directly to vendors (Firebase/Redis/etc.). All such access is centralized here.

---

**Invariants**

1. **Single Initialization**
   - Firebase Admin and other heavy clients must be initialized once per runtime, with protections against accidental re-init.

2. **Config Safety**
   - All required env vars must be validated at startup; missing or invalid values should fail fast (in dev) or log critical errors (in prod).

3. **Vendor Encapsulation**
   - No application or UI code should import vendor SDKs directly.
   - All vendor interactions go through thin adapters in this layer.

4. **Rule–Domain Consistency**
   - Firestore rules must be kept consistent with:
     - Domain schemas from `@fresh-schedules/types`
     - Bible and schema docs (`schema-map.md`, `schema-network.md`)
   - Any change to domain entities that affects security must be reflected here.

5. **Side-Effects are Controlled**
   - This is the only layer allowed to have raw side-effects (network I/O, disk, etc.).
   - Side-effects must be exposed via **clear function boundaries** to Layer 02.

6. **Testability**
   - Provides test hooks or emulator configs so higher layers can run integration tests without touching production infra.

---

**Change Log**

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 layer definition |

# LAYER_01_INFRASTRUCTURE

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
