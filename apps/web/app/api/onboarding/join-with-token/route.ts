// [P0][ONBOARDING][JOIN][API] Join organization with token endpoint
// Tags: P0, ONBOARDING, JOIN, API, SDK_FACTORY

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
      const result = {
        userId: context.auth?.userId,
        token: input.joinToken,
        joinedAt: Date.now(),
        role: "member",
        status: "pending_approval",
      };
      return ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join with token";
      console.error("Join with token failed", {
        error: message,
        userId: context.auth?.userId,
        token: input.joinToken,
      });
      return serverError("Failed to join with token");
    }
  },
});
