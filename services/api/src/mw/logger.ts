// [P1][RELIABILITY][OBS] Request logging middleware with reqId and latency tracking
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, MIDDLEWARE
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

import { logger } from "../obs/log.js";

/**
 * @description Creates an Express middleware for logging incoming requests.
 * This middleware attaches a unique request ID to each request, logs the request and response with latency, and uses a structured logger.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqId = randomUUID();
    const start = Date.now();

    // Attach reqId to request for downstream use
    (req as Request & { reqId: string }).reqId = reqId;

    // Log response when finished
    res.on("finish", () => {
      const latencyMs = Date.now() - start;
      logger.request(req, res, latencyMs);
    });

    next();
  };
}
