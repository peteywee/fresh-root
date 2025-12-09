// [P0][CORE][API] Template endpoint for new routes
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

// Minimal template payload schema for POST examples
const TemplatePostSchema = z.object({
  message: z.string().optional(),
});

// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
// Example shows imports you will actually use in real routes:
// import { z } from "zod";
// import { SomeSchema } from "@fresh-schedules/types";
// import { requireSession, requireRole } from "@/src/lib/api";
// import { doWork } from "@/src/lib/someUseCase";

/**
 * Canonical thin-edge template (Layer 03).
 *
 * Pattern: parse → validate → authorize → app-lib → respond
 */

export const GET = createPublicEndpoint({
  handler: async ({ request, context }) => {
    try {
      const url = new URL(request.url);
      const message = url.searchParams.get("message") ?? "Hello from SDK endpoint";
      return NextResponse.json({ ok: true, message });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Server error";
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }
  },
});

// Use the TemplatePostSchema defined above

export const POST = createPublicEndpoint({
  input: TemplatePostSchema,
  handler: async ({ input }) => {
    const payload = input ?? {};
    return NextResponse.json({ ok: true, payload }, { status: 201 });
  },
});

export const HEAD = createPublicEndpoint({
  handler: async () => new Response(null, { status: 200 }),
});

// Optional examples; keep thin in real handlers.
export const DELETE = async () => NextResponse.json({ ok: true });
export const PATCH = async () => NextResponse.json({ ok: true });
