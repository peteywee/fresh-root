// [P1][RELIABILITY][OTEL] OpenTelemetry distributed tracing initialization
// Tags: P1, RELIABILITY, OBSERVABILITY, OTEL, TRACING, INSTRUMENTATION
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
// (no direct semantic attr constants needed; set via env vars)

/**
 * @description Configuration for initializing the OpenTelemetry SDK.
 */
export interface OTelConfig {
  /** @description The name of the service, used for identifying traces. */
  serviceName: string;
  /** @description The version of the service. */
  serviceVersion?: string;
  /** @description The OTLP endpoint to send traces to. */
  endpoint?: string;
  /** @description A flag to enable or disable tracing. */
  enabled?: boolean;
}

let sdk: NodeSDK | null = null;

/**
 * @description Dynamically loads an available OTLP trace exporter to avoid compile-time errors
 * if the exporter package is not installed.
 * @returns {new (config?: any) => any} The constructor for the OTLP trace exporter.
 * @throws {Error} If no supported OTLP trace exporter package is found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadOTLPTraceExporter(): new (config?: any) => any {
  try {
    // Preferred: HTTP exporter
    return require("@opentelemetry/exporter-trace-otlp-http").OTLPTraceExporter;
  } catch {}
  try {
    // Fallback: gRPC exporter
    return require("@opentelemetry/exporter-trace-otlp-grpc").OTLPTraceExporter;
  } catch {}
  try {
    // Fallback: proto HTTP exporter (varies by setup)
    return require("@opentelemetry/exporter-trace-otlp-proto").OTLPTraceExporter;
  } catch {}
  throw new Error(
    "No OTLP trace exporter package found. Install one of: @opentelemetry/exporter-trace-otlp-http, @opentelemetry/exporter-trace-otlp-grpc, or @opentelemetry/exporter-trace-otlp-proto.",
  );
}

/**
 * @description Initializes the OpenTelemetry SDK with auto-instrumentation for Node.js applications.
 * This function should be called before any other modules are imported to ensure all libraries are correctly instrumented.
 * @param {OTelConfig} config - The configuration for OpenTelemetry.
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
    // Create OTLP trace exporter (dynamically loaded to avoid missing module errors)
    const OTLPTraceExporterCtor = loadOTLPTraceExporter();
    const traceExporter = new OTLPTraceExporterCtor({
      url: endpoint,
    });

    // Configure service identity via environment to avoid direct Resource class dependency
    try {
      // Standard OTel envs understood by the SDK/resource detectors
      process.env.OTEL_SERVICE_NAME = serviceName;
      const attrs: string[] = [];
      if (serviceVersion) attrs.push(`service.version=${serviceVersion}`);
      if (attrs.length) {
        const prior = process.env.OTEL_RESOURCE_ATTRIBUTES?.trim();
        process.env.OTEL_RESOURCE_ATTRIBUTES =
          prior && prior.length ? `${prior},${attrs.join(",")}` : attrs.join(",");
      }
    } catch {}

    // Initialize SDK with auto-instrumentation
    sdk = new NodeSDK({
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
 * @description Retrieves the active trace context, which can be used to correlate logs with traces.
 * @returns {{traceId: string, spanId: string, traceFlags: number} | null} The trace context, or null if no active span is found.
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
  } catch (_e) {
    // OTel not available
  }
  return null;
}

/**
 * @description Manually flushes any pending traces. This is useful in serverless environments or during testing.
 * @param {number} [_timeout=5000] - The timeout in milliseconds to wait for the flush to complete.
 * @returns {Promise<void>} A promise that resolves when the traces have been flushed.
 */
export async function flushTraces(_timeout: number = 5000): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log("[otel] traces flushed");
  }
}
