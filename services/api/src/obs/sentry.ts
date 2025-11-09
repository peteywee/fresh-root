// [P1][RELIABILITY][SENTRY] Sentry error tracking and performance monitoring
// Tags: P1, RELIABILITY, OBSERVABILITY, SENTRY, ERROR_TRACKING, PROFILING
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

/**
 * @description Configuration for initializing the Sentry SDK.
 */
export interface SentryConfig {
  /** @description The DSN for your Sentry project. */
  dsn?: string;
  /** @description The application environment (e.g., "production", "development"). */
  environment: string;
  /** @description The release version of your application. */
  release?: string;
  /** @description The sampling rate for performance traces (0 to 1). */
  tracesSampleRate?: number;
  /** @description The sampling rate for profiling data (0 to 1). */
  profilesSampleRate?: number;
}

/**
 * @description Initializes the Sentry SDK for a Node.js/Express application.
 * This should be called before any other Express middleware.
 * @param {Express} app - The Express application instance.
 * @param {SentryConfig} config - The configuration for Sentry.
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
 * @description Manually captures an exception and sends it to Sentry.
 * This is useful for tracking caught errors that you still want to be aware of.
 * @param {Error} error - The error to capture.
 * @param {Record<string, unknown>} [context] - Additional context to send with the error.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}

/**
 * @description Manually captures a message and sends it to Sentry.
 * This is useful for tracking non-error events.
 * @param {string} message - The message to capture.
 * @param {Sentry.SeverityLevel} [level="info"] - The severity level of the message.
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}

/**
 * @description Flushes any pending Sentry events.
 * This is useful in serverless environments or before the application shuts down.
 * @param {number} [timeout=2000] - The maximum time to wait for the flush to complete, in milliseconds.
 * @returns {Promise<boolean>} A promise that resolves to true if the flush was successful.
 */
export async function flush(timeout: number = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}
