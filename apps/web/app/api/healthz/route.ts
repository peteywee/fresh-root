// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
/**
 * [P0][API][HEALTH] Health Check Endpoint
 * Tags: api, health, infra
 *
 * Overview:
 * - Simple liveness probe for load balancers and uptime monitoring
 * - Does NOT hit Firestore; use for "is the web app alive" checks
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      // You can hard-code or inject a version string later
      version: "v14-core",
    },
    { status: 200 },
  );
}

// Some monitors use HEAD for cheaper checks
export async function HEAD() {
  return new Response(null, { status: 200 });
}
