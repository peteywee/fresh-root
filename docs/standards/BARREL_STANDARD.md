# Barrel File Standard (v15.0)

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** Strict control of `index.ts` / barrels to avoid circular-dependency hell and bundle bloat.

## 1. Barrel Types

- **Type-only barrels** (`export type { X } from "./x";`): ALLOWED.
- **Runtime barrels** (`export { X } from "./x";`): DISALLOWED BY DEFAULT.

Exceptions for runtime barrels:

1. The barrel is the **documented package entrypoint** in `package.json`.
2. The file contains a `// BARREL_RUNTIME_JUSTIFICATION:` comment explaining why.

## 2. Requirements for Runtime Barrels

If you keep a runtime barrel:

- It MUST only re-export deliberate, stable surface area.
- It MUST NOT re-export "everything" (`export *`) by default.
- It MUST have:

```ts
// BARREL_RUNTIME_JUSTIFICATION: Public API surface for package "@fresh-schedules/types".
```

## 3. Agent Enforcement

Safe for agent to:

- Mark type-only barrels as compliant automatically.
- Flag runtime barrels without a justification comment.
- Suggest direct imports from source modules in violation report.

Not safe for autofix:

- Deleting runtime barrels.
- Mass-rewriting all importers. This must be a manual, planned change.
