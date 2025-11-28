# Fresh Schedules Context Manifest v2.0

> This is the **2-minute briefing** for working in the Fresh Schedules codebase.

---

## 1. Core Invariants

1. **Triad of Trust**
   - Entities that cross the boundary must be covered by:
     - Schema (`packages/types/src/...`)
     - API (`apps/web/app/api/...`)
     - Rules (`firestore.rules`)
   - Triad coverage is tracked and scored by `scripts/validate-patterns.mjs`.

2. **Validation**
   - Every POST/PATCH/PUT handler must:
     - Parse input once (e.g., `parseJson` + Zod schema).
     - Use inferred types from Zod (no manual DTO duplication).

3. **Security**
   - API handlers must go through:
     - Authentication guard.
     - Authorization guard for the relevant org/tenant.
   - Firestore rules must:
     - Enforce tenant isolation.
     - Disallow unbounded lists where possible.

---

## 2. Patterns You Will See

1. **Types & Schemas**
   - `packages/types/src/*.ts`
   - Expect:
     - `import { z } from "zod"`
     - `export const <Name>Schema = z.object({ ... })`
     - `export type <Name> = z.infer<typeof <Name>Schema>`

2. **API Routes**
   - `apps/web/app/api/**/route.ts`
   - Expect:
     - Headers: `// [P#][API][CODE] ...`
     - Guards: `withSecurity`, `requireOrgMembership`, or equivalent.
     - Validation: Zod schema per input payload.

3. **Rules**
   - `firestore.rules`
   - Expect:
     - Tenant scoping helpers (`isOrgMember`, etc.).
     - List blocking or scoped queries.
     - Specific match blocks per entity.

---

## 3. How to Use This Manifest

When asked to change or add functionality:

1. Identify:
   - Which entity/entities are involved.
   - Which Triad components they touch.

2. For each component:
   - Confirm file location.
   - Confirm existing pattern usage.

3. Only then:
   - Modify or add the necessary code.
   - Keep the Symmetry and Tier standards in mind.

---

## 4. Quantitative Hooks

The following are enforced by `scripts/validate-patterns.mjs`:

1. Missing:
   - Zod import in schema files → Tier 1.
   - Type inference pattern → Tier 1.
   - Security wrappers on API → Tier 0.
   - Input validation for writes → Tier 0.

2. Incomplete Triad coverage:
   - Tracked and displayed; impacts score and future enforcement.
