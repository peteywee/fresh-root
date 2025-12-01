// [P0][ITEMS][API] Items list endpoint
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { CreateItemSchema } from "@fresh-schedules/types";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../_shared/validation";

/**
 * GET /api/items
 * List items for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
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
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const validated = CreateItemSchema.parse(body);
      
      const item = {
        id: `item-${Date.now()}`,
        orgId: context.org?.orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(item, { status: 201 });
    } catch {
      return serverError("Failed to create item");
    }
  },
});
