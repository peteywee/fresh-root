// [P0][ONBOARDING][CORPORATE][API] Create corporate network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateCorporateOnboardingSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-corporate
 * Create a corporate network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateCorporateOnboardingSchema,
  handler: async ({ input, context }) => {
    try {
      const { corporateName, brandName, formToken } = input;
      const network = {
        id: `network-${Date.now()}`,
        type: "corporate",
        corporateName,
        brandName,
        formToken,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };
      return ok(network);
    } catch {
      return serverError("Failed to create corporate network");
    }
  },
});
