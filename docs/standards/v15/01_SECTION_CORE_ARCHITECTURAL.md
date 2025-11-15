# Section 1: Core Architectural Standards (10 Standards)

## 1. 📄 DOMAIN_SCHEMA_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 00 (Domain)  
**Purpose:** To define the single source of truth for all business entities using Zod schemas, directly translating the Project Bible's data models into verifiable code.

### Principles

1. **Bible as Source:** Schemas MUST be a 1:1 implementation of the Project Bible's data models.
2. **Zod is Authority:** Zod schemas are the source of truth. TypeScript types MUST be inferred via `z.infer`. Manual `interface` definitions that mirror schemas are forbidden.
3. **Location:** All schemas MUST reside in the `packages/types/src` directory (Layer 00).
4. **Immutability by Default:** Core identifiers (`id`, `networkId`, `createdAt`, `createdBy`) MUST be marked as `.readonly()` to prevent mutation.

### The Rules

- **Schema Suffix:** Exported Zod object schemas MUST use a `PascalCaseSchema` suffix (e.g., `NetworkSchema`).
- **ID Fields:** Every primary entity schema MUST include `id: z.string().readonly()`.
- **Tenancy Field:** Every entity within a tenant boundary MUST include `networkId: z.string().readonly()`.
- **Timestamps & Ownership:** Persistent documents MUST include `createdAt: z.date().readonly()`, `createdBy: z.string().readonly()`, `updatedAt: z.date()`, and `updatedBy: z.string()`.
- **Constants for Enums:** Use enums/constants imported from the shared constants package for controlled vocabularies (`z.enum(USER_ROLES)`). Do not use hardcoded string arrays.

---

## 2. 📄 RULES_PARITY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 01 (Rules) & 02 (API)  
**Purpose:** To ensure that data validation logic is perfectly synchronized across the stack: Domain (Zod), API (Route Handlers), and Database (Firestore Rules).

### Principles

1. **The Triad of Trust:** For any given entity, these three components must be in parity:
   - **Layer 00:** The `ZodSchema`.
   - **Layer 01:** The `firestore.rules` validation logic.
   - **Layer 02:** The API route's input validation.
2. **Zod is the Leader:** The Zod schema is the "leader." Firestore rules and API validation are "followers" that implement the schema's constraints.
3. **Parity over Performance:** Redundant checks in rules are preferable to a security gap.

### The Rules

- **Field-Level Parity:** If a field is required in Zod, the Firestore rule MUST check for its existence and correct type.
- **Read-Only Parity:** Fields marked `.readonly()` in Zod MUST NOT be updatable in a Firestore rule's `update` condition.
- **Enum Parity:** A `z.enum(MY_ENUM)` in Zod MUST have a corresponding `request.resource.data.status in MY_ENUM` check in the Firestore rule.
- **API Route Parity:** An API route that creates or updates an entity MUST use the corresponding `ZodSchema.parse()` or `.safeParse()` on its incoming request body.

---

## 3. 📄 API_ROUTE_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API)  
**Purpose:** To define a consistent, secure, and observable structure for all API route handlers.

### Principles

1. **Secure by Default:** Every route must perform authentication, authorization (RBAC), and tenancy checks.
2. **Validate, Don't Trust:** All incoming data MUST be parsed and validated by Zod.
3. **Single Responsibility:** An API route file handles all HTTP methods for a single resource.

### The Rules

- **Location:** Routes MUST reside in `apps/web/app/api/...`.
- **Exports:** Handlers MUST be exported as named functions (`GET`, `POST`, `PATCH`, `DELETE`).
- **Validation First:** The first step in any handler MUST be input validation.
- **Tenancy & RBAC Check:** Following validation, the route MUST enforce tenancy and role permissions.
- **Wrappers:** All handlers MUST be wrapped in a series of standard wrappers (`withTelemetry`, `withApiAuth`, `withErrorHandler`).

---

## 4. 📄 UI_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 03 (UI)  
**Purpose:** To ensure UI components are predictable, performant, and strictly separated from server-side logic.

### Principles

1. **Strict Boundary:** Layer 03 is for presentation only. It consumes data from Layer 02 APIs; it does not generate or fetch it directly.
2. **State Management:** Use data-fetching libraries (e.g., React Query) for server state. Use `useState` only for transient client state.
3. **Client SDK Only:** UI components MUST only use the **Firebase Client SDK** (`firebase/firestore`, `firebase/auth`).

### The Rules

- **Data Fetching:** All communication with APIs MUST be done through custom data-fetching hooks (e.g., `useOrganizations()`).
- **No Server Code:** The presence of `firebase-admin` is a 🔴 CRITICAL violation.
- **"use client" Directive:** All files containing React hooks (`useState`, `useEffect`) MUST begin with the `"use client";` directive.

---

## 5. 📄 RBAC_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 01 (Rules) & 02 (API)  
**Purpose:** To define the official user roles and enforce a strict authorization model.

### Principles

1. **Least Privilege:** Grant minimum necessary permissions.
2. **Server-Side Enforcement:** RBAC checks MUST be enforced on the server.
3. **No Magic Strings:** Roles must be referenced via constants.

### Authoritative Roles

Roles are defined and exported as `USER_ROLES` from `packages/types/src/constants.ts`:

```typescript
export const USER_ROLES = ["platform_super_admin", "network_owner", "org_admin", "staff"] as const;
```

### The Rules

- **API Authorization:** API routes must check `requiredRole` against the imported `USER_ROLES` constant.
- **Firestore Rules Authorization:** Rules must validate roles against the same canonical list.
- **No Role Conflation:** Logic like `if (role === 'network_owner' || role === 'org_admin')` must be reviewed for potential refactoring into a more granular permission.

---

## 6. 📄 TENANCY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To enforce the "Single Tenant Invariant", ensuring all data is strictly partitioned by `networkId` and preventing any possibility of data leakage between tenants. This is the most important architectural standard.

### The Prime Invariant

**"Every meaningful piece of data must be associated with exactly one `networkId`."**

### The Rules

- **Firestore Path Structure:** All top-level collections containing business data MUST be sub-collections of `/networks/{networkId}`.
- **Document Field:** Every document within a network's sub-collection MUST also contain a redundant `networkId` field.
- **Firestore Rule Enforcement:** Every single `read` or `write` rule MUST contain a condition that validates `request.resource.data.networkId == request.auth.token.networkId`.
- **API Enforcement:** API routes MUST extract `networkId` from the authenticated user's session token, NOT from the request body. This `networkId` MUST be used in all database queries (`.where('networkId', '==', networkId)`).

---

## 7. ⭐ SDK_BOUNDARY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To explicitly define which Firebase SDK is permissible in each architectural layer, eliminating all ambiguity around what constitutes "server code."

### The Two SDKs: A Strict Division

1. **The Client SDK (`firebase/*`)**: Used in browsers. Operates with the end-user's permissions.
2. **The Admin SDK (`firebase-admin`)**: Used on trusted servers. Bypasses all Firestore rules and has privileged access.

**This division is a cornerstone of our security model.**

### The Rules: Where Each SDK Can Live

| Layer          | Path Pattern                         | Allowed SDK         | Rationale                                         |
| -------------- | ------------------------------------ | ------------------- | ------------------------------------------------- |
| **00: Domain** | `packages/types/src/**`              | **NEITHER**         | Must be platform-agnostic.                        |
| **02: API**    | `/app/api/**`, `/functions/**`       | **Admin SDK only**  | Server needs privileged access.                   |
| **03: UI**     | `/components/**`, `/app/(routes)/**` | **Client SDK only** | UI must operate under the end-user's credentials. |

**The Golden Rule:** The string `firebase-admin` must NEVER be imported outside of Layer 02.

---

## 8. ⭐ CONSTANTS_ENUMS_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 00 (Domain) / ALL  
**Purpose:** To eliminate "magic strings" and "magic numbers" by establishing a single, shared source of truth for critical, hardcoded values.

### Principles

1. **Single Source of Truth:** If a value is used in more than one place, it belongs in a constant.
2. **Discoverability:** Constants provide type safety and IDE auto-completion.
3. **Location:** The canonical source for shared constants is `packages/types/src/constants.ts`.

### The Rules

- **Create a Central File:** A file MUST exist at `packages/types/src/constants.ts`.
- **Export `as const`:** Arrays/objects used as enums MUST be exported with `as const` for narrow types.
- **Capitalization:** All constants MUST be named in `UPPER_SNAKE_CASE`.

### Example constants.ts

```typescript
// RBAC Roles
export const USER_ROLES = ["platform_super_admin", "network_owner", "org_admin", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Firestore Collection Names
export const COLLECTIONS = { NETWORKS: "networks", ORGS: "orgs" } as const;
```

---

## 9. ⭐ MUTABILITY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 00 (Domain) / 01 (Rules) / 02 (API)  
**Purpose:** To provide explicit rules on which data fields can and cannot be changed after creation.

### Principles

1. **Immutable by Default:** Fields are immutable unless explicitly defined otherwise.
2. **Creation is Special:** `id`, `createdAt`, `networkId`, `createdBy` are set only once.
3. **`Create` vs. `Update`:** The logic for `POST` (create) is different from `PATCH` (update). This must be reflected in our schemas.

### Mutability Levels

- **Level 1: Immutable (`readonly`)**: `id`, `networkId`, `createdAt`, `createdBy`. Must be `.readonly()` in Zod and blocked in `update` rules.
- **Level 2: State-Machine Mutable**: `status` fields. Logic must enforce valid transitions.
- **Level 3: Freely Mutable**: `displayName`, `notes`.

### The `Create` vs. `Update` Schema Pattern

For every major entity, there must be two Zod schemas:

1. **`Create...Schema`**: Defines all required fields for creation.
2. **`Update...Schema`**: Defines only mutable fields, all marked with `.optional()`. Immutable fields are omitted entirely.

---

## 10. ⭐ FEATURE_FLAG_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To define a consistent and secure pattern for managing and checking feature flags for controlled rollouts.

### Principles

1. **Tenant-Scoped Flags:** Feature flags are properties of the `Network` document.
2. **Centralized Definition:** The `NetworkSchema` is the single source of truth for all available flags.
3. **Secure by Default:** A missing or `false` flag denies access.
4. **Checks Occur on the Server:** The API MUST enforce the flag before executing logic.

### The Standard Implementation

#### A. Schema Definition in `NetworkSchema`

```typescript
export const NetworkSchema = z.object({
  // ...
  features: z
    .object({
      analytics: z.boolean().default(false),
      aiAssistant: z.boolean().default(false),
    })
    .default({}),
});
```

#### B. API Enforcement Pattern

```typescript
export const POST = withApiAuth({
  requiredRole: "org_admin",
  handler: async ({ req, session, network }) => {
    if (!network.features?.aiAssistant) {
      return createStandardErrorResponse(
        {
          code: "FEATURE_NOT_ENABLED",
          message: "This feature is not enabled for your network.",
        },
        { status: 403 },
      );
    }
    // Proceed with feature logic...
  },
});
```

---

**This completes Section 1: Core Architectural Standards (10 standards). See the Index for navigation to other sections.**
