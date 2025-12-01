// [P0][AUTH][API] MFA setup endpoint
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const MFASetupSchema = z.object({}).passthrough().optional();

export const POST = createAuthenticatedEndpoint({
  input: MFASetupSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ context }) => {
    try {
      const userLabel = context.auth?.userId || "user";
      const secret = speakeasy.generateSecret({
        name: `FreshRoot (${userLabel})`,
        issuer: "FreshRoot",
      });
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      console.warn("MFA setup initiated", { userId: context.auth?.userId });

      return NextResponse.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: secret.otpauth_url,
      }, { status: 200 });
    } catch (error) {
      console.error("MFA setup failed", error);
      return NextResponse.json({ error: "Failed to generate MFA secret" }, { status: 500 });
    }
  },
});
