// [P0][CORE][API] Widgets management endpoint
// Tags: P0, CORE, API, SDK_FACTORY

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest } from "../_shared/validation";

// Widget item schema
const CreateItemSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).optional(),
});

// Widget endpoint for testing/demo purposes
export const POST = createPublicEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    try {
      const body = await request.json();
      // Validate with schema
      const result = CreateItemSchema.safeParse(body);
      if (!result.success) {
        return badRequest("Invalid widget data", result.error.issues);
      }
      const typedInput = result.data;
      const widget = {
        id: `widget-${Date.now()}`,
        name: typedInput.name,
        type: typedInput.type,
        config: typedInput.config,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return NextResponse.json(widget, { status: 201 });
    } catch (_error) {
      return badRequest("Invalid request");
    }
  },
});
