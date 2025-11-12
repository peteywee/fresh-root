# Layer 01 – Infrastructure Abstraction

**Purpose**  
Define low-level platform access and provider abstraction to allow future migration from Firebase to any equivalent backend.

---

## Provider Adapter Interface (2025-11-11 v15)

```ts
export interface QueryFilter {
  field: string;
  op: "==" | "<" | "<=" | ">" | ">=" | "in" | "array-contains" | "array-contains-any";
  value: unknown;
}

export interface DataProviderAdapter {
  getDoc<T>(path: string): Promise<T | null>;
  setDoc<T>(path: string, data: T): Promise<void>;
  query<T>(collection: string, filters: QueryFilter[]): Promise<T[]>;
  deleteDoc(path: string): Promise<void>;
}
```

### Notes

- `QueryFilter` intentionally mirrors a subset of Firestore style operators while remaining backend‑agnostic.
- Implementations must translate filter ops to the underlying vendor (Firestore, REST, SQL, etc.) or throw `UnsupportedOperationError`.
- All data returned should already be validated by Layer 00 schemas before exposure to higher layers.

### Next Steps

1. Provide a Firestore-backed implementation: `FirestoreDataProviderAdapter`.
2. Add an in-memory adapter for tests/emulator fast paths.
3. Document migration strategy for replacing Firebase with an alternative provider.

---

| Date       | Author         | Change                     |
| ---------- | -------------- | -------------------------- |
| 2025-11-11 | Patrick Craven | Replace legacy verbose doc |

### Scope

Infrastructure source locations:

- `apps/web/src/lib/env.ts`
- `apps/web/src/lib/env.server.ts`
- `apps/web/src/lib/firebase.server.ts`
- `apps/web/src/lib/otel.ts`
- `apps/web/src/lib/logger.ts`
- `apps/web/src/lib/storage/kv.ts` (if backed by external storage)

Configuration & rules:

- `firebase.json`, `firebase.*.json`
- `.firebaserc`
- `storage.rules`
- `firestore.rules`
- `packages/rules-tests/**` (tests for Firestore rules)

**Not** in scope:

- Business logic (e.g., "how to create a schedule").
- UI-facing helpers.
- HTTP route handlers.

### Inputs

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

### Outputs

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

### Dependencies

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

### Consumers

Infrastructure is consumed by:

- **Layer 02 – Application Libraries**
  - For onboarding flows, scheduling, attendance recording, etc. that require persistence.

- **Layer 03 – API Edge**
  - For some lower-level routes or middleware that may need direct infra access (e.g., health checks).

No layer above is allowed to bypass this layer to talk directly to vendors (Firebase/Redis/etc.). All such access is centralized here.

### Invariants

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

## Change Log

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| 2025-11-11 | Patrick Craven | Initial v15 layer definition |
