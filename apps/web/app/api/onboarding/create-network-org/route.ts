// [P0][ONBOARDING][ORG][API] Create organization network endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { z } from "zod";

// Inline schema (copied from packages/types) to avoid mismatched export names
const CreateNetworkOrgPayloadSchema = z.object({
  basics: z.object({
    orgName: z.string().min(1, "Organization name required"),
    hasCorporateAboveYou: z.boolean().default(false),
    segment: z.string().optional(),
  }),
  venue: z
    .object({
      venueName: z.string().min(1, "Venue name required"),
      timeZone: z.string().default("UTC"),
    })
    .optional(),
  formToken: z.string().min(1, "Form token required"),
});

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
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
