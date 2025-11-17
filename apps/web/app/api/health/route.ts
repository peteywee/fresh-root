// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// Tags: P1, OBSERVABILITY, HEALTH
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Basic health check endpoint for uptime monitoring
 * Returns 200 with ok: true if service is running
 */
export function GET() {
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
}
