// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { withTelemetry } from "@/lib/telemetry";
// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { NextResponse } from "next/server";

// Example secured handler pattern for copy-paste into new routes
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

export const GET = () => {
  // your logic here
  return NextResponse.json({ ok: true }, { status: 200 });
};

async function POST_impl(req: Request) {
  try {
    // Example when you need the request in future:
    // const session = await requireSession(req);
    // const body = await req.json();
    // const parsed = SomeSchema.parse(body);
    // const result = await doWork(parsed, session);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    let status = 500;
    let message = "Server error";
    if (err instanceof Error) {
      status = err.name === "ZodError" ? 400 : 500;
      message = err.message;
    }
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export const HEAD = () => new Response(null, { status: 200 });

// Optional examples; keep thin in real handlers.
export const DELETE = () => NextResponse.json({ ok: true });
export const PATCH = () => NextResponse.json({ ok: true });

export const POST = withTelemetry(POST_impl, "/api/_template");
