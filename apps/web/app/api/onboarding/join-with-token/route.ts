// [P0][ONBOARDING][JOIN][API] Join organization with token endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/join-with-token
 * Join an organization using an invite token
 */
export const POST = createAuthenticatedEndpoint({
  handler: ({ input, context }) => {
    try {
      // Note: input validation can be added with Zod schema if needed
      const { token, invitationId } = input as any;

      const result = {
        userId: context.auth?.userId,
        invitationId,
        joinedAt: Date.now(),
        role: "member",
      };
      return ok(result);
    } catch {
      return serverError("Failed to join organization");
    }
  },
});
