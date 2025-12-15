// [P0][METRICS][API] Metrics endpoint

import { createPublicEndpoint } from "@fresh-schedules/api-framework";

import { ok, serverError } from "../_shared/validation";

/**
 * GET /api/metrics
 * Get system metrics
 */
export const GET = createPublicEndpoint({
  rateLimit: { maxRequests: 1000, windowMs: 60000 },
  handler: async () => {
    try {
      const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: Date.now(),
      };

      return ok(metrics);
    } catch {
      return serverError("Failed to fetch metrics");
    }
  },
});
