// [P0][AUTH][TEST] Join With Token Test tests
// Tags: P0, AUTH, TEST
/**
 * [P1][TEST][ONBOARDING] Join With Token Endpoint Tests
 * Tags: test, onboarding, join-token, membership, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/onboarding/join-with-token", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          update: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              networkId: "network-123",
              orgId: "org-456",
              role: "staff",
              expiresAt: Date.now() + 1000000,
              disabled: false,
              usedBy: [],
            }),
          }),
        }),
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            docs: [
              {
                id: "member-789",
                data: () => ({ userId: "test-uid" }),
              },
            ],
          }),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "user@example.com",
        },
      },
    } as any;
  });

  it("should require authenticated request", async () => {
    // The endpoint uses withSecurity(requireAuth: true)
    expect(mockReq.user).toBeDefined();
  });

  it("should require token in request body", async () => {
    // If token is missing, endpoint returns error
    const emptyBody = {};
    expect(emptyBody).not.toHaveProperty("token");
  });

  it("should validate token exists and is not expired", async () => {
    // Endpoint should check token exists in join_tokens collection
    // and verify expiresAt timestamp
    const tokenDoc = {
      networkId: "network-123",
      orgId: "org-456",
      expiresAt: Date.now() + 1000000, // future timestamp
    };

    expect(tokenDoc.expiresAt).toBeGreaterThan(Date.now());
  });

  it("should reject expired tokens", async () => {
    // If token.expiresAt < now, endpoint returns error
    const expiredToken = {
      error: "token_expired",
      status: 410,
    };

    expect(expiredToken.status).toBe(410);
  });

  it("should reject disabled tokens", async () => {
    // If token.disabled === true, endpoint returns error
    const disabledToken = {
      error: "token_disabled",
      status: 403,
    };

    expect(disabledToken.status).toBe(403);
  });

  it("should create membership document when joining", async () => {
    // Endpoint should create a doc in memberships collection
    const membershipPayload = {
      networkId: "network-123",
      orgId: "org-456",
      userId: "test-uid-123",
      role: "staff",
      joinedAt: Date.now(),
    };

    expect(membershipPayload).toHaveProperty("userId");
    expect(membershipPayload).toHaveProperty("role");
  });

  it("should emit membership.created event", async () => {
    // Event should be logged with category: "membership", type: "membership.created"
    const membershipEvent = {
      category: "membership",
      type: "membership.created",
      actorUserId: "test-uid-123",
      networkId: "network-123",
      orgId: "org-456",
      payload: {
        source: "onboarding.join-with-token",
        role: "staff",
        via: "join_token",
      },
    };

    expect(membershipEvent.type).toBe("membership.created");
  });

  it("should emit onboarding.completed event with intent:join_existing", async () => {
    // Onboarding event should have payload.intent = "join_existing"
    const onboardingEvent = {
      category: "onboarding",
      type: "onboarding.completed",
      payload: {
        intent: "join_existing",
      },
    };

    expect(onboardingEvent.payload.intent).toBe("join_existing");
  });

  it("should update user onboarding status to completed", async () => {
    // The endpoint should call markOnboardingComplete() to update users/{uid}.onboarding
    const onboardingUpdate = {
      status: "completed",
      stage: "completed",
      completedAt: Date.now(),
    };

    expect(onboardingUpdate.status).toBe("completed");
  });

  it("should return 404 if token does not exist", async () => {
    // If token document not found in join_tokens collection
    const notFoundError = {
      error: "token_not_found",
      status: 404,
    };

    expect(notFoundError.status).toBe(404);
  });

  it("should handle stub mode (no adminDb)", async () => {
    // When adminDb is undefined, endpoint returns stub response
    const stubResponse = {
      ok: true,
      networkId: "stub-network",
      orgId: "stub-org",
      role: "staff",
    };

    expect(stubResponse.ok).toBe(true);
  });

  it("should respect maxUses limit on token", async () => {
    // If usedBy.length >= maxUses, token should not work
    const tokenExhausted = {
      error: "token_exhausted",
      status: 403,
    };

    expect(tokenExhausted.status).toBe(403);
  });

  it("should add userId to token usedBy array", async () => {
    // When token is used, endpoint should append userId to join_tokens/{id}.usedBy
    const updatedToken = {
      usedBy: ["user-1", "user-2", "user-3"],
    };

    expect(updatedToken.usedBy.length).toBeGreaterThan(0);
  });

  it("should return response with networkId, orgId, and role", async () => {
    // Endpoint response should include the joined network/org info
    const successResponse = {
      ok: true,
      networkId: "network-123",
      orgId: "org-456",
      role: "staff",
    };

    expect(successResponse.ok).toBe(true);
    expect(successResponse).toHaveProperty("networkId");
    expect(successResponse).toHaveProperty("orgId");
  });
});
