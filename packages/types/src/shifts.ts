// [P1][INTEGRITY][SCHEMA] Shifts schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, SHIFTS
import { z } from "zod";

/**
 * Shift status lifecycle
 */
export const ShiftStatus = z.enum(["draft", "published", "in_progress", "completed", "cancelled"]);
export type ShiftStatus = z.infer<typeof ShiftStatus>;

/**
 * Shift assignment status
 */
export const AssignmentStatus = z.enum([
  "unassigned",
  "assigned",
  "confirmed",
  "declined",
  "no_show",
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatus>;

/**
 * Individual shift assignment
 */
export const ShiftAssignmentSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  status: AssignmentStatus.default("assigned"),
  assignedAt: z.number().int().positive(),
  assignedBy: z.string().min(1),
  confirmedAt: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});
export type ShiftAssignment = z.infer<typeof ShiftAssignmentSchema>;

/**
 * Full Shift document schema
 * Firestore path: /shifts/{orgId}/{scheduleId}/{shiftId}
 * or /orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}
 */
export const ShiftSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),

    // Time boundaries (Unix timestamps in milliseconds)
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),

    status: ShiftStatus.default("draft"),

    // Staffing
    assignments: z.array(ShiftAssignmentSchema).default([]),
    requiredStaff: z.number().int().positive().default(1),

    // Metadata
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().default(0),

    // AI metadata
    aiGenerated: z.boolean().default(false),
    aiConfidence: z.number().min(0).max(1).optional(),

    createdBy: z.string().min(1),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type Shift = z.infer<typeof ShiftSchema>;

/**
 * Schema for creating a new shift
 * Used in POST /api/shifts
 */
export const CreateShiftSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    requiredStaff: z.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;

/**
 * Schema for updating an existing shift
 * Used in PATCH /api/shifts/{id}
 */
export const UpdateShiftSchema = z.object({
  positionId: z.string().min(1).optional(),
  venueId: z.string().optional(),
  zoneId: z.string().optional(),
  startTime: z.number().int().positive().optional(),
  endTime: z.number().int().positive().optional(),
  status: ShiftStatus.optional(),
  requiredStaff: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  breakMinutes: z.number().int().nonnegative().optional(),
});
export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

/**
 * Schema for assigning staff to a shift
 * Used in POST /api/shifts/{id}/assign
 */
export const AssignShiftSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  notes: z.string().max(500).optional(),
});
export type AssignShiftInput = z.infer<typeof AssignShiftSchema>;

/**
 * Query parameters for listing shifts
 */
export const ListShiftsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  scheduleId: z.string().optional(),
  positionId: z.string().optional(),
  venueId: z.string().optional(),
  status: ShiftStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  assignedTo: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListShiftsQuery = z.infer<typeof ListShiftsQuerySchema>;
