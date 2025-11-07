// [P1][INTEGRITY][SCHEMA] Schedule schemas
// Tags: P1, INTEGRITY, SCHEMA, ZOD, SCHEDULES
import { z } from "zod";

/**
 * Schedule status lifecycle
 */
export const ScheduleStatus = z.enum(["draft", "published", "active", "completed", "archived"]);
export type ScheduleStatus = z.infer<typeof ScheduleStatus>;

/**
 * Schedule visibility settings
 */
export const ScheduleVisibility = z.enum([
  "private", // Only managers can see
  "team", // All team members can see
  "public", // Public viewing (with link)
]);
export type ScheduleVisibility = z.infer<typeof ScheduleVisibility>;

/**
 * Schedule statistics
 */
export const ScheduleStatsSchema = z.object({
  totalShifts: z.number().int().nonnegative().default(0),
  assignedShifts: z.number().int().nonnegative().default(0),
  unassignedShifts: z.number().int().nonnegative().default(0),
  totalHours: z.number().nonnegative().default(0),
  totalCost: z.number().nonnegative().default(0),
  conflictCount: z.number().int().nonnegative().default(0),
});
export type ScheduleStats = z.infer<typeof ScheduleStatsSchema>;

/**
 * Full Schedule document schema
 * Firestore path: /schedules/{orgId}/{scheduleId}
 * or /orgs/{orgId}/schedules/{scheduleId}
 */
export const ScheduleSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Schedule name is required").max(100),
    description: z.string().max(500).optional(),

    // Time boundaries (Unix timestamps in milliseconds)
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),

    status: ScheduleStatus.default("draft"),
    visibility: ScheduleVisibility.default("team"),

    // Metadata
    templateId: z.string().optional(), // If created from a template
    parentScheduleId: z.string().optional(), // If cloned from another schedule

    // Statistics (denormalized for performance)
    stats: ScheduleStatsSchema.optional(),

    // AI generation metadata
    aiGenerated: z.boolean().default(false),
    aiModel: z.string().optional(),
    aiGeneratedAt: z.number().int().positive().optional(),

    // Publishing
    publishedAt: z.number().int().positive().optional(),
    publishedBy: z.string().optional(),

    createdBy: z.string().min(1),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type Schedule = z.infer<typeof ScheduleSchema>;

/**
 * Schema for creating a new schedule
 * Used in POST /api/schedules
 */
export const CreateScheduleSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Schedule name is required").max(100),
    description: z.string().max(500).optional(),
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),
    visibility: ScheduleVisibility.optional().default("team"),
    templateId: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

/**
 * Schema for updating an existing schedule
 * Used in PATCH /api/schedules/{id}
 */
export const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z.number().int().positive().optional(),
  endDate: z.number().int().positive().optional(),
  status: ScheduleStatus.optional(),
  visibility: ScheduleVisibility.optional(),
});
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;

/**
 * Schema for publishing a schedule
 * Used in POST /api/schedules/{id}/publish
 */
export const PublishScheduleSchema = z.object({
  notifyStaff: z.boolean().default(true),
  message: z.string().max(500).optional(),
});
export type PublishScheduleInput = z.infer<typeof PublishScheduleSchema>;

/**
 * Schema for cloning a schedule
 * Used in POST /api/schedules/{id}/clone
 */
export const CloneScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.number().int().positive(),
  endDate: z.number().int().positive(),
  includeAssignments: z.boolean().default(false),
});
export type CloneScheduleInput = z.infer<typeof CloneScheduleSchema>;

/**
 * Query parameters for listing schedules
 */
export const ListSchedulesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  status: ScheduleStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListSchedulesQuery = z.infer<typeof ListSchedulesQuerySchema>;
