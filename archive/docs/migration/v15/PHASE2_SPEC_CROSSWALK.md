# Phase 2 – Spec Crosswalk (13.5 → 14 → 15)

**Purpose**
Provide a **side-by-side mapping** of key concepts across v13.5, v14, and v15 plus the actual code locations.
For each concept, we decide: **KEEP**, **CHANGE**, or **KILL** for v15 and point to the real implementation.

This is an **active artifact**. When behavior changes, this document must be updated.

---

## 1. Columns

Each row uses this structure:

- **Concept** – Domain or feature name (e.g., “Network”, “Onboarding Wizard”).
- **v13.5 Spec** – How 13.5 described it (short summary + section reference).
- **v14 Spec** – How 14 described it or changed it (short summary + ref).
- **Code Reality** – Where it currently lives in `fresh-root-main`.
- **v15 Decision** – `KEEP`, `CHANGE`, or `KILL`.
- **Notes** – Explanation and any migration notes.

---

## 2. Crosswalk Table

> References to sections like “§3.2” are placeholders to the relevant sections in the v13.5/v14 Bibles.

```md
| Concept               | v13.5 Spec                                                            | v14 Spec                                                                         | Code Reality                                                                                                           | v15 Decision | Notes                                                                                                            |
| --------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Network               | Basic Network → Org hierarchy; light description in §2.1.             | Expanded to Network → Corp → Org → Venue; introduced gaps and TODOs in §3.1.     | Domain types in `packages/types/src/network.ts`; schema in `docs/schema-network.md`.                                   | KEEP         | v15 formally adopts full Network → Corp → Org → Venue hierarchy; clarifies missing fields and enforces in rules. |
| Corp                  | Mentioned as “company-level grouping” but not well-defined.           | Corp added as explicit layer between Network and Org in §3.1.                    | Domain types in `packages/types/src/orgs.ts` (corp-related types); Firestore collections indicated in `schema-map.md`. | KEEP         | v15 keeps Corp but documents exact responsibilities (branding, global settings, cross-org reporting).            |
| Org                   | Primary tenant unit; owns venues and staff.                           | Same, with more detail around onboarding and tokens.                             | Types in `packages/types/src/orgs.ts`; Firestore `orgs` collection; rules in `firestore.rules`.                        | CHANGE       | v15 tightens Org fields (id, networkId, corpId, ownerId) and enforces via Zod + rules.                           |
| Venue                 | Early concept (“location/store”) with minimal fields.                 | Formalized as child of Org; capacity and scheduling hints added.                 | Types in `packages/types/src/venues.ts`; Firestore `venues` collection.                                                | CHANGE       | v15 adds operational fields (timezone, laborBudget%, forecastType) and requires them during onboarding.          |
| Staff                 | Users attached directly to Org with role; venue association implicit. | Staff tied to Org with optional Venue; roles more explicit.                      | Types in `packages/types/src/staff.ts`; Firestore `staff` or `users` subcollection depending on current design.        | CHANGE       | v15 requires explicit venue/homeVenueId and normalizes staff docs; role model moved to RBAC types.               |
| Roles (Manager/Staff) | Simple enum with limited commentary.                                  | Expanded RBAC notes; managers can publish schedules; staff view-only in §4.1.    | Types in `packages/types/src/rbac.ts`; enforcement in `apps/web/src/lib/api/authorization.ts`.                         | KEEP         | v15 keeps Manager/Staff roles but codifies exact permissions in Layer 02 + rules tests.                          |
| Onboarding Wizard     | Linear wizard idea; minimal detail on steps.                          | Recognized as critical, but step order and data contracts under-specified in §5. | Routes in `apps/web/app/(onboarding)/**`; logic in `apps/web/src/lib/onboarding/**`.                                   | CHANGE       | v15 defines exact steps, required fields, validation, and error states; wizard must align with domain schemas.   |
| Org Join Flow         | “Join existing org via invite” described briefly.                     | Mentions invite tokens and approval but no full flow chart.                      | API in `apps/web/app/api/org-tokens/**`; types in `packages/types/src/orgTokens.ts`; lib in `apps/web/src/lib/api/**`. | CHANGE       | v15 finalizes org-token lifecycle (issued, pending, accepted, expired) and ensures UI + API are consistent.      |
| Schedule Creation     | “Manager creates schedule” described conceptually; no algorithms.     | Mentions labor budgeting and forecasted sales; sub-5-minute goal emphasized.     | UI skeleton under `apps/web/app/(app)/schedule/**`; partial logic in `apps/web/src/lib/**` (TBD).                      | CHANGE       | v15 defines labor-budget math and minimum viable scheduling algorithm; moves logic into Layer 02 with tests.     |
| Attendance Record     | Basic check-in/out idea tied to staff and shift.                      | Clarified states (present, absent, late) in §6.2, but no persistence details.    | Types in `packages/types/src/attendance.ts`; route in `apps/web/app/api/attendance/route.ts`.                          | KEEP         | v15 keeps states but formalizes enum + schema; API must use `CreateAttendanceRecordSchema` end-to-end.           |
| Session Handling      | “Sessions + cookies” assumed, little detail.                          | Session security and session refresh rules expanded in Block 1 spec.             | Implemented via middleware and API helpers in `apps/web/middleware.ts` and `apps/web/src/lib/api/session.ts`.          | KEEP         | v15 keeps current session model; focuses on hardening and tests rather than redesign.                            |
| MFA Flow              | Mentioned as “future enhancement”.                                    | Described as target but not fully spec’d; optional for v14.                      | MFA endpoints under `apps/web/app/api/auth/mfa/**` (if present) or stubbed.                                            | CHANGE       | v15 defines minimal MFA path (opt-in, TOTP or magic link) with clear fallback; may be partially implemented.     |
| PWA Shell             | High-level intent for installable app.                                | Block 4 calls for PWA: offline stance, manifest, icons.                          | `apps/web/app/RegisterServiceWorker.tsx`, `public/manifest.json`, icons under `public/**`.                             | KEEP         | v15 keeps PWA stance; clarifies “offline-lite” approach and required minimum caching.                            |
| Block 1 – Security    | General security statements.                                          | Detailed SLOs and controls; some gaps in rules/testing.                          | `firestore.rules`, `storage.rules`, `packages/rules-tests/**`, `apps/web/src/lib/api/**`.                              | CHANGE       | v15 enforces security via rule tests and explicit threat model; no more security TODOs.                          |
| Block 3 – Integrity   | Conceptual emphasis on data correctness.                              | Adds ledger ideas for attendance and schedule; limited concrete wiring.          | Domain types + partial implementation; some tests in `apps/web/src/__tests__/**`.                                      | CHANGE       | v15 wires integrity through schemas, migrations, and tests (esp. attendance and schedules).                      |
| Block 4 – UX & PWA    | “Sub-5-minute schedule” tagline.                                      | More detailed UX intent but still not fully mapped to flows.                     | UI skeleton for onboarding and scheduling in `apps/web/app/(onboarding)/**` and `(app)/schedule/**`.                   | CHANGE       | v15 pins down exact golden path UX and measurable timing target; defers advanced UX to v15.1+.                   |
```

3. How to Extend

When you discover additional concepts:

Add a row under the table with the same columns.

Keep descriptions short but specific.

Ensure Code Reality includes at least one file path.

Update Project_Bible_v15.0.0.md if the v15 Decision implies spec changes.

4. Acceptance Criteria (Phase 2 – Spec Crosswalk)

All major domain and feature concepts have at least one row.

Each row has a v15 Decision.

Code Reality points to actual files.

This doc is referenced from Project_Bible_v15_MIGRATION_PLAN.md as the canonical crosswalk.

| Concept           | v13.5 Spec | v14 Spec                             | Code Reality                          | v15 Decision | Notes                                                                                                                     |
| ----------------- | ---------- | ------------------------------------ | ------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Org Search & Join | Absent     | Mentioned implicitly (“invite only”) | None                                  | CHANGE       | v15 introduces searchable Org directory (`orgSearchIndex`), allowing users to request invite tokens via discovery form.   |
| Forecast Import   | None       | Mentioned in labor math appendix     | `services/forecast-import.ts` planned | ADD          | Accept CSV/XLSX/email attachments; uses AI parser layer for type and column detection; validates to schema before import. |
