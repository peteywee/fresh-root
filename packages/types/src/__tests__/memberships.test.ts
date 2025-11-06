// [P1][INTEGRITY][TEST] Membership Zod schema validation tests
// Tags: P1, INTEGRITY, TEST, zod, validation, rbac

import { describe, it, expect } from "vitest";

import { MembershipRecord, MembershipCreateSchema, MembershipUpdateSchema } from "../memberships";

describe("MembershipRecord schema", () => {
  const validMembership = {
    id: "mem-123",
    orgId: "org-456",
    uid: "user-789",
    roles: ["admin", "manager"],
    joinedAt: "2025-01-01T00:00:00Z",
    mfaVerified: true,
    invitedBy: "user-abc",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  };

  it("should validate a complete valid membership record", () => {
    const result = MembershipRecord.parse(validMembership);
    expect(result).toEqual(validMembership);
  });

  it("should validate membership with minimal required fields", () => {
    const minimal = {
      id: "mem-123",
      orgId: "org-456",
      uid: "user-789",
      roles: ["staff"],
      joinedAt: "2025-01-01T00:00:00Z",
      createdAt: "2025-01-01T00:00:00Z",
    };
    const result = MembershipRecord.parse(minimal);
    expect(result).toMatchObject(minimal);
    expect(result.mfaVerified).toBe(false); // default
  });

  it("should reject membership with missing required fields", () => {
    const missingId = { ...validMembership };
    delete (missingId as Record<string, unknown>).id;
    expect(() => MembershipRecord.parse(missingId)).toThrow();

    const missingOrgId = { ...validMembership };
    delete (missingOrgId as Record<string, unknown>).orgId;
    expect(() => MembershipRecord.parse(missingOrgId)).toThrow();

    const missingUid = { ...validMembership };
    delete (missingUid as Record<string, unknown>).uid;
    expect(() => MembershipRecord.parse(missingUid)).toThrow();

    const missingRoles = { ...validMembership };
    delete (missingRoles as Record<string, unknown>).roles;
    expect(() => MembershipRecord.parse(missingRoles)).toThrow();
  });

  it("should reject membership with empty required strings", () => {
    expect(() => MembershipRecord.parse({ ...validMembership, id: "" })).toThrow();
    expect(() => MembershipRecord.parse({ ...validMembership, orgId: "" })).toThrow();
    expect(() => MembershipRecord.parse({ ...validMembership, uid: "" })).toThrow();
  });

  it("should require at least one role", () => {
    expect(() => MembershipRecord.parse({ ...validMembership, roles: [] })).toThrow();
  });

  it("should validate role enum values", () => {
    const validRoles = ["org_owner", "admin", "manager", "scheduler", "staff"];
    validRoles.forEach((role) => {
      expect(MembershipRecord.parse({ ...validMembership, roles: [role] }).roles).toContain(role);
    });

    expect(() => MembershipRecord.parse({ ...validMembership, roles: ["invalid_role"] })).toThrow();
  });

  it("should validate datetime format for timestamps", () => {
    expect(() =>
      MembershipRecord.parse({ ...validMembership, joinedAt: "invalid-date" }),
    ).toThrow();
    expect(() => MembershipRecord.parse({ ...validMembership, createdAt: "2025-01-01" })).toThrow();
  });

  it("should default mfaVerified to false", () => {
    const noMfa = { ...validMembership };
    delete (noMfa as Record<string, unknown>).mfaVerified;
    const result = MembershipRecord.parse(noMfa);
    expect(result.mfaVerified).toBe(false);
  });
});

describe("MembershipCreateSchema", () => {
  it("should validate valid membership creation input", () => {
    const input = {
      uid: "user-123",
      roles: ["manager", "scheduler"],
      mfaVerified: false,
    };
    const result = MembershipCreateSchema.parse(input);
    expect(result).toEqual(input);
  });

  it("should validate with minimal required fields", () => {
    const minimal = {
      uid: "user-123",
      roles: ["staff"],
    };
    const result = MembershipCreateSchema.parse(minimal);
    expect(result.uid).toBe("user-123");
    expect(result.roles).toEqual(["staff"]);
    expect(result.mfaVerified).toBe(false); // default
  });

  it("should reject input with missing required uid", () => {
    expect(() => MembershipCreateSchema.parse({ roles: ["staff"] })).toThrow();
  });

  it("should reject input with empty uid", () => {
    expect(() => MembershipCreateSchema.parse({ uid: "", roles: ["staff"] })).toThrow();
  });

  it("should reject input with missing or empty roles", () => {
    expect(() => MembershipCreateSchema.parse({ uid: "user-123" })).toThrow();
    expect(() => MembershipCreateSchema.parse({ uid: "user-123", roles: [] })).toThrow();
  });

  it("should reject invalid role values", () => {
    expect(() => MembershipCreateSchema.parse({ uid: "user-123", roles: ["invalid"] })).toThrow();
  });

  it("should reject org_owner role assignment via API", () => {
    expect(() => MembershipCreateSchema.parse({ uid: "user-123", roles: ["org_owner"] })).toThrow(
      /org_owner role cannot be assigned via API/,
    );

    expect(() =>
      MembershipCreateSchema.parse({ uid: "user-123", roles: ["admin", "org_owner"] }),
    ).toThrow(/org_owner role cannot be assigned via API/);
  });

  it("should enforce maximum 5 roles", () => {
    expect(() =>
      MembershipCreateSchema.parse({
        uid: "user-123",
        roles: ["admin", "manager", "scheduler", "staff", "admin", "manager"],
      }),
    ).toThrow(/Maximum 5 roles/);
  });

  it("should allow non-org_owner roles", () => {
    const valid = {
      uid: "user-123",
      roles: ["admin", "manager", "scheduler"],
    };
    expect(MembershipCreateSchema.parse(valid).roles).toEqual(["admin", "manager", "scheduler"]);
  });
});

describe("MembershipUpdateSchema", () => {
  it("should allow partial updates (all fields optional)", () => {
    expect(MembershipUpdateSchema.parse({})).toEqual({});
    expect(MembershipUpdateSchema.parse({ roles: ["manager"] })).toEqual({
      roles: ["manager"],
    });
    expect(MembershipUpdateSchema.parse({ mfaVerified: true })).toEqual({
      mfaVerified: true,
    });
  });

  it("should validate roles when provided", () => {
    const update = { roles: ["admin", "scheduler"] };
    expect(MembershipUpdateSchema.parse(update).roles).toEqual(["admin", "scheduler"]);
  });

  it("should require at least one role if roles are provided", () => {
    expect(() => MembershipUpdateSchema.parse({ roles: [] })).toThrow(
      /At least one role is required/,
    );
  });

  it("should reject org_owner role in updates", () => {
    expect(() => MembershipUpdateSchema.parse({ roles: ["org_owner"] })).toThrow(/org_owner/);

    expect(() => MembershipUpdateSchema.parse({ roles: ["admin", "org_owner"] })).toThrow(
      /org_owner/,
    );
  });

  it("should enforce maximum 5 roles when provided", () => {
    expect(() =>
      MembershipUpdateSchema.parse({
        roles: ["admin", "manager", "scheduler", "staff", "admin", "manager"],
      }),
    ).toThrow(/Maximum 5 roles/);
  });

  it("should validate role enum values", () => {
    expect(() => MembershipUpdateSchema.parse({ roles: ["invalid_role"] })).toThrow();

    expect(MembershipUpdateSchema.parse({ roles: ["manager"] }).roles).toEqual(["manager"]);
  });

  it("should allow mfaVerified updates", () => {
    expect(MembershipUpdateSchema.parse({ mfaVerified: true }).mfaVerified).toBe(true);
    expect(MembershipUpdateSchema.parse({ mfaVerified: false }).mfaVerified).toBe(false);
  });

  it("should allow updating both roles and mfaVerified", () => {
    const update = {
      roles: ["admin"],
      mfaVerified: true,
    };
    const result = MembershipUpdateSchema.parse(update);
    expect(result).toEqual(update);
  });
});
