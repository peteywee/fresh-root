// [P1][INTEGRITY][TEST] Zones schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ZONES
import { describe, it, expect } from "vitest";

import { ZoneSchema, CreateZoneSchema, UpdateZoneSchema, ListZonesQuerySchema } from "../zones";

describe("ZoneSchema", () => {
  it("validates a complete zone", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone A",
      description: "Production zone",
      type: "production" as const,
      capacity: 50,
      floor: "1",
      isActive: true,
      color: "#FF5733",
      notes: "Main production area",
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = ZoneSchema.safeParse(zone);
    expect(result.success).toBe(true);
  });

  it("requires id, orgId, venueId, name, createdBy, createdAt, updatedAt", () => {
    const result = ZoneSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("id");
      expect(errors).toContain("orgId");
      expect(errors).toContain("venueId");
      expect(errors).toContain("name");
      expect(errors).toContain("createdBy");
      expect(errors).toContain("createdAt");
      expect(errors).toContain("updatedAt");
    }
  });

  it("validates isActive boolean field", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone",
      isActive: true,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const validValues = [true, false];
    validValues.forEach((isActive) => {
      const zoneWithStatus = { ...zone, isActive };
      const result = ZoneSchema.safeParse(zoneWithStatus);
      expect(result.success).toBe(true);
    });
  });

  it("validates capacity is positive", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone",
      capacity: -10,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = ZoneSchema.safeParse(zone);
    expect(result.success).toBe(false);
  });
});

describe("CreateZoneSchema", () => {
  it("validates zone creation", () => {
    const input = {
      orgId: "o1",
      venueId: "v1",
      name: "New Zone",
      description: "A new zone",
      type: "storage" as const,
      capacity: 30,
    };

    const result = CreateZoneSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId, venueId, and name", () => {
    const result = CreateZoneSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
      expect(errors).toContain("venueId");
      expect(errors).toContain("name");
    }
  });
});

describe("UpdateZoneSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateZoneSchema.safeParse({ name: "Updated Zone" });
    expect(result.success).toBe(true);
  });
});

describe("ListZonesQuerySchema", () => {
  it("validates query with venueId", () => {
    const result = ListZonesQuerySchema.safeParse({
      orgId: "o1",
      venueId: "v1",
      limit: 50,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListZonesQuerySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
    }
  });
});
