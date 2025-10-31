// [P1][RELIABILITY][OBS] Request logging middleware with reqId and latency tracking
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, MIDDLEWARE
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../obs/log.js";

/**
 * Middleware to attach a unique request ID and log all requests with latency.
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqId = randomUUID();
    const start = Date.now();

    // Attach reqId to request for downstream use
    (req as any).reqId = reqId;

    // Log response when finished
    res.on("finish", () => {
      const latencyMs = Date.now() - start;
      logger.request(req, res, latencyMs);
    });

    next();
  };
}
