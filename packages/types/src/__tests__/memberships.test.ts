// [P1][INTEGRITY][TEST] Memberships schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, MEMBERSHIPS
import { describe, expect, it } from "vitest";

import {
  MembershipSchema,
  CreateMembershipSchema,
  UpdateMembershipSchema,
  MembershipRole,
  MembershipStatus,
} from "../memberships";

describe("MembershipSchema", () => {
  it("validates a complete membership", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
      status: "active" as const,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });

  it("requires uid", () => {
    const invalidMembership = {
      orgId: "org456",
      roles: ["staff" as const],
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(invalidMembership);
    expect(result.success).toBe(false);
  });

  it("requires at least one role", () => {
    const invalidMembership = {
      uid: "user123",
      orgId: "org456",
      roles: [],
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(invalidMembership);
    expect(result.success).toBe(false);
  });

  it("accepts multiple roles", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["manager" as const, "scheduler" as const],
      status: "active" as const,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });

  it("accepts optional invitedBy and invitedAt", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
      status: "invited" as const,
      invitedBy: "admin789",
      invitedAt: Date.now() - 1000,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });
});

describe("CreateMembershipSchema", () => {
  it("validates creation payload", () => {
    const validInput = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
    };

    const result = CreateMembershipSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults status to invited", () => {
    const input = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
    };

    const result = CreateMembershipSchema.parse(input);
    expect(result.status).toBe("invited");
  });

  it("requires at least one role", () => {
    const invalidInput = {
      uid: "user123",
      orgId: "org456",
      roles: [],
    };

    const result = CreateMembershipSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("UpdateMembershipSchema", () => {
  it("allows updating roles", () => {
    const validUpdate = {
      roles: ["manager" as const, "staff" as const],
    };

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows updating status", () => {
    const validUpdate = {
      status: "suspended" as const,
    };

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rejects empty roles array", () => {
    const invalidUpdate = {
      roles: [],
    };

    const result = UpdateMembershipSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("allows partial updates", () => {
    const validUpdate = {};

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});

describe("MembershipRole enum", () => {
  it("accepts valid roles", () => {
    const roles = ["org_owner", "admin", "manager", "scheduler", "staff"];
    roles.forEach((role) => {
      const result = MembershipRole.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid roles", () => {
    const result = MembershipRole.safeParse("super_admin");
    expect(result.success).toBe(false);
  });
});

describe("MembershipStatus enum", () => {
  it("accepts valid statuses", () => {
    const statuses = ["active", "suspended", "invited", "removed"];
    statuses.forEach((status) => {
      const result = MembershipStatus.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid statuses", () => {
    const result = MembershipStatus.safeParse("banned");
    expect(result.success).toBe(false);
  });
});
