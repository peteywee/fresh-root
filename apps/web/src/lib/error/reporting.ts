// [P2][APP][CODE] Reporting
// Tags: P2, APP, CODE
// Centralized error reporting with Sentry integration
import * as Sentry from "@sentry/nextjs";

import { logger } from "../logger";

/**
 * Reports an error to Sentry and falls back to structured logging.
 *
 * @param {unknown} error - The error to report.
 * @param {Record<string, unknown>} [context] - Additional context to include with the error report.
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  // Always log locally with structured logger
  logger.error("Application error", error, context);

  // Send to Sentry if configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: context,
          level: "error",
        });
      } else {
        Sentry.captureMessage(String(error), {
          extra: context,
          level: "error",
        });
      }
    } catch (sentryError) {
      // Fallback: if Sentry fails, log to console
      const errorMessage = sentryError instanceof Error ? sentryError.message : String(sentryError);
      logger.warn(`Failed to send error to Sentry: ${errorMessage}`);
    }
  }
}

/**
 * Sets the user context for error reporting.
 *
 * @param {{ id: string; email?: string; username?: string }} user - The user object.
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clears the user context, for example, on logout.
 */
export function clearUserContext() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Adds a breadcrumb for debugging context in Sentry.
 *
 * @param {string} message - The breadcrumb message.
 * @param {Record<string, unknown>} [data] - Additional data to include with the breadcrumb.
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: "info",
    });
  }
}
