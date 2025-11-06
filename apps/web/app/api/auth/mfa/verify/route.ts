// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
// Tags: P0, AUTH, API
import { NextRequest, NextResponse } from "next/server";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../../../lib/firebase-admin";
import { requireSession, AuthenticatedRequest } from "../../../_shared/middleware";

const verifySchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});

/**
 * POST /api/auth/mfa/verify
 * Verifies TOTP token and sets mfa=true custom claim.
 * Requires valid session.
 */
export async function POST(req: NextRequest) {
  return requireSession(req as AuthenticatedRequest, async (authReq: AuthenticatedRequest) => {
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
        authReq.logger?.warn("Invalid MFA verification code", { uid: authReq.user!.uid });
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      // Set mfa=true custom claim
      const auth = getFirebaseAdminAuth();
      const uid = authReq.user!.uid;

      await auth.setCustomUserClaims(uid, {
        ...authReq.user!.customClaims,
        mfa: true,
      });

      authReq.logger?.info("MFA enabled successfully", { uid });

      // Store secret in Firestore for future verification (optional)
      // In production, hash the secret before storing

      return NextResponse.json({
        success: true,
        message: "MFA enabled successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request", details: error.errors },
          { status: 400 },
        );
      }

      authReq.logger?.error("MFA verification failed", error);
      return NextResponse.json({ error: "Failed to verify MFA" }, { status: 500 });
    }
  });
}
