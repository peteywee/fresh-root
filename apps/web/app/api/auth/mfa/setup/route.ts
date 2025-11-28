// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import { withSecurity } from "../../../_shared/middleware";
import { ok, serverError } from "../../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * POST /api/auth/mfa/setup
 * Generates a TOTP secret and QR code for MFA enrollment.
 * Requires valid session.
 */
export const POST = withSecurity(
  async (
    _req: NextRequest,
    context: { params: Record<string, string>; userId: string },
  ) => {
    try {
      // Derive a stable label from user id for display if email is unknown client-side
      const userLabel = context.userId || "user";

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FreshRoot (${userLabel})`,
        issuer: "FreshRoot",
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      console.warn("MFA setup initiated", { userId: context.userId });

      // Store secret temporarily in Firestore (or return to client for storage)
      // For simplicity, return to client. In production, store server-side.
      return ok({ success: true, secret: secret.base32, qrCode: qrCodeDataUrl, otpauthUrl: secret.otpauth_url });
    } catch (error) {
      console.error("MFA setup failed", error);
      return serverError("Failed to generate MFA secret");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
