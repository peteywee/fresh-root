// [P0][AUTH][API] MFA setup endpoint
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { ok, serverError } from "../../../_shared/validation";

// Schema for MFA setup request (empty for now, but validates request is valid JSON)
const MFASetupSchema = z.object({}).passthrough().optional();

/**
 * POST /api/auth/mfa/setup
 * Generates a TOTP secret and QR code for MFA enrollment.
 * Requires valid session.
 */
export const POST = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: MFASetupSchema,
  handler: async ({ _input, context }) => {
    try {
      // input is already validated (may be undefined)

      // Derive a stable label from user id for display if email is unknown client-side
      const userLabel = context.auth?.userId || "user";

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FreshRoot (${userLabel})`,
        issuer: "FreshRoot",
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      console.warn("MFA setup initiated", { userId: context.auth?.userId });

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
});
