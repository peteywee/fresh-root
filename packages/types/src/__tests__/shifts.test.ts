// [P0][TYPES][TEST] Shifts Schema Tests
// Tags: P0, TYPES, TEST, VALIDATION

import { describe, it, expect } from "vitest";
import {
  Shift,
  ShiftCreateSchema,
  ShiftUpdateSchema,
} from "../schedules";

describe("Shift", () => {
  it("should validate a valid shift", () => {
    const validShift = {
      id: "shift123",
      scheduleId: "sched123",
      positionId: "pos123",
      userId: "user123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
      breakMinutes: 30,
      status: "published",
      createdAt: "2025-01-01T08:00:00Z",
    };

    expect(() => Shift.parse(validShift)).not.toThrow();
  });

  it("should reject shift with missing required fields", () => {
    const invalidShift = {
      id: "shift123",
      scheduleId: "sched123",
      // Missing positionId
    };

    expect(() => Shift.parse(invalidShift)).toThrow();
  });

  it("should reject shift with invalid status", () => {
    const invalidShift = {
      id: "shift123",
      scheduleId: "sched123",
      positionId: "pos123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
      status: "invalid_status",
      createdAt: "2025-01-01T08:00:00Z",
    };

    expect(() => Shift.parse(invalidShift)).toThrow();
  });
});

describe("ShiftCreateSchema", () => {
  it("should validate valid shift creation data", () => {
    const validCreate = {
      scheduleId: "sched123",
      positionId: "pos123",
      userId: "user123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
      breakMinutes: 30,
    };

    expect(() => ShiftCreateSchema.parse(validCreate)).not.toThrow();
  });

  it("should reject creation with negative break minutes", () => {
    const invalidCreate = {
      scheduleId: "sched123",
      positionId: "pos123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
      breakMinutes: -10,
    };

    expect(() => ShiftCreateSchema.parse(invalidCreate)).toThrow();
  });

  it("should allow creation without optional fields", () => {
    const minimalCreate = {
      scheduleId: "sched123",
      positionId: "pos123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
    };

    expect(() => ShiftCreateSchema.parse(minimalCreate)).not.toThrow();
  });

  it("should reject creation with missing required fields", () => {
    const invalidCreate = {
      scheduleId: "sched123",
      // Missing positionId
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
    };

    expect(() => ShiftCreateSchema.parse(invalidCreate)).toThrow();
  });
});

describe("ShiftUpdateSchema", () => {
  it("should validate partial shift update", () => {
    const validUpdate = {
      breakMinutes: 45,
      notes: "Extended lunch break",
    };

    expect(() => ShiftUpdateSchema.parse(validUpdate)).not.toThrow();
  });

  it("should allow updating just status", () => {
    const validUpdate = {
      status: "cancelled",
    };

    expect(() => ShiftUpdateSchema.parse(validUpdate)).not.toThrow();
  });

  it("should allow empty update object", () => {
    const emptyUpdate = {};

    expect(() => ShiftUpdateSchema.parse(emptyUpdate)).not.toThrow();
  });

  it("should reject update with invalid status", () => {
    const invalidUpdate = {
      status: "invalid_status_value",
    };

    expect(() => ShiftUpdateSchema.parse(invalidUpdate)).toThrow();
  });

  it("should reject update with negative break minutes", () => {
    const invalidUpdate = {
      breakMinutes: -5,
    };

    expect(() => ShiftUpdateSchema.parse(invalidUpdate)).toThrow();
  });
});

describe("Shift time validation", () => {
  it("should validate shifts with proper time ranges", () => {
    const validShift = {
      scheduleId: "sched123",
      positionId: "pos123",
      userId: "user123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T17:00:00Z",
      breakMinutes: 30,
    };

    const result = ShiftCreateSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("should handle shifts with minimal duration", () => {
    const validShift = {
      scheduleId: "sched123",
      positionId: "pos123",
      startTime: "2025-01-01T09:00:00Z",
      endTime: "2025-01-01T09:30:00Z",
      breakMinutes: 0,
    };

    expect(() => ShiftCreateSchema.parse(validShift)).not.toThrow();
  });

  it("should handle shifts across midnight", () => {
    const validShift = {
      scheduleId: "sched123",
      positionId: "pos123",
      startTime: "2025-01-01T22:00:00Z",
      endTime: "2025-01-02T06:00:00Z",
      breakMinutes: 30,
    };

    expect(() => ShiftCreateSchema.parse(validShift)).not.toThrow();
  });
});
