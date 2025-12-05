// [P0][ONBOARDING][CORPORATE][API] Create corporate network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { CreateCorporateNetworkSchema } from "@fresh-schedules/types";

/**
 * POST /api/onboarding/create-network-corporate
 * Create a corporate network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateCorporateNetworkSchema,
  handler: async ({ input, context }) => {
    try {
      const { companyName, industry, size } = input;
      const network = {
        id: `network-${Date.now()}`,
        type: "corporate",
        companyName,
        industry,
        size,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };
      return ok(network);
    } catch {
      return serverError("Failed to create corporate network");
    }
  },
});
