// [P0][ONBOARDING][ORG][API] Create organization network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { CreateNetworkOrgPayloadSchema } from "@fresh-schedules/types";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkOrgPayloadSchema,
  handler: async ({ input, context }) => {
    try {
      const { basics, venue } = input;

      const org = {
        id: `org-${Date.now()}`,
        name: basics.orgName,
        hasCorporateAboveYou: basics.hasCorporateAboveYou,
        segment: basics.segment,
        venue: venue
          ? {
              name: venue.venueName,
              timeZone: venue.timeZone,
            }
          : undefined,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };
      return ok(org);
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
