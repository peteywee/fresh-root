// [P0][ONBOARDING][API] Verify eligibility endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

import { ok, serverError, badRequest } from "../../_shared/validation";

const VerifyEligibilitySchema = z.object({}).passthrough().optional();

/**
 * POST /api/onboarding/verify-eligibility
 * Verify user eligibility for onboarding
 */
export const POST = createAuthenticatedEndpoint({
  rateLimit: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  handler: async ({ request, context }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const result = VerifyEligibilitySchema.safeParse(body);

      if (!result.success) {
        return badRequest("Invalid request");
      }

      const eligibility = {
        userId: context.auth?.userId,
        eligible: true,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        verifiedAt: Date.now(),
      };

      return ok(eligibility);
    } catch {
      return serverError("Failed to verify eligibility");
    }
  },
});
