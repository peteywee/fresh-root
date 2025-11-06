// [P1][OBS][OTEL] Next.js instrumentation entrypoint (server-only)
// Tags: P1, OBS, OTEL
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { NodeSDK, resources } from "@opentelemetry/sdk-node";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

let started = false;

export function register() {
  // Only run on Node runtime (not edge)
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (started) return;
  started = true;

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
    // When using ConsoleSpanExporter, NodeSDK will wrap it for us
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Fire and forget
  void sdk.start();
}
