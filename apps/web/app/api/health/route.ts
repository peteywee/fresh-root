// [P0][HEALTH][API] Health check endpoint
import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Basic health check endpoint for uptime monitoring
 * Returns 200 with ok: true if service is running
 *
 * Public endpoint - no authentication required.
 */
export const dynamic = "force-dynamic";

export const GET = createPublicEndpoint({
  handler: async ({}) => {
    const healthStatus = {
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  },
});
