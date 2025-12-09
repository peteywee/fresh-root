# Fresh Schedules Symmetry Framework v2.0
> This framework defines the **expected fingerprints** of files in the Fresh
> Schedules codebase. If a file doesn't match its fingerprint, treat it as a
> potential defect.

---

## 1. Universal File Header
All first-class files (schemas, APIs, rules, critical UI) SHOULD begin with:

```ts
// [P<priority>][<CATEGORY>][<KIND>] Brief description
// Tags: TAG_ONE, TAG_TWO
```

Examples:

- `// [P1][SCHEMA][DOMAIN] Schedule entity schema`
- `// [P0][API][CODE] Shift assignment API`
- `// [P0][RULES][SECURITY] Firestore rules for schedules`

This header is validated as a **Tier 3 (style)** check.

---

## 2. Layer Fingerprints
### 2.1 Layer 00 — Domain (Schemas & Types)
**Location:**

- `packages/types/src/**/*.ts`

**Fingerprint:**

1. Imports:
   - `import { z } from "zod"` (Tier 1 if missing).

1. Exports:
   - `export const <Name>Schema = z.object({ ... })`
   - `export type <Name> = z.infer<typeof <Name>Schema>`

1. Naming:
   - Schema name ends with `Schema`.
   - Type matches entity name without `Schema`.

---

### 2.2 Layer 02 — API (Routes)
**Location:**

- `apps/web/app/api/**/route.ts`

**Fingerprint:**

1. Header: `[API][CODE]` header present.

1. Guards:
   - Top-level wrapper such as `withSecurity`, `requireOrgMembership`, or equivalent.

1. Validation:
   - Each write operation (POST/PATCH/PUT) validates with Zod before use.

1. Response:
   - Returns typed JSON or NextResponse with clear shape.

---

### 2.3 Layer 01 — Rules (Firestore)
**Location:**

- `firestore.rules`

**Fingerprint:**

1. Root:
   - Paranoid top-level match that denies by default.

1. Helpers:
   - Functions that:
     - Enforce tenant isolation.
     - Limit query scope.

1. Entity blocks:
   - `match /<entity>/...` blocks:
     - Enforce org scoping.
     - Restrict write conditions.

---

### 2.4 Layer 03 — UI (Pages & Components)
**Location:**

- `apps/web/app/**/page.tsx`
- Shared components under `apps/web/app/(components|features)/**`

**Fingerprint:**

1. Imports:
   - Typed hooks and services (not raw fetch).

1. Respect:
   - Does not duplicate validation logic already in schemas.
   - Reads API types instead of inventing new shapes.

---

## 3. Symmetry as a Signal
Use these signals:

- **Strong symmetry:** All files for a feature share the same structural patterns.
- **Broken symmetry:** A file deviates from its layer fingerprint (missing header, bypassing guards, etc.).

Broken symmetry is not always a bug, but it is always a **cue to investigate**.

---

## 4. Quantitative Enforcement
`scripts/validate-patterns.mjs` enforces parts of this framework by:

1. Checking:
   - Headers
   - Imports
   - Naming patterns
   - Guards
   - Validation calls

1. Assigning tiered penalties and computing a score.

When extending or modifying the framework:

1. Update fingerprints in this document.
2. Add corresponding checks in the validator.
