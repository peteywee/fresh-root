# Scheduling SDK Deprecation Ledger
## LEGACY\_COMPONENT: inlineScheduleCreationV1
**TYPE:** Route/Function with inline Firestore writes

<<<<<<< HEAD:docs/reports/mega-report/06_SDK_DEPRECATION_LEDGER/scheduling_ledger.md
**LOCATION\_OLD** (representative):
=======
**LOCATION_OLD** (representative):
>>>>>>> pr-128:docs/mega-report/06_SDK_DEPRECATION_LEDGER/scheduling_ledger.md

- `apps/web/app/api/schedules/create/route.ts`
- `functions/src/schedules/createScheduleInline.ts`

**REASON\_REMOVED:**

- Non-transactional multi-document writes.
- Mixed concerns (HTTP handling, validation, persistence).
- No idempotency, making retries unsafe.

**RISK\_IF\_LOST:**

- We forget the business assumptions (how shifts were derived, how assignments were initially attached).
- Future devs reintroduce ad-hoc writes to `schedules` and `shifts` by copy-pasting old patterns.

---

## NEW\_SDK\_INTERFACE
**NAME:** `@fresh-root/scheduling-sdk`

**LOCATION\_NEW:** `packages/scheduling-sdk/src/transactions/createSchedule.ts`

**SURFACE:**

- `createScheduleWithShifts(input: CreateScheduleInput): Promise<CreateScheduleResult>`

**Key responsibilities:**

- Enforce Firestore transaction boundary.
- Enforce idempotency by `(orgId, venueId, weekOf, idempotencyKey)`.
- Create schedule, shifts, and initial assignments as a single atomic operation.
- Serve as the only allowed write path for schedule creation.

---

## EXAMPLES
### BEFORE\_CODE (Representative Pattern)
```ts
// legacy-style pattern (representative)

const scheduleRef = db.collection("schedules").doc();
await scheduleRef.set(scheduleData);

for (const shift of shifts) {
  await scheduleRef.collection("shifts").add({
    ...shift,
    scheduleId: scheduleRef.id,
  });
}

for (const assignment of assignments) {
  await db.collection("assignments").add({
    ...assignment,
    scheduleId: scheduleRef.id,
  });
}
```

### AFTER\_CODE (SDK Usage)
```ts
import { createScheduleWithShifts } from "@fresh-root/scheduling-sdk";

const result = await createScheduleWithShifts({
  orgId,
  venueId,
  weekOf,
  templateId,
  laborInputs,
  shifts,
  assignments,
  idempotencyKey,
  createdByUserId: user.id,
});
```

---

## MIGRATION\_CHECKLIST
- \[ ] Audit all `schedules` collection writes in routes and functions.
- \[ ] Replace inline writes with SDK calls.
- \[ ] Add integration tests covering the new SDK surface.
- \[ ] Document the deprecated route/function in this ledger.
- \[ ] Set deprecation timeline (e.g., "removed in v2.0").
