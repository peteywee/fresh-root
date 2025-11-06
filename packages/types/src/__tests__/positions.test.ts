// [P1][INTEGRITY][TEST] Position Zod schema validation tests
// Tags: P1, INTEGRITY, TEST, zod, validation, schedules

import { describe, it, expect } from "vitest";

import { PositionSchema, PositionCreateSchema, PositionUpdateSchema } from "../positions";

describe("PositionSchema", () => {
  const validPosition = {
    id: "pos-123",
    orgId: "org-456",
    title: "Shift Manager",
    description: "Oversees operations during shift",
    hourlyRate: 25.5,
    color: "#3B82F6",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    createdBy: "user-789",
  };

  it("should validate a complete valid position", () => {
    const result = PositionSchema.parse(validPosition);
    expect(result).toEqual(validPosition);
  });

  it("should validate position with minimal required fields", () => {
    const minimal = {
      id: "pos-123",
      orgId: "org-456",
      title: "Cashier",
      createdAt: "2025-01-01T00:00:00Z",
      createdBy: "user-789",
    };
    const result = PositionSchema.parse(minimal);
    expect(result).toMatchObject(minimal);
    expect(result.isActive).toBe(true); // default
  });

  it("should reject position with missing required fields", () => {
    expect(() => PositionSchema.parse({ ...validPosition, id: undefined })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, orgId: undefined })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, title: undefined })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, createdAt: undefined })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, createdBy: undefined })).toThrow();
  });

  it("should enforce title length constraints (min 1, max 100)", () => {
    expect(() => PositionSchema.parse({ ...validPosition, title: "" })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, title: "a".repeat(101) })).toThrow();
    expect(PositionSchema.parse({ ...validPosition, title: "A" }).title).toBe("A");
    expect(PositionSchema.parse({ ...validPosition, title: "a".repeat(100) }).title).toHaveLength(
      100,
    );
  });

  it("should enforce description max length (500)", () => {
    expect(() =>
      PositionSchema.parse({ ...validPosition, description: "a".repeat(501) }),
    ).toThrow();
    const result = PositionSchema.parse({
      ...validPosition,
      description: "a".repeat(500),
    });
    expect(result.description).toHaveLength(500);
  });

  it("should validate hourlyRate constraints (0 to 9999.99)", () => {
    expect(() => PositionSchema.parse({ ...validPosition, hourlyRate: -1 })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, hourlyRate: 10000 })).toThrow();
    expect(PositionSchema.parse({ ...validPosition, hourlyRate: 0 }).hourlyRate).toBe(0);
    expect(PositionSchema.parse({ ...validPosition, hourlyRate: 9999.99 }).hourlyRate).toBe(
      9999.99,
    );
    expect(PositionSchema.parse({ ...validPosition, hourlyRate: 15.5 }).hourlyRate).toBe(15.5);
  });

  it("should validate color as hex format", () => {
    expect(PositionSchema.parse({ ...validPosition, color: "#FF0000" }).color).toBe("#FF0000");
    expect(PositionSchema.parse({ ...validPosition, color: "#abc123" }).color).toBe("#abc123");

    expect(() => PositionSchema.parse({ ...validPosition, color: "red" })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, color: "#FF" })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, color: "FF0000" })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, color: "#GGGGGG" })).toThrow();
  });

  it("should default isActive to true", () => {
    const noActive = { ...validPosition };
    delete (noActive as Record<string, unknown>).isActive;
    const result = PositionSchema.parse(noActive);
    expect(result.isActive).toBe(true);
  });

  it("should validate datetime format for timestamps", () => {
    expect(() => PositionSchema.parse({ ...validPosition, createdAt: "invalid-date" })).toThrow();
    expect(() => PositionSchema.parse({ ...validPosition, createdAt: "2025-01-01" })).toThrow();
  });
});

describe("PositionCreateSchema", () => {
  it("should validate valid position creation input", () => {
    const input = {
      orgId: "org-456",
      title: "Server",
      description: "Restaurant server position",
      hourlyRate: 18.0,
      color: "#10B981",
      isActive: true,
    };
    const result = PositionCreateSchema.parse(input);
    expect(result).toEqual(input);
  });

  it("should validate with minimal required fields", () => {
    const minimal = {
      orgId: "org-123",
      title: "Cook",
    };
    const result = PositionCreateSchema.parse(minimal);
    expect(result.orgId).toBe("org-123");
    expect(result.title).toBe("Cook");
    expect(result.isActive).toBe(true); // default
  });

  it("should reject input with missing required fields", () => {
    expect(() => PositionCreateSchema.parse({ title: "Manager" })).toThrow();
    expect(() => PositionCreateSchema.parse({ orgId: "org-123" })).toThrow();
  });

  it("should enforce title length constraints", () => {
    expect(() => PositionCreateSchema.parse({ orgId: "org-123", title: "" })).toThrow();
    expect(() =>
      PositionCreateSchema.parse({ orgId: "org-123", title: "a".repeat(101) }),
    ).toThrow();
  });

  it("should enforce hourlyRate validation", () => {
    expect(() =>
      PositionCreateSchema.parse({ orgId: "org-123", title: "Test", hourlyRate: -1 }),
    ).toThrow();
    expect(() =>
      PositionCreateSchema.parse({
        orgId: "org-123",
        title: "Test",
        hourlyRate: 10000,
      }),
    ).toThrow();
    expect(
      PositionCreateSchema.parse({
        orgId: "org-123",
        title: "Test",
        hourlyRate: 50.25,
      }).hourlyRate,
    ).toBe(50.25);
  });

  it("should validate color hex format", () => {
    expect(
      PositionCreateSchema.parse({
        orgId: "org-123",
        title: "Test",
        color: "#123ABC",
      }).color,
    ).toBe("#123ABC");

    expect(() =>
      PositionCreateSchema.parse({
        orgId: "org-123",
        title: "Test",
        color: "invalid",
      }),
    ).toThrow();
  });
});

describe("PositionUpdateSchema", () => {
  it("should allow partial updates (all fields optional)", () => {
    expect(PositionUpdateSchema.parse({})).toEqual({});
    expect(PositionUpdateSchema.parse({ title: "Updated Title" })).toEqual({
      title: "Updated Title",
    });
    expect(PositionUpdateSchema.parse({ hourlyRate: 30.0 })).toEqual({
      hourlyRate: 30.0,
    });
  });

  it("should validate title length when provided", () => {
    expect(() => PositionUpdateSchema.parse({ title: "" })).toThrow();
    expect(() => PositionUpdateSchema.parse({ title: "a".repeat(101) })).toThrow();
    expect(PositionUpdateSchema.parse({ title: "Valid" }).title).toBe("Valid");
  });

  it("should validate hourlyRate when provided", () => {
    expect(() => PositionUpdateSchema.parse({ hourlyRate: -1 })).toThrow();
    expect(() => PositionUpdateSchema.parse({ hourlyRate: 10000 })).toThrow();
    expect(PositionUpdateSchema.parse({ hourlyRate: 22.5 }).hourlyRate).toBe(22.5);
  });

  it("should validate color when provided", () => {
    expect(PositionUpdateSchema.parse({ color: "#ABCDEF" }).color).toBe("#ABCDEF");
    expect(() => PositionUpdateSchema.parse({ color: "notahex" })).toThrow();
  });

  it("should validate isActive when provided", () => {
    expect(PositionUpdateSchema.parse({ isActive: false }).isActive).toBe(false);
    expect(PositionUpdateSchema.parse({ isActive: true }).isActive).toBe(true);
  });

  it("should allow multiple fields to be updated", () => {
    const update = {
      title: "Senior Manager",
      description: "Experienced manager",
      hourlyRate: 45.0,
      color: "#EF4444",
      isActive: false,
    };
    const result = PositionUpdateSchema.parse(update);
    expect(result).toEqual(update);
  });
});
