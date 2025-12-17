// [P0][ONBOARDING][JOIN][API] Join organization with token endpoint
// Tags: P0, ONBOARDING, JOIN, API, SDK_FACTORY

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { JoinWithTokenSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/join-with-token
 * Join an organization using an invite token
 */
export const POST = createAuthenticatedEndpoint({
  input: JoinWithTokenSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof JoinWithTokenSchema>;
      const result = {
        userId: context.auth?.userId,
        token: typedInput.joinToken,
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
        token: input instanceof Object && "joinToken" in input ? (input as any).joinToken : "unknown",
      });
      return serverError("Failed to join with token");
    }
  },
});
