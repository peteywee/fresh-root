# L2 — Shift Lifecycle & Compliance

> **Status:** Draft (repo-grounded fill).

This subsystem covers shift lifecycle (draft → published → worked/attended) and compliance-related
rules/data (break tracking, attestations/forms, overtime/pay rules).

## 1. Role in the System

- Define the “shape” of shift and attendance records and their invariants.
- Track compliance artifacts (forms/attestations) associated with orgs and onboarding.
- Support downstream calculations (e.g., pay/overtime) and policy enforcement.

Key locations in this repo:

- Shift schema includes break minutes: `packages/types/src/shifts.ts`.
- Attendance schema includes break duration: `packages/types/src/attendance.ts`.
- Compliance container docs + schemas:
  - `packages/types/src/compliance.ts`
  - `packages/types/src/compliance/adminResponsibilityForm.ts`
- Backend pay/overtime calculation helper: `functions/src/domain/billing.ts`.
- Onboarding creates compliance doc artifacts: `apps/web/src/lib/onboarding/createNetworkOrg.ts`.

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Compliance events must be durable and ordered; be careful with multi-writer workflows.
- Security (Marcus): Compliance docs can contain sensitive/legal attestations; treat as sensitive data and log carefully.
- DDD (Ingrid): Model compliance as first-class domain concepts (Attestation, Policy, Rule Set), not ad-hoc flags.
- Platform (Kenji): Ensure compliance checks are enforceable both client- and server-side.
- Staff Engineer (Priya): Put compliance rules behind well-tested pure functions and shared schema contracts.
- Database (Omar): Define explicit document paths and indexing; avoid storing compliance in ambiguous “misc” docs.
- API Design (Sarah): Expose explicit endpoints/operations for compliance transitions (sign, revoke, version).
- Devil's Advocate (Rafael): “Compliance” can balloon; constrain scope and document supported jurisdictions/rules.
- Strategic/Impact (Victoria): Compliance is trust; mistakes can be catastrophic. Favor correctness and auditability.

## 3. Critical Findings (Current)

No confirmed “Critical” issues recorded in this doc yet.

Concrete areas to validate:

- Schema consistency between scheduling helpers and `packages/types` (avoid drift between app-level `ShiftDoc` and canonical schema).
- Overtime logic location: `functions/src/domain/billing.ts` currently defines overtime threshold + multiplier calculation.

## 4. Architectural Notes & Invariants

- Compliance artifacts are immutable or versioned (no silent rewrites of signed attestations).
- Break minutes/durations are non-negative integers; shift start/end invariants hold.
- Overtime rules (thresholds/multipliers) are explicit and stored with the policy/jurisdiction that produced them.
- Any “publish schedule” action should be auditable and role-gated.

## 5. Example Patterns

- **Good Pattern Example:** Strong Zod schemas in `packages/types` for compliance artifacts.
- **Good Pattern Example:** Backend pay computation isolated in a small helper (`functions/src/domain/billing.ts`).
- **Risky Pattern Example:** Duplicated shift schema definitions across app and types packages.
- **Refactored Pattern:** Create a single canonical shift/attendance model in `packages/types` and use it everywhere (client, functions, API).

## 6. Open Questions

- Which compliance rules are in-scope (break rules, minors, overtime, maximum shift length, rest periods)?
- Where is the source-of-truth for overtime policy (per org, per jurisdiction, per role)?
- How are compliance artifacts audited and retained (retention policy and export needs)?

