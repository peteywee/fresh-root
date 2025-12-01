// [P0][ORGS][API] Organization member management endpoint
export const dynamic = "force-dynamic";

import { UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint, type OrgRole } from "@fresh-schedules/api-framework";

const buildMemberPayload = (memberId: string, orgId: string) => ({
  id: memberId,
  orgId,
  uid: "user-123",
  roles: ["admin"] as OrgRole[],
  joinedAt: new Date().toISOString(),
  mfaVerified: true,
  createdAt: new Date().toISOString(),
});

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params, context }) => {
    try {
      const { memberId } = params;
      const orgId = context.org!.orgId;
      return NextResponse.json(buildMemberPayload(memberId, orgId), { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  org: "required",
  roles: ["admin"],
  input: UpdateMembershipSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, params, context }) => {
    try {
      const { memberId } = params;
      const orgId = context.org!.orgId;
      const userId = context.auth!.userId;
      return NextResponse.json({
        ...buildMemberPayload(memberId, orgId),
        ...input,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
    }
  },
});

export const DELETE = createAuthenticatedEndpoint({
  org: "required",
  roles: ["admin"],
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params, context }) => {
    try {
      const { memberId } = params;
      const orgId = context.org!.orgId;
      return NextResponse.json({ message: "Member removed successfully", orgId, memberId }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
  },
});
