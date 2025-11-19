// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
// Template: CODE_NEXT_API_ROUTE
//
// Example API route implementation:
//
// export async function POST(req: NextRequest) {
//   return withRateLimit(async () => {
//     const session = await requireSession(req);
//     if (!session?.uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//
//     const json = await req.json().catch(() => ({}));
//     const parsed = Body.safeParse(json);
//     if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
//
//     return NextResponse.json({ ok: true }, { status: 200 });
//   });
// }

import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 200 });
}
