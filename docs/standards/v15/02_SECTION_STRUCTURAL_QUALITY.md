# Section 2: Structural / Code Quality Standards (8 Standards)

## 11. 📄 FILE_HEADER_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To provide consistent, machine-readable metadata at the top of every source file for discoverability, ownership, and automated processing.

### Principles

1. **Universality:** Every source file (`.ts`, `.tsx`, `.rules`, `.md`, etc.) MUST have a standard header.
2. **Machine Readability:** The format must be a simple JSDoc or frontmatter block that is easily parsable.
3. **Single Source of Context:** The header provides immediate context about the file's purpose, layer, and project relevance.

### The Rules: The JSDoc Header

All TypeScript/JavaScript files MUST begin with a JSDoc block containing these fields:

```typescript
/**
 * @fileoverview [Brief, one-sentence description of the file's purpose.]
 * @layer [00-03] | [The architectural layer number and name.]
 * @package [The npm package name, e.g., @fresh-schedules/types.]
 * @purpose [More detailed explanation of what this file does and why it exists.]
 * @owner [The team or individual primarily responsible, e.g., @patrick_craven.]
 * @block_id [The project block this file primarily contributes to, e.g., "BLOCK-4".]
 * @project Fresh Schedules
 */
```

- Markdown and other files should use a similar frontmatter block.
- All fields are mandatory. Use "N/A" if a field is not applicable.
- This header MUST be followed by the File Tag metadata block.

---

## 12. 📄 IMPORTS_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To create a deterministic, readable, and performant import graph, preventing cycles and code churn.

### The Rules: The 5-Group Import Order

Imports MUST be organized into these five groups, in this exact order, separated by a blank line:

1. **Node.js built-ins** (`fs`, `path`)
2. **External packages** (`zod`, `react`)
3. **Internal path aliases** (`@/components/...`, `@/packages/types`)
4. **Relative paths** (`./`, `../`)
5. **Side-effect imports** (`./globals.css`), which REQUIRE an explanatory comment.

Furthermore, type-only imports MUST use the `import type` syntax.

---

## 13. 📄 NAMING_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To create a ubiquitous language that maps from the domain to the UI, ensuring consistency and predictability.

### The Rules: Authoritative Naming Conventions

| Entity Type              | Convention            | Example                                   |
| ------------------------ | --------------------- | ----------------------------------------- |
| Directories              | `kebab-case`          | `user-accounts/`                          |
| Files (non-Component)    | `kebab-case.ts`       | `get-user-by-id.ts`                       |
| React Components (.tsx)  | `PascalCase.tsx`      | `UserProfile.tsx`                         |
| Types / Zod Schemas      | `PascalCaseSchema`    | `const UserProfileSchema = ...`           |
| Variables / Functions    | `camelCase`           | `const userProfile = ...`                 |
| Booleans                 | `is*`, `has*`, `can*` | `const isActive = true`                   |
| Enums (JS Objects)       | `UPPER_SNAKE_CASE`    | `export const USER_ROLES = ...`           |
| **ID Parameters & Vars** | **Exact Match**       | `networkId`, `orgId`, `venueId`, `corpId` |

**Crucial Rule:** The identifier `networkId` MUST be used consistently everywhere. `tenantId`, `network_id`, `networkID` are all critical violations.

---

## 14. 📄 BARREL_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To strictly control the use of barrel files (`index.ts`) to prevent circular dependencies, slow IDE performance, and bloated bundles.

### The Rules: The Barrel Decision Tree

1. **Type-Only Barrels** (`export type`): **ALLOWED.** The `index.ts` in `@fresh-schedules/types` is the canonical example.
2. **Runtime Barrels** (`export`): **PROHIBITED BY DEFAULT.**
3. **Exception**: A runtime barrel is permitted **only if**:
   - It contains a `// BARREL_RUNTIME_JUSTIFICATION: ...` comment.
   - OR it is the declared `main`/`exports` entry point in a `package.json`.

---

## 15. 📄 DIRECTORY_LAYOUT_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To enforce the project's layered architecture by ensuring files are located in the correct directory, making the codebase predictable and preventing boundary violations.

### The Rules: Authoritative Directory Mapping

| Layer          | Path Pattern                                               | Description                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| **00: Domain** | `packages/types/src/**`                                    | Zod schemas, plain types, constants.       |
| **01: Rules**  | `firestore.rules`, `storage.rules`                         | Security rules.                            |
| **02: API**    | `app/api/**`, `functions/**`, `**/*.server.{ts,tsx}`       | Server-side logic, API handlers.           |
| **03: UI**     | `app/(routes)/**`, `components/**`, `**/*.client.{ts,tsx}` | React components, pages, client-side code. |

**Critical Violation:** Any violation of the `SDK_BOUNDARY_STANDARD`.

---

## 16. 📄 ID_PARAM_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To enforce strict consistency in how entity identifiers are named in database schemas, variable names, and API route parameters.

### The Canonical Identifiers

These are defined as constants and are the only valid forms:

- `networkId`
- `orgId`
- `corpId`
- `venueId`
- `userId` (or `uid` for Firebase Auth UID)
- `shiftId`

**The Anti-Pattern:** `organizationId`, `tenantId`, `organisationID`, `user_id`.

### The Rules

- **Database and Zod Fields:** Fields for these identifiers MUST use the exact `camelCase` form.
- **API Route Parameters:** Dynamic route segments MUST be named identically (e.g., `app/api/orgs/[orgId]/route.ts`).
- **Variable Names:** Variables holding these identifiers SHOULD be named identically.

---

## 17. 📄 ERROR_RESPONSE_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API)  
**Purpose:** To ensure all API errors are returned in a consistent, predictable, and client-friendly JSON format, without leaking sensitive information.

### Principles

1. **Consistency:** Every failed API request returns the same error shape.
2. **Security:** Stack traces and internal error details MUST NOT be sent to the client in production.
3. **Clarity:** The error `code` should be a machine-readable enum, and the `message` should be human-readable.

### The Standard Error Shape

All `4xx` and `5xx` API responses MUST return a JSON body with this structure:

```json
{
  "error": {
    "message": "A human-readable explanation of the error.",
    "code": "INVALID_INPUT",
    "requestId": "A unique ID for this request for log correlation",
    "details": {
      "fieldErrors": {
        "email": ["Invalid email format."]
      }
    }
  }
}
```

---

## 18. 📄 TYPE_EXPORT_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To ensure that TypeScript types are handled and exported in a way that maximizes tree-shaking and prevents runtime code from being unnecessarily included in client bundles.

### Principles

1. **Types are Free:** TypeScript types should have zero runtime cost.
2. **Clarity of Intent:** It must be obvious whether an export is a `type` or a runtime `value`.
3. **Bundle Size Matters:** We must be vigilant against accidentally pulling server-side or large libraries into client bundles via incorrect re-exports.

### The Rules

- **Type-Only Imports:** When importing a symbol that will only be used as a type annotation, ALWAYS use `import type`.
- **Type-Only Exports:** When re-exporting a `type` or `interface` from another module, ALWAYS use `export type`.

```typescript
// Good: Zero runtime cost
export type { Network } from "./network-schema";

// Bad: Pulls the entire network-schema.ts module into the runtime graph
export { Network } from "./network-schema";
```

- **Inferred Types:** Favor inferring types from Zod schemas (`type MyType = z.infer<typeof MySchema>`) over manually defining a matching `interface`. Export the inferred type.

---

**This completes Section 2: Structural / Code Quality Standards (8 standards). See the Index for navigation to other sections.**
