# Naming Standard (v15.0)

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** Enforce consistent naming across codebase; align IDs with tenancy; safe autofix for obvious variants.

## 1. Canonical Forms

| Thing                   | Canonical Name  |
| ----------------------- | --------------- |
| Network identifier      | networkId       |
| Organization identifier | orgId           |
| Corporate identifier    | corpId          |
| Venue identifier        | venueId         |
| User identifier         | userId (or uid) |

Other rules:

- Files (non-components): `kebab-case.ts`
- React components: `PascalCase.tsx`
- Types and Zod schemas: `PascalCaseSchema`
- Variables/functions: `camelCase`
- Booleans: `is*/has*/can*`
- Enums/constants: `UPPER_SNAKE_CASE`

## 2. Anti-Patterns (Critical Violations)

The following are NOT allowed for new work:

- `tenantId` when you mean `networkId`
- `organisationId`, `organizationID`, `network_id`, `networkID`
- Inconsistent naming between:
  - Route param: `[organisationId]`
  - Zod schema: `organizationId`
  - Firestore field: `orgId`

## 3. Agent Enforcement (Safe Autofix)

The refactor agent MAY autofix:

- Obvious, unambiguous mapping:
  - `tenantId` → `networkId`
  - `organisationId` → `orgId`
- Variable casing (`my_var` → `myVar`) when it is local and clearly safe.

The agent MUST instead **report and NOT autofix** when:

- Renaming would cross public APIs (e.g., exported function name).
- There is any ambiguity about meaning (e.g., `id` variable with unclear type).
