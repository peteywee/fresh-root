// [P0][INTEGRITY][CODE] Schedule and shift Zod schemas
// Tags: P0, INTEGRITY, CODE
import { z } from "zod";

export const ShiftStatus = z.enum(["draft", "published", "cancelled"]);
export type ShiftStatus = z.infer<typeof ShiftStatus>;

export const Shift = z.object({
  id: z.string(),
  scheduleId: z.string(),
  positionId: z.string(),
  userId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: ShiftStatus,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});
export type Shift = z.infer<typeof Shift>;

export const ScheduleStatus = z.enum(["draft", "published", "active", "completed"]);
export type ScheduleStatus = z.infer<typeof ScheduleStatus>;

export const Schedule = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: ScheduleStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string(),
});
export type Schedule = z.infer<typeof Schedule>;

export const CreateScheduleInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});
export type CreateScheduleInput = z.infer<typeof CreateScheduleInput>;

export const UpdateScheduleInput = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: ScheduleStatus.optional(),
  })
  .partial();
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleInput>;

export const CreateShiftInput = z.object({
  positionId: z.string(),
  userId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});
export type CreateShiftInput = z.infer<typeof CreateShiftInput>;

export const UpdateShiftInput = z
  .object({
    positionId: z.string().optional(),
    userId: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: ShiftStatus.optional(),
    notes: z.string().optional(),
  })
  .partial();
export type UpdateShiftInput = z.infer<typeof UpdateShiftInput>;
