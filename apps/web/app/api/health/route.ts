// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// Tags: P1, OBSERVABILITY, HEALTH
import { NextResponse } from "next/server";

/**
 * Handles GET requests to `/api/health` to perform a basic health check.
 * This endpoint is used for uptime monitoring and returns a 200 OK response if the service is running.
 *
 * @returns {NextResponse} A JSON response with the health status.
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
