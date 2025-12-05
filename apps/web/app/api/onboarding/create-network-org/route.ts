// [P0][ONBOARDING][ORG][API] Create organization network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network
 */
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const { organizationName, type } = body;

      const org = {
        id: `org-${Date.now()}`,
        name: organizationName,
        type: type || "standard",
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };
      return ok(org);
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
