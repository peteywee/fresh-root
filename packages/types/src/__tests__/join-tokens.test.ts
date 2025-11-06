// [P1][INTEGRITY][TEST] Join tokens schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, JOIN_TOKENS
import { describe, it, expect } from "vitest";

import {
  JoinTokenSchema,
  CreateJoinTokenSchema,
  UpdateJoinTokenSchema,
  RedeemJoinTokenSchema,
  ListJoinTokensQuerySchema,
  JoinTokenStatus,
} from "../join-tokens";
import { MembershipRole } from "../memberships";

describe("JoinTokenSchema", () => {
  it("validates a full join token", () => {
    const token = {
      id: "t1",
      orgId: "o1",
      token: "1234567890abcdef",
      defaultRoles: ["staff"] as Array<typeof MembershipRole._type>,
      status: "active" as const,
      maxUses: 10,
      currentUses: 1,
      usedBy: ["u1"],
      expiresAt: Date.now() + 3600_000,
      description: "Invite for seasonal staff",
      createdBy: "admin1",
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 1000,
    };
    const result = JoinTokenSchema.safeParse(token);
    expect(result.success).toBe(true);
  });

  it("requires core fields", () => {
    const result = JoinTokenSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("orgId");
      expect(fields).toContain("token");
      expect(fields).toContain("defaultRoles");
      expect(fields).toContain("createdBy");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts status enum values", () => {
    ["active", "used", "expired", "revoked"].forEach((s) => {
      expect(JoinTokenStatus.safeParse(s).success).toBe(true);
    });
  });
});

describe("CreateJoinTokenSchema", () => {
  it("validates creation input", () => {
    const input = {
      orgId: "o1",
      defaultRoles: ["staff"],
      maxUses: 5,
      description: "Temporary",
    };
    const result = CreateJoinTokenSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId and defaultRoles", () => {
    const result = CreateJoinTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("UpdateJoinTokenSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateJoinTokenSchema.safeParse({ status: "revoked", maxUses: 100 });
    expect(result.success).toBe(true);
  });
});

describe("RedeemJoinTokenSchema", () => {
  it("requires a token string", () => {
    const ok = RedeemJoinTokenSchema.safeParse({ token: "1234567890abcdef" });
    expect(ok.success).toBe(true);
    const bad = RedeemJoinTokenSchema.safeParse({ token: "short" });
    expect(bad.success).toBe(false);
  });
});

describe("ListJoinTokensQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListJoinTokensQuerySchema.safeParse({ orgId: "o1", status: "active", limit: 20 });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListJoinTokensQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
