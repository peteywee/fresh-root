// [P1][INTEGRITY][TEST] Schedules schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, SCHEDULES
import { describe, expect, it } from "vitest";

import { ScheduleSchema, CreateScheduleSchema, PublishScheduleSchema } from "../schedules";

describe("ScheduleSchema", () => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  it("validates a complete schedule", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Week 1 Schedule",
      startDate: now,
      endDate: now + oneWeek,
      status: "draft" as const,
      visibility: "team" as const,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("requires endDate after startDate", () => {
    const invalidSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Invalid Schedule",
      startDate: now,
      endDate: now - 1000,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(invalidSchedule);
    expect(result.success).toBe(false);
  });

  it("validates schedule with statistics", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Week 1 Schedule",
      startDate: now,
      endDate: now + oneWeek,
      stats: {
        totalShifts: 50,
        assignedShifts: 45,
        unassignedShifts: 5,
        totalHours: 400,
        totalCost: 8000,
        conflictCount: 2,
      },
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("validates AI-generated schedule", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "AI Generated Schedule",
      startDate: now,
      endDate: now + oneWeek,
      aiGenerated: true,
      aiModel: "gemini-1.5-pro",
      aiGeneratedAt: now,
      createdBy: "ai-scheduler",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });
});

describe("CreateScheduleSchema", () => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      name: "New Schedule",
      startDate: now,
      endDate: now + oneWeek,
    };

    const result = CreateScheduleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults visibility to team", () => {
    const input = {
      orgId: "org456",
      name: "New Schedule",
      startDate: now,
      endDate: now + oneWeek,
    };

    const result = CreateScheduleSchema.parse(input);
    expect(result.visibility).toBe("team");
  });

  it("requires endDate after startDate", () => {
    const invalidInput = {
      orgId: "org456",
      name: "Invalid Schedule",
      startDate: now,
      endDate: now - 1000,
    };

    const result = CreateScheduleSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("PublishScheduleSchema", () => {
  it("validates publish payload", () => {
    const validInput = {
      notifyStaff: true,
      message: "New schedule is available!",
    };

    const result = PublishScheduleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults notifyStaff to true", () => {
    const input = {};

    const result = PublishScheduleSchema.parse(input);
    expect(result.notifyStaff).toBe(true);
  });
});
