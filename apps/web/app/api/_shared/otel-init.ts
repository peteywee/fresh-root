// [P1][OBSERVABILITY][OTEL] Otel Init
// Tags: P1, OBSERVABILITY, OTEL
/**
 * apps/web/app/api/_shared/otel-init.ts
 *
 * OpenTelemetry Node SDK bootstrap for Fresh Root web API.
 *
 * This uses OTLP HTTP exporter. Tracing is enabled only when
 * OTEL_EXPORTER_OTLP_ENDPOINT is set in the environment.
 */

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK, resources } from "@opentelemetry/sdk-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// Lazy-import env to avoid module-level side effects during build
let OTEL_ENABLED: boolean | null = null;

function isOtelEnabled(): boolean {
  if (OTEL_ENABLED === null) {
    // Import env only when actually checking if OTEL is enabled

    const { env } = require("@/src/env");
    OTEL_ENABLED = Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT) && Boolean(env.OBSERVABILITY_TRACES_ENABLED);
  }
  return OTEL_ENABLED;
}

let sdk: NodeSDK | null = null;

/**
 * Ensure the OTEL SDK is started exactly once.
 *
 * Safe to call multiple times; subsequent calls are no-ops.
 */
export function ensureOtelStarted(): void {
  if (!isOtelEnabled()) {
    return;
  }

  const g = globalThis as any;

  if (g.__freshRootOtelStarted) {
    return;
  }

  // Import env here, inside the function, to avoid module-level side effects

  const { env } = require("@/src/env");

  const exporter = new OTLPTraceExporter({
    url: env.OTEL_EXPORTER_OTLP_ENDPOINT as string,
  });

  sdk = new NodeSDK({
    traceExporter: exporter,
    resource: resources.resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: "fresh-root-web-api",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
    }),
  });

  // Start the SDK synchronously
  try {
    sdk.start();

    console.log("[otel] OpenTelemetry SDK started");
  } catch (err) {
    console.error("[otel] Failed to start OpenTelemetry SDK", err);
  }

  g.__freshRootOtelStarted = true;
}

/**
 * Optional graceful shutdown hook if you ever need it.
 */
export async function shutdownOtel(): Promise<void> {
  if (!sdk) {
    return;
  }
  try {
    await sdk.shutdown();

    console.log("[otel] OpenTelemetry SDK shutdown complete");
  } catch (err) {
    console.error("[otel] Error during OpenTelemetry shutdown", err);
  }
}
