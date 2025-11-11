// [P1][TEST][ONBOARDING] Onboarding Schemas Unit Tests
// Tags: P1, TEST, ONBOARDING, VITEST
/**
 * @fileoverview
 * Unit tests for v14 onboarding schemas (CreateOrgOnboardingSchema, CreateCorporateOnboardingSchema, JoinWithTokenSchema, etc.).
 * Validates schema parsing, validation errors, and type inference.
 */
import { describe, it, expect } from "vitest";

import { CreateCorporateOnboardingSchema, JoinWithTokenSchema } from "..";
import { CreateOrgOnboardingSchema, OnboardingStateSchema } from "../onboarding";

describe("onboarding schemas", () => {
  it("parses valid create corporate payload", () => {
    const payload = { corporateName: "Acme Corp", brandName: "Acme" };
    const parsed = CreateCorporateOnboardingSchema.parse(payload);
    expect(parsed.corporateName).toBe("Acme Corp");
  });

  it("rejects empty join token", () => {
    expect(() => JoinWithTokenSchema.parse({ joinToken: "" })).toThrow();
  });
});

describe("CreateOrgOnboardingSchema and OnboardingStateSchema", () => {
  it("parses valid create org payload", () => {
    const payload = {
      orgName: "Acme Org",
      venueName: "Acme HQ",
      formToken: "form-123",
      location: {
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        countryCode: "US",
        timeZone: "America/Los_Angeles",
      },
    };

    const parsed = CreateOrgOnboardingSchema.safeParse(payload);
    expect(parsed.success).toBe(true);

    const state = {
      status: "complete",
      intent: "create_org",
      stage: "network_created",
      primaryNetworkId: "net_1",
      primaryOrgId: "org_1",
      primaryVenueId: "venue_1",
      completedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    const parsedState = OnboardingStateSchema.safeParse(state);
    expect(parsedState.success).toBe(true);
  });
});
