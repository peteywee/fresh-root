// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../../../lib/firebase-admin";
import { withSecurity, type AuthenticatedRequest } from "../../../_shared/middleware";
import { badRequest, serverError, ok } from "../../../_shared/validation";

// Rate limiting via withSecurity options

const verifySchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});

/**
 * POST /api/auth/mfa/verify
 * Verifies TOTP token and sets mfa=true custom claim.
 * Requires valid session.
 */
export const POST = withSecurity(
  async (
    req: NextRequest,
    context: { params: Record<string, string>; userId: string },
  ) => {
    try {
      const { secret, token } = verifySchema.parse(await req.json());

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

      return ok({ success: true, message: "MFA enabled successfully" });
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
