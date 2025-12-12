// [P0][CORE][API] Widgets management endpoint
// Tags: P0, CORE, API, SDK_FACTORY

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { z } from "zod";

// Widget item schema
const CreateItemSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

type CreateItem = z.infer<typeof CreateItemSchema>;

// Widget endpoint for testing/demo purposes
export const POST = createPublicEndpoint({
  input: CreateItemSchema,
  handler: async ({ input }: { input: CreateItem }) => {
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
