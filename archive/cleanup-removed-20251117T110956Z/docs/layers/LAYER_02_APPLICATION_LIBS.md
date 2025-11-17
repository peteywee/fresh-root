# Layer 02 – Application Libraries (Canonical)

**Purpose**  
Contain application logic: onboarding flows, scheduling operations, labor math, access guards. This layer converts domain rules into use-cases and is UI/HTTP agnostic.

---

## 1. Responsibilities

- Orchestrate **use-cases**: new-user onboarding, org/venue creation, schedule create/publish, attendance record.
- Expose **guards** reused by API/UI: `requireSession`, `requireOrgMembership`, `requireRole`.
- Provide **labor** helpers and **forecast** import.
- Wrap **infrastructure** access through provider adapters; no raw SDKs scattered here.

---

## 2. Code Locations

- `apps/web/src/lib/**`
  - `onboarding/**`
  - `api/**` (guards, rate-limit, parsing)
  - `labor/forecastImporter.ts`
  - `labor/laborBudget.ts`
  - `env*.ts`, `firebase.server.ts` (thin integration surfaces)

---

## 3. Inputs

- Domain types/schemas → `@fresh-schedules/types` (L00)
- Infra adapters/helpers → L01
- Validated payloads from API Edge (L03) or UI glue (L04)

---

## 4. Outputs

- Pure functions/services for business logic.
- Small React-facing hooks where necessary (kept thin).
- No HTTP types, no JSX.

---

## 5. Dependency Rules

- **Allowed:** L00, L01, stdlib.
- **Forbidden:** importing `apps/web/app/**` (UI), components, or direct Firebase Admin.
- **Pattern:** UI → (hooks) → App Libs → Infra → Domain.

---

## 6. Invariants

1. No raw HTTP types within this layer.
2. Domain schemas (Zod) are the source of truth for inputs/outputs.
3. Guards are centralized and reused.
4. Forecast import supports CSV/XLSX with minimal AI parsing (not conversational).

---

## 7. Forecast Import (minimal AI parser)

- Accept CSV/XLSX.
- Detect columns; validate to `ForecastRecord` schema.
- Reject unsupported formats early.

_Pseudocode interface:_

```ts
export type ForecastRecord = { date: string; sales: number };

export async function importForecast(file: File): Promise<ForecastRecord[]> {
  // Implement CSV/XLSX parsing here
}
```
