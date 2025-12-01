// [P0][CORE][API] User profile endpoint
import { NextRequest } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../_shared/validation";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

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
export const GET = (withSecurity(
  async (request, context: { params: Record<string, string>; userId: string })  = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60 },
  handler: async ({ request, input, context, params }) => 
}));;
