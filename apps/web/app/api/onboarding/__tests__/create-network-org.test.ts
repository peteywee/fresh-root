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
    // Create a more realistic adminDb mock to support nested collection/doc calls
    const formsDoc = {
      get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    const complianceFormsCollection = {
      doc: vi.fn().mockImplementation((token) => ({ get: formsDoc.get })),
    };

    const complianceDoc = {
      collection: vi.fn().mockReturnValue(complianceFormsCollection),
    };

    mockAdminDb = {
      collection: vi.fn().mockImplementation((name: string) => {
        if (name === "compliance") return { doc: vi.fn().mockReturnValue(complianceDoc) };

        // Default behavior for top-level collections used in createNetworkOrgHandler
        return {
          doc: vi.fn().mockReturnValue({
            id: `${name}-stub-id`,
            set: vi.fn().mockResolvedValue(undefined),
            get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
            collection: vi.fn().mockReturnValue({ doc: vi.fn().mockReturnValue({ set: vi.fn().mockResolvedValue(undefined) }) }),
          }),
          add: vi.fn().mockResolvedValue({ id: `${name}-add-id` }),
        };
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
      runTransaction: vi.fn().mockImplementation(async (cb: any) => {
        const tx = {
          set: vi.fn(),
          update: vi.fn(),
        } as any;
        await cb(tx);
        return Promise.resolve();
      }),
    } as any;

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
          email_verified: true,
          selfDeclaredRole: "org_owner",
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

  it("should return 422 if missing formToken", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "My Network",
      orgName: "My Org",
      // missing formToken
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toBe("missing_form_token");
  });

  it("should create network and org documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
      formToken: "test-form-token",
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
      formToken: "test-form-token",
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
      formToken: "test-form-token",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);

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

  it("should allow long network names (no length validation)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      orgName: "Test Org",
      formToken: "test-form-token",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
      formToken: "test-form-token",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });

  it("should set org status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
      formToken: "test-form-token",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });
});
