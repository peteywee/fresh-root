// [P1][OBS][OTEL] Next.js instrumentation entrypoint (server-only)
// Tags: P1, OBS, OTEL
// NOTE: This file intentionally uses runtime `require()` to import OpenTelemetry
// packages only when running in the Node server runtime. Keeping these imports
// behind a runtime guard prevents Turbopack from attempting to bundle Node-only
// modules into Edge/client runtimes where they would cause __import_unsupported
// and similar errors.

let started = false;

export function register() {
  // Only run on Node runtime (not edge)
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (started) return;
  started = true;

  // === SKIP DURING BUILD ===
  // During build, Next.js will call register() but we must NOT initialize
  // any instrumentation, env validation, or network clients. Build must complete
  // quickly without network I/O or waiting for infrastructure.
  const NEXT_PHASE = (process as any).env.NEXT_PHASE || "";
  const isBuildPhase = NEXT_PHASE.includes("build");

  if (isBuildPhase) {
    // Skip all initialization during build phase
    return;
  }

  // === Import and validate server environment ===
  // Import and validate server environment at startup. Keep as a runtime
  // require so bundlers won't pull this into client bundles.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { loadServerEnv } = require("./src/lib/env.server");
    loadServerEnv();
  } catch (error) {
    console.error("[instrumentation] Failed to load server environment:", error);
    throw error; // Fail fast
  }

  // === Environment validation (production only) ===
  try {
    if (process.env.NODE_ENV === "production") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { env, preFlightChecks, getMultiInstanceInfo } = require("@packages/env");

      console.log("\n📋 Validating production environment...");
      preFlightChecks(env);

      const info = getMultiInstanceInfo(env);
      if (info.riskLevel === "critical") {
        console.error(`\n❌ CRITICAL: ${info.message}`);
        // Use throw instead of process.exit to avoid Edge Runtime incompatibility
        throw new Error(`Critical environment validation failure: ${info.message}`);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("[instrumentation] Environment validation failed:", error);
      throw error;
    } else {
      console.warn("[instrumentation] Environment validation warning (dev mode):", error);
    }
  }

  // === OpenTelemetry SDK (optional, with timeout guard) ===
  // Initialize OTEL only in runtime, NOT during build. SDK initialization
  // can hang if network endpoints are unreachable, so we add a timeout.
  initializeOpenTelemetryWithTimeout();
}

/**
 * Initialize OpenTelemetry SDK with a timeout to prevent hangs.
 * This runs only in production runtime, never during build.
 *
 * NOTE: OTEL SDK initialization can hang on unreachable network endpoints.
 * We skip it during module load and don't initialize it at all in dev.
 * If needed, OTEL can be initialized lazily on first request or via a separate process.
 */
function initializeOpenTelemetryWithTimeout(): void {
  // OTEL is optional and must never block startup.
  // We rely on `ensureOtelStarted()` which is idempotent and does not await
  // network I/O on startup.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ensureOtelStarted } = require("./app/api/_shared/otel-init");
    ensureOtelStarted();
  } catch (err) {
    console.warn("[instrumentation] OTEL initialization skipped:", err);
  }
}
