// [P1][INTEGRITY][TEST] Attendance schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ATTENDANCE
import { describe, it, expect } from "vitest";

import {
  AttendanceRecordSchema,
  CreateAttendanceRecordSchema,
  UpdateAttendanceRecordSchema,
  ListAttendanceRecordsQuerySchema,
  AttendanceStatus,
  CheckMethod,
  LocationSchema,
} from "../attendance";

describe("AttendanceRecordSchema", () => {
  it("validates a complete attendance record", () => {
    const record = {
      id: "a1",
      orgId: "o1",
      shiftId: "sh1",
      scheduleId: "sc1",
      staffUid: "u1",
      status: "checked_in" as const,
      scheduledStart: Date.now() - 3600_000,
      scheduledEnd: Date.now() + 3600_000,
      actualCheckIn: Date.now() - 1800_000,
      actualCheckOut: undefined,
      checkInMethod: "qr_code" as const,
      checkInLocation: { lat: 40.0, lng: -70.0 },
      scheduledDuration: 120,
      actualDuration: 90,
      breakDuration: 10,
      notes: "On time",
      managerNotes: "Good",
      overriddenBy: "admin1",
      overriddenAt: Date.now(),
      createdAt: Date.now() - 4000,
      updatedAt: Date.now() - 1000,
    };
    const result = AttendanceRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("requires core fields", () => {
    const result = AttendanceRecordSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("orgId");
      expect(fields).toContain("shiftId");
      expect(fields).toContain("scheduleId");
      expect(fields).toContain("staffUid");
      expect(fields).toContain("scheduledStart");
      expect(fields).toContain("scheduledEnd");
      expect(fields).toContain("scheduledDuration");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts valid status enum values", () => {
    const statuses: Array<typeof AttendanceStatus._type> = [
      "scheduled",
      "checked_in",
      "checked_out",
      "no_show",
      "excused_absence",
      "late",
    ];
    statuses.forEach((status) => {
      const ok = AttendanceStatus.safeParse(status);
      expect(ok.success).toBe(true);
    });
  });

  it("accepts valid check methods and location", () => {
    const methods: Array<typeof CheckMethod._type> = [
      "manual",
      "qr_code",
      "nfc",
      "geofence",
      "admin_override",
    ];
    methods.forEach((m) => {
      expect(CheckMethod.safeParse(m).success).toBe(true);
    });

    const locOk = LocationSchema.safeParse({ lat: 10, lng: 10, accuracy: 5 });
    expect(locOk.success).toBe(true);
  });
});

describe("CreateAttendanceRecordSchema", () => {
  it("validates creation input", () => {
    const input = {
      orgId: "o1",
      shiftId: "sh1",
      scheduleId: "sc1",
      staffUid: "u1",
      scheduledStart: Date.now(),
      scheduledEnd: Date.now() + 3600_000,
      breakDuration: 0,
      notes: "First shift",
    };
    const result = CreateAttendanceRecordSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires minimum fields", () => {
    const result = CreateAttendanceRecordSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("orgId");
      expect(fields).toContain("shiftId");
      expect(fields).toContain("scheduleId");
      expect(fields).toContain("staffUid");
      expect(fields).toContain("scheduledStart");
      expect(fields).toContain("scheduledEnd");
    }
  });
});

describe("UpdateAttendanceRecordSchema", () => {
  it("allows partial override updates", () => {
    const result = UpdateAttendanceRecordSchema.safeParse({
      status: "checked_out",
      actualCheckOut: Date.now(),
      breakDuration: 5,
      managerNotes: "Approved by manager",
    });
    expect(result.success).toBe(true);
  });
});

describe("ListAttendanceRecordsQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListAttendanceRecordsQuerySchema.safeParse({
      orgId: "o1",
      scheduleId: "sc1",
      status: "scheduled",
      startAfter: Date.now() - 1000,
      startBefore: Date.now() + 1000,
      limit: 25,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListAttendanceRecordsQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
