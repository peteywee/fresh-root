// [P1][API][CODE] Index
// Tags: P1, API, CODE
/**
 * @fileoverview This file serves as a central export point for API-related utilities,
 * ensuring consistent imports across different API routes.
 */

// Central API exports for consistent imports across routes
export * from "./session";
export * from "./authorization";
export * from "./csrf";
export { default as redisAdapter } from "./redis";
export { createRedisRateLimit } from "./redis-rate-limit";

import redisAdapter from "./redis";
import type { RateLimitConfig } from "./redis-rate-limit";
import { createRedisRateLimit } from "./redis-rate-limit";

/**
 * A convenience factory function that creates a rate limiter using the shared Redis adapter.
 *
 * @param {RateLimitConfig} config - The configuration for the rate limiter.
 * @returns {ReturnType<typeof createRedisRateLimit>} A new rate limiter instance.
 */
export function createRateLimiter(config: RateLimitConfig) {
  return createRedisRateLimit(redisAdapter, config);
}
