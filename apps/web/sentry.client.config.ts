// [P0][OBS][SENTRY] Sentry client-side configuration
// Tags: P0, OBS, SENTRY
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust in production (e.g., 0.1 = 10%)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Note: if you want to override the automatic release value, do so here
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

    // Additional options
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // Network errors
      "NetworkError",
      "Failed to fetch",
    ],

    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
          frame.filename?.includes("extension://"),
        )
      ) {
        return null;
      }
      return event;
    },
  });
}
