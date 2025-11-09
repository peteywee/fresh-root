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
 * @property {number} lat - The latitude.
 * @property {number} lng - The longitude.
 * @property {number} [accuracy] - The accuracy of the location in meters.
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
 * @property {string} id - The unique identifier for the attendance record.
 * @property {string} orgId - The ID of the organization.
 * @property {string} shiftId - The ID of the shift this record is for.
 * @property {string} scheduleId - The ID of the schedule this record is for.
 * @property {string} staffUid - The user ID of the staff member.
 * @property {AttendanceStatus} [status=scheduled] - The current status of the attendance record.
 * @property {number} scheduledStart - The scheduled start time as a Unix timestamp.
 * @property {number} scheduledEnd - The scheduled end time as a Unix timestamp.
 * @property {number} [actualCheckIn] - The actual check-in time as a Unix timestamp.
 * @property {number} [actualCheckOut] - The actual check-out time as a Unix timestamp.
 * @property {CheckMethod} [checkInMethod] - The method used for check-in.
 * @property {Location} [checkInLocation] - The location of the check-in.
 * @property {CheckMethod} [checkOutMethod] - The method used for check-out.
 * @property {Location} [checkOutLocation] - The location of the check-out.
 * @property {number} scheduledDuration - The scheduled duration of the shift in minutes.
 * @property {number} [actualDuration] - The actual duration of the shift in minutes.
 * @property {number} [breakDuration=0] - The duration of the break in minutes.
 * @property {string} [notes] - Notes from the staff member.
 * @property {string} [managerNotes] - Notes from the manager.
 * @property {string} [overriddenBy] - The user ID of the manager who overrode the record.
 * @property {number} [overriddenAt] - The timestamp of when the record was overridden.
 * @property {number} createdAt - The timestamp of when the record was created.
 * @property {number} updatedAt - The timestamp of when the record was last updated.
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
 * @property {string} orgId - The ID of the organization.
 * @property {string} shiftId - The ID of the shift.
 * @property {string} scheduleId - The ID of the schedule.
 * @property {string} staffUid - The user ID of the staff member.
 * @property {number} scheduledStart - The scheduled start time as a Unix timestamp.
 * @property {number} scheduledEnd - The scheduled end time as a Unix timestamp.
 * @property {number} [breakDuration] - The duration of the break in minutes.
 * @property {string} [notes] - Any notes for the record.
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
 * @property {CheckMethod} [method=manual] - The method used for check-in.
 * @property {Location} [location] - The location of the check-in.
 * @property {string} [notes] - Any notes for the check-in.
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
 * @property {CheckMethod} [method=manual] - The method used for check-out.
 * @property {Location} [location] - The location of the check-out.
 * @property {string} [notes] - Any notes for the check-out.
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
 * @property {AttendanceStatus} [status] - The new status of the record.
 * @property {number} [actualCheckIn] - The new check-in time.
 * @property {number} [actualCheckOut] - The new check-out time.
 * @property {number} [breakDuration] - The new break duration.
 * @property {string} [managerNotes] - Any notes from the manager.
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
 * @property {string} orgId - The ID of the organization.
 * @property {string} [scheduleId] - Filter by schedule ID.
 * @property {string} [shiftId] - Filter by shift ID.
 * @property {string} [staffUid] - Filter by staff member ID.
 * @property {AttendanceStatus} [status] - Filter by status.
 * @property {number} [startAfter] - Filter for records starting after this timestamp.
 * @property {number} [startBefore] - Filter for records starting before this timestamp.
 * @property {number} [limit=50] - The maximum number of records to return.
 * @property {string} [cursor] - The cursor for pagination.
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
