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
  handler: async () => {
    return NextResponse.json(
      {
        ok: true,
        status: "healthy",
        version: "v14-core",
      },
      { status: 200 },
    );
  },
});

export const HEAD = createPublicEndpoint({
  handler: async () => {
    return NextResponse.json(null, { status: 200 });
  },
});
