// [P0][OBS][SENTRY] Sentry server-side configuration
// Tags: P0, OBS, SENTRY
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust in production (e.g., 0.05 = 5%)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Note: if you want to override the automatic release value, do so here
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

    // Server-side error handling
    beforeSend(event, hint) {
      // Add server context
      if (event.request) {
        event.tags = {
          ...event.tags,
          server: "true",
        };
      }
      return event;
    },
  });
}
