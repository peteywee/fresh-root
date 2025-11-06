//[P1][API][CODE] Positions API route handler
// Tags: P1, API, CODE, validation, zod

import { PositionCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../_shared/middleware";
import { serverError } from "../_shared/validation";

/**
 * GET /api/positions
 * List positions in an organization
 */
export async function GET(request: NextRequest) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId");

      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }

      // In production, fetch from Firestore filtered by orgId
      const positions = [
        {
          id: "pos-1",
          orgId,
          title: "Server",
          hourlyRate: 15.0,
          color: "#2196F3",
          createdAt: new Date().toISOString(),
        },
        {
          id: "pos-2",
          orgId,
          title: "Cook",
          hourlyRate: 18.0,
          color: "#4CAF50",
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ positions });
    } catch {
      return serverError("Failed to fetch positions");
    }
  });
}

/**
 * POST /api/positions
 * Create a new position
 */
export const POST = withValidation(
  PositionCreateSchema,
  async (request: NextRequest, data: z.infer<typeof PositionCreateSchema>) => {
    return requireSession(request as AuthenticatedRequest, async (authReq) => {
      try {
        // In production, create position in Firestore
        const newPosition = {
          id: `pos-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          createdBy: authReq.user?.uid,
        };

        return NextResponse.json(newPosition, { status: 201 });
      } catch {
        return serverError("Failed to create position");
      }
    });
  },
);
