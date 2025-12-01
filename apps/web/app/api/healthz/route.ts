// [P0][HEALTH][API] Kubernetes liveness probe endpoint
import { NextResponse } from "next/server";

import { withSecurity } from "../_shared/middleware";

/**
 * [P0][API][HEALTH] Health Check Endpoint
 * Tags: api, health, infra
 *
 * Overview:
 * - Simple liveness probe for load balancers and uptime monitoring
 * - Does NOT hit Firestore; use for "is the web app alive" checks
 */

export const GET = createAuthenticatedEndpoint({
  handler: async ({ request, input, context, params }) => async () => {
  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      // You can hard-code or inject a version string later
      version: "v14-core",
    }
});

// Some monitors use HEAD for cheaper checks
export const HEAD = withSecurity(async () => {
  return NextResponse.json(null, { status: 200 });
});
