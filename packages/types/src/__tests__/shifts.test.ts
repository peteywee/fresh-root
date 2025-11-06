// [P0][INTEGRITY][TEST] Shift schema validation tests
// Tags: P0, INTEGRITY, TEST, ZOD, SHIFTS
import { describe, it, expect } from "vitest";

import {
  Shift,
  ShiftStatus,
  CreateShiftInput,
  UpdateShiftInput,
  ShiftCreateSchema,
  ShiftUpdateSchema,
} from "../schedules";

describe("ShiftStatus", () => {
  it("should accept valid shift statuses", () => {
    expect(ShiftStatus.parse("draft")).toBe("draft");
    expect(ShiftStatus.parse("published")).toBe("published");
    expect(ShiftStatus.parse("cancelled")).toBe("cancelled");
  });

  it("should reject invalid shift statuses", () => {
    expect(() => ShiftStatus.parse("invalid")).toThrow();
    expect(() => ShiftStatus.parse("active")).toThrow();
    expect(() => ShiftStatus.parse("")).toThrow();
  });
});

describe("Shift", () => {
  const validShift = {
    id: "shift123",
    scheduleId: "schedule123",
    positionId: "position123",
    userId: "user123",
    startTime: "2025-01-15T09:00:00Z",
    endTime: "2025-01-15T17:00:00Z",
    status: "published" as const,
    notes: "Morning shift",
    breakMinutes: 30,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  it("should accept valid shift", () => {
    const result = Shift.parse(validShift);
    expect(result).toEqual(validShift);
  });

  it("should accept shift without optional fields", () => {
    const minimalShift = {
      id: "shift123",
      scheduleId: "schedule123",
      positionId: "position123",
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T17:00:00Z",
      status: "draft" as const,
      createdAt: "2025-01-01T00:00:00Z",
    };
    const result = Shift.parse(minimalShift);
    expect(result.userId).toBeUndefined();
    expect(result.notes).toBeUndefined();
    expect(result.breakMinutes).toBeUndefined();
  });

  it("should reject shift with missing required fields", () => {
    const invalidShift = {
      scheduleId: "schedule123",
      positionId: "position123",
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T17:00:00Z",
      status: "draft",
      createdAt: "2025-01-01T00:00:00Z",
    };
    expect(() => Shift.parse(invalidShift)).toThrow();
  });

  it("should reject shift with invalid datetime format", () => {
    const invalidShift = {
      ...validShift,
      startTime: "2025-01-15 09:00:00", // Invalid format
    };
    expect(() => Shift.parse(invalidShift)).toThrow();
  });

  it("should reject shift with negative breakMinutes", () => {
    const invalidShift = {
      ...validShift,
      breakMinutes: -10,
    };
    expect(() => Shift.parse(invalidShift)).toThrow();
  });

  it("should reject shift with non-integer breakMinutes", () => {
    const invalidShift = {
      ...validShift,
      breakMinutes: 15.5,
    };
    expect(() => Shift.parse(invalidShift)).toThrow();
  });
});

describe("CreateShiftInput", () => {
  const validInput = {
    positionId: "position123",
    userId: "user123",
    startTime: "2025-01-15T09:00:00Z",
    endTime: "2025-01-15T17:00:00Z",
    notes: "Morning shift",
    breakMinutes: 30,
  };

  it("should accept valid shift creation input", () => {
    const result = CreateShiftInput.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it("should accept shift without optional fields", () => {
    const minimalInput = {
      positionId: "position123",
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T17:00:00Z",
    };
    const result = CreateShiftInput.parse(minimalInput);
    expect(result.userId).toBeUndefined();
    expect(result.notes).toBeUndefined();
    expect(result.breakMinutes).toBeUndefined();
  });

  it("should reject shift with startTime after endTime", () => {
    const invalidInput = {
      ...validInput,
      startTime: "2025-01-15T18:00:00Z",
      endTime: "2025-01-15T09:00:00Z",
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow("startTime must be before endTime");
  });

  it("should reject shift with startTime equal to endTime", () => {
    const invalidInput = {
      ...validInput,
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T09:00:00Z",
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow("startTime must be before endTime");
  });

  it("should reject shift with negative breakMinutes", () => {
    const invalidInput = {
      ...validInput,
      breakMinutes: -10,
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow("Break minutes must be non-negative");
  });

  it("should reject shift with breakMinutes exceeding shift duration", () => {
    const invalidInput = {
      positionId: "position123",
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T10:00:00Z", // 60 minute shift
      breakMinutes: 90, // More than shift duration
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow("Break minutes must be less than shift duration");
  });

  it("should accept shift with breakMinutes equal to shift duration minus 1", () => {
    const validInput = {
      positionId: "position123",
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T10:00:00Z", // 60 minute shift
      breakMinutes: 59, // Just under duration
    };
    const result = CreateShiftInput.parse(validInput);
    expect(result.breakMinutes).toBe(59);
  });

  it("should reject shift with missing required positionId", () => {
    const invalidInput = {
      startTime: "2025-01-15T09:00:00Z",
      endTime: "2025-01-15T17:00:00Z",
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow();
  });

  it("should reject shift with invalid datetime format", () => {
    const invalidInput = {
      ...validInput,
      startTime: "2025-01-15 09:00:00", // Invalid format
    };
    expect(() => CreateShiftInput.parse(invalidInput)).toThrow();
  });
});

describe("UpdateShiftInput", () => {
  it("should accept valid partial updates", () => {
    const update = {
      notes: "Updated notes",
      breakMinutes: 45,
    };
    const result = UpdateShiftInput.parse(update);
    expect(result).toEqual(update);
  });

  it("should accept empty update object", () => {
    const result = UpdateShiftInput.parse({});
    expect(result).toEqual({});
  });

  it("should accept status update", () => {
    const update = {
      status: "cancelled" as const,
    };
    const result = UpdateShiftInput.parse(update);
    expect(result.status).toBe("cancelled");
  });

  it("should reject invalid status value", () => {
    const invalidUpdate = {
      status: "invalid",
    };
    expect(() => UpdateShiftInput.parse(invalidUpdate)).toThrow();
  });

  it("should reject negative breakMinutes", () => {
    const invalidUpdate = {
      breakMinutes: -15,
    };
    expect(() => UpdateShiftInput.parse(invalidUpdate)).toThrow("Break minutes must be non-negative");
  });

  it("should accept all fields as optional", () => {
    const fullUpdate = {
      positionId: "newPosition",
      userId: "newUser",
      startTime: "2025-01-16T10:00:00Z",
      endTime: "2025-01-16T18:00:00Z",
      status: "published" as const,
      notes: "Updated shift",
      breakMinutes: 60,
    };
    const result = UpdateShiftInput.parse(fullUpdate);
    expect(result).toEqual(fullUpdate);
  });
});

describe("Schema aliases", () => {
  it("ShiftCreateSchema should be alias for CreateShiftInput", () => {
    expect(ShiftCreateSchema).toBe(CreateShiftInput);
  });

  it("ShiftUpdateSchema should be alias for UpdateShiftInput", () => {
    expect(ShiftUpdateSchema).toBe(UpdateShiftInput);
  });
});
