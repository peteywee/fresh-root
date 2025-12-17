// [P0][HEALTH][API] Health check endpoint

import { createPublicEndpoint } from "@fresh-schedules/api-framework";

import { ok } from "../_shared/validation";

/**
 * GET /api/healthz
 * Health check endpoint
 */
export const GET = createPublicEndpoint({
  rateLimit: {
    maxRequests: 1000,
    windowMs: 60000,
  },
  handler: async ({ context }) => {
    return ok({
      status: "healthy",
      timestamp: Date.now(),
      requestId: context.requestId,
    });
  },
});

/**
 * HEAD /api/healthz
 * Health check HEAD
 */
export const HEAD = createPublicEndpoint({
  handler: async () => {
    return ok({ status: "healthy" });
  },
});
