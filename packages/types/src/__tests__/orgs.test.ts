// [P1][INTEGRITY][TEST] Organizations schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ORGANIZATIONS
import { describe, it, expect } from "vitest";

import {
  OrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  ListOrganizationsQuerySchema,
  OrganizationSize,
  OrganizationStatus,
  SubscriptionTier,
  OrganizationSettingsSchema,
} from "../orgs";

describe("OrganizationSchema", () => {
  it("validates a complete organization", () => {
    const org = {
      id: "o1",
      name: "Acme Events",
      description: "Event management company",
      industry: "Events",
      size: "11-50" as const,
      status: "active" as const,
      subscriptionTier: "starter" as const,
      ownerId: "u1",
      memberCount: 10,
      settings: {
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        weekStartsOn: 1,
        allowSelfScheduling: true,
        requireShiftConfirmation: true,
        enableGeofencing: false,
        geofenceRadius: 150,
      },
      logoUrl: "https://example.com/logo.png",
      websiteUrl: "https://example.com",
      contactEmail: "info@example.com",
      contactPhone: "+1-555-1234",
      createdAt: Date.now() - 10_000,
      updatedAt: Date.now() - 5_000,
      trialEndsAt: Date.now() + 86_400_000,
      subscriptionEndsAt: Date.now() + 172_800_000,
    };

    const result = OrganizationSchema.safeParse(org);
    expect(result.success).toBe(true);
  });

  it("requires id, name, ownerId, createdAt, updatedAt", () => {
    const result = OrganizationSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("name");
      expect(fields).toContain("ownerId");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts enum values and defaults", () => {
    ["1-10", "11-50", "51-200", "201-500", "500+"].forEach((sz) => {
      expect(OrganizationSize.safeParse(sz).success).toBe(true);
    });
    ["active", "suspended", "trial", "cancelled"].forEach((st) => {
      expect(OrganizationStatus.safeParse(st).success).toBe(true);
    });
    ["free", "starter", "professional", "enterprise"].forEach((tier) => {
      expect(SubscriptionTier.safeParse(tier).success).toBe(true);
    });
  });

  it("validates settings schema", () => {
    const ok = OrganizationSettingsSchema.safeParse({
      timezone: "UTC",
      timeFormat: "24h",
      weekStartsOn: 0,
      geofenceRadius: 200,
    });
    expect(ok.success).toBe(true);
  });
});

describe("CreateOrganizationSchema", () => {
  it("validates creation input", () => {
    const input = {
      name: "New Org",
      description: "Desc",
      settings: { timezone: "UTC" },
      contactEmail: "co@example.com",
    };
    const result = CreateOrganizationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = CreateOrganizationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("UpdateOrganizationSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateOrganizationSchema.safeParse({
      name: "Updated",
      status: "suspended",
      logoUrl: "https://example.com/logo.png",
    });
    expect(result.success).toBe(true);
  });
});

describe("ListOrganizationsQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListOrganizationsQuerySchema.safeParse({ status: "active", size: "11-50", limit: 25 });
    expect(result.success).toBe(true);
  });
});
