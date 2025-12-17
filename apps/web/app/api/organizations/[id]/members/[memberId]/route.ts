// [P0][ORG][MEMBER][DETAIL][API] Organization member detail endpoint

import { z } from "zod";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateMemberApiSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { ok, serverError } from "../../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details
 */
export const GET = createOrgEndpoint({
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { id, memberId } = params;

      // [A09] Org scoping assertion: reject cross-org access attempts
      if (id !== context.org!.orgId) {
        console.warn("Org mismatch in member GET", {
          requestedOrgId: id,
          userOrgId: context.org!.orgId,
          memberId,
          userId: context.auth?.userId,
        });
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 },
        );
      }

      const member = {
        id: memberId,
        orgId: id,
        email: "member@example.com",
        role: "staff",
        joinedAt: Date.now(),
      };
      return ok(member);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to fetch member", {
        error: message,
        orgId: context.org?.orgId,
        memberId: params.memberId,
        userId: context.auth?.userId,
      });
      return serverError("Failed to fetch member");
    }
  },
});

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member role or permissions
 */
export const PATCH = createOrgEndpoint({
  roles: ["admin"],
  input: UpdateMemberApiSchema,
  handler: async ({ request: _request, input, context, params }) => {
    try {
      // [A09] Org scoping assertion
      if (params.id !== context.org!.orgId) {
        console.warn("Org mismatch in member PATCH", {
          requestedOrgId: params.id,
          userOrgId: context.org!.orgId,
          memberId: params.memberId,
          userId: context.auth?.userId,
        });
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 },
        );
      }

      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof UpdateMemberApiSchema>;
      const { role, permissions } = typedInput;
      const updated = {
        id: params.memberId,
        orgId: params.id,
        role,
        permissions,
        updatedBy: context.auth?.userId,
      };
      return ok(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to update member", {
        error: message,
        orgId: context.org?.orgId,
        memberId: params.memberId,
        userId: context.auth?.userId,
      });
      return serverError("Failed to update member");
    }
  },
});

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove member from organization
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      // [A09] Org scoping assertion
      if (params.id !== context.org!.orgId) {
        console.warn("Org mismatch in member DELETE", {
          requestedOrgId: params.id,
          userOrgId: context.org!.orgId,
          memberId: params.memberId,
          userId: context.auth?.userId,
        });
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied" } },
          { status: 403 },
        );
      }

      return ok({ removed: true, memberId: params.memberId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to remove member", {
        error: message,
        orgId: context.org?.orgId,
        memberId: params.memberId,
        userId: context.auth?.userId,
      });
      return serverError("Failed to remove member");
    }
  },
});
