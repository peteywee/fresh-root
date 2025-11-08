// [P1][TEST][TEST] Venue Network Test tests
// Tags: P1, TEST, TEST
// Tests for network-aware fields on venue schemas
import { describe, it, expect } from "vitest";

import { CreateVenueSchema, VenueSchema, ListVenuesQuerySchema } from "../venues";

describe("Venue networkId handling", () => {
  it("accepts an optional networkId when creating a venue", () => {
    const input = { orgId: "o1", name: "V1", networkId: "network-1" };
    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.networkId).toBe("network-1");
  });

  it("rejects an empty string for networkId when creating a venue", () => {
    const input = { orgId: "o1", name: "V1", networkId: "" };
    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("Venue document can include networkId", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Main",
      createdBy: "user1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      networkId: "network-1",
    } as const;

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });

  it("ListVenuesQuerySchema accepts networkId as optional filter", () => {
    const result = ListVenuesQuerySchema.safeParse({
      orgId: "o1",
      networkId: "network-2",
      limit: 10,
    });
    expect(result.success).toBe(true);
  });
});
