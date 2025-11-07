// [P1][INTEGRITY][TEST] Organization Zod schema validation tests
// Tags: P1, INTEGRITY, TEST, zod, validation

import { describe, it, expect } from "vitest";

import {
  Organization,
  OrganizationSize,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
} from "../orgs";

describe("OrganizationSize enum", () => {
  it("should accept valid organization sizes", () => {
    expect(OrganizationSize.parse("1-10")).toBe("1-10");
    expect(OrganizationSize.parse("11-50")).toBe("11-50");
    expect(OrganizationSize.parse("51-200")).toBe("51-200");
    expect(OrganizationSize.parse("201-500")).toBe("201-500");
    expect(OrganizationSize.parse("500+")).toBe("500+");
  });

  it("should reject invalid organization sizes", () => {
    expect(() => OrganizationSize.parse("invalid")).toThrow();
    expect(() => OrganizationSize.parse("0-10")).toThrow();
    expect(() => OrganizationSize.parse("1000+")).toThrow();
  });
});

describe("Organization schema", () => {
  const validOrg = {
    id: "org-123",
    name: "Test Organization",
    description: "A test organization",
    industry: "Technology",
    size: "11-50" as const,
    ownerId: "user-456",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    memberCount: 5,
  };

  it("should validate a complete valid organization", () => {
    const result = Organization.parse(validOrg);
    expect(result).toEqual(validOrg);
  });

  it("should validate organization with minimal required fields", () => {
    const minimal = {
      id: "org-123",
      name: "Minimal Org",
      ownerId: "user-456",
      createdAt: "2025-01-01T00:00:00Z",
      memberCount: 1,
    };
    const result = Organization.parse(minimal);
    expect(result).toMatchObject(minimal);
  });

  it("should reject organization with missing required fields", () => {
    const missingId = { ...validOrg };
    delete (missingId as Record<string, unknown>).id;
    expect(() => Organization.parse(missingId)).toThrow();

    const missingName = { ...validOrg };
    delete (missingName as Record<string, unknown>).name;
    expect(() => Organization.parse(missingName)).toThrow();

    const missingOwnerId = { ...validOrg };
    delete (missingOwnerId as Record<string, unknown>).ownerId;
    expect(() => Organization.parse(missingOwnerId)).toThrow();

    const missingCreatedAt = { ...validOrg };
    delete (missingCreatedAt as Record<string, unknown>).createdAt;
    expect(() => Organization.parse(missingCreatedAt)).toThrow();

    const missingMemberCount = { ...validOrg };
    delete (missingMemberCount as Record<string, unknown>).memberCount;
    expect(() => Organization.parse(missingMemberCount)).toThrow();
  });

  it("should reject organization with invalid field types", () => {
    expect(() => Organization.parse({ ...validOrg, name: 123 })).toThrow();
    expect(() => Organization.parse({ ...validOrg, memberCount: "5" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, size: "invalid" })).toThrow();
  });

  it("should enforce name length constraints (min 1, max 100)", () => {
    expect(() => Organization.parse({ ...validOrg, name: "" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, name: "a".repeat(101) })).toThrow();
    expect(Organization.parse({ ...validOrg, name: "a" }).name).toBe("a");
    expect(Organization.parse({ ...validOrg, name: "a".repeat(100) }).name).toHaveLength(100);
  });

  it("should enforce description max length (500)", () => {
    expect(() => Organization.parse({ ...validOrg, description: "a".repeat(501) })).toThrow();
    const result = Organization.parse({ ...validOrg, description: "a".repeat(500) });
    expect(result.description).toHaveLength(500);
  });

  it("should enforce memberCount is non-negative integer", () => {
    expect(() => Organization.parse({ ...validOrg, memberCount: -1 })).toThrow();
    expect(() => Organization.parse({ ...validOrg, memberCount: 1.5 })).toThrow();
    expect(Organization.parse({ ...validOrg, memberCount: 0 }).memberCount).toBe(0);
    expect(Organization.parse({ ...validOrg, memberCount: 100 }).memberCount).toBe(100);
  });

  it("should validate datetime format for createdAt and updatedAt", () => {
    expect(() => Organization.parse({ ...validOrg, createdAt: "invalid-date" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, createdAt: "2025-01-01" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, updatedAt: "not-a-datetime" })).toThrow();
  });
});

describe("CreateOrganizationInput schema", () => {
  it("should validate valid organization creation input", () => {
    const input = {
      name: "New Organization",
      description: "A new test org",
      industry: "Healthcare",
      size: "11-50" as const,
    };
    const result = CreateOrganizationInput.parse(input);
    expect(result).toEqual(input);
  });

  it("should validate with minimal required fields (name only)", () => {
    const minimal = { name: "Minimal Org" };
    const result = CreateOrganizationInput.parse(minimal);
    expect(result).toEqual(minimal);
  });

  it("should reject input missing required name", () => {
    expect(() => CreateOrganizationInput.parse({})).toThrow();
    expect(() => CreateOrganizationInput.parse({ description: "No name" })).toThrow();
  });

  it("should enforce name length constraints", () => {
    expect(() => CreateOrganizationInput.parse({ name: "" })).toThrow();
    expect(() => CreateOrganizationInput.parse({ name: "a".repeat(101) })).toThrow();
  });

  it("should enforce description max length", () => {
    expect(() =>
      CreateOrganizationInput.parse({ name: "Test", description: "a".repeat(501) }),
    ).toThrow();
  });

  it("should validate size enum", () => {
    expect(CreateOrganizationInput.parse({ name: "Test", size: "51-200" }).size).toBe("51-200");
    expect(() => CreateOrganizationInput.parse({ name: "Test", size: "invalid" })).toThrow();
  });
});

describe("UpdateOrganizationInput schema", () => {
  it("should allow partial updates (all fields optional)", () => {
    expect(UpdateOrganizationInput.parse({})).toEqual({});
    expect(UpdateOrganizationInput.parse({ name: "Updated" })).toEqual({ name: "Updated" });
    expect(UpdateOrganizationInput.parse({ description: "New desc" })).toEqual({
      description: "New desc",
    });
  });

  it("should validate name length when provided", () => {
    expect(() => UpdateOrganizationInput.parse({ name: "" })).toThrow();
    expect(() => UpdateOrganizationInput.parse({ name: "a".repeat(101) })).toThrow();
    expect(UpdateOrganizationInput.parse({ name: "Valid" }).name).toBe("Valid");
  });

  it("should validate description length when provided", () => {
    expect(() => UpdateOrganizationInput.parse({ description: "a".repeat(501) })).toThrow();
  });

  it("should validate size enum when provided", () => {
    expect(UpdateOrganizationInput.parse({ size: "201-500" }).size).toBe("201-500");
    expect(() => UpdateOrganizationInput.parse({ size: "bad-size" })).toThrow();
  });

  it("should allow multiple fields to be updated", () => {
    const update = {
      name: "Updated Name",
      description: "Updated description",
      industry: "Finance",
      size: "500+" as const,
    };
    const result = UpdateOrganizationInput.parse(update);
    expect(result).toEqual(update);
  });
});

describe("OrganizationCreateSchema and OrganizationUpdateSchema aliases", () => {
  it("should be aliases for Create and Update schemas", () => {
    expect(OrganizationCreateSchema).toBe(CreateOrganizationInput);
    expect(OrganizationUpdateSchema).toBe(UpdateOrganizationInput);
  });
});
