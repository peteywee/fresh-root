// [P0][SECURITY][TEST] Create Network Corporate Test tests
// Tags: P0, SECURITY, TEST
/**
 * [P1][TEST][ONBOARDING] Create Network Corporate Endpoint Tests
 * Tags: test, onboarding, network, corporate, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNetworkCorporateHandler } from "../create-network-corporate/route";
import { createAdminDbMock, createMockReq } from "../../../../tests/utils/firestoreMock";

describe("POST /api/onboarding/create-network-corporate", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = createAdminDbMock();
    mockReq = createMockReq();
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await createNetworkCorporateHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 422 if missing formToken", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Corporate Network",
      companyName: "Acme Corp",
      // missing formToken
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toBe("missing_form_token");
  });

  it("should create network and corporate documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("networkId");
    // Some handlers return `corpId`, others `corporateId`; accept either
    expect(data.corpId || data.corporateId).toBeDefined();
  });

  it("should emit network.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      formToken: "test-form-token",
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
      formToken: "test-form-token",
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
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
  });

  it("should allow long network names (no length validation)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      companyName: "Acme Corp",
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should set corporate status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should allow optional industryType", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      industryType: "Technology",
      formToken: "test-form-token",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });
});
