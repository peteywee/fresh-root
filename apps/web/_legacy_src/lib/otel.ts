// [P2][OBS][OTEL] Helpers for manual spans
// Tags: P2, OBS, OTEL
import { trace, SpanStatusCode } from "@opentelemetry/api";

export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attrs?: Record<string, unknown>,
): Promise<T> {
  const tracer = trace.getTracer("apps-web");
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          // OTel attributes may be string | number | boolean | Array of those
          if (Array.isArray(v)) {
            if (v.every((x) => typeof x === "string")) {
              span.setAttribute(k, v as string[]);
            } else if (v.every((x) => typeof x === "number")) {
              span.setAttribute(k, v as number[]);
            } else if (v.every((x) => typeof x === "boolean")) {
              span.setAttribute(k, v as boolean[]);
            } else {
              span.setAttribute(k, v.map(String));
            }
          } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            span.setAttribute(k, v);
          } else {
            span.setAttribute(k, String(v));
          }
        }
      }
      const result = await fn();
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
