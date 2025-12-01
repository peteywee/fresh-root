// [P0][CORE][API] User profile endpoint
import { NextRequest } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../_shared/validation";

// Rate limiting via withSecurity options

// Schema for updating user profile
const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).optional(),
      notifications: z.boolean().optional(),
      language: z.string().length(2).optional(),
    })
    .optional(),
});

/**
 * GET /api/users/profile
 * Get the current user's profile
 */
export const GET = withSecurity(
  async (request, context: { params: Record<string, string>; userId: string }) => {
    try {
      // For now, return a mock profile based on authenticated user
      const userProfile = {
        id: context.userId,
        email: `${context.userId}@example.com`,
        displayName: "John Doe",
        bio: "Software developer",
        phoneNumber: "+1234567890",
        photoURL: null,
        createdAt: new Date().toISOString(),
        preferences: {
          theme: "light",
          notifications: true,
          language: "en",
        },
      };
      return ok(userProfile);
    } catch {
      return serverError("Failed to fetch user profile");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/users/profile
 * Update the current user's profile
 */
export const PATCH = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const parsed = await parseJson(request, UpdateProfileSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      // In production, update user in database
      // For now, return updated mock data
      const updatedProfile = {
        id: context.userId,
        email: `${context.userId}@example.com`,
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      return ok(updatedProfile);
    } catch {
      return serverError("Failed to update profile");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
