// [P1][INTEGRITY][TEST] Venues schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, VENUES
import { describe, it, expect } from "vitest";

import {
  VenueSchema,
  CreateVenueSchema,
  UpdateVenueSchema,
  ListVenuesQuerySchema,
  VenueType,
} from "../venues";

describe("VenueSchema", () => {
  it("validates a complete venue", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Main Stage",
      description: "Primary performance venue",
      type: "indoor" as const,
      capacity: 500,
      isActive: true,
      timezone: "America/New_York",
      contactPhone: "555-0123",
      contactEmail: "venue@example.com",
      notes: "Main performance space",
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });

  it("requires id, orgId, name, createdBy, createdAt, updatedAt", () => {
    const result = VenueSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("id");
      expect(errors).toContain("orgId");
      expect(errors).toContain("name");
      expect(errors).toContain("createdBy");
      expect(errors).toContain("createdAt");
      expect(errors).toContain("updatedAt");
    }
  });

  it("validates venue types", () => {
    const validTypes = ["indoor", "outdoor", "hybrid", "virtual"];
    validTypes.forEach((type) => {
      const result = VenueType.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("validates isActive boolean field", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Venue",
      type: "indoor" as const,
      isActive: true,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);

    const inactiveVenue = { ...venue, isActive: false };
    const inactiveResult = VenueSchema.safeParse(inactiveVenue);
    expect(inactiveResult.success).toBe(true);
  });

  it("validates coordinates range", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Venue",
      type: "indoor" as const,
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });
});

describe("CreateVenueSchema", () => {
  it("validates venue creation", () => {
    const input = {
      orgId: "o1",
      name: "New Venue",
      description: "A new venue",
      type: "indoor" as const,
      capacity: 200,
      contactEmail: "venue@example.com",
    };

    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId and name only", () => {
    const result = CreateVenueSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
      expect(errors).toContain("name");
    }
  });
});

describe("UpdateVenueSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateVenueSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("validates updated fields", () => {
    const result = UpdateVenueSchema.safeParse({
      capacity: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("ListVenuesQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListVenuesQuerySchema.safeParse({
      orgId: "o1",
      limit: 20,
      type: "indoor",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListVenuesQuerySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
    }
  });
});
