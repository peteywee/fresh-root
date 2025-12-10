// [P0][CORE][API] Widgets management endpoint
// Tags: P0, CORE, API, SDK_FACTORY

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { CreateWidgetSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

// Widget endpoint for testing/demo purposes
export const POST = createPublicEndpoint({
  input: CreateWidgetSchema,
  handler: async ({ input }) => {
    const widget = {
      id: `widget-${Date.now()}`,
      name: input.name,
      type: input.type,
      config: input.config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return NextResponse.json(widget, { status: 201 });
  },
});
