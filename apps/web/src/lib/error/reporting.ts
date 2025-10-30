// Centralized error reporting with a safe no-op fallback.
// If NEXT_PUBLIC_SENTRY_DSN is set and @sentry/nextjs is installed,
// we capture exceptions there; otherwise we console.error.

let sentryLoaded = false;
// Use loose typing to avoid requiring @sentry/nextjs types at build time
let Sentry: any = null;

export async function initErrorReporting() {
  if (sentryLoaded) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // no-op if DSN not set
  try {
  const importer = new Function('s', 'return import(s)') as (s: string) => Promise<any>;
  const mod: any = await importer('@sentry/nextjs');
  mod?.init?.({ dsn });
  Sentry = mod || null;
    sentryLoaded = true;
  } catch (e) {
    // Avoid hard-crashing if package is not present — keep it optional
    // to honor "no unmet peers" policy.
    // If you want strict enforcement, add @sentry/nextjs to deps.
    // eslint-disable-next-line no-console
    console.warn('Sentry not available; falling back to console error.');
  }
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (Sentry && typeof Sentry.captureException === 'function') {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } else {
    // Safe fallback: minimal PII, structured
    // eslint-disable-next-line no-console
    console.error('[ERR]', {
      message: (error as any)?.message || String(error),
      stack: (error as any)?.stack || null,
      context: context || null,
    });
  }
}
