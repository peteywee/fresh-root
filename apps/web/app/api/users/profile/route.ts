// [P0][USERS][PROFILE][API] User profile endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { ok, serverError } from "../../_shared/validation";

/**
 * GET /api/users/profile
 * Get authenticated user profile
 */
export const GET = createAuthenticatedEndpoint({
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  handler: async ({ context }) => {
    try {
      const profile = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        customClaims: context.auth?.customClaims,
      };
      return ok(profile);
    } catch {
      return serverError("Failed to fetch profile");
    }
  },
});
