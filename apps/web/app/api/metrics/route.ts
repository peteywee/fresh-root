// [P0][METRICS][API] Prometheus metrics endpoint
import { NextResponse } from "next/server";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

/**
 * Metrics endpoint exposing Prometheus-compatible metrics.
 * This is a simple implementation that tracks basic counters.
 * For production, consider using @opentelemetry/api with a proper registry.
 */

// In-memory metrics store (will be replaced with proper instrumentation)
interface Metrics {
  http_requests_total: Record<string, number>;
  http_request_duration_seconds: Record<string, number[]>;
  http_errors_total: Record<string, number>;
}

// Global metrics object (temporary - will use OpenTelemetry in production)
const metrics: Metrics = {
  http_requests_total: {},
  http_request_duration_seconds: {},
  http_errors_total: {},
};

/**
 * Record a request metric
 */
function _recordRequest(method: string, path: string, duration: number, statusCode: number) {
  const key = `${method}_${path}`;

  // Count total requests
  metrics.http_requests_total[key] = (metrics.http_requests_total[key] || 0) + 1;

  // Record duration
  if (!metrics.http_request_duration_seconds[key]) {
    metrics.http_request_duration_seconds[key] = [];
  }
  metrics.http_request_duration_seconds[key].push(duration);

  // Count errors
  if (statusCode >= 400) {
    metrics.http_errors_total[key] = (metrics.http_errors_total[key] || 0) + 1;
  }
}

/**
 * Calculate percentile from array of values
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Format metrics in Prometheus text format
 */
function formatPrometheusMetrics(): string {
  const lines: string[] = [];

  // HTTP requests total
  lines.push("# HELP http_requests_total Total number of HTTP requests");
  lines.push("# TYPE http_requests_total counter");
  for (const [key, count] of Object.entries(metrics.http_requests_total)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    lines.push(`http_requests_total{method="${method}",path="${path}"} ${count}`);
  }

  // HTTP request duration (p50, p95, p99)
  lines.push("");
  lines.push("# HELP http_request_duration_seconds HTTP request duration in seconds");
  lines.push("# TYPE http_request_duration_seconds summary");
  for (const [key, durations] of Object.entries(metrics.http_request_duration_seconds)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    const p50 = percentile(durations, 50) / 1000; // Convert ms to seconds
    const p95 = percentile(durations, 95) / 1000;
    const p99 = percentile(durations, 99) / 1000;
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.5"} ${p50.toFixed(3)}`,
    );
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.95"} ${p95.toFixed(3)}`,
    );
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.99"} ${p99.toFixed(3)}`,
    );
  }

  // HTTP errors total
  lines.push("");
  lines.push("# HELP http_errors_total Total number of HTTP errors (4xx, 5xx)");
  lines.push("# TYPE http_errors_total counter");
  for (const [key, count] of Object.entries(metrics.http_errors_total)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    lines.push(`http_errors_total{method="${method}",path="${path}"} ${count}`);
  }

  return lines.join("\n") + "\n";
}

export const GET = createPublicEndpoint({
  handler: async () => {
    // Return metrics in Prometheus text format
    const metricsText = formatPrometheusMetrics();

    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    });
  },
});
