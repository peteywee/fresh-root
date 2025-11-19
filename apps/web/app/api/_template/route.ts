// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
import { NextRequest, NextResponse } from "next/server";
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

export const GET = async () => {
  try {
    // const session = await requireSession(req);
    // await requireRole(session, ["manager"]);
    // const data = await doWork(/* args */);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // const session = await requireSession(req);
    // const body = await req.json();
    // const parsed = SomeSchema.parse(body);
    // const result = await doWork(parsed, session);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const status = err instanceof Error && err.name === "ZodError" ? 400 : 500;
    const error = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ ok: false, error }, { status });
  }
};

export const HEAD = async () => new Response(null, { status: 200 });

// Optional examples; keep thin in real handlers.
export const DELETE = async () => NextResponse.json({ ok: true });
export const PATCH = async () => NextResponse.json({ ok: true });
