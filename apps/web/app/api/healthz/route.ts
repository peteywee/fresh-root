// [P0][HEALTH][API] Kubernetes liveness probe endpoint
import { NextResponse } from "next/server";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

/**
 * [P0][API][HEALTH] Health Check Endpoint
 * Tags: api, health, infra
 *
 * Overview:
 * - Simple liveness probe for load balancers and uptime monitoring
 * - Does NOT hit Firestore; use for "is the web app alive" checks
 */

export const GET = createPublicEndpoint({
  handler: async ({ request, input, context, params }) => {
    async () => {
  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      // You can hard-code or inject a version string later
      version: "v14-core",
    },
    { status: 200 };
  }
});
});

// Some monitors use HEAD for cheaper checks
export const HEAD = createPublicEndpoint({
  handler: async ({ request, input, context, params }) => {
    async () => {
  return NextResponse.json(null, { status: 200 };
  }
});
});
