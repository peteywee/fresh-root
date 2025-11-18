// [P1][OBS][OTEL] Next.js instrumentation entrypoint (server-only)
// Tags: P1, OBS, OTEL
// Lazy-load OpenTelemetry packages inside `register` so importing this
// module does not immediately pull heavy native deps during tests.
let started = false;

export function register() {
  // Skip instrumentation during tests or when telemetry explicitly disabled
  const isTest = process.env.NODE_ENV === "test" || !!process.env.VITEST;
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.NEXT_TELEMETRY_DISABLED === "1" || isTest) {
    started = true;
    return;
  }
  if (started) return;
  started = true;

  // === Fail-fast environment validation ===
  // Import and validate server environment at startup
  // This ensures the app won't start with missing or invalid configuration
  try {
    const { loadServerEnv } = require("./src/lib/env.server");
    loadServerEnv();
  } catch (error) {
    // In production we want fail-fast. During tests, warn and no-op so tests
    // can run without full instrumentation environment configured.
    if (process.env.NODE_ENV === "test" || !!process.env.VITEST) {
       
      console.warn("[instrumentation] loadServerEnv failed in test mode:", error);
      return;
    }
    console.error("[instrumentation] Failed to load server environment:", error);
    throw error;
  }
  // Lazy-load OTEL packages now that we've confirmed we should start.
  let diag: any;
  let DiagConsoleLogger: any;
  let DiagLogLevel: any;
  let NodeSDK: any;
  let resources: any;
  let SEMRESATTRS_SERVICE_NAME: string | symbol = "service.name";
  let SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: string | symbol = "deployment.environment";
  let SEMRESATTRS_SERVICE_VERSION: string | symbol = "service.version";
  let OTLPTraceExporter: any;
  let getNodeAutoInstrumentations: any;
  let ConsoleSpanExporter: any;

  try {
    const otelApi = require("@opentelemetry/api");
    diag = otelApi.diag;
    DiagConsoleLogger = otelApi.DiagConsoleLogger;
    DiagLogLevel = otelApi.DiagLogLevel;

    const sdkNode = require("@opentelemetry/sdk-node");
    NodeSDK = sdkNode.NodeSDK;
    resources = sdkNode.resources;

    const sem = require("@opentelemetry/semantic-conventions");
    SEMRESATTRS_SERVICE_NAME = sem.SEMRESATTRS_SERVICE_NAME || "service.name";
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = sem.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT || "deployment.environment";
    SEMRESATTRS_SERVICE_VERSION = sem.SEMRESATTRS_SERVICE_VERSION || "service.version";

    const exporterPkg = require("@opentelemetry/exporter-trace-otlp-http");
    OTLPTraceExporter = exporterPkg.OTLPTraceExporter;

    const autoInstr = require("@opentelemetry/auto-instrumentations-node");
    getNodeAutoInstrumentations = autoInstr.getNodeAutoInstrumentations;

    const traceBase = require("@opentelemetry/sdk-trace-base");
    ConsoleSpanExporter = traceBase.ConsoleSpanExporter;
  } catch (err) {
    // If OTEL packages are not installed or fail to load, log and noop.
    // This keeps the runtime resilient in test and low-memory environments.
     
    console.warn("[instrumentation] OpenTelemetry packages not available, skipping instrumentation:", err && err.message ? err.message : err);
    return;
  }

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
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
      [SEMRESATTRS_SERVICE_VERSION]: commitSha || "unknown",
    }),
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Fire and forget
  void sdk.start();
}
