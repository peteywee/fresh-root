// [P1][TEST][TEST] Onboarding Test tests
// Tags: P1, TEST, TEST
import { describe, it, expect } from "vitest";

import { CreateCorporateOnboardingSchema, JoinWithTokenSchema } from "..";

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
