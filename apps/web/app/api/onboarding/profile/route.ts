// [P0][ONBOARDING][PROFILE][API] Profile onboarding endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/profile
 * Complete user profile during onboarding
 */
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const { firstName, lastName, avatar, timezone } = body;

      const profile = {
        userId: context.auth?.userId,
        firstName,
        lastName,
        avatar,
        timezone: timezone || "UTC",
        updatedAt: Date.now(),
        onboardingComplete: true,
      };
      return ok(profile);
    } catch {
      return serverError("Failed to update profile");
    }
  },
});
