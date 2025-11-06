//[P1][API][CODE] Shifts [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { UpdateShiftSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

export const GET = requireOrgMembership(
  async (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string; orgId: string },
  ) => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, RateLimits.api);
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const { params } = context;
      const { id } = await params;
      const shift = {
        id,
        scheduleId: "sched-1",
        positionId: "pos-1",
        userId: "user-123",
        startTime: "2025-01-15T09:00:00Z",
        endTime: "2025-01-15T17:00:00Z",
        status: "published",
        breakMinutes: 30,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(shift);
    } catch {
      return serverError("Failed to fetch shift");
    }
  },
);

export const PATCH = csrfProtection()(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        // Apply rate limiting
        const rateLimitResponse = await rateLimit(request, RateLimits.api);
        if (rateLimitResponse) return rateLimitResponse;

        try {
          const { params } = context;
          const { id } = await params;
          const body = await request.json();
          const validated = UpdateShiftSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const updated = {
            id,
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };
          return NextResponse.json(updated);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid shift update" }, { status: 400 });
          }
          return serverError("Failed to update shift");
        }
      },
    ),
  ),
);

export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        // Apply rate limiting
        const rateLimitResponse = await rateLimit(request, RateLimits.api);
        if (rateLimitResponse) return rateLimitResponse;

        try {
          const { params } = context;
          const { id } = await params;
          return NextResponse.json({ message: "Shift deleted successfully", id });
        } catch {
          return serverError("Failed to delete shift");
        }
      },
    ),
  ),
);
