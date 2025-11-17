// [P1][API][CODE] Index
// Tags: P1, API, CODE
// Central API exports for consistent imports across routes
export * from "./session";
export * from "./authorization";
export * from "./csrf";
export { default as redisAdapter } from "./redis";
export { createRedisRateLimit } from "./redis-rate-limit";
import redisAdapter from "./redis";
import { createRedisRateLimit } from "./redis-rate-limit";
/**
 * Convenience factory: create a rate limiter using the shared redis adapter
 */
export function createRateLimiter(config) {
    return createRedisRateLimit(redisAdapter, config);
}
