import { describe, it, expect } from "vitest";
import { CreateScheduleSchema } from "./schedules";

describe("CreateScheduleSchema", () => {
  it("should validate a valid schedule", () => {
    const validSchedule = {
      orgId: "org-123",
      name: "Summer Schedule",
      startDate: 1625097600000,
      endDate: 1627776000000,
    };

    const result = CreateScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("should fail if end date is before start date", () => {
    const invalidSchedule = {
      orgId: "org-123",
      name: "Invalid Schedule",
      startDate: 1627776000000,
      endDate: 1625097600000, // Before start
    };

    const result = CreateScheduleSchema.safeParse(invalidSchedule);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("End date must be after start date");
    }
  });

  it("should fail if required fields are missing", () => {
    const invalidSchedule = {
      name: "Missing Org",
      // orgId missing
      startDate: 1625097600000,
      endDate: 1627776000000,
    };

    const result = CreateScheduleSchema.safeParse(invalidSchedule);
    expect(result.success).toBe(false);
  });
});
