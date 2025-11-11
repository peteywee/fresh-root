# LAYER_00_DOMAIN_KERNEL

**Purpose**  
Defines the _pure domain kernel_: canonical data contracts and invariants for every entity in Fresh Schedules.  
All higher layers depend on this foundation for typing, validation, and consistency.

---

## 1. Scope

`packages/types/src/**`

Contains only:

- Zod schemas and constants.
- TypeScript types and enums.
- Pure transformation utilities (no I/O).

---

## 2. Inputs

- Project Bible v15.0.0
- ENTITY\_\* specifications (e.g., ENTITY_ROLE_v15.md)

---

## 3. Outputs

- `@fresh-schedules/types` package exports.
- Zod schemas validated at build-time.
- Inferred TS types (`z.infer`).

---

## 4. Dependencies

- `zod@3.x`
- No Firebase, React, or Next dependencies.

---

## 5. Consumers

01 Infrastructure → rules generation  
02 Application Libs → validation  
03 API Edge → request/response typing  
04 UI/UX → form typing

---

## 6. Invariants

- No side effects, async calls, or SDK references.
- Each entity file exports both `Schema` and typed alias.
- `roleId` is required in Attendance (v15 mandate).

---

## 7. File Map

| File            | Description                   |
| --------------- | ----------------------------- |
| `network.ts`    | Network schema                |
| `orgs.ts`       | Org schema                    |
| `venues.ts`     | Venue schema                  |
| `users.ts`      | User/Staff schema             |
| `roles.ts`      | Scheduling Role schema        |
| `schedules.ts`  | Shift & ShiftRoleRequirement  |
| `attendance.ts` | AttendanceRecord incl. roleId |
| `rbac.ts`       | RBAC role/claim definitions   |
| `index.ts`      | Barrel re-export              |

---

## 8. Validation Checklist

- [ ] `pnpm typecheck` passes with strict mode.
- [ ] Each schema exported via barrel.
- [ ] No circular imports.
- [ ] Unit tests in `__tests__` verify sample data.

---

## 9. Change Log

| Date       | Author         | Change            |
| ---------- | -------------- | ----------------- |
| YYYY-MM-DD | Patrick Craven | Initial L00 guide |
