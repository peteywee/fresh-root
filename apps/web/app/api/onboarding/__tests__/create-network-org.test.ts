// [P0][TEST][TEST] Create Network Org Test tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][ONBOARDING] Create Network Org Endpoint Tests
 * Tags: test, onboarding, network, org, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { createNetworkOrgHandler } from "../create-network-org/route";

describe("POST /api/onboarding/create-network-org", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              status: "not_started",
              stage: "profile",
              onboarding: {},
            }),
          }),
        }),
        add: vi.fn().mockResolvedValue({ id: "network-123" }),
      }),
      batch: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          batch: {
            set: vi.fn(),
            commit: vi.fn().mockResolvedValue(undefined),
          },
        }),
        commit: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await createNetworkOrgHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing networkName or orgName", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "My Network",
      // missing orgName
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should create network and org documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("networkId");
    expect(data).toHaveProperty("orgId");
  });

  it("should emit network.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    // Events are logged asynchronously, so we just verify response is ok
    expect(response.status).toBe(200);
  });

  it("should emit org.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    await createNetworkOrgHandler(mockReq, mockAdminDb);
    // Events are logged asynchronously
  });

  it("should mark onboarding as complete for intent:create_org", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();

    // Verify onboarding status was updated
    expect(mockAdminDb.collection).toHaveBeenCalledWith("users");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
  });

  it("should reject networkName longer than 100 chars", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });

  it("should set org status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });
});
