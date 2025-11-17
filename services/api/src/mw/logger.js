// [P1][RELIABILITY][OBS] Request logging middleware with reqId and latency tracking
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, MIDDLEWARE
import { randomUUID } from "crypto";
import { logger } from "../obs/log.js";
/**
 * Middleware to attach a unique request ID and log all requests with latency.
 */
export function requestLogger() {
    return (req, res, next) => {
        const reqId = randomUUID();
        const start = Date.now();
        // Attach reqId to request for downstream use
        req.reqId = reqId;
        // Log response when finished
        res.on("finish", () => {
            const latencyMs = Date.now() - start;
            logger.request(req, res, latencyMs);
        });
        next();
    };
}
