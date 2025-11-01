// [P1][RELIABILITY][SENTRY] Sentry error tracking and performance monitoring
// Tags: P1, RELIABILITY, OBSERVABILITY, SENTRY, ERROR_TRACKING, PROFILING
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

export interface SentryConfig {
  dsn?: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
}

/**
 * Initialize Sentry SDK for Node.js/Express.
 * Must be called before any other Express middleware.
 */
export function initSentry(app: Express, config: SentryConfig): void {
  const { dsn, environment, release, tracesSampleRate = 0.1, profilesSampleRate = 0.1 } = config;

  if (!dsn) {
    console.log("[sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate,
    profilesSampleRate,
    integrations: [
      // Express instrumentation (v10+ uses setupExpressErrorHandler)
      // Node profiling
      nodeProfilingIntegration(),
      // HTTP instrumentation
      Sentry.httpIntegration(),
    ],
  });

  // Set up Express error handler after init
  Sentry.setupExpressErrorHandler(app);

  console.log(`[sentry] initialized for env=${environment}, release=${release || "unknown"}`);
}

/**
 * Manually capture an exception (useful for caught errors you still want tracked)
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}

/**
 * Manually capture a message (useful for non-error events)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}

/**
 * Flush pending events (useful in serverless or before shutdown)
 */
export async function flush(timeout: number = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}
