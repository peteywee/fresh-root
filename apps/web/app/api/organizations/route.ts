// [P0][API][CODE] Organizations API route handler
// Tags: P0, API, CODE, validation, zod
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../_shared/middleware";
import { serverError, OrganizationCreateSchema } from "../_shared/validation";
import { rateLimit, RateLimits } from "../../../src/lib/api/rate-limit";
import { csrfProtection } from "../../../src/lib/api/csrf";
import { sanitizeObject } from "../../../src/lib/api/sanitize";

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  async (request: NextRequest) => {
    return requireSession(request as AuthenticatedRequest, async (authReq) => {
      try {
        // In production, fetch from database based on authenticated user
        const organizations = [
          {
            id: "org-1",
            name: "Acme Corp",
            description: "A great company",
            role: "admin",
            createdAt: new Date().toISOString(),
            memberCount: 25,
            ownerId: authReq.user?.uid,
          },
          {
            id: "org-2",
            name: "Tech Startup",
            description: "Innovative solutions",
            role: "manager",
            createdAt: new Date().toISOString(),
            memberCount: 10,
            ownerId: authReq.user?.uid,
          },
        ];

        return NextResponse.json({ organizations, userId: authReq.user?.uid });
      } catch {
        return serverError("Failed to fetch organizations");
      }
    });
  },
);

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    withValidation(
      OrganizationCreateSchema,
      async (request: NextRequest, data: z.infer<typeof OrganizationCreateSchema>) => {
        return requireSession(request as AuthenticatedRequest, async (authReq) => {
          try {
            // Sanitize user input
            const sanitized = sanitizeObject(data, {
              urlFields: ["website"],
            });

            // In production, create organization in Firestore
            const newOrg = {
              id: `org-${Date.now()}`,
              ...sanitized,
              ownerId: authReq.user?.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            return NextResponse.json(newOrg, { status: 201 });
          } catch {
            return serverError("Failed to create organization");
          }
        });
      },
    ),
  ),
);
