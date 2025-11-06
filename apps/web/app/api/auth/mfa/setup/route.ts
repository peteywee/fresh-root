// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
// Tags: P0, AUTH, API
import { NextRequest, NextResponse } from "next/server";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import { requireSession, AuthenticatedRequest } from "../../../_shared/middleware";

/**
 * POST /api/auth/mfa/setup
 * Generates a TOTP secret and QR code for MFA enrollment.
 * Requires valid session.
 */
export async function POST(req: NextRequest) {
  return requireSession(req as AuthenticatedRequest, async (authReq: AuthenticatedRequest) => {
    try {
      const { email } = authReq.user!;

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FreshRoot (${email})`,
        issuer: "FreshRoot",
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      authReq.logger?.info("MFA setup initiated", { email });

      // Store secret temporarily in Firestore (or return to client for storage)
      // For simplicity, return to client. In production, store server-side.
      return NextResponse.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: secret.otpauth_url,
      });
    } catch (error) {
      authReq.logger?.error("MFA setup failed", error);
      return NextResponse.json({ error: "Failed to generate MFA secret" }, { status: 500 });
    }
  });
}
