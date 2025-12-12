// [P0][ONBOARDING][PROFILE][API] Profile onboarding endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { OnboardingProfileSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/profile
 * Complete user profile during onboarding
 */
export const POST = createAuthenticatedEndpoint({
  input: OnboardingProfileSchema,
  handler: async ({ input, context }) => {
    try {
      const { firstName, lastName, avatar, timezone } = input;

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
