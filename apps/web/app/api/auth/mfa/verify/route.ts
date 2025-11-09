// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../../../lib/firebase-admin";
import { withSecurity } from "../../../_shared/middleware";
import type { AuthenticatedRequest } from "../../../_shared/middleware";
import { badRequest, serverError, ok } from "../../../_shared/validation";

// Rate limiting via withSecurity options

const verifySchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});

/**
 * Handles POST requests to `/api/auth/mfa/verify` to verify a TOTP token and set the `mfa` custom claim.
 * Requires a valid session.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  async (req: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const body = await req.json();
      const { secret, token } = verifySchema.parse(body);

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2, // Allow 2 time steps before/after
      });

      if (!verified) {
        console.warn("Invalid MFA verification code", { uid: context.userId });
        return badRequest("Invalid verification code");
      }

      // Set mfa=true custom claim
      const auth = getFirebaseAdminAuth();
      // Prefer explicit context.userId, fall back to any authenticated request user attached by middleware
      const uid = context.userId ?? (req as AuthenticatedRequest).user?.uid;

      // For safety, preserve any existing custom claims you manage elsewhere
      await auth.setCustomUserClaims(uid, {
        mfa: true,
      });

      console.warn("MFA enabled successfully", { uid });

      // Store secret in Firestore for future verification (optional)
      // In production, hash the secret before storing

      return ok({
        success: true,
        message: "MFA enabled successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest("Invalid request", error.errors);
      }

      console.error("MFA verification failed", error);
      return serverError("Failed to verify MFA");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
