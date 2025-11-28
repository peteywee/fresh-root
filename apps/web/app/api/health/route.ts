// [P0][HEALTH][API] Health check endpoint
import { NextResponse } from "next/server";

import { withSecurity } from "../_shared/middleware";

/**
 * GET /api/health
 * Basic health check endpoint for uptime monitoring
 * Returns 200 with ok: true if service is running
 */
export const GET = withSecurity(async () => {
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
});
