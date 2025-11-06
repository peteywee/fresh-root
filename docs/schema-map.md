# Schema Map (Zod ↔ Firestore Collections)

This document maps Firestore collections to their Zod schemas and summarizes validation and RBAC at a high level.

## Collections ↔ Schemas

- orgs, organizations
  - Schema: `Organization`
  - Key fields: id, name (1–100), ownerId, createdAt
  - RBAC: members can read; `org_owner`/admin/manager can update

- memberships
  - Schema: `MembershipRecord`, inputs: `MembershipCreateSchema`, `MembershipUpdateSchema`
  - Key fields: orgId, uid, roles[OrgRole], mfaVerified
  - RBAC: managers+ can create/update in org; self can read own

- positions
  - Schema: `PositionSchema`, inputs: `PositionCreateSchema`, `PositionUpdateSchema`
  - Key fields: orgId, title (≤100), hourlyRate (0–9999.99), color (#RRGGBB)
  - RBAC: manager+ write, members read

- schedules
  - Schema: `Schedule`, inputs: `ScheduleCreateSchema`, `ScheduleUpdateSchema`
  - Key fields: orgId, name, startDate ≤ endDate, status
  - RBAC: scheduler+ write, members read

- shifts
  - Schema: `Shift`, inputs: `ShiftCreateSchema`, `ShiftUpdateSchema`
  - Key fields: scheduleId, positionId, startTime < endTime, breakMinutes < duration
  - RBAC: scheduler+ write, members read; staff can update own notes where applicable (API layer)

- attendance_records
  - Schema: (no Zod yet)
  - RBAC: manager+ write; staff can write own record

- join_tokens
  - Schema: (no Zod yet)
  - RBAC: manager+ write, members read

- venues, zones, messages, receipts
  - Schema: (no Zod yet)
  - RBAC: manager+ write, members read (receipts: self create/update)

## Notes

- API routes enforce additional business rules (e.g., MFA for managers, CSRF, rate limits).
- Firestore rules enforce tenant isolation and role gating; legacy membership-doc roles are supported for compatibility.
- Parity check: run `pnpm run schema:parity` to detect collections without exported schemas.
