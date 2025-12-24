// [P0][OPS][API] Ops health summary endpoint
// Tags: P0, OPS, API, HEALTH

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

/**
 * GET /api/ops/health
 * Quick health check for monitoring
 */
export const GET = createPublicEndpoint({
  rateLimit: { maxRequests: 1000, windowMs: 60000 },
  handler: async () => {
    try {
      const memory = process.memoryUsage();
      const heapPercent = (memory.heapUsed / memory.heapTotal) * 100;
      
      const status = heapPercent < 90 ? "healthy" : heapPercent < 95 ? "degraded" : "unhealthy";
      
      return NextResponse.json({
        status,
        timestamp: Date.now(),
        uptime: Math.floor(process.uptime()),
        memory: {
          heapPercent: Math.round(heapPercent),
          heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        },
        version: process.env.npm_package_version || "unknown",
      });
    } catch {
      return NextResponse.json(
        { status: "error", timestamp: Date.now() },
        { status: 500 }
      );
    }
  },
});
