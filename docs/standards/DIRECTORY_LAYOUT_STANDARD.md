# Directory Layout Standard (v15.0)

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** Enforce layered architecture via file placement; surface cross-layer violations.

## 1. Layer ↔ Path Mapping

| Layer | Purpose      | Required Paths / Patterns                                    |
| ----- | ------------ | ------------------------------------------------------------ |
| 00    | Domain       | `packages/types/src/**` (Zod schemas, constants, pure types) |
| 01    | Rules        | `firestore.rules`, `storage.rules`                           |
| 02    | API / Server | `apps/web/app/api/**`, `functions/**`, `**/*.server.ts[x]`   |
| 03    | UI / Client  | `apps/web/app/(routes)/**`, `apps/web/components/**`         |

## 2. Required Behavior

- Layer 00 (Domain) MUST not import `react`, `firebase`, or any runtime SDK.
- Layer 03 (UI) MUST NOT import `firebase-admin` (enforced also by `SDK_BOUNDARY_STANDARD`).
- "Server" files in app router MUST use `.server.ts[x]` or live in `app/api/**`.

## 3. Agent Enforcement

The agent:

- Infers **actual layer** from file path.
- Infers **required layer** from imports and usage (React, Admin SDK, etc.).
- If `actual != required`, it raises a **critical violation**:
  - Suggests a `git mv` path in the report.
  - Does **not** move the file automatically.
