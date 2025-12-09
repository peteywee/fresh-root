// [P0][ONBOARDING][JOIN][API] Join organization with token endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { JoinWithTokenSchema } from "@fresh-schedules/types";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/join-with-token
 * Join an organization using an invite token
 */
export const POST = createAuthenticatedEndpoint({
  input: JoinWithTokenSchema,
  handler: async ({ input, context }) => {
    try {
      const { joinToken } = input;

      const result = {
        userId: context.auth?.userId,
        joinToken,
        joinedAt: Date.now(),
        role: "member",
      };
      return ok(result);
    } catch {
      return serverError("Failed to join organization");
    }
  },
});
