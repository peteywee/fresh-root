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

  // === Fail-fast environment validation ===
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

  // Dynamically require OpenTelemetry modules so they are only loaded in the
  // Node server runtime. If the optional packages are missing, warn and return
  // without crashing the server.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let diagModule: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    diagModule = require("@opentelemetry/api");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeSDK, resources } = require("@opentelemetry/sdk-node");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const semantic = require("@opentelemetry/semantic-conventions");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

    const { diag, DiagConsoleLogger, DiagLogLevel } = diagModule;

    // Minimal diagnostics
    if (process.env.OTEL_DEBUG === "1") {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    } else {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
    }

    const serviceName = process.env.OTEL_SERVICE_NAME || "apps-web";
    const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";
    const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

    // Prefer OTLP HTTP exporter if endpoint provided, else fall back to console in dev
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const traceExporter = otlpEndpoint
      ? new OTLPTraceExporter({ url: `${otlpEndpoint.replace(/\/$/, "")}/v1/traces` })
      : environment === "development"
        ? new ConsoleSpanExporter()
        : undefined;

    const sdk = new NodeSDK({
      resource: resources.resourceFromAttributes({
        [semantic.SEMRESATTRS_SERVICE_NAME]: serviceName,
        [semantic.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
        [semantic.SEMRESATTRS_SERVICE_VERSION]: commitSha || "unknown",
      }),
      // When using ConsoleSpanExporter, NodeSDK will wrap it for us
      traceExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // Fire and forget
    void sdk.start();
  } catch (err) {
    // Optional instrumentation packages are not present or failed to load.
    // Warn but do not crash the server.
    // eslint-disable-next-line no-console
    console.warn("[instrumentation] OpenTelemetry not initialized (optional):", err);
    return;
  }
}
