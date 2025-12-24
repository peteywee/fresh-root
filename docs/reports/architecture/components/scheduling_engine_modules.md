# L3 — Scheduling Engine Modules

This file documents the scheduling engine modules, Zod schemas, and domain types in Fresh Schedules.

---

## 1. Type System Overview

All domain types are defined in `packages/types/src/` using Zod schemas. Types are inferred using
`z.infer<typeof Schema>` — never duplicated.

---

## 2. Core Domain Schemas

### Scheduling Domain

| Schema                 | File           | Purpose                    |
| ---------------------- | -------------- | -------------------------- |
| `ScheduleSchema`       | `schedules.ts` | Schedule entity definition |
| `CreateScheduleSchema` | `schedules.ts` | Schedule creation input    |
| `UpdateScheduleSchema` | `schedules.ts` | Schedule update input      |
| `ShiftSchema`          | `shifts.ts`    | Shift entity definition    |
| `CreateShiftSchema`    | `shifts.ts`    | Shift creation input       |
| `UpdateShiftSchema`    | `shifts.ts`    | Shift update input         |
| `PositionSchema`       | `positions.ts` | Position/role definition   |

### Organization Domain

| Schema             | File             | Purpose               |
| ------------------ | ---------------- | --------------------- |
| `OrgSchema`        | `orgs.ts`        | Organization entity   |
| `MembershipSchema` | `memberships.ts` | User-org membership   |
| `VenueSchema`      | `venues.ts`      | Venue/location entity |
| `ZoneSchema`       | `zones.ts`       | Zone within venue     |

### Staff Management

| Schema                   | File            | Purpose             |
| ------------------------ | --------------- | ------------------- |
| `AttendanceRecordSchema` | `attendance.ts` | Attendance tracking |
| `CreateAttendanceSchema` | `attendance.ts` | Clock-in/out input  |
| `CheckInSchema`          | `attendance.ts` | Check-in payload    |
| `CheckOutSchema`         | `attendance.ts` | Check-out payload   |

### RBAC & Security

| Schema             | File      | Purpose                |
| ------------------ | --------- | ---------------------- |
| `OrgRoleSchema`    | `rbac.ts` | Role enumeration       |
| `PermissionSchema` | `rbac.ts` | Permission definitions |

---

## 3. Onboarding Schemas

Located in `packages/types/src/onboarding.ts`:

| Schema                          | Purpose                         |
| ------------------------------- | ------------------------------- |
| `AdminResponsibilityFormSchema` | Admin responsibility form input |
| `CreateNetworkOrgSchema`        | Network org creation            |
| `CreateNetworkCorporateSchema`  | Corporate entity creation       |
| `ActivateNetworkSchema`         | Network activation              |
| `JoinWithTokenSchema`           | Join via invite token           |
| `VerifyEligibilitySchema`       | Eligibility check               |

---

## 4. Compliance Schemas

Located in `packages/types/src/compliance/`:

| Schema                          | File                         | Purpose                   |
| ------------------------------- | ---------------------------- | ------------------------- |
| `AdminResponsibilityFormSchema` | `adminResponsibilityForm.ts` | Admin responsibility form |
| `ComplianceDocSchema`           | `compliance.ts`              | Generic compliance doc    |
| `CertificationSchema`           | `compliance.ts`              | Certification tracking    |

---

## 5. Network & Corporate Schemas

Located in `packages/types/src/`:

| Schema                     | File                           | Purpose                |
| -------------------------- | ------------------------------ | ---------------------- |
| `NetworkSchema`            | `networks.ts`                  | Network tenant root    |
| `CorporateSchema`          | `corporates.ts`                | Corporate entity       |
| `CreateCorporateSchema`    | `corporates.ts`                | Corporate creation     |
| `UpdateCorporateSchema`    | `corporates.ts`                | Corporate update       |
| `CorpOrgLinkSchema`        | `links/corpOrgLinks.ts`        | Corp-org relationships |
| `OrgVenueAssignmentSchema` | `links/orgVenueAssignments.ts` | Org-venue assignments  |

---

## 6. Utility Schemas

| Schema                | File             | Purpose                     |
| --------------------- | ---------------- | --------------------------- |
| `ErrorResponseSchema` | `errors.ts`      | Standardized error response |
| `EventSchema`         | `events.ts`      | Event/audit logging         |
| `BatchItemSchema`     | `batch.ts`       | Batch operation item        |
| `CreateBatchSchema`   | `batch.ts`       | Batch operation input       |
| `SessionSchema`       | `session.ts`     | Session data                |
| `MessageSchema`       | `messages.ts`    | In-app messaging            |
| `ReceiptSchema`       | `receipts.ts`    | Message receipts            |
| `JoinTokenSchema`     | `join-tokens.ts` | Invite token                |
| `WidgetSchema`        | `widgets.ts`     | Widget configuration        |
| `ItemSchema`          | `items.ts`       | Generic items               |

---

## 7. Type Export Pattern

All schemas are re-exported from `packages/types/src/index.ts`:

```typescript
// Domain exports
export * from "./schedules";
export * from "./shifts";
export * from "./positions";
export * from "./orgs";
export * from "./memberships";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./rbac";

// Supporting exports
export * from "./onboarding";
export * from "./compliance";
export * from "./networks";
export * from "./corporates";
export * from "./links";
export * from "./errors";
export * from "./events";
export * from "./batch";
export * from "./session";
export * from "./messages";
export * from "./receipts";
export * from "./join-tokens";
export * from "./widgets";
export * from "./items";
export * from "./internal";
```

---

## 8. Schema Derivation Pattern

All schemas follow this pattern to prevent duplication:

```typescript
// Base schema (full document)
export const EntitySchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  status: z.enum(["active", "inactive"]).default("active"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

// Infer TypeScript type
export type Entity = z.infer<typeof EntitySchema>;

// Derive Create schema (omit auto-generated fields)
export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Derive Update schema (partial, omit immutable)
export const UpdateEntitySchema = EntitySchema.partial().omit({
  id: true,
  orgId: true,
});
```

---

## 9. Validation Refinements

Complex validation using Zod refinements:

```typescript
export const ShiftSchema = z
  .object({
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
```

---

**Total Schema Files**: 30  
**Total Schemas**: 60+  
**Package**: `@fresh-schedules/types`  
**Last Generated**: December 2025
