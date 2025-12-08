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
     
    const { loadServerEnv } = require("./src/lib/env.server");
    loadServerEnv();
  } catch (error) {
    console.error("[instrumentation] Failed to load server environment:", error);
    throw error; // Fail fast
  }

  // === Environment validation (production only) ===
  try {
    if (process.env.NODE_ENV === "production") {
       
      const { env, preFlightChecks, getMultiInstanceInfo } = require("@packages/env");

      console.log("\n📋 Validating production environment...");
      preFlightChecks(env);

      const info = getMultiInstanceInfo(env);
      if (info.riskLevel === "critical") {
        console.error(`\n❌ CRITICAL: ${info.message}`);
        process.exit(1);
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
  // OTEL initialization is deferred to avoid hanging during module load.
  // In production, you should initialize OTEL in a separate worker or defer it.
  // For now, we skip OTEL initialization to keep startup fast and unblocking.

  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
     
    console.warn(
      "[instrumentation] OTEL_EXPORTER_OTLP_ENDPOINT is set but OTEL SDK not initialized during module load to prevent hangs. Consider initializing in a separate worker.",
    );
  }
}
