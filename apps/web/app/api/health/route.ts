// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}
