# SDK Ledger — Example Entries (Templates)
This file contains concrete templates you can copy when documenting real deprecations.

## Example 1 — Legacy Firestore Write Pattern → Transactional SDK
LEGACY\_COMPONENT: createScheduleAndShiftsInline\
TYPE: Cloud Function (HTTP)\
LOCATION\_OLD: `functions/src/schedules/createScheduleAndShiftsInline.ts`\
REASON\_REMOVED: Mixed concerns (HTTP + validation + Firestore writes), no transaction, duplicated logic.\
RISK\_IF\_LOST: We forget the exact order of writes and edge cases that were previously handled ad-hoc.

NEW\_SDK\_INTERFACE:
NAME: `@fresh-root/scheduling-sdk`\
LOCATION\_NEW: `packages/scheduling-sdk/src/transactions/createSchedule.ts`\
SURFACE: - `createScheduleWithShifts(input: CreateScheduleInput): Promise<CreateScheduleResult>`

BEFORE\_CODE (Representative):

```ts
// Pseudo-legacy example (for pattern only)
const scheduleRef = db.collection("schedules").doc();
await scheduleRef.set(scheduleData);
for (const shift of shifts) {
  await scheduleRef.collection("shifts").add(shift);
}
```

AFTER\_CODE (Representative):

```ts
// New SDK usage
const result = await schedulingSdk.createScheduleWithShifts({
  orgId,
  venueId,
  weekOf,
  templateId,
  laborInputs,
});
```

MIGRATION\_NOTES:

- All direct writes to `schedules` and `shifts` collections must go through `createScheduleWithShifts`.
- Firestore transaction is enforced inside the SDK.
- Idempotency key is required in `CreateScheduleInput`.
