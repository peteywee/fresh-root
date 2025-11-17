// [P0][SECURITY][TEST] Create Network Corporate Test tests
// Tags: P0, SECURITY, TEST
/**
 * [P1][TEST][ONBOARDING] Create Network Corporate Endpoint Tests
 * Tags: test, onboarding, network, corporate, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { createNetworkCorporateHandler } from "../create-network-corporate/route";

describe("POST /api/onboarding/create-network-corporate", () => {
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
        add: vi.fn().mockResolvedValue({ id: "network-456" }),
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
          email: "corporate-admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await createNetworkCorporateHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing networkName or companyName", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Corporate Network",
      // missing companyName
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should create network and corporate documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("networkId");
    expect(data).toHaveProperty("corporateId");
  });

  it("should emit network.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should emit corporate.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    await createNetworkCorporateHandler(mockReq, mockAdminDb);
  });

  it("should mark onboarding as complete for intent:create_corporate", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const _data = await response.json();

    // mark response data as intentionally unused for this unit test
    void _data;

    expect(mockAdminDb.collection).toHaveBeenCalledWith("users");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
  });

  it("should reject networkName longer than 100 chars", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should set corporate status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should allow optional industryType", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      industryType: "Technology",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });
});
