// [P0][ITEMS][API] Items list endpoint
export const dynamic = "force-dynamic";

import { z } from "zod";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateItemSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { badRequest, forbidden, ok, serverError } from "../_shared/validation";

/**
 * GET /api/items
 * List items for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgIdParam = searchParams.get("orgId");
      const orgId = orgIdParam || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }
      if (orgIdParam && context.org?.orgId && orgIdParam !== context.org.orgId) {
        return forbidden("orgId does not match organization context");
      }

      // Mock data - in production, fetch from Firestore
      const items = [
        {
          id: "item-1",
          orgId,
          name: "Sample Item",
          description: "A sample inventory item",
          quantity: 100,
          unit: "pcs",
          isActive: true,
        },
      ];

      return ok({ items, total: items.length });
    } catch {
      return serverError("Failed to fetch items");
    }
  },
});

/**
 * POST /api/items
 * Create new item
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreateItemSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateItemSchema>;
      const orgId = context.org?.orgId;
      if (!orgId) {
        return badRequest("Organization context is required");
      }
      const item = {
        id: `item-${Date.now()}`,
        orgId,
        ...typedInput,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(item, { status: 201 });
    } catch {
      return serverError("Failed to create item");
    }
  },
});
