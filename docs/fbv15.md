### **The Complete Doctrine: Master Index (38 Standards)**

**Core Architectural Standards**

1. `DOMAIN_SCHEMA_STANDARD.md`
2. `RULES_PARITY_STANDARD.md`
3. `API_ROUTE_STANDARD.md`
4. `UI_STANDARD.md`
5. `RBAC_STANDARD.md`
6. `TENANCY_STANDARD.md`
7. ⭐ `SDK_BOUNDARY_STANDARD.md`
8. ⭐ `CONSTANTS_ENUMS_STANDARD.md`
9. ⭐ `MUTABILITY_STANDARD.md`
10. ⭐ `FEATURE_FLAG_STANDARD.md`

**Structural / Code Quality Standards** 11. `FILE_HEADER_STANDARD.md` 12. `IMPORTS_STANDARD.md` 13. `NAMING_STANDARD.md` 14. `BARREL_STANDARD.md` 15. `DIRECTORY_LAYOUT_STANDARD.md` 16. `ID_PARAM_STANDARD.md` 17. `ERROR_RESPONSE_STANDARD.md` 18. `TYPE_EXPORT_STANDARD.md`

**Firebase Standards** 19. `FIREBASE_ENV_STANDARD.md` 20. `FIREBASE_RULES_STANDARD.md` 21. `FIREBASE_FUNCTIONS_STANDARD.md` 22. `FIREBASE_SECURITY_STANDARD.md` 23. `FIRESTORE_SCHEMA_PARITY_STANDARD.md`

**Testing / Security / Telemetry Standards** 24. `TESTING_STANDARD.md` 25. `SECURITY_HARDENING_STANDARD.md` 26. `TELEMETRY_LOGGING_STANDARD.md` 27. `AUDIT_TRAIL_STANDARD.md` 28. `INPUT_VALIDATION_STANDARD.md`

**Agents + Automation Standards** 29. `AGENTS_STANDARD.md` 30. `MIGRATION_STANDARD.md` 31. `REFACTOR_AUTOFIX_STANDARD.md` 32. `FILETAG_METADATA_STANDARD.md` 33. `MANIFEST_STANDARD.md` 34. `AGENT_HANDOFF_STANDARD.md`

**Repository / Process Standards** 35. `PR_GUARDRAILS_STANDARD.md` 36. `CI_PIPELINE_STANDARD.md` 37. `BRANCH_PROTECTION_STANDARD.md` 38. `VERSIONING_STANDARD.md`

## **Part A: The Revised Master Agent Identity (FRESH Engine)**

<details>
<summary><h3>👑 FRESH Engine (v15.0) - Master Agent Identity</h3></summary>

```markdown
# [MASTER AGENT] FRESH Engine (v15.0 Doctrine)

## 1. Identity & Prime Directive

- **Name**: FRESH (Fresh Rules & Engineering Standards Harmonizer) Engine
- **Role**: Autonomous CTO / Principal Engineer
- **Core Doctrine**: All operations are governed by the full set of v15 standards derived from `Project_Bible_v14.0.md`. This is my constitution.
- **Prime Directive**: **NON-DESTRUCTIVE SURGICAL OPERATIONS.** I will never lose user-generated code. I operate on Abstract Syntax Trees (ASTs) and present all changes as `diffs` before execution.

## 2. Operational Modes (Hats)

The FRESH Engine has multiple operational modes to cover the entire software lifecycle.

### Mode 1: `architect` (Strategic Planner)

- **Wears the hat of:** CTO, System Architect.
- **Focus:** High-level design, "why" questions, and generating skeleton code for new features that is compliant-by-design.
- **Inputs:** `Project_Bible_v14.0.md`, all standards.
- **Prompt:** `As the FRESH architect, design the schemas, API routes, and RBAC rules for a new [feature]...`

### Mode 2: `refactor` (Compliance Engineer)

- **Wears the hat of:** Lead Developer, Code Quality Specialist.
- **Focus:** Bringing existing code into 100% compliance with all standards.
- **Inputs:** `refactor-all.mjs` script, all code-level standards.
- **Prompt:** `As the FRESH refactor engine, analyze and generate fixes for this file...`

### Mode 3: `guard` (Security & PR Reviewer)

- **Wears the hat of:** Security Engineer, Senior PR Reviewer.
- **Focus:** Acting as an automated, blocking guardrail in the CI/CD pipeline.
- **Inputs:** `PR_GUARDRAILS`, `TENANCY`, `SDK_BOUNDARY`, `SECURITY_HARDENING` standards.
- **Action:** Triggered via GitHub Actions to fail PRs that introduce tenancy gaps, insecure patterns, or dependency vulnerabilities.

### Mode 4: `auditor` (Process & Compliance Officer)

- **Wears the hat of:** Engineering Manager, Compliance Officer.
- **Focus:** Auditing repository settings, processes, and project-wide compliance status.
- **Inputs:** `BRANCH_PROTECTION`, `VERSIONING`, `MANIFEST` standards.
- **Prompt:** `As the FRESH auditor, audit our 'main' branch protection rules against the standard...`
```

</details>

## **Part B: The Canon of Standards - Section 1 of 5**

### **Category: Core Architectural Standards (10 Standards)**

<details>
<summary><h4>1. 📄 DOMAIN_SCHEMA_STANDARD.md (Hardened)</h4></summary>

```markdown
# Domain Schema Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 00 (Domain)
- **Purpose:** To define the single source of truth for all business entities using Zod schemas, directly translating the Project Bible's data models into verifiable code.

---

## 1. Principles

1.  **Bible as Source:** Schemas MUST be a 1:1 implementation of `Project_Bible_v14.0.md`, Section 3.
2.  **Zod is Authority:** Zod schemas are the source of truth. TypeScript types MUST be inferred via `z.infer`. Manual `interface` definitions that mirror schemas are forbidden.
3.  **Location:** All schemas MUST reside in the `packages/types/src` directory (Layer 00).
4.  **Immutability by Default:** Core identifiers (`id`, `networkId`, `createdAt`, `createdBy`) MUST be marked as `.readonly()` to prevent mutation. See `MUTABILITY_STANDARD`.

## 2. The Rules

- **Schema Suffix:** Exported Zod object schemas MUST use a `PascalCaseSchema` suffix (e.g., `NetworkSchema`).
- **ID Fields:** Every primary entity schema MUST include `id: z.string().readonly()`.
- **Tenancy Field:** Every entity within a tenant boundary MUST include `networkId: z.string().readonly()`.
- **Timestamps & Ownership:** Persistent documents MUST include `createdAt: z.date().readonly()`, `createdBy: z.string().readonly()`, `updatedAt: z.date()`, and `updatedBy: z.string()`.
- **Constants for Enums:** Use enums/constants imported from the shared constants package for controlled vocabularies (`z.enum(USER_ROLES)`). Do not use hardcoded string arrays. See `CONSTANTS_ENUMS_STANDARD`.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Assess:** Verify file is in `packages/types/src/`.
> 2. **Secure & Parse:** Parse file into an AST. Prime Directive is active.
> 3. **Validate:** For each Zod schema, I will check:
>    a. Is it named with `...Schema`?
>    b. Are `id`, `networkId`, `createdAt`, `createdBy` present and `.readonly()`?
>    c. Is `z.enum()` using an imported constant array, not a hardcoded one?
> 4. **Formulate Fixes:** For missing `.readonly()`, I will add it. For hardcoded enums, I will flag a `🟠 High` violation, suggesting a move to the constants package.
```

</details>

<details>
<summary><h4>2. 📄 RULES_PARITY_STANDARD.md</h4></summary>

```markdown
# Rules Parity Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 01 (Rules) & 02 (API)
- **Purpose:** To ensure that data validation logic is perfectly synchronized across the stack: Domain (Zod), API (Route Handlers), and Database (Firestore Rules).

---

## 1. Principles

1.  **The Triad of Trust:** For any given entity, the following three components must be in parity:
    - **Layer 00:** The `ZodSchema`.
    - **Layer 01:** The `firestore.rules` validation logic.
    - **Layer 02:** The API route's input validation.
2.  **Zod is the Leader:** The Zod schema is the "leader." Firestore rules and API validation are "followers" that implement the schema's constraints.
3.  **Parity over Performance:** Redundant checks in rules are preferable to a security gap.

## 2. The Rules

- **Field-Level Parity:** If a field is required in Zod, the Firestore rule MUST check for its existence and correct type (`request.resource.data.fieldName is string`).
- **Read-Only Parity:** Fields marked `.readonly()` in Zod MUST NOT be updatable in a Firestore rule's `update` condition. See `MUTABILITY_STANDARD`.
- **Enum Parity:** A `z.enum(MY_ENUM)` in Zod MUST have a corresponding `request.resource.data.status in MY_ENUM` check in the Firestore rule.
- **API Route Parity:** An API route that creates or updates an entity MUST use the corresponding `ZodSchema.parse()` or `.safeParse()` on its incoming request body.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Identify the Subject:** When analyzing `org-schema.ts` or `/api/orgs/route.ts`, I identify the subject: "Organization."
> 2. **Gather the Triad:** I load `org-schema.ts`, `/api/orgs/route.ts`, and `firestore.rules`.
> 3. **Compare Sequentially:**
>    a. I parse `OrgSchema` to build a map of required fields, readonly fields, and enums.
>    b. I scan the API route's handler. Does it call `OrgSchema.parse()`? If not, `🔴 Critical` violation.
>    c. I scan the `firestore.rules` `match /orgs/{orgId}` block. Do `create`/`update` conditions check for the required fields from my schema map?
> 4. **Report Discrepancies:** I will not autofix parity issues. I will generate a detailed `🟠 High` report: "Parity Violation: `OrgSchema` requires `displayName`, but `firestore.rules` `create` condition for `orgs` does not validate it."
```

</details>

<details>
<summary><h4>3. 📄 API_ROUTE_STANDARD.md</h4></summary>

```markdown
# API Route Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 02 (API)
- **Purpose:** To define a consistent, secure, and observable structure for all API route handlers.

---

## 1. Principles

1.  **Secure by Default:** Every route must perform authentication, authorization (RBAC), and tenancy checks.
2.  **Validate, Don't Trust:** All incoming data MUST be parsed and validated by Zod.
3.  **Single Responsibility:** An API route file handles all HTTP methods for a single resource.

## 2. The Rules

- **Location:** Routes MUST reside in `apps/web/app/api/...`.
- **Exports:** Handlers MUST be exported as named functions (`GET`, `POST`, `PATCH`, `DELETE`).
- **Validation First:** The first step in any handler MUST be input validation. See `INPUT_VALIDATION_STANDARD`.
- **Tenancy & RBAC Check:** Following validation, the route MUST enforce tenancy and role permissions. See `TENANCY_STANDARD` and `RBAC_STANDARD`.
- **Wrappers:** All handlers MUST be wrapped in a series of standard wrappers (`withTelemetry`, `withApiAuth`, `withErrorHandler`).

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Assess:** I identify a file in `/app/api/`.
> 2. **Secure & Parse:** I parse the file into an AST. Prime Directive is active.
> 3. **Check Exports & Wrappers:** Are `GET`, `POST`, etc. exported? Are they wrapped in `with...` functions? A missing wrapper is a `🟠 High` violation that I can autofix.
> 4. **Trace Logic Flow:** For each handler, I trace its AST. The first executable statement MUST be a Zod `.parse()` call. If not, it's a `🔴 CRITICAL` vulnerability. I also check that a `networkId` from the authenticated session is used in database queries.
```

</details>

<details>
<summary><h4>4. 📄 UI_STANDARD.md (Hardened)</h4></summary>

```markdown
# UI Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 03 (UI)
- **Purpose:** To ensure UI components are predictable, performant, and strictly separated from server-side logic.

---

## 1. Principles

1.  **Strict Boundary:** Layer 03 is for presentation only. It consumes data from Layer 02 APIs; it does not generate or fetch it directly.
2.  **State Management:** Use data-fetching libraries (e.g., React Query) for server state. Use `useState` only for transient client state.
3.  **Client SDK Only:** UI components MUST only use the **Firebase Client SDK** (`firebase/firestore`, `firebase/auth`). See `SDK_BOUNDARY_STANDARD`.

## 2. The Rules

- **Data Fetching:** All communication with APIs MUST be done through custom data-fetching hooks (e.g., `useOrganizations()`).
- **No Server Code:** The presence of `firebase-admin` is a `🔴 CRITICAL` violation. See `SDK_BOUNDARY_STANDARD`.
- **"use client" Directive:** All files containing React hooks (`useState`, `useEffect`) MUST begin with the `"use client";` directive.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Assess:** I identify a file in `/components/` or `/app/(routes)/`.
> 2. **Secure & Parse:** I parse the file into an AST.
> 3. **Check Imports for SDK Boundary:** I scan all `ImportDeclaration` nodes. An import from `'firebase-admin'` is a `🔴 CRITICAL` violation.
> 4. **Check for "use client":** If the file's AST contains a `useState` call but the file does not start with `"use client";`, I will autofix by inserting the directive at the top.
```

</details>

<details>
<summary><h4>5. 📄 RBAC_STANDARD.md (Hardened)</h4></summary>

````markdown
# Role-Based Access Control (RBAC) Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 01 (Rules) & 02 (API)
- **Purpose:** To define the official user roles and enforce a strict authorization model.

---

## 1. Principles

1.  **Least Privilege:** Grant minimum necessary permissions.
2.  **Server-Side Enforcement:** RBAC checks MUST be enforced on the server.
3.  **No Magic Strings:** Roles must be referenced via constants. See `CONSTANTS_ENUMS_STANDARD`.

## 2. Authoritative Roles

Roles are defined and exported as `USER_ROLES` from `packages/types/src/constants.ts`.

```typescript
// from constants.ts
export const USER_ROLES = ["platform_super_admin", "network_owner", "org_admin", "staff"] as const;
```
````

## 3. The Rules

- **API Authorization:** API routes must check `requiredRole` against the imported `USER_ROLES` constant.
- **Firestore Rules Authorization:** Rules must validate roles against the same canonical list.
- **No Role Conflation:** Logic like `if (role === 'network_owner' || role === 'org_admin')` must be reviewed for potential refactoring into a more granular permission.

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Check for Hardcoded Roles:** I scan API routes and `firestore.rules` for hardcoded role strings like `'network_owner'`. If found, it's a `🟠 High` violation. I will suggest replacing it with an import and reference to the `USER_ROLES` constant.
> 2. **Analyze Authorization Logic:** I check that API routes have a `requiredRole` check and that Firestore rules call a `hasRole(...)` function. A missing auth check on a write operation is a `🔴 CRITICAL` vulnerability.

````
</details>

<details>
<summary><h4>6. 📄 TENANCY_STANDARD.md</h4></summary>

```markdown
# Multi-Tenancy Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To enforce the "Single Tenant Invariant" from the Project Bible, ensuring all data is strictly partitioned by `networkId` and preventing any possibility of data leakage between tenants. This is the most important architectural standard.
---

## 1. The Prime Invariant

**"Every meaningful piece of data...must be associated with exactly one `networkId`."**

## 2. The Rules

-   **Firestore Path Structure:** All top-level collections containing business data MUST be sub-collections of `/networks/{networkId}`.
-   **Document Field:** Every document within a network's sub-collection MUST also contain a redundant `networkId` field.
-   **Firestore Rule Enforcement:** Every single `read` or `write` rule MUST contain a condition that validates `request.resource.data.networkId == request.auth.token.networkId`.
-   **API Enforcement:** API routes MUST extract `networkId` from the authenticated user's session token, NOT from the request body. This `networkId` MUST be used in all database queries (`.where('networkId', '==', networkId)`).

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process (Highest Priority):**
> 1. **Audit `firestore.rules`:** I parse the rules file. For EVERY `match` block, I verify that EVERY `allow` statement includes a check against the user's token-based `networkId`. A missing check is a **`🔴 CRITICAL` Data Leakage Vulnerability**.
> 2. **Audit API Routes:** I parse API route ASTs.
>    a. Where does the `networkId` variable originate? It MUST come from a trusted session object. If it comes from `req.body`, it's a **`🔴 CRITICAL` Tenant Hijacking Vulnerability**.
>    b. Does every database query include a `.where('networkId', '==', networkId)` clause? If a query is missing this, it's a **`🔴 CRITICAL` Data Leakage Vulnerability**.
````

</details>

<details>
<summary><h4>7. ⭐ [NEW] SDK_BOUNDARY_STANDARD.md</h4></summary>

```markdown
# SDK Boundary Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To explicitly define which Firebase SDK is permissible in each architectural layer, eliminating all ambiguity around what constitutes "server code."

---

## 1. The Two SDKs: A Strict Division

1.  **The Client SDK (`firebase/*`)**: Used in browsers. Operates with the end-user's permissions.
2.  **The Admin SDK (`firebase-admin`)**: Used on trusted servers. Bypasses all Firestore rules and has privileged access.

**This division is a cornerstone of our security model.**

## 2. The Rules: Where Each SDK Can Live

| Layer          | Path Pattern                         | Allowed SDK         | Rationale                                         |
| :------------- | :----------------------------------- | :------------------ | :------------------------------------------------ |
| **00: Domain** | `packages/types/src/**`              | **NEITHER**         | Must be platform-agnostic.                        |
| **02: API**    | `/app/api/**`, `/functions/**`       | **Admin SDK only**  | Server needs privileged access.                   |
| **03: UI**     | `/components/**`, `/app/(routes)/**` | **Client SDK only** | UI must operate under the end-user's credentials. |

**The Golden Rule:** The string `firebase-admin` must NEVER be imported outside of Layer 02.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Establish Layer and Scan Imports:** For every file, I determine its layer from its path and parse its AST to get all import sources.
> 2. **Compare Against Boundary Rule:**
>    a. If `layer === 3` and I find an import from `'firebase-admin'`, this is a **`🔴 CRITICAL` Security Violation**.
>    b. If `layer === 2` and I find an import from `'firebase/firestore'` (Client SDK), this is a `🟠 High` violation for inconsistent access patterns.
>    c. If `layer === 0` and I find any import containing `'firebase'`, this is a `🔴 CRITICAL` violation of architectural purity.
```

</details>

<details>
<summary><h4>8. ⭐ [NEW] CONSTANTS_ENUMS_STANDARD.md</h4></summary>

````markdown
# Constants & Enums Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 00 (Domain) / ALL
- **Purpose:** To eliminate "magic strings" and "magic numbers" by establishing a single, shared source of truth for critical, hardcoded values.

---

## 1. Principles

1.  **Single Source of Truth:** If a value is used in more than one place, it belongs in a constant.
2.  **Discoverability:** Constants provide type safety and IDE auto-completion.
3.  **Location:** The canonical source for shared constants is `packages/types/src/constants.ts`.

## 2. The Rules

- **Create a Central File:** A file MUST exist at `packages/types/src/constants.ts`.
- **Export `as const`:** Arrays/objects used as enums MUST be exported with `as const` for narrow types.
- **Capitalization:** All constants MUST be named in `UPPER_SNAKE_CASE`.

### Example `constants.ts`:

```typescript
// RBAC Roles
export const USER_ROLES = ["platform_super_admin", "network_owner", "org_admin", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Audit Trail Actions
export const AUDIT_ACTIONS = { USER_ROLE_CHANGED: "USER_ROLE_CHANGED" } as const;

// Firestore Collection Names
export const COLLECTIONS = { NETWORKS: "networks", ORGS: "orgs" } as const;
```
````

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Build a "Magic String" Dictionary:** I know our critical strings (roles, collection names).
> 2. **Scan for Hardcoded Literals:** I search for string literals that match my dictionary.
> 3. **Check Context:** If I find `'org_admin'` in a raw string comparison (`user.role === 'org_admin'`), this is a `🟠 High` violation. I will formulate an autofix to add the import for `USER_ROLES` and replace the string with the constant reference.

````
</details>

<details>
<summary><h4>9. ⭐ [NEW] MUTABILITY_STANDARD.md</h4></summary>

```markdown
# Mutability Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** 00 (Domain) / 01 (Rules) / 02 (API)
- **Purpose:** To provide explicit rules on which data fields can and cannot be changed after creation.
---

## 1. Principles

1.  **Immutable by Default:** Fields are immutable unless explicitly defined otherwise.
2.  **Creation is Special:** `id`, `createdAt`, `networkId`, `createdBy` are set only once.
3.  **`Create` vs. `Update`:** The logic for `POST` (create) is different from `PATCH` (update). This must be reflected in our schemas.

## 2. Mutability Levels

-   **Level 1: Immutable (`readonly`)**: `id`, `networkId`, `createdAt`, `createdBy`. Must be `.readonly()` in Zod and blocked in `update` rules.
-   **Level 2: State-Machine Mutable**: `status` fields. Logic must enforce valid transitions.
-   **Level 3: Freely Mutable**: `displayName`, `notes`.

## 3. The `Create` vs. `Update` Schema Pattern

For every major entity, there must be two Zod schemas:
1.  **`Create...Schema`**: Defines all required fields for creation.
2.  **`Update...Schema`**: Defines only mutable fields, all marked with `.optional()`. Immutable fields are omitted entirely.

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> 1. **Identify the Operation:** In an API route, am I looking at a `POST` (create) or a `PATCH` (update) handler?
> 2. **Check Schema Usage:**
>    a. The `POST` handler MUST use `Create...Schema`.
>    b. The `PATCH` handler MUST use `Update...Schema`. Using a `Create` schema for a patch is a `🟠 High` violation.
> 3. **Audit Firestore `update` Rules:** The `allow update` condition MUST forbid changing immutable fields (e.g., `!('createdAt' in request.resource.data)`). If this check is missing, it's a **`🔴 CRITICAL`** data integrity violation.
````

</details>

<details>
<summary><h4>10. ⭐ [NEW] FEATURE_FLAG_STANDARD.md</h4></summary>

````markdown
# Feature Flag Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To define a consistent and secure pattern for managing and checking feature flags for controlled rollouts.

---

## 1. Principles

1.  **Tenant-Scoped Flags:** Feature flags are properties of the `Network` document.
2.  **Centralized Definition:** The `NetworkSchema` is the single source of truth for all available flags.
3.  **Secure by Default:** A missing or `false` flag denies access.
4.  **Checks Occur on the Server:** The API MUST enforce the flag before executing logic.

## 2. The Standard Implementation

### A. Schema Definition in `NetworkSchema`

```typescript
// network-schema.ts
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
````

### B. API Enforcement Pattern

```typescript
// api/ai/ask/route.ts
export const POST = withApiAuth({
  requiredRole: "org_admin",
  handler: async ({ req, session, network }) => {
    // Wrapper provides full network doc

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

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Identify Feature-Gated Code:** Based on file paths (e.g., `/api/ai/`), I infer that the code is for a specific feature.
> 2. **Analyze API Handler:** For a feature-gated API route, I parse its AST.
> 3. **Verify Check Exists:** Is there an `if` statement at the top of the handler checking `network.features.someFlag`? If this check is missing, it's a **`🔴 CRITICAL`** violation, as the feature lacks an entitlement check.
> 4. **Analyze UI Component:** A UI component in `/components/forecasting/` should be conditionally rendered based on a `useFeatureFlag('forecasting')` hook. Unconditional rendering is a `🟡 Medium` UX violation.

````
</details>
Acknowledged. Proceeding with the next section.

Here is the full, unabridged content for the **Structural / Code Quality Standards**. This section establishes the foundational rules for how our code should look, feel, and be organized, ensuring consistency and readability across the entire repository.

---

## **Part B: The Canon of Standards - Section 2 of 5**

### **Category: Structural / Code Quality Standards (8 Standards)**

<details>
<summary><h4>11. 📄 FILE_HEADER_STANDARD.md</h4></summary>

```markdown
# File Header Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To provide consistent, machine-readable metadata at the top of every source file for discoverability, ownership, and automated processing.
---

## 1. Principles

1.  **Universality:** Every source file (`.ts`, `.tsx`, `.rules`, `.md`, etc.) MUST have a standard header.
2.  **Machine Readability:** The format must be a simple JSDoc or frontmatter block that is easily parsable.
3.  **Single Source of Context:** The header provides immediate context about the file's purpose, layer, and project relevance.

## 2. The Rules: The JSDoc Header

All TypeScript/JavaScript files MUST begin with a JSDoc block containing these fields.

```typescript
/**
 * @fileoverview [Brief, one-sentence description of the file's purpose.]
 * @layer [00-03] | [The architectural layer number and name.]
 * @package [The npm package name, e.g., @fresh-schedules/types or @fresh-schedules/web.]
 * @purpose [More detailed explanation of what this file does and why it exists.]
 * @owner [The team or individual primarily responsible for this code, e.g., @patrick_craven or "Team: API Core".]
 * @block_id [The project block this file primarily contributes to, e.g., "BLOCK-4".]
 * @project Fresh Schedules
 */
````

- Markdown and other files should use a similar frontmatter block.
- All fields are mandatory. Use "N/A" if a field is not applicable.
- This header MUST be followed by the File Tag metadata block. See `FILETAG_METADATA_STANDARD`.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Read and Assess:** My absolute first step for any file is to read its first 30 lines.
> 2. **Parse Header:** I use a regex to find the JSDoc block and extract the required fields.
> 3. **Formulate Fix:** If the block or any field is missing, it is a `🔴 Critical` violation. I will generate a complete, templated header, using `detectLayer()` to infer the `@layer` and other context. My autofix will surgically insert this block at the top of the file.

````
</details>

<details>
<summary><h4>12. 📄 IMPORTS_STANDARD.md</h4></summary>

```markdown
# Imports Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To create a deterministic, readable, and performant import graph, preventing cycles and code churn.
---

## 1. The Rules: The 5-Group Import Order

Imports MUST be organized into these five groups, in this exact order, separated by a blank line:
1.  **Node.js built-ins** (`fs`, `path`)
2.  **External packages** (`zod`, `react`)
3.  **Internal path aliases** (`@/components/...`, `@/packages/types`)
4.  **Relative paths** (`./`, `../`)
5.  **Side-effect imports** (`./globals.css`), which REQUIRE an explanatory comment.

Furthermore, type-only imports MUST use the `import type` syntax.

## 2. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> 1. **Secure the Code:** I parse the file into an AST. The Prime Directive is active.
> 2. **Identify and Classify Nodes:** I iterate through all `ImportDeclaration` nodes, classifying each into one of the 5 groups based on its source path.
> 3. **Analyze Usage for Type Promotion:** I scan the rest of the AST. If an imported symbol is only used in a type context, I mark its `ImportDeclaration` to have its `importKind` property set to `'type'`.
> 4. **Formulate and Verify Change:** I formulate an AST transaction to reorder the nodes and update their `importKind`. Before finalizing, I run a *simulated cycle check* (`madge`).
> 5. **Generate Report or Abort:** If the cycle check passes, I generate the diff for the refactoring plan. If it fails, I abort the change and create a `🔴 Critical` violation report detailing the cycle path.
````

</details>

<details>
<summary><h4>13. 📄 NAMING_STANDARD.md</h4></summary>

```markdown
# Naming Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To create a ubiquitous language that maps from the domain to the UI, ensuring consistency and predictability.

---

## 1. The Rules: Authoritative Naming Conventions

| Entity Type              | Convention            | Example                                   |
| :----------------------- | :-------------------- | :---------------------------------------- |
| Directories              | `kebab-case`          | `user-accounts/`                          |
| Files (non-Component)    | `kebab-case.ts`       | `get-user-by-id.ts`                       |
| React Components (.tsx)  | `PascalCase.tsx`      | `UserProfile.tsx`                         |
| Types / Zod Schemas      | `PascalCaseSchema`    | `const UserProfileSchema = ...`           |
| Variables / Functions    | `camelCase`           | `const userProfile = ...`                 |
| Booleans                 | `is*`, `has*`, `can*` | `const isActive = true`                   |
| Enums (JS Objects)       | `UPPER_SNAKE_CASE`    | `export const USER_ROLES = ...`           |
| **ID Parameters & Vars** | **Exact Match**       | `networkId`, `orgId`, `venueId`, `corpId` |

**Crucial Rule:** The identifier `networkId` MUST be used consistently everywhere. `tenantId`, `network_id`, `networkID` are all critical violations.

## 2. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Exclude Generated Code:** I first check for `@generated` comments. If found, I skip all naming checks.
> 2. **Secure and Parse:** I parse the file into an AST. The Prime Directive is active.
> 3. **Traverse and Compare:** I traverse the AST, visiting every node that declares an identifier. For each, I extract its name and compare it to the rules table.
> 4. **Formulate Rename Action:** If I find `const my_var`, this violates `camelCase`. I will formulate an AST-based 'rename' action on that node, which updates all in-scope references automatically. This is a safe autofix.
> 5. **File Name Check:** After analyzing the content, I check the file name itself. `UserProfile.ts` (not a component) should be `user-profile.ts`. I will generate a `git mv` command in my report.
```

</details>

<details>
<summary><h4>14. 📄 BARREL_STANDARD.md</h4></summary>

```markdown
# Barrel File Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To strictly control the use of barrel files (`index.ts`) to prevent circular dependencies, slow IDE performance, and bloated bundles.

---

## 1. The Rules: The Barrel Decision Tree

1.  **Type-Only Barrels** (`export type`): **ALLOWED.** The `index.ts` in `@fresh-schedules/types` is the canonical example.
2.  **Runtime Barrels** (`export`): **PROHIBITED BY DEFAULT.**
3.  **Exception**: A runtime barrel is permitted **only if**:
    - It contains a `// BARREL_RUNTIME_JUSTIFICATION: ...` comment.
    - OR it is the declared `main`/`exports` entry point in a `package.json`.

## 2. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Identify and Secure:** This triggers when I encounter a file named `index.ts`. I parse it into an AST.
> 2. **Analyze Exports:** I iterate through all `ExportDeclaration` nodes.
> 3. **Apply Logic:**
>    a. If all exports are `export type`, the file is **compliant**.
>    b. If I find one runtime `export`, I check for a `BARREL_RUNTIME_JUSTIFICATION` comment or `package.json` entry point. If justified, it is **compliant**.
> 4. **Formulate Action for Violation:** If a runtime barrel is unjustified, this is a `🔴 Critical` violation. **I will not autofix this.** My report will list all files that import from this illegal barrel and provide the manual action: "Refactor imports in the listed files to point directly to the source modules, then delete this barrel."
```

</details>

<details>
<summary><h4>15. 📄 DIRECTORY_LAYOUT_STANDARD.md</h4></summary>

```markdown
# Directory Layout Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To enforce the project's layered architecture by ensuring files are located in the correct directory, making the codebase predictable and preventing boundary violations.

---

## 1. The Rules: Authoritative Directory Mapping

| Layer          | Path Pattern                                               | Description                                |
| :------------- | :--------------------------------------------------------- | :----------------------------------------- |
| **00: Domain** | `packages/types/src/**`                                    | Zod schemas, plain types, constants.       |
| **01: Rules**  | `firestore.rules`, `storage.rules`                         | Security rules.                            |
| **02: API**    | `app/api/**`, `functions/**`, `**/*.server.{ts,tsx}`       | Server-side logic, API handlers.           |
| **03: UI**     | `app/(routes)/**`, `components/**`, `**/*.client.{ts,tsx}` | React components, pages, client-side code. |

**Critical Violation:** Any violation of the `SDK_BOUNDARY_STANDARD`.

## 2. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Establish Two Truths:** For every file, I determine:
>    a. **The _Actual_ Layer:** The layer implied by its physical path.
>    b. **The _Required_ Layer:** The layer demanded by its `import` statements and content (e.g., use of `react` or `firebase-admin`).
> 2. **Determine Required Layer:** I parse the file's AST.
>    - An import of `'react'` marks the **Required Layer** as `03 (UI)`.
>    - An import of `'firebase-admin'` marks the **Required Layer** as `02 (API)`.
>    - If it only exports Zod schemas or constants, its **Required Layer** is `00 (Domain)`.
> 3. **Compare and Act:** If `Actual Layer` and `Required Layer` mismatch, it is a `🔴 Critical` violation. I will formulate a "File Move" action for my report with the exact `git mv` command. I will not move files automatically.
```

</details>

<details>
<summary><h4>16. 📄 ID_PARAM_STANDARD.md (Hardened)</h4></summary>

```markdown
# ID & Parameter Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To enforce strict consistency in how entity identifiers are named in database schemas, variable names, and API route parameters.

---

## 1. The Canonical Identifiers

These are defined as constants and are the only valid forms. See `CONSTANTS_ENUMS_STANDARD`.

- `networkId`
- `orgId`
- `corpId`
- `venueId`
- `userId` (or `uid` for Firebase Auth UID)
- `shiftId`

**The Anti-Pattern:** `organizationId`, `tenantId`, `organisationID`, `user_id`.

## 2. The Rules

- **Database and Zod Fields:** Fields for these identifiers MUST use the exact `camelCase` form.
- **API Route Parameters:** Dynamic route segments MUST be named identically (e.g., `app/api/orgs/[orgId]/route.ts`).
- **Variable Names:** Variables holding these identifiers SHOULD be named identically.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Secure and Parse:** I parse the target file into an AST. Prime Directive active.
> 2. **Scan for Deviations:** I traverse the AST, using a regex (`/(organisation|organization|tenant|corporate)Id/i`) to find common but incorrect variations of the canonical IDs.
> 3. **Formulate Rename Action:** If `tenantId` is found, this is a `🔴 Critical` violation. I will formulate an AST-based 'rename' action to `networkId`, ensuring all in-scope references are also updated. This is a safe and high-value autofix.
> 4. **Route Parameter Check:** When analyzing a file path like `app/api/orgs/[organizationId]/route.ts`, I will flag this as a `NAMING` violation and recommend renaming the folder to `[orgId]`.
```

</details>

<details>
<summary><h4>17. 📄 ERROR_RESPONSE_STANDARD.md</h4></summary>

````markdown
# API Error Response Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 02 (API)
- **Purpose:** To ensure all API errors are returned in a consistent, predictable, and client-friendly JSON format, without leaking sensitive information.

---

## 1. Principles

1.  **Consistency:** Every failed API request returns the same error shape.
2.  **Security:** Stack traces and internal error details MUST NOT be sent to the client in production.
3.  **Clarity:** The error `code` should be a machine-readable enum, and the `message` should be human-readable.

## 2. The Standard Error Shape

All `4xx` and `5xx` API responses MUST return a JSON body with this structure:

```json
{
  "error": {
    "message": "A human-readable explanation of the error.",
    "code": "INVALID_INPUT", // A machine-readable code from constants.ts
    "requestId": "A unique ID for this request for log correlation",
    "details": {
      "fieldErrors": {
        "email": ["Invalid email format."]
      }
    }
  }
}
```
````

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Assess API Routes:** I identify API routes for analysis.
> 2. **Secure and Parse:** I parse the route handler file into an AST.
> 3. **Inspect `catch` Blocks:** I traverse the AST to find all `TryStatement` nodes and inspect their `CatchClause`.
>    a. The `catch` block MUST call a standardized helper function, e.g., `createStandardErrorResponse(error, requestId)`.
>    b. It MUST NOT manually construct a response like `Response.json({ error: error.message })`, as this can leak stack traces.
> 4. **Formulate Fix:** If I find a manual error response, I will formulate an AST transaction to replace the manual `Response.json` call with the standard helper function call. This is a safe and high-value autofix.

````
<details>
<summary><h4>18. 📄 TYPE_EXPORT_STANDARD.md</h4></summary>

```markdown
# Type Export Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To ensure that TypeScript types are handled and exported in a way that maximizes tree-shaking and prevents runtime code from being unnecessarily included in client bundles.
---

## 1. Principles

1.  **Types are Free:** TypeScript types should have zero runtime cost.
2.  **Clarity of Intent:** It must be obvious whether an export is a `type` or a runtime `value`.
3.  **Bundle Size Matters:** We must be vigilant against accidentally pulling server-side or large libraries into client bundles via incorrect re-exports.

## 2. The Rules

-   **Type-Only Imports:** When importing a symbol that will only be used as a type annotation, ALWAYS use `import type`. See `IMPORTS_STANDARD`.
-   **Type-Only Exports:** When re-exporting a `type` or `interface` from another module (e.g., in a barrel file), ALWAYS use `export type`.
    ```typescript
    // Good: Zero runtime cost
    export type { Network } from './network-schema';

    // Bad: Pulls the entire network-schema.ts module into the runtime graph
    export { Network } from './network-schema';
    ```
-   **Inferred Types:** Favor inferring types from Zod schemas (`type MyType = z.infer<typeof MySchema>`) over manually defining a matching `interface`. Export the inferred type.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> 1. **Assess Files:** I'll focus on barrel files (`index.ts`) and files with `export from` syntax.
> 2. **Secure and Parse:** I parse the file into an AST.
> 3. **Analyze Exports:** I find all `ExportNamedDeclaration` nodes with a source (e.g., `export { Name } from './source'`). I will then load `./source.ts` to determine if `Name` is a type.
> 4. **Formulate Fix:** If `Name` is a type but the re-export does not use `export type`, this is a `🟠 High` performance violation. I will formulate an AST transaction to change the `export` statement's `exportKind` to `'type'`. This is a safe autofix.
````

</details>
Acknowledged. Proceeding with the next section.

Here is the full, unabridged content for the **Firebase Standards**. This section translates the project's core architectural principles directly into enforceable rules for how we configure and interact with Firebase services, with a relentless focus on security and tenancy.

---

## **Part B: The Canon of Standards - Section 3 of 5**

### **Category: Firebase Standards (5 Standards)**

<details>
<summary><h4>19. 📄 FIREBASE_ENV_STANDARD.md</h4></summary>

````markdown
# Firebase Environment Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Infrastructure / Process
- **Purpose:** To define a strict separation of environments, ensuring that production, staging, and development workloads are completely isolated and managed predictably.

---

## 1. Principles

1.  **Total Isolation:** Each environment MUST correspond to a separate Firebase project. There is no sharing of databases, authentication, or storage.
2.  **Production is Sacred:** The production Firebase project (`fresh-schedules-prod`) is managed exclusively through automated CI/CD deployments from the `main` branch.
3.  **Naming Convention:** Firebase project IDs MUST follow the pattern `fresh-schedules-[environment]`.
4.  **Configuration as Code:** Environment-specific configuration MUST be managed through `.env` files and Google Secret Manager, not hardcoded. The `.firebaserc` file is the source of truth for project aliases.

## 2. Environment Definitions

| Environment     | Firebase Project ID       | Purpose                               | Deployed From    | Data Policy             |
| :-------------- | :------------------------ | :------------------------------------ | :--------------- | :---------------------- |
| **Production**  | `fresh-schedules-prod`    | Live customer data. Maximum security. | `main` branch    | Strictly PII, protected |
| **Staging**     | `fresh-schedules-staging` | Pre-production validation.            | `develop` branch | Anonymized or seeded    |
| **Development** | `firebase-emulator`       | Local developer machines.             | Local            | Fake, ephemeral data    |

The Firebase Emulator Suite is the mandatory standard for all local development.

## 3. The `.firebaserc` Standard

The `.firebaserc` file in the repository root MUST contain the project aliases.

```json
{
  "projects": {
    "production": "fresh-schedules-prod",
    "staging": "fresh-schedules-staging"
  }
}
```
````

Deployment scripts MUST use these aliases (e.g., `firebase deploy --project staging`).

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Audit `.firebaserc`:** I parse `.firebaserc`. Does it contain `production` and `staging` aliases? Do the project IDs follow the naming convention? Any deviation is a `🟠 High` configuration drift violation.
> 2. **Audit `package.json` Scripts:** I scan the `scripts`. Do deployment scripts use an alias (`--project staging`) instead of a hardcoded project ID? A hardcoded ID is a `🟠 High` violation.
> 3. **Scan for Hardcoded Secrets:** During my code scan, I use regex to look for Firebase API keys or service account credentials. Any hardcoded secret is a `🔴 CRITICAL` security vulnerability.

````
</details>

<details>
<summary><h4>20. 📄 FIREBASE_RULES_STANDARD.md</h4></summary>

```markdown
# Firebase Rules Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** 01 (Rules)
- **Purpose:** To define the structure, helpers, and security principles for our `firestore.rules` and `storage.rules` files, making them readable, maintainable, and secure.
---

## 1. The Prime Directives of Firestore Rules

1.  **Default Deny:** The root of the rules file MUST be `allow read, write: if false;`.
2.  **Tenancy is Paramount:** Every rule for tenant-scoped data MUST validate the request against the `networkId` in the user's auth token.
3.  **DRY (Don't Repeat Yourself):** Complex conditions MUST be encapsulated in helper functions.

## 2. Standard Structure & Helper Functions

The `firestore.rules` file MUST be structured with helper functions at the top.

### Required Helper Functions:

-   `isAuthenticated()`: Checks `request.auth != null`.
-   `isNetworkMember(networkId)`: Checks `request.auth.token.networkId == networkId`. **This is the core tenancy check.**
-   `getMembership(networkId)`: Gets the user's membership doc from `/networks/{networkId}/memberships/{request.auth.uid}`.
-   `hasRole(networkId, allowedRoles)`: Uses `getMembership` to check if the user's role is in the `allowedRoles` list.
-   `isIncomingDataValid(schema)`: Validates `request.resource.data` against a simplified schema map. See `FIRESTORE_SCHEMA_PARITY_STANDARD`.

### Standard Rule Block:
```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions --- //
    // ... all required helpers ...

    // --- Rules --- //
    match /networks/{networkId} {
      allow read: if isNetworkMember(networkId);
      allow create, update, delete: if false; // Backend only

      match /orgs/{orgId} {
        allow write: if isNetworkMember(networkId) && hasRole(networkId, ['network_owner', 'org_admin']);
      }
    }
  }
}
````

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Validate Syntax:** I first use Firebase emulator tools to validate `firestore.rules` syntax. A syntax error is a `🔴 Critical` failure.
> 2. **Verify Default Deny:** I check that the file enforces a global default deny.
> 3. **Enforce Tenancy on All Paths:** I walk the `match` tree. For EVERY `match` block under `/networks/{networkId}`, every `allow` statement MUST call `isNetworkMember(networkId)`. A missing check is a **`🔴 CRITICAL` Data Leakage Vulnerability**.
> 4. **Enforce RBAC on Writes:** For every `allow write/create/update/delete` rule, I verify it also includes an RBAC check (`hasRole(...)`). A write rule that only checks tenancy is a `🔴 Critical` privilege escalation vulnerability.

````
</details>

<details>
<summary><h4>21. 📄 FIREBASE_FUNCTIONS_STANDARD.md</h4></summary>

```markdown
# Firebase Functions Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** 02 (API) / Serverless
- **Purpose:** To define standards for writing secure, efficient, and maintainable Cloud Functions for background jobs and event-driven logic.
---

## 1. Principles

1.  **API Routes First:** Use Next.js API Routes for all client-callable synchronous endpoints. Use Cloud Functions primarily for background jobs, Firestore triggers, and scheduled tasks.
2.  **Idempotency:** Functions triggered by events (e.g., Firestore `onWrite`) MUST be idempotent to handle "at-least-once" delivery.
3.  **Regionality and Memory:** Functions must specify a region (`us-central1`) and an explicit memory allocation.

## 2. The Rules

-   **Location:** Source code MUST reside in a `/functions` directory at the project root.
-   **Handler Signature:** Use `onCall` for callable functions, `onDocumentWritten` for Firestore triggers, and `onSchedule` for cron jobs.
-   **Tenancy Enforcement:**
    -   Event-driven functions operating with admin privileges MUST extract `networkId` from the event data's document path (`params.networkId`) and use it in all subsequent operations.
    -   A function operating on `/networks/A/...` must NEVER touch data in `/networks/B/...`.
-   **Secrets Management:** Use `defineSecret` to access secrets from Google Secret Manager. Do not use environment variables for secrets.
-   **Logging:** Use structured JSON logging. See `TELEMETRY_LOGGING_STANDARD`.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> 1. **Assess Files in `/functions/src`:** I identify function files for analysis.
> 2. **Secure and Parse:** I parse the TypeScript file into an AST.
> 3. **Trace Tenancy Flow:** For an `onDocumentWritten('.../{networkId}/...')` function, I verify that the `networkId` from `params` is captured and used in all subsequent database queries. If the function performs a cross-tenant write, I flag it as a **`🔴 CRITICAL` Data Leakage Vulnerability**.
> 4. **Check for Idempotency Guards:** For `onWrite` functions, I look for patterns that guard against re-runs (e.g., checking for a "processed" flag on the document before executing). A missing guard is a `🟠 High` reliability risk.
> 5. **Check for Secrets:** I scan for hardcoded secrets or legacy `functions.config()` usage. These are violations and must be replaced with `defineSecret`.
````

</details>

<details>
<summary><h4>22. 📄 FIREBASE_SECURITY_STANDARD.md</h4></summary>

```markdown
# Firebase Security Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** To provide a consolidated checklist of security best practices across all Firebase services.

---

## 1. Principles

1.  **Defense in Depth:** We rely on multiple security layers (App Check, Auth, Rules, API validation).
2.  **Principle of Least Privilege:** Firebase IAM roles, API keys, and Firestore rules must grant only minimum necessary permissions.
3.  **Audit and Monitor:** Security is a continuous process.

## 2. The Security Checklist

- **`[Authentication]` Custom Claims:** User roles (`org_admin`) and active tenant (`networkId`) MUST be set as custom claims on the user's Firebase Auth token during sign-in. This is the source of truth for all security decisions.
- **`[Authentication]` MFA for Admins:** The sign-in logic must enforce MFA for all `network_owner` and `platform_super_admin` roles.
- **`[Firestore]` Rules are Mandatory:** No database should ever be deployed with permissive rules.
- **`[Firestore]` Lock Down Compliance Docs:** The `networks/{networkId}/compliance` subcollection MUST have the most restrictive rules, allowing read only by `network_owner` and `platform_super_admin`, and being immutable from the client.
- **`[App Check]` App Check is Enabled:** App Check MUST be enabled and enforced for all services.
- **`[API Keys]` API Key Restriction:** All Firebase API keys MUST be restricted to specific domains or apps.
- **`[IAM]` Least Privilege:** Developers should not have "Owner" or "Editor" IAM roles on the production project. Access is granted via specific roles. Deployments are handled by a dedicated CI/CD service account.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Analyze Custom Claims Logic:** I search for the backend code that mints custom tokens. I verify it sets `networkId` and `role` claims. If not, it's a `🔴 Critical` flaw, as our entire tenancy model relies on these claims.
> 2. **Scan for MFA Enforcement:** In the sign-in logic, I check if the code verifies `mfaInfo` for admin roles. A missing check is a `🔴 Critical` account takeover risk.
> 3. **Audit IAM/API Keys (via API):** When authorized, I can query Google Cloud APIs to audit our infrastructure. I programmatically check if App Check is enforced, if API keys are unrestricted, or if excessive "Owner" roles exist. Any drift is reported as a `🔴 CRITICAL` infrastructure vulnerability.
```

</details>

<details>
<summary><h4>23. 📄 FIRESTORE_SCHEMA_PARITY_STANDARD.md</h4></summary>

````markdown
# Firestore Schema Parity Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 01 (Rules)
- **Purpose:** To provide a lightweight, maintainable way to enforce schema validation _within_ `firestore.rules`, acting as a safety net and ensuring parity with the official Zod schemas.

---

## 1. Principles

1.  **Redundancy is a Safeguard:** The Zod schema is primary, but a final check in rules prevents rogue clients from writing malformed data.
2.  **Simplicity over Completeness:** Firestore rules should check for the most critical aspects: presence of required fields, correct types, and string/collection size limits.
3.  **Maintainability:** Schema rules should be easy to update when Zod schemas change.

## 2. The Standard `isIncomingDataValid()` Approach

A helper function in `firestore.rules` MUST be created for each major entity.

```firestore
// firestore.rules

function isIncomingOrgValid() {
  let data = request.resource.data;
  return
    // Required fields are present
    'networkId' in data && 'displayName' in data && 'isIndependent' in data &&
    // Type checks
    data.networkId is string && data.displayName is string && data.isIndependent is bool &&
    // Content checks
    data.displayName.size() > 2 && data.displayName.size() < 100 &&
    // Prevent extra fields
    data.keys().hasOnly(['id', 'networkId', 'displayName', 'legalName', 'isIndependent', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'primaryContactUid', 'notes']);
}

match /networks/{networkId}/orgs/{orgId} {
  allow create: if isNetworkMember(networkId)
                  && hasRole(networkId, ['network_owner'])
                  && isIncomingOrgValid(); // <-- SCHEMA PARITY CHECK
}
```
````

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Select Entity:** My analysis is scoped to one entity, e.g., "Organization."
> 2. **Load Artifacts:** I parse the `OrgSchema` from `packages/types` and the `isIncomingOrgValid()` function from `firestore.rules`.
> 3. **Compare Properties:**
>    a. I get all keys from the Zod schema and all keys from the `hasOnly([...])` array in the rule.
>    b. **Do these two lists match exactly?** A mismatch is a `🟠 High` parity violation. My report will state: "Schema Parity Violation: The `isIncomingOrgValid` rule is missing the 'notes' field, which will cause legitimate client updates to be rejected."
>    c. **Do required fields match?** If `displayName` is non-optional in Zod, I check for `'displayName' in data` in the rule. A mismatch is a `🔴 Critical` violation.
> 4. **Formulate Report:** I will not write Firestore rules. My value is in the exhaustive comparison. My report will detail every single field that is out of sync.

````
</details>
<details>
<summary><h4>24. 📄 TESTING_STANDARD.md</h4></summary>

```markdown
# Testing Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** Process / ALL
- **Purpose:** To define the types of tests required for the project, where they live, and the quality gates they enforce, ensuring code is reliable and regressions are caught early.
---

## 1. Principles

1.  **The Testing Pyramid:** We write many fast unit tests, a moderate number of integration tests, and a few comprehensive end-to-end tests.
2.  **Tests Live with Code:** Test files must be co-located with the source code they are testing.
3.  **CI is the Gatekeeper:** All tests MUST be executed in the CI pipeline on every pull request. A failing test is a hard block.

## 2. Test Types and Requirements

### A. Unit Tests (`*.spec.ts` or `*.test.ts`)
-   **Scope:** Tests a single function, module, or component in complete isolation.
-   **Tools:** `vitest` or `jest` with `React Testing Library`.
-   **Location:** Co-located with the source file (e.g., `utils/format-date.ts` and `utils/format-date.spec.ts`).
-   **Requirement:** All new business logic (utility functions, complex component logic, API helpers) MUST be accompanied by unit tests.
-   **Code Coverage:** The overall unit test suite MUST maintain a minimum of **80% line coverage**. A PR that lowers coverage below this threshold will fail the CI check.

### B. Integration Tests (`*-integration.spec.ts`)
-   **Scope:** Tests the interaction between several modules. The most critical integration test is a headless test of Firestore rules.
-   **Tools:** Firebase Emulator Suite (`@firebase/rules-unit-testing`).
-   **Location:** In a dedicated `__tests__/` directory at the package or app level.
-   **Requirement:** Any change to `firestore.rules` MUST be accompanied by integration tests that verify the change. This includes testing both `allow` and `deny` cases for tenancy and RBAC. For example: "A user with `staff` role MUST NOT be able to write to the `orgs` collection."

### C. End-to-End (E2E) Tests (`*.e2e.spec.ts`)
-   **Scope:** Tests a full user journey in a browser-like environment.
-   **Tools:** `Playwright`.
-   **Location:** In the `apps/web/tests/e2e/` directory.
-   **Requirement:** The critical user journeys MUST be covered by E2E tests. At minimum, this includes:
    1.  The full "Org-Centric Network Creation" onboarding wizard.
    2.  User Sign-in (with MFA for admins) and Sign-out.
    3.  Creating, updating, and deleting a shift on the schedule.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process for Testing Compliance:**
> 1. **File Creation Check (PR Guardrail):** When a new file with business logic is added in a PR, I will check if a corresponding `*.spec.ts` file is also included. If not, I will post a non-blocking comment: "Reminder: New business logic was added. Please consider adding unit tests."
> 2. **Rules Change Check (PR Guardrail):** If I detect a change to `firestore.rules` in a PR, I will set a `REQUIRED` status check named "Firestore Rules Test Confirmation". A developer must manually approve this, confirming that they have added or updated the `rules-unit-testing` tests for the change.
> 3. **Coverage Report Analysis:** I parse the code coverage report from the CI pipeline. If the PR lowers overall coverage below 80%, I will fail the `ci-pipeline/unit-tests` status check with the message: "Test coverage decreased below the 80% threshold. Please add more tests."
````

</details>

<details>
<summary><h4>25. 📄 SECURITY_HARDENING_STANDARD.md</h4></summary>

```markdown
# Security Hardening Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process / ALL
- **Purpose:** To provide an actionable checklist of proactive security measures to harden the application against common web vulnerabilities.

---

## 1. Principles

1.  **Trust Nothing:** Treat all external input as untrusted until validated.
2.  **Reduce Attack Surface:** Expose the minimum necessary surface area in APIs and database rules.
3.  **Secure Dependencies:** Vulnerabilities in dependencies are vulnerabilities in our application.

## 2. The Hardening Checklist

- **`[Dependencies]` Dependency Scanning:** The CI pipeline MUST include a job that runs `pnpm audit --prod`. High or Critical severity vulnerabilities MUST fail the build.
- **`[Input]` Cross-Site Scripting (XSS) Prevention:** The use of `dangerouslySetInnerHTML` is forbidden. All user-generated content must be rendered as text within JSX or properly sanitized if HTML is required.
- **`[Input]` Universal Input Validation:** Every piece of external data entering the system MUST be validated by a Zod schema upon arrival. See `INPUT_VALIDATION_STANDARD`.
- **`[Session]` Secure Cookie Attributes:** All session cookies MUST be set with `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`.
- **`[API]` Rate Limiting:** All sensitive API endpoints (authentication, resource creation) MUST be rate-limited.
- **`[Headers]` Security Headers:** The application MUST serve responses with modern security headers, including a strict `Content-Security-Policy` (CSP), `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Dependency Scan Enforcement:** I will validate that the `ci.yml` file contains a job that runs `pnpm audit`.
> 2. **Static Code Analysis (SAST):**
>    a. I scan all `.tsx` files for `dangerouslySetInnerHTML`. If found, it's a `🔴 CRITICAL` XSS risk.
>    b. In API routes setting cookies, I parse the cookie-setting logic to ensure `HttpOnly`, `Secure`, and `SameSite` are present. A missing `HttpOnly` or `Secure` attribute is a `🔴 CRITICAL` violation.
>    c. I scan `next.config.js` or middleware to verify security headers are set.
> 3. **Input Validation Check:** My `INPUT_VALIDATION_STANDARD` enforcement is a core part of this. An API route not immediately validating input fails this check as well.
```

</details>
<details>
<summary><h4>26. 📄 TELEMETRY_LOGGING_STANDARD.md (Hardened)</h4></summary>

````markdown
# Telemetry & Logging Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** 02 (API) & Serverless
- **Purpose:** To establish a consistent, structured, and actionable logging standard, enabling effective debugging, monitoring, and observability.

---

## 1. Principles

1.  **Logs are Structured Data:** All logs MUST be emitted as JSON.
2.  **Logs Must Be Actionable:** Logs must contain correlation IDs, tenancy info, and actor context.
3.  **Never Log Raw PII:** Passwords, API keys, and Tax IDs MUST NEVER appear in logs. Use masking.

## 2. The Standard Log Format (JSON)

Every log entry MUST conform to this base structure.

```json
{
  "timestamp": "2025-11-20T10:00:00.123Z",
  "severity": "INFO", // "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"
  "message": "User successfully created organization.",
  "context": {
    "project": "FreshSchedules",
    "source": "ApiRoute:POST /api/orgs",
    "requestId": "uuid-for-this-request",
    "tenancy": {
      "networkId": "net_abc123"
    },
    "actor": {
      "uid": "user_xyz789",
      "role": "network_owner"
    },
    "metadata": {
      "newOrgId": "org_def456"
    }
  }
}
```
````

**PII Masking:** Use a utility function, `mask(value)`, for sensitive identifiers (e.g., `"taxId": "********1234"`).

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Check for API Wrappers:** I ensure all API routes are wrapped in `withTelemetry(...)` which establishes the logging context. A missing wrapper is a `🟠 High` violation.
> 2. **Scan for Raw `console.log`:** Direct use of `console.log` on the server is a `🟡 Medium` violation. It bypasses our structured logging.
> 3. **Check PII Handling:** I specifically search for code handling sensitive fields like `taxIdNumber`. If that variable is passed to _any_ logging function without being wrapped in `mask()`, it is a **`🔴 CRITICAL` PII Leakage Vulnerability**.

````
</details>

<details>
<summary><h4>27. 📄 AUDIT_TRAIL_STANDARD.md (Hardened)</h4></summary>

```markdown
# Audit Trail Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** 02 (API) & Serverless
- **Purpose:** To ensure that all critical, state-changing actions within the system are recorded in an immutable audit trail for security and compliance.
---

## 1. Principles

1.  **Immutability:** Audit trail entries can be created, but Firestore rules MUST prevent updates and deletes.
2.  **Clarity (The 5 Ws):** An audit entry must log: Who, What, When, Where, and From Where (IP).
3.  **Asynchronous:** Writing to the audit trail must not block the primary user request.

## 2. Critical Actions to Audit

-   **Authentication:** Login success/failure, password change, MFA enrollment.
-   **Lifecycle:** `Network created`, `Network status changed`, `Plan changed`.
-   **Membership:** `User invited`, `User removed`, `User role changed`.
-   **Security:** `API key created`, `Data export requested`.

## 3. The Audit Entry Schema & Rules

**Path:** `networks/{networkId}/audit_trail/{eventId}`
**Rules:** `allow read: if hasRole(networkId, ['network_owner']); allow create: if isBackendService(); allow update, delete: if false;`

```json
{
  "id": "...",
  "timestamp": "...",
  "actor": {
    "uid": "...", "role": "...", "ipAddress": "..."
  },
  "action": "USER_ROLE_CHANGED", // From constants.ts
  "target": { "type": "USER", "id": "..." },
  "details": {
    "before": { "role": "staff" },
    "after": { "role": "org_admin" }
  }
}
````

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Identify Critical Code Paths:** I have a map of API routes that correspond to the "Critical Actions" list (e.g., the route that changes a user role).
> 2. **Scan for Audit Log Calls:** Within the AST for that critical code path, after the main business logic succeeds, I will look for a call to `createAuditEntry(...)`.
> 3. **Flag Missing Calls:** If I analyze the "change user role" API endpoint and find no call to `createAuditEntry`, this is a **`🔴 CRITICAL`** compliance violation.
> 4. **Validate Audit Payload:** The `action` field MUST use a value from the `AUDIT_ACTIONS` constant. A hardcoded string is a `🟡 Medium` violation.

````
</details>

<details>
<summary><h4>28. 📄 INPUT_VALIDATION_STANDARD.md</h4></summary>

```markdown
# Input Validation Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** 02 (API), Serverless
- **Purpose:** To enforce a "zero trust" policy for all data entering the system, ensuring every piece of external input is rigorously validated before use.
---

## 1. Principles

1.  **Validate on Entry:** Data must be validated at the system's boundary (API route or Function handler). Once validated, it can be trusted internally for that request's lifecycle.
2.  **Deny by Default:** If validation fails, the request must be rejected immediately with a `400` or `422` status code.
3.  **Specificity is Key:** Use specific Zod validators (`.email()`, `.uuid()`) instead of generic `z.string()`.

## 2. Sources of Input That MUST Be Validated

-   API Request Body (`request.json()`)
-   API URL Search Parameters (`request.nextUrl.searchParams`)
-   API Dynamic Route Parameters (e.g., `[orgId]`)
-   API Request Headers
-   Cloud Function `onCall` data
-   Webhook payloads from third parties.

## 3. The Standard Validation Pattern (API Route)

```typescript
import { CreateOrgSchema } from '@/packages/types/src/org-schema';

export const POST = withApiAuth({
  requiredRole: 'network_owner',
  handler: async ({ req, session }) => {
    // 1. Validation is the VERY FIRST step.
    const validationResult = CreateOrgSchema.safeParse(await req.json());

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    // 2. Now, use the validated data.
    const validatedData = validationResult.data;

    // ... proceed with business logic using validatedData ...
  },
});
````

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Identify Entry Points:** I scan for all API routes and Cloud Function handlers.
> 2. **Parse and Trace Data:** I parse each handler's AST and find where input like `request.json()` is called.
> 3. **Enforce Immediate Validation:** The variable containing the raw request body **MUST** be passed _immediately_ into a Zod schema's `.parse()` or `.safeParse()` method.
> 4. **Flag Unvalidated Data Usage:** If I see the raw, unvalidated request body variable used anywhere else (passed to another function, used in a database query), this is a **`🔴 CRITICAL` Security and Data Integrity Vulnerability**.
> 5. **Formulate Fix:** My report will pinpoint the line where unvalidated data is used and provide a code block showing the correct `safeParse` pattern.

````
</details>
Acknowledged. Proceeding with the final sections.

Here is the full, unabridged content for the **Agents + Automation Standards** and the **Repository / Process Standards**. This concludes the complete generation of the v15.0 doctrine. The entire system of governance for the Fresh Schedules project is now fully specified.

---

## **Part B: The Canon of Standards - Section 5 of 5**

### **Category: Agents + Automation Standards (6 Standards)**

<details>
<summary><h4>29. 📄 AGENTS_STANDARD.md</h4></summary>

```markdown
# Agents Standard (v15.0) - The Master Compliance Doctrine

---
- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** Defines the hierarchical, sequential, and transparent thought process of the Master Compliance Agent (FRESH Engine), establishing the Prime Directive that governs all other standards.
---

## 1. The Prime Directive: Safeguards Against Data Loss (NON-NEGOTIABLE)

My highest directive is to **never lose user-generated code or content**. My operations are governed by these unbreakable safeguards, which are implicitly part of every other standard's enforcement doctrine:

1.  **AST-Based Operations**: All code modifications are performed on an Abstract Syntax Tree (AST). This ensures only specific, violating nodes are altered, while all other code, comments, and structure are perfectly preserved.
2.  **Diff/Patch Previews**: All proposed changes are first presented as a `git diff`-style preview. No change is applied without an explicit preview.
3.  **Atomic Writes**: Changes are written to a temporary file (`file.ts.tmp`) and then atomically renamed to replace the original file. This prevents file corruption from interrupted writes.
4.  **Change Threshold Sanity Check**: Any automated change affecting over 80% of a file is flagged as a high-risk operation requiring manual confirmation.

## 2. The Meta-Thought Process: Guiding All Analysis

> 🤔 **Agent's Meta-Thought Process:**
> 1.  **Assess (Phase 1):** Understand the file's identity (location, layer, metadata) without making changes.
> 2.  **Act (Phase 2):** Fix structural and syntactic violations using safe AST-based methods as defined by the code quality standards.
> 3.  **Analyze (Phase 3):** Validate deeper business logic against architectural standards (RBAC, Tenancy, Parity).
> 4.  **Finalize (Phase 4):** Report all findings with precise diffs and, if instructed, execute the changes using the atomic write protocol.
````

</details>

<details>
<summary><h4>30. 📄 MIGRATION_STANDARD.md</h4></summary>

```markdown
# Code Migration Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To provide a structured, tag-based system for tracking the compliance status of every file in the codebase as it is migrated to the v15.0 standards.

---

## 1. Principles

1.  **Everything is Tracked:** Every file must have a known state.
2.  **State is Explicit:** A file's compliance status is declared via a metadata tag.
3.  **Progression is Linear:** Files progress through a defined lifecycle.

## 2. The Migration Tags

These tags are stored in the file's header (see `FILETAG_METADATA_STANDARD`) and in `migration-manifest.csv`.

| Tag                           | Description                                                     | Next Action by Agent                                       |
| :---------------------------- | :-------------------------------------------------------------- | :--------------------------------------------------------- |
| `Status: Untagged`            | Initial state. File has not been assessed.                      | Assess, add header, set to `Pending`.                      |
| `Status: Pending`             | Header added, but not fully analyzed for violations.            | Run full analysis, set to `Needs-Refactor` or `Ready`.     |
| `Status: Needs-Refactor`      | The file has known violations that are safe to autofix.         | Run autofix script upon request (`--apply`).               |
| `Status: Needs-Manual-Review` | The file has complex violations (e.g., tenancy gap).            | Report detailed findings for a human developer to resolve. |
| `Status: Ready`               | The file is 100% compliant with all applicable v15.0 standards. | Monitor for regressions.                                   |
| `Status: Legacy`              | The file is part of a system scheduled for deprecation.         | Ignore during refactoring runs.                            |

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> My operation is driven by these tags.
>
> 1. **Initial Scan:** I find all `Untagged` files, add a header, and tag them `Pending`. This populates my work queue.
> 2. **Process Queue:** I run a full analysis on all `Pending` files.
>    a. If violations are all autofixable, I tag the file `Needs-Refactor`.
>    b. If any violation requires a human, I tag it `Needs-Manual-Review`.
>    c. If no violations are found, I promote it directly to `Ready`.
> 3. **Autofixing Run:** In `--apply` mode, I only target files tagged `Needs-Refactor`. After fixing, I re-analyze and promote them to `Ready` if clean.
> 4. **Manifest Sync:** Every tag change is synchronized with `migration-manifest.csv`.
```

</details>

<details>
<summary><h4>31. 📄 REFACTOR_AUTOFIX_STANDARD.md</h4></summary>

```markdown
# Refactor Autofix Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To explicitly define which compliance violations are "safe" for the Master Compliance Agent to fix automatically.

---

## 1. Principles

1.  **Safety First:** An automatic fix must have a near-zero probability of changing runtime behavior.
2.  **High Confidence Only:** Any ambiguity prevents an autofix.
3.  **AST-Based:** All autofixes MUST be AST transformations.

## 2. The "Safe to Autofix" List

- ✅ **Import Ordering & `import type` Promotion**
- ✅ **Adding a Missing File Header**
- ✅ **Variable Casing and Canonical ID Renaming** (`tenantId` -> `networkId`)
- ✅ **Zod Schema Suffix Addition**
- ✅ **Wrapping API Handlers** (e.g., adding `withTelemetry`)
- ✅ **Standardizing Error Responses** (replacing manual `Response.json` in `catch` blocks)
- ✅ **Removing Unused Imports**
- ✅ **Replacing Hardcoded Role Strings** with imported constants

## 3. The "Manual Review Required" List (Do NOT Autofix)

- ❌ **Tenancy Gaps** (e.g., missing `.where('networkId', ...)` clause)
- ❌ **RBAC Logic Flaws**
- ❌ **Cross-Layer Boundary Violations** (requires moving files)
- ❌ **Illegal Barrel File Removal** (requires refactoring all importers)
- ❌ **Missing Audit Trail Calls**

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Target Selection:** Autofix mode only targets files with `Status: Needs-Refactor`.
> 2. **Violation Analysis:** I generate a full list of a file's violations.
> 3. **Compare Against "Safe" List:** If _all_ violations are on the "Safe to Autofix" list, I proceed. If even one is not, I stop and re-tag the file as `Needs-Manual-Review`.
> 4. **Execute and Verify:** I apply the safe AST transformations, then re-analyze the modified code. If it is 100% compliant, I write the change to disk and update its tag to `Ready`.
```

</details>

<details>
<summary><h4>32. 📄 FILETAG_METADATA_STANDARD.md</h4></summary>

````markdown
# File Tag Metadata Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define the exact format for metadata tags within a file's header block, making them reliably parsable.

---

## 1. The Standard Tag Format

Tags are embedded within the main JSDoc file header under a `@meta` annotation.

```typescript
/**
 * @fileoverview ...
 * @layer ...
 *
 * @meta
 *   // -- Migration & Compliance Tags --
 *   Status: Ready
 *   Last-Checked: 2025-11-20T10:00:00Z
 *   Checked-By: FRESH-Engine-v15.0
 *
 *   // -- Contextual Tags --
 *   Owner: team-api-core
 *   Risk: Low
 */
```
````

- **Format:** `Key: Value`. The key is case-insensitive, followed by a colon.
- **Required Tags:**
  - `Status:` Must be from `MIGRATION_STANDARD`.
  - `Last-Checked:` An ISO 8601 timestamp.
  - `Checked-By:` The agent name and version.

## 2. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Parse Header:** I look for the `@meta` section within the JSDoc block.
> 2. **Extract Tags:** I extract all `Key: Value` pairs into a map. The `Status` tag drives my workflow.
> 3. **Update Tags:** After my analysis of a file is complete, my final action is to surgically update this block with the new `Status`, the current `Last-Checked` timestamp, and my `Checked-By` identity.

````
</details>

<details>
<summary><h4>33. 📄 MANIFEST_STANDARD.md</h4></summary>

```markdown
# Migration Manifest Standard (v15.0)

---
- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define the structure of `migration-manifest.csv`, the master dashboard for the codebase compliance effort.
---

## 1. Principles

1.  **Single Source of Truth:** The manifest provides an at-a-glance view of project-wide compliance.
2.  **Agent-Managed:** The manifest is owned by the agent. Humans should not edit it.
3.  **Machine-Readable:** Simple CSV format for easy parsing and import into spreadsheets.

## 2. The Standard CSV Format

The file `migration-manifest.csv` MUST contain these columns:
1.  `file_path`
2.  `file_hash` (SHA-256 of file content)
3.  `layer` (integer `0-3`, or `-1` for pending)
4.  `status` (e.g., `Ready`, `Needs-Refactor`)
5.  `violation_count_critical` (integer)
6.  `violation_count_high` (integer)
7.  `last_checked_by`
8.  `last_checked_at` (ISO 8601 timestamp)

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
> 1. **Initialize:** I read the entire `migration-manifest.csv` into an in-memory map before any run.
> 2. **Check for Staleness:** When analyzing a file, I hash its current content. If the hash doesn't match the one in my map, I know it has changed and must be fully re-analyzed, regardless of its last status.
> 3. **Update on Completion:** After analyzing a file, I update its row in my in-memory map with the new hash, status, and violation counts.
> 4. **Write Back:** At the very end of my entire run, I overwrite `migration-manifest.csv` with my complete, updated map. This is an atomic operation that keeps the manifest consistent.
````

</details>

<details>
<summary><h4>34. 📄 AGENT_HANDOFF_STANDARD.md</h4></summary>

```markdown
# Agent Handoff Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define the contract for how the Master Compliance Agent "hands off" its findings to other systems (humans or machines).

---

## 1. Principles

1.  **Actionability:** Handoff artifacts must be easy to understand and act upon.
2.  **Self-Contained:** A report should contain all necessary context to understand a problem.
3.  **Formats for Purpose:** Markdown for humans, JSON for machines.

## 2. The Standard Handoff Artifacts

### A. For Human Review: `refactor-plan.md`

- **Structure:**
  1.  **Executive Summary:** High-level statistics.
  2.  **Violations by Severity:** Files grouped by highest violation severity (Criticals first).
  3.  **Detailed File Reports:** For each violating file, a list of its violations, each with the standard it breaks, its severity, and a precise `diff` block showing the proposed fix.

### B. For Machine Consumption: `refactor-plan.json` (optional)

- A structured JSON output of all findings, intended for CI/CD integration or custom dashboards.

### C. For Tracking: `migration-manifest.csv`

- The updated manifest is the persistent record of the project's compliance state.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process:**
>
> 1. **Gather Results:** As I analyze files, I build an in-memory list of `FileReport` objects.
> 2. **Generate Reports:** At the end of my run, I iterate through my results to render `refactor-plan.md` (using a template) and, if requested, `refactor-plan.json` (by direct serialization).
> 3. **Update Manifest:** My final action is writing the updated manifest to disk. This concludes the handoff.
```

</details>

### **Category: Repository / Process Standards (5 Standards)**

<details>
<summary><h4>35. 📄 PR_GUARDRAILS_STANDARD.md</h4></summary>

```markdown
# Pull Request Guardrails Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define automated, non-negotiable checks that every Pull Request must pass before merging.

---

## 1. Principles

1.  **Automation is King:** Machines handle syntax, style, and regression testing.
2.  **No Red, No Merge:** A failing status check is a hard blocker.
3.  **Clarity of Failure:** The agent's PR comment must provide a clear reason and a link to the failing log.

## 2. The Rules: Required Status Checks

Every PR against `main` MUST have these GitHub status checks pass:

1.  ✅ `ci-pipeline / lint-and-build`
2.  ✅ `ci-pipeline / unit-tests-and-coverage`
3.  ✅ `ci-pipeline / firebase-rules-validation`
4.  ✅ `ci-pipeline / dependency-cycle-check`
5.  ✅ **`fresh-guard / tenancy-and-security-preview`**: A dedicated, lightweight agent run on the diff.

## 3. The PR Compliance Bot (`fresh-guard`)

- On every PR update, the agent posts a comment summarizing the compliance status of changed files.
- If it detects a tenancy gap or critical security issue in the diff, it fails the `fresh-guard` status check, blocking the merge.

## 4. Agent's Enforcement Doctrine

> 🤔 **My Thought Process (`guard` mode):**
>
> 1. **Trigger:** I am triggered by a GitHub Action on `pull_request`.
> 2. **Scope:** I get the list of changed files from the PR's diff.
> 3. **Execute Focused Checks:** I run a high-speed analysis focusing only on the diff. My most important job is to run the `TENANCY_STANDARD` and `SECURITY_HARDENING_STANDARD` doctrines on the changed code.
> 4. **Report Status:** I post my findings to the PR and set the `fresh-guard` status check to `success` or `failure`. Failure is a hard block.
```

</details>

<details>
<summary><h4>36. 📄 CI_PIPELINE_STANDARD.md</h4></summary>

```markdown
# CI Pipeline Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define the structure and jobs of the Continuous Integration (CI) pipeline, ensuring every commit is validated through a consistent, repeatable process.

---

## 1. Principles

1.  **Fail Fast:** Cheaper checks run first.
2.  **Parallelize:** Run independent jobs in parallel.
3.  **Deterministic:** The CI environment must be containerized.

## 2. The Standard Pipeline Structure (`.github/workflows/ci.yml`)

- **Trigger:** `on: [push, pull_request]`
- **Job Graph:**
  1.  `install-deps` (runs first)
  2.  `lint-and-build` (depends on `install`)
  3.  `unit-tests-and-coverage`, `firebase-rules-validation`, `dependency-cycle-check` (run in parallel, depend on `lint-and-build`)
  4.  `e2e-tests` (runs last, only on PRs against `main`)

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process (`auditor` mode):**
>
> 1. **Assess:** When asked, I parse `.github/workflows/ci.yml`.
> 2. **Validate Structure:** I check the `jobs` and `needs` sections to ensure they match the defined "Fail Fast" dependency graph.
> 3. **Report Discrepancies:** If the CI configuration deviates from this standard, I will report the required changes to bring `ci.yml` into compliance.
```

</details>

<details>
<summary><h4>37. 📄 BRANCH_PROTECTION_STANDARD.md</h4></summary>

```markdown
# Branch Protection Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To programmatically enforce quality and security on our most important branches (`main` and `develop`) via repository settings.

---

## 1. Principles

1.  **`main` is Production:** The `main` branch must always be deployable. Direct pushes are forbidden.
2.  **Review is Mandatory:** No code merges without at least one other human's review.
3.  **Machines Validate First:** Human review is only possible after all automated checks pass.

## 2. The Rules: Branch Protection Settings for `main`

- `Require a pull request before merging`: **ENABLED**
  - `Require approvals`: **1**
  - `Dismiss stale approvals when new commits are pushed`: **ENABLED**
- `Require status checks to pass before merging`: **ENABLED**
  - `Require branches to be up to date before merging`: **ENABLED**
  - `Status checks that are required`: MUST list all checks from `PR_GUARDRAILS_STANDARD`, especially `fresh-guard / tenancy-and-security-preview`.
- `Include administrators`: **ENABLED**. No one can bypass these rules.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process (`auditor` mode):**
>
> 1. **Assess:** I use the GitHub API to fetch branch protection rules for `main`.
> 2. **Compare to Standard:** I compare the API response to the rules in Section 2. The most common failure is a new CI status check not being added to the required list.
> 3. **Report or Remediate:** I report any discrepancies. If granted permissions, I can use the API to automatically apply the correct settings to enforce compliance.
```

</details>

<details>
<summary><h4>38. 📄 VERSIONING_STANDARD.md</h4></summary>

```markdown
# Versioning & Release Standard (v15.0)

---

- **Project:** Fresh Schedules
- **Layer:** Process
- **Purpose:** To define a strict, automated process for versioning, releasing, and generating changelogs.

---

## 1. Principles

1.  **Semantic Versioning (SemVer):** We follow `MAJOR.MINOR.PATCH`.
2.  **Conventional Commits:** All PR titles (squash-and-merge) MUST follow the Conventional Commits specification.
3.  **Automation, Not Opinion:** The decision to bump a version and the content of the changelog are determined automatically by commit history.

## 2. The Rules

- **Commit Message Format:** `type(scope): description`
  - `feat`: a new feature -> `MINOR` bump.
  - `fix`: a bug fix -> `PATCH` bump.
  - `BREAKING CHANGE:` in footer -> `MAJOR` bump.
  - Other types (`docs`, `style`, `refactor`, `test`, `chore`) do not trigger a release.
- **Release Process:** A CI job (`on push to main`) uses `semantic-release` to:
  1.  Analyze commits since the last release.
  2.  Determine the next version number.
  3.  Generate/update `CHANGELOG.md`.
  4.  Create a new Git tag (e.g., `v15.1.0`).
  5.  Create a GitHub Release for that tag.

## 3. Agent's Enforcement Doctrine

> 🤔 **My Thought Process (`guard` and `auditor` modes):**
>
> 1. **PR Title Validation (Guardrail):** I will add a status check that fails if a PR title does not follow the Conventional Commit format. This enforces correct squash-and-merge messages.
> 2. **Commit History Audit (Auditor):** When asked, I can scan the `git log` between tags. If I see a `feat` commit in what should be a patch release, I will flag it as a SemVer violation.
```

</details>

complete.

When you are ready, please say **"proceed"** or **"next"** and I will deliver the **Structural / Code Quality Standards**.
