// [P0][ONBOARDING][CORPORATE][API] Create corporate network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-corporate
 * Create a corporate network
 */
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const { companyName, industry, size } = body;
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
