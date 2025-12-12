// [P1][OBSERVABILITY][OTEL] Otel
// Tags: P1, OBSERVABILITY, OTEL
/**
 * apps/web/app/api/_shared/otel.ts
 *
 * OpenTelemetry helper functions for tracing API requests.
 *
 * This file exposes:
 *   - traceFn(method, path, duration, statusCode): compatibility helper
 *   - withSpan(name, fn, attributes?): helper to wrap async functions in spans
 */

import { context, trace, SpanStatusCode, type Attributes } from "@opentelemetry/api";

import { ensureOtelStarted } from "./otel-init";

const tracer = trace.getTracer("fresh-root-web-api");

/**
 * Compatibility helper matching the original stub signature.
 *
 * This is ideal for use in middleware where you already measure duration.
 */
export function traceFn(
  method: string,
  path: string,
  durationMs: number,
  statusCode: number,
): void {
  // If OTEL isn't configured, this is a no-op.
  ensureOtelStarted();

  const span = tracer.startSpan(`${method.toUpperCase()} ${path}`, {
    attributes: {
      "http.method": method.toUpperCase(),
      "http.route": path,
      "http.status_code": statusCode,
      "http.server.duration_ms": durationMs,
    },
  });

  if (statusCode >= 500) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `HTTP ${statusCode}`,
    });
  } else {
    span.setStatus({ code: SpanStatusCode.OK });
  }

  span.end();
}

/**
 * General-purpose helper to run an async function within a span.
 *
 * Example:
 *   return withSpan("schedules.list", { "tenant.orgId": orgId }, async (span) => {
 *     // handler logic here
 *   });
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: import("@opentelemetry/api").Span) => Promise<T>,
): Promise<T> {
  ensureOtelStarted();

  return await context.with(trace.setSpan(context.active(), tracer.startSpan(name)), async () => {
    const span = trace.getSpan(context.active());
    if (!span) {
      // OTEL disabled or failed to init; just run the function.
      return await fn(undefined as unknown as import("@opentelemetry/api").Span);
    }

    try {
      span.setAttributes(attributes);
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err?.message ?? "Unknown error",
      });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  });
}
