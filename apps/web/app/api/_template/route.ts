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

export const GET = async (_req: NextRequest) => {
  try {
    // const session = await requireSession(_req);
    // await requireRole(session, ["manager"]);
    // const data = await doWork(/* args */);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // const session = await requireSession(req);
    // const body = await req.json();
    // const parsed = SomeSchema.parse(body);
    // const result = await doWork(parsed, session);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status },
    );
  }
};

export const HEAD = async () => new Response(null, { status: 200 });

// Optional examples; keep thin in real handlers.
export const DELETE = async (_req: NextRequest) =>
  NextResponse.json({ ok: true });
export const PATCH = async (_req: NextRequest) =>
  NextResponse.json({ ok: true });
