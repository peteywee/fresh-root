// [P0][ONBOARDING][CORPORATE][API] Create corporate network endpoint

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateCorporateOnboardingSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-corporate
 * Create a corporate network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateCorporateOnboardingSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateCorporateOnboardingSchema>;
      const { corporateName, brandName, formToken } = typedInput;
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
