// [P0][ONBOARDING][ORG][API] Create organization network endpoint
// Tags: P0, ONBOARDING, ORG, API, SDK_FACTORY

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateNetworkSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateNetworkSchema>;
      const org = {
        id: `org-${Date.now()}`,
        name: typedInput.organizationName,
        type: typedInput.type,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
        status: "active",
      };
      return ok(org);
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
