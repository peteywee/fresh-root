// [P0][API][CODE] Organizations [id] API route handler
// Tags: P0, API, CODE, validation, zod
import { OrganizationUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../../src/lib/api/validation";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // In production, fetch from database and check permissions
    const organization = {
      id,
      name: "Acme Corp",
      description: "A great company",
      industry: "Technology",
      size: "51-200",
      createdAt: new Date().toISOString(),
      settings: {
        allowPublicSchedules: false,
        requireShiftApproval: true,
        defaultShiftDuration: 8,
      },
      memberCount: 25,
    };

    return NextResponse.json(organization);
  } catch {
    return serverError("Failed to fetch organization");
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
async function patchHandler(
  request: NextRequest,
  data: z.infer<typeof OrganizationUpdateSchema>,
  params: { id: string },
) {
  try {
    const { id } = params;

    // In production, update in database after checking permissions
    const updatedOrg = {
      id,
      name: "Acme Corp",
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedOrg);
  } catch {
    return serverError("Failed to update organization");
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const validated = withValidation(OrganizationUpdateSchema, (req, data) =>
    patchHandler(req, data, params),
  );
  return validated(request);
}

/**
 * DELETE /api/organizations/[id]
 * Delete an organization (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // In production, check if user is admin and delete from database
    return NextResponse.json({ message: "Organization deleted successfully", id });
  } catch {
    return serverError("Failed to delete organization");
  }
}
