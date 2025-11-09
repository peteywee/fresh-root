// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import { withSecurity } from "../../../_shared/middleware";
import { ok, serverError } from "../../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * Handles POST requests to `/api/auth/mfa/setup` to generate a TOTP secret and QR code for MFA enrollment.
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
      return ok({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: secret.otpauth_url,
      });
    } catch (error) {
      console.error("MFA setup failed", error);
      return serverError("Failed to generate MFA secret");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
