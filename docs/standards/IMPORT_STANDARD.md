# Import Standard (CSV/XLSX/Email Intake)

## Purpose

Uniform ingestion for forecasts, staff, schedules. No UI coupling; pure App Lib.

## Contract

- Inputs: File/Buffer + declared `importType` (e.g., `forecast`, `staff`).
- Detect MIME/extension → parse (CSV/XLSX).
- Map columns → Zod schema (per import type).
- Return:

```ts
type ImportResult<T> = {
  records: T[];
  warnings: string[];
  rejected: { row: number; reason: string }[];
};
```
