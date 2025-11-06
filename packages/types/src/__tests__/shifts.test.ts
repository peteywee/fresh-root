// [P1][INTEGRITY][TEST] Shifts schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, SHIFTS
import { describe, expect, it } from "vitest";

import { ShiftSchema, CreateShiftSchema, AssignShiftSchema } from "../shifts";

describe("ShiftSchema", () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  it("validates a complete shift", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      status: "draft" as const,
      assignments: [],
      requiredStaff: 1,
      breakMinutes: 15,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("requires endTime after startTime", () => {
    const invalidShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now - 1000, // Before start time
      assignments: [],
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(invalidShift);
    expect(result.success).toBe(false);
  });

  it("validates shift with assignments", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      assignments: [
        {
          uid: "user1",
          status: "assigned" as const,
          assignedAt: now,
          assignedBy: "manager1",
        },
      ],
      requiredStaff: 2,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("validates AI-generated metadata", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      assignments: [],
      aiGenerated: true,
      aiConfidence: 0.95,
      createdBy: "ai-scheduler",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });
});

describe("CreateShiftSchema", () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
    };

    const result = CreateShiftSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults requiredStaff to 1", () => {
    const input = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
    };

    const result = CreateShiftSchema.parse(input);
    expect(result.requiredStaff).toBe(1);
  });

  it("requires endTime after startTime", () => {
    const invalidInput = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now - 1000,
    };

    const result = CreateShiftSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("AssignShiftSchema", () => {
  it("validates assignment payload", () => {
    const validInput = {
      uid: "user123",
      notes: "Works evening shifts",
    };

    const result = AssignShiftSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("requires uid", () => {
    const invalidInput = {
      notes: "Some notes",
    };

    const result = AssignShiftSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
