// [P2][D7][WIDGETS][API] Widgets management endpoint with Firestore persistence
// Tags: P2, D7, API, SDK_FACTORY, FIRESTORE

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

// Widget item schema
const CreateItemSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  config: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Widget interface
 */
interface Widget {
  id: string;
  name: string;
  type: string;
  config?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/**
 * POST /api/widgets
 * Create a new widget (public endpoint)
 */
export const POST = createPublicEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    try {
      const body = await request.json();

      // Validate with schema
      const result = CreateItemSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid widget data", details: result.error.issues },
          { status: 400 },
        );
      }

      const typedInput = result.data;
      const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const widget: Widget = {
        id: widgetId,
        name: typedInput.name,
        type: typedInput.type,
        config: typedInput.config || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Persist to Firestore in a public widgets collection
      const db = getFirestore();
      await db.collection('widgets').doc(widgetId).set(widget);

      return NextResponse.json(widget, { status: 201 });
    } catch (error) {
      console.error("Error creating widget:", error);
      return NextResponse.json(
        { error: "Failed to create widget" },
        { status: 500 },
      );
    }
  },
});
