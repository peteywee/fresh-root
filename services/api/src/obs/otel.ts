// [P1][RELIABILITY][OTEL] OpenTelemetry distributed tracing initialization
// Tags: P1, RELIABILITY, OBSERVABILITY, OTEL, TRACING, INSTRUMENTATION
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

export interface OTelConfig {
  serviceName: string;
  serviceVersion?: string;
  endpoint?: string;
  enabled?: boolean;
}

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry SDK with auto-instrumentation for Express, HTTP, and more.
 * Must be called BEFORE any other imports that should be instrumented.
 * 
 * @example
 * ```typescript
 * import { initOTel } from './obs/otel.js';
 * 
 * initOTel({
 *   serviceName: 'fresh-schedules-api',
 *   serviceVersion: '1.0.0',
 *   endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
 * });
 * 
 * // Now import Express and other instrumented libraries
 * import express from 'express';
 * ```
 */
export function initOTel(config: OTelConfig): void {
  const { serviceName, serviceVersion, endpoint, enabled = true } = config;

  // Skip if disabled or no endpoint configured
  if (!enabled || !endpoint) {
    console.log("[otel] tracing disabled (no endpoint or explicitly disabled)");
    return;
  }

  try {
    // Create OTLP trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: endpoint,
    });

    // Configure resource with service metadata
    const resource = Resource.default().merge(
      new Resource({
        [SEMRESATTRS_SERVICE_NAME]: serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: serviceVersion || "unknown",
      }),
    );

    // Initialize SDK with auto-instrumentation
    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Enable Express instrumentation
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
          // Enable HTTP instrumentation
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            // Capture request/response headers for debugging
            requestHook: (span, request) => {
                const userAgent =
                  "headers" in request && request.headers
                    ? request.headers["user-agent"] || "unknown"
                    : "unknown";
                span.setAttribute("http.user_agent", userAgent);
            },
          },
          // Enable DNS instrumentation
          "@opentelemetry/instrumentation-dns": {
            enabled: true,
          },
          // Enable net instrumentation
          "@opentelemetry/instrumentation-net": {
            enabled: true,
          },
          // Disable FS instrumentation (too noisy)
          "@opentelemetry/instrumentation-fs": {
            enabled: false,
          },
        }),
      ],
    });

    sdk.start();
    console.log(`[otel] initialized with endpoint=${endpoint}, service=${serviceName}`);

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", async () => {
      try {
        await sdk?.shutdown();
        console.log("[otel] shutdown complete");
      } catch (error) {
        console.error("[otel] error during shutdown:", error);
      }
    });
  } catch (error) {
    console.error("[otel] failed to initialize:", error);
  }
}

/**
 * Get the active trace context for correlation with logs.
 * Use this to attach trace IDs to log entries.
 * 
 * @example
 * ```typescript
 * import { trace } from '@opentelemetry/api';
 * 
 * const span = trace.getActiveSpan();
 * if (span) {
 *   const traceId = span.spanContext().traceId;
 *   logger.info('Processing request', { traceId });
 * }
 * ```
 */
export function getTraceContext() {
  // Import dynamically to avoid breaking if OTel not initialized
  try {
    const { trace } = require("@opentelemetry/api");
    const span = trace.getActiveSpan();
    if (span) {
      const ctx = span.spanContext();
      return {
        traceId: ctx.traceId,
        spanId: ctx.spanId,
        traceFlags: ctx.traceFlags,
      };
    }
  } catch (e) {
    // OTel not available
  }
  return null;
}

/**
 * Manually flush pending traces (useful for serverless or testing).
 */
export async function flushTraces(timeout: number = 5000): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log("[otel] traces flushed");
  }
}
