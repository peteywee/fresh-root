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

function isOtelEnabled(): boolean {
  // Avoid importing env modules here (keeps this safe in tests/build tooling).
  // These env vars are already validated elsewhere at runtime.
  return (
    Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT) &&
    process.env.OBSERVABILITY_TRACES_ENABLED === "true"
  );
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

  // Set early to prevent races in concurrent startup paths.
  g.__freshRootOtelStarted = true;

  // Import env here, inside the function, to avoid module-level side effects
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT as string,
  });

  sdk = new NodeSDK({
    traceExporter: exporter,
    resource: resources.resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: "fresh-root-web-api",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    }),
  });

  try {
    const startResult = sdk.start();
    const maybePromise = startResult as unknown as Promise<void> | void;

    if (maybePromise && typeof (maybePromise as any).then === "function") {
      const timeoutMs = 5_000;
      const timeout = setTimeout(() => {
        console.warn(`[otel] OpenTelemetry SDK start still pending after ${timeoutMs}ms`);
      }, timeoutMs);

      void (maybePromise as Promise<void>)
        .then(() => {
          console.log("[otel] OpenTelemetry SDK started");
        })
        .catch((err) => {
          console.error("[otel] Failed to start OpenTelemetry SDK", err);
        })
        .finally(() => {
          clearTimeout(timeout);
        });
    } else {
      console.log("[otel] OpenTelemetry SDK started");
    }
  } catch (err) {
    console.error("[otel] Failed to start OpenTelemetry SDK", err);
  }
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
