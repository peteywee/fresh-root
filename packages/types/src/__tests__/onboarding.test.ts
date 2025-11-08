// [P1][TEST][TEST] Onboarding Test tests
// Tags: P1, TEST, TEST
import { describe, it, expect } from "vitest";

import {
  CreateCorporateOnboardingSchema,
  JoinWithTokenSchema,
  CreateNetworkOrgSchema,
  CreateNetworkOrgResponseSchema,
} from "..";

describe("onboarding schemas", () => {
  describe("CreateCorporateOnboardingSchema", () => {
    it("parses valid create corporate payload", () => {
      const payload = { corporateName: "Acme Corp", brandName: "Acme" };
      const parsed = CreateCorporateOnboardingSchema.parse(payload);
      expect(parsed.corporateName).toBe("Acme Corp");
      expect(parsed.brandName).toBe("Acme");
    });

    it("parses payload without optional fields", () => {
      const payload = { corporateName: "Acme Corp" };
      const parsed = CreateCorporateOnboardingSchema.parse(payload);
      expect(parsed.corporateName).toBe("Acme Corp");
      expect(parsed.brandName).toBeUndefined();
    });

    it("rejects empty corporate name", () => {
      expect(() => CreateCorporateOnboardingSchema.parse({ corporateName: "" })).toThrow();
    });
  });

  describe("JoinWithTokenSchema", () => {
    it("parses valid join token", () => {
      const payload = { joinToken: "abc123" };
      const parsed = JoinWithTokenSchema.parse(payload);
      expect(parsed.joinToken).toBe("abc123");
    });

    it("rejects empty join token", () => {
      expect(() => JoinWithTokenSchema.parse({ joinToken: "" })).toThrow();
    });
  });

  describe("CreateNetworkOrgSchema", () => {
    it("parses valid network org creation payload", () => {
      const payload = {
        orgName: "My Organization",
        venueName: "Main Venue",
        formToken: "abc123",
      };
      const parsed = CreateNetworkOrgSchema.parse(payload);
      expect(parsed.orgName).toBe("My Organization");
      expect(parsed.venueName).toBe("Main Venue");
      expect(parsed.formToken).toBe("abc123");
    });

    it("rejects missing required fields", () => {
      expect(() => CreateNetworkOrgSchema.parse({})).toThrow();
      expect(() => CreateNetworkOrgSchema.parse({ orgName: "Test" })).toThrow();
      expect(() =>
        CreateNetworkOrgSchema.parse({ orgName: "Test", venueName: "Venue" }),
      ).toThrow();
    });

    it("rejects empty strings", () => {
      expect(() =>
        CreateNetworkOrgSchema.parse({ orgName: "", venueName: "Venue", formToken: "token" }),
      ).toThrow();
    });
  });

  describe("CreateNetworkOrgResponseSchema", () => {
    it("parses valid response", () => {
      const response = {
        ok: true,
        networkId: "net123",
        orgId: "org456",
        venueId: "venue789",
        status: "pending_verification",
      };
      const parsed = CreateNetworkOrgResponseSchema.parse(response);
      expect(parsed.ok).toBe(true);
      expect(parsed.networkId).toBe("net123");
      expect(parsed.orgId).toBe("org456");
      expect(parsed.venueId).toBe("venue789");
      expect(parsed.status).toBe("pending_verification");
    });

    it("rejects invalid response", () => {
      expect(() =>
        CreateNetworkOrgResponseSchema.parse({ ok: false, networkId: "net123" }),
      ).toThrow();
    });
  });
});

