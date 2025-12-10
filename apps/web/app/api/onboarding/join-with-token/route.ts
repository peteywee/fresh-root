// [P0][ONBOARDING][JOIN][API] Join organization with token endpoint
// Tags: P0, ONBOARDING, JOIN, API, SDK_FACTORY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { JoinWithTokenSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

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
        joinToken: input.joinToken,
        joinedAt: Date.now(),
        role: "member",
        status: "pending_approval",
      };
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join with token";
      console.error("Join with token failed", {
        error: message,
        userId: context.auth?.userId,
        token: input.joinToken,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
    }
  },
});
