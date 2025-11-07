// [P1][INTEGRITY][SCHEMA] Attendance schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ATTENDANCE
import { z } from "zod";

/**
 * Attendance record status
 */
export const AttendanceStatus = z.enum([
  "scheduled",
  "checked_in",
  "checked_out",
  "no_show",
  "excused_absence",
  "late",
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

/**
 * Check-in/out method
 */
export const CheckMethod = z.enum(["manual", "qr_code", "nfc", "geofence", "admin_override"]);
export type CheckMethod = z.infer<typeof CheckMethod>;

/**
 * Geographic location for check-ins
 */
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

/**
 * Full Attendance record schema
 * Firestore path: /attendance_records/{orgId}/{recordId}
 */
export const AttendanceRecordSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  shiftId: z.string().min(1, "Shift ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
  staffUid: z.string().min(1, "Staff user ID is required"),

  status: AttendanceStatus.default("scheduled"),

  // Timestamps
  scheduledStart: z.number().int().positive(),
  scheduledEnd: z.number().int().positive(),
  actualCheckIn: z.number().int().positive().optional(),
  actualCheckOut: z.number().int().positive().optional(),

  // Check-in metadata
  checkInMethod: CheckMethod.optional(),
  checkInLocation: LocationSchema.optional(),
  checkOutMethod: CheckMethod.optional(),
  checkOutLocation: LocationSchema.optional(),

  // Duration calculations (minutes)
  scheduledDuration: z.number().int().nonnegative(),
  actualDuration: z.number().int().nonnegative().optional(),
  breakDuration: z.number().int().nonnegative().default(0),

  // Notes and overrides
  notes: z.string().max(1000).optional(),
  managerNotes: z.string().max(1000).optional(),
  overriddenBy: z.string().optional(),
  overriddenAt: z.number().int().positive().optional(),

  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

/**
 * Schema for creating a new attendance record
 * Used in POST /api/attendance
 */
export const CreateAttendanceRecordSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  shiftId: z.string().min(1, "Shift ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
  staffUid: z.string().min(1, "Staff user ID is required"),
  scheduledStart: z.number().int().positive(),
  scheduledEnd: z.number().int().positive(),
  breakDuration: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateAttendanceRecordInput = z.infer<typeof CreateAttendanceRecordSchema>;

/**
 * Schema for checking in
 * Used in POST /api/attendance/{id}/check-in
 */
export const CheckInSchema = z.object({
  method: CheckMethod.default("manual"),
  location: LocationSchema.optional(),
  notes: z.string().max(500).optional(),
});
export type CheckInInput = z.infer<typeof CheckInSchema>;

/**
 * Schema for checking out
 * Used in POST /api/attendance/{id}/check-out
 */
export const CheckOutSchema = z.object({
  method: CheckMethod.default("manual"),
  location: LocationSchema.optional(),
  notes: z.string().max(500).optional(),
});
export type CheckOutInput = z.infer<typeof CheckOutSchema>;

/**
 * Schema for updating an attendance record (admin override)
 * Used in PATCH /api/attendance/{id}
 */
export const UpdateAttendanceRecordSchema = z.object({
  status: AttendanceStatus.optional(),
  actualCheckIn: z.number().int().positive().optional(),
  actualCheckOut: z.number().int().positive().optional(),
  breakDuration: z.number().int().nonnegative().optional(),
  managerNotes: z.string().max(1000).optional(),
});
export type UpdateAttendanceRecordInput = z.infer<typeof UpdateAttendanceRecordSchema>;

/**
 * Query parameters for listing attendance records
 */
export const ListAttendanceRecordsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  scheduleId: z.string().optional(),
  shiftId: z.string().optional(),
  staffUid: z.string().optional(),
  status: AttendanceStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListAttendanceRecordsQuery = z.infer<typeof ListAttendanceRecordsQuerySchema>;
