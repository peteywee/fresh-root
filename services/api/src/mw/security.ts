// [P0][SECURITY][EDGE] Edge security: headers, CORS allowlist, rate limiting, body size caps
// Tags: P0, SECURITY, EDGE, CORS, HSTS, RATE_LIMIT, MIDDLEWARE
import express, { type Express, type NextFunction, type Request, type Response } from "express";

import type { Env } from "../env.js";
import { getCorsOrigins } from "../env.js";

/**
 * @description Creates an Express middleware that applies a set of minimal, security-focused HTTP headers.
 * These headers help protect against common web vulnerabilities.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
function securityHeaders(): (req: Request, res: Response, next: NextFunction) => void {
  return (_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
  };
}

/**
 * @description Creates an Express middleware that applies the HTTP Strict-Transport-Security (HSTS) header.
 * This header is only applied in the production environment to enforce HTTPS.
 * @param {Env} env - The application's environment variables.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
function hsts(env: Env): (req: Request, res: Response, next: NextFunction) => void {
  return (_req, res, next) => {
    if (env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains"); // 180 days
    }
    next();
  };
}

/**
 * @description Creates an Express middleware for handling Cross-Origin Resource Sharing (CORS).
 * It allows requests from a specified list of origins.
 * @param {string[]} origins - A list of allowed origins.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
function corsAllowlist(
  origins: string[],
): (req: Request, res: Response, next: NextFunction) => void {
  const allowset = new Set(origins);
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowset.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  };
}

/**
 * @description Creates an Express middleware for rate limiting requests.
 * This is a simple in-memory implementation that tracks hits per IP address.
 * @param {number} windowMs - The time window in milliseconds for which requests are counted.
 * @param {number} max - The maximum number of requests allowed per IP within the time window.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
function rateLimit(
  windowMs: number,
  max: number,
): (req: Request, res: Response, next: NextFunction) => void {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const rec = hits.get(ip);
    if (!rec || rec.reset < now) {
      hits.set(ip, { count: 1, reset: now + windowMs });
      return next();
    }
    rec.count += 1;
    if (rec.count > max) {
      const retry = Math.max(0, Math.ceil((rec.reset - now) / 1000));
      res.setHeader("Retry-After", String(retry));
      return res.status(429).json({ error: "rate_limited" });
    }
    next();
  };
}

/**
 * @description Applies a suite of security-related middleware to the Express application.
 * This includes security headers, HSTS, CORS, body size limits, and rate limiting.
 * @param {Express} app - The Express application instance.
 * @param {Env} env - The application's environment variables.
 */
export function applySecurity(app: Express, env: Env) {
  const origins = getCorsOrigins(env);
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const max = Number(env.RATE_LIMIT_MAX ?? 300);

  app.use(securityHeaders());
  app.use(hsts(env));
  app.use(corsAllowlist(origins));

  // Body size caps (JSON and urlencoded)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Global rate limit; sensitive routes can add tighter limits inline if needed
  app.use(rateLimit(windowMs, max));
}
