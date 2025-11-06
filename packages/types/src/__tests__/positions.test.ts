// [P1][INTEGRITY][TEST] Positions schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, POSITIONS
import { describe, expect, it } from "vitest";

import {
  PositionSchema,
  CreatePositionSchema,
  UpdatePositionSchema,
  PositionType,
  SkillLevel,
} from "../positions";

describe("PositionSchema", () => {
  it("validates a complete position", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Event Staff",
      type: "part_time" as const,
      skillLevel: "entry" as const,
      isActive: true,
      requiredCertifications: [],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("validates position with hourly rate", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Senior Manager",
      type: "full_time" as const,
      skillLevel: "expert" as const,
      hourlyRate: 35.5,
      isActive: true,
      requiredCertifications: ["CPR", "First Aid"],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      type: "part_time" as const,
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      hourlyRate: -10,
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });

  it("validates hex color format", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      color: "#FF5733",
      isActive: true,
      requiredCertifications: [],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      color: "red",
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });
});

describe("CreatePositionSchema", () => {
  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      name: "Security Staff",
    };

    const result = CreatePositionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults type to part_time", () => {
    const input = {
      orgId: "org456",
      name: "Staff",
    };

    const result = CreatePositionSchema.parse(input);
    expect(result.type).toBe("part_time");
  });

  it("defaults skillLevel to entry", () => {
    const input = {
      orgId: "org456",
      name: "Staff",
    };

    const result = CreatePositionSchema.parse(input);
    expect(result.skillLevel).toBe("entry");
  });

  it("enforces max name length", () => {
    const invalidInput = {
      orgId: "org456",
      name: "A".repeat(101),
    };

    const result = CreatePositionSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("UpdatePositionSchema", () => {
  it("allows updating name", () => {
    const validUpdate = {
      name: "Updated Position Name",
    };

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows updating isActive", () => {
    const validUpdate = {
      isActive: false,
    };

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows partial updates", () => {
    const validUpdate = {};

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("validates hourly rate when provided", () => {
    const invalidUpdate = {
      hourlyRate: -5,
    };

    const result = UpdatePositionSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe("PositionType enum", () => {
  it("accepts valid types", () => {
    const types = ["full_time", "part_time", "contractor", "volunteer"];
    types.forEach((type) => {
      const result = PositionType.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid types", () => {
    const result = PositionType.safeParse("intern");
    expect(result.success).toBe(false);
  });
});

describe("SkillLevel enum", () => {
  it("accepts valid skill levels", () => {
    const levels = ["entry", "intermediate", "advanced", "expert"];
    levels.forEach((level) => {
      const result = SkillLevel.safeParse(level);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid skill levels", () => {
    const result = SkillLevel.safeParse("beginner");
    expect(result.success).toBe(false);
  });
});
