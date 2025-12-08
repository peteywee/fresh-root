// [P0][ONBOARDING][ORG][API] Create organization network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateNetworkOrgPayloadSchema } from "@fresh-schedules/types";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkOrgPayloadSchema,
  handler: async ({ input, context }) => {
    try {
      const { basics } = input;

      const org = {
        id: `org-${Date.now()}`,
        name: basics.orgName,
        type: "standard",
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };
      return ok(org);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create organization network";
      console.error("Failed to create organization network", { error: message, userId: context.auth?.userId });
      return serverError("Failed to create organization network");
    }
  },
});
