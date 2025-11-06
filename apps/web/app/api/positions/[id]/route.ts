//[P1][API][CODE] Positions [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { PositionUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../../_shared/middleware";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/positions/[id]
 * Get position details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = await params;

      // In production, fetch from Firestore and check permissions
      const position = {
        id,
        orgId: "org-1",
        title: "Server",
        description: "Front of house server position",
        hourlyRate: 15.0,
        color: "#2196F3",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "user-123",
      };

      return NextResponse.json(position);
    } catch {
      return serverError("Failed to fetch position");
    }
  });
}

/**
 * PATCH /api/positions/[id]
 * Update position details
 */
async function patchHandler(
  request: NextRequest,
  data: z.infer<typeof PositionUpdateSchema>,
  params: { id: string },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = params;

      // In production, update in Firestore after checking permissions
      const updatedPosition = {
        id,
        orgId: "org-1",
        title: "Server",
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(updatedPosition);
    } catch {
      return serverError("Failed to update position");
    }
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const validated = withValidation(PositionUpdateSchema, (req, data) =>
    patchHandler(req, data, params),
  );
  return validated(request);
}

/**
 * DELETE /api/positions/[id]
 * Delete a position (soft delete - set isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = await params;

      // In production, soft delete by setting isActive = false
      return NextResponse.json({
        message: "Position deleted successfully",
        id,
      });
    } catch {
      return serverError("Failed to delete position");
    }
  });
}
