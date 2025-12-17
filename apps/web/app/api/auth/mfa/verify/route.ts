// [P0][AUTH][API] MFA verify endpoint
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { ok, serverError, badRequest } from "../../../_shared/validation";

// Schema for MFA verification request
const MFAVerifySchema = z.object({
  secret: z.string().min(1, "secret is required"),
  token: z.string().min(1, "token is required"),
});

/**
 * POST /api/auth/mfa/verify
 * Verifies a TOTP token for MFA.
 * Requires valid session.
 */
export const POST = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: MFAVerifySchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof MFAVerifySchema>;
      const { secret, token } = typedInput;

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 2, // Allow 2 30-second windows
      });

      if (!verified) {
        console.warn("MFA verification failed", { userId: context.auth?.userId });
        return badRequest("Invalid token");
      }

      console.info("MFA verification succeeded", { userId: context.auth?.userId });

      // In production: update user's MFA status, emit audit log
      return ok({ success: true, verified: true });
    } catch (error) {
      console.error("MFA verification error", error);
      return serverError("Failed to verify MFA token");
    }
  },
});
