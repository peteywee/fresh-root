// [P1][TEST][TEST] Org Network Test tests
// Tags: P1, TEST, TEST
// Tests for network-aware fields on organization schemas
import { describe, it, expect } from "vitest";

import { CreateOrganizationInput, Organization, UpdateOrganizationInput } from "../orgs";

describe("Organization networkId handling", () => {
  it("accepts an optional networkId when creating an organization", () => {
    const input = { name: "Org with network", networkId: "network-1" };
    const result = CreateOrganizationInput.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.networkId).toBe("network-1");
  });

  it("rejects an empty string for networkId", () => {
    const input = { name: "Bad Org", networkId: "" };
    const result = CreateOrganizationInput.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("allows Organization document to include networkId", () => {
    const org = {
      id: "org-1",
      name: "Org",
      ownerId: "user-1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memberCount: 0,
      networkId: "network-1",
    } as const;

    const result = Organization.safeParse(org);
    expect(result.success).toBe(true);
  });

  it("UpdateOrganizationInput accepts networkId when present and rejects empty string", () => {
    expect(UpdateOrganizationInput.safeParse({ networkId: "network-2" }).success).toBe(true);
    expect(UpdateOrganizationInput.safeParse({ networkId: "" }).success).toBe(false);
  });
});
