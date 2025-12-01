// [P0][CORE][API] User profile endpoint
import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "auto"]).optional(),
    notifications: z.boolean().optional(),
    language: z.string().length(2).optional(),
  }).optional(),
});

export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ context }) => {
    try {
      const userId = context.auth!.userId;
      const userProfile = {
        id: userId,
        email: `${userId}@example.com`,
        displayName: "John Doe",
        bio: "Software developer",
        phoneNumber: "+1234567890",
        photoURL: null,
        createdAt: new Date().toISOString(),
        preferences: { theme: "light", notifications: true, language: "en" },
      };
      return NextResponse.json(userProfile, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  input: UpdateProfileSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const userId = context.auth!.userId;
      const updatedProfile = {
        id: userId,
        email: `${userId}@example.com`,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(updatedProfile, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
  },
});
