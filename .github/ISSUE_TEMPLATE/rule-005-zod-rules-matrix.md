## # Objective
name: RULE-005 Zod Contracts & Rules Matrix about: Finalize Zod schemas and expand Firestore rules
tests (success + denial matrices) title: "\[RULE-005] Zod & Rules Matrix" labels: \["rules",
"backend", "P1"] assignees: \["peteywee"]

---

## Objective
Guarantee **data correctness** and **tenant isolation** with Zod validation and robust rules tests.

## Scope
- Collections: `orgs, memberships, positions, schedules, shifts`.

## Deliverables
- `packages/types/src/*.ts` final schemas + invariants.
- `services/api/src/validators/*.ts`
- `tests/rules/*.test.ts` expanded matrix.

## Tasks
- \[ ] Finalize schemas (required fields, time ranges, overlap constraints).
- \[ ] API validates all writes (422 with details on failure).
- \[ ] Add ≥3 denial tests per collection (wrong role, cross-org, missing fields).
- \[ ] Keep CI rules suite green.

## Acceptance Criteria
- Invalid payload ⇒ **422** with pointer messages.
- Cross-org denial paths covered.

## KPIs
- 0 policy regressions in rules test coverage.

## Definition of Done
- PR merged with coverage evidence.
