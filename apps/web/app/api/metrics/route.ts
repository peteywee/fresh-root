// [P1][OBSERVABILITY][METRICS] Prometheus-compatible metrics endpoint
// Tags: P1, OBSERVABILITY, METRICS
import { NextResponse } from "next/server";

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
 * Records a request metric in the in-memory store.
 *
 * @param {string} method - The HTTP method of the request.
 * @param {string} path - The path of the request.
 * @param {number} duration - The duration of the request in milliseconds.
 * @param {number} statusCode - The status code of the response.
 */
export function recordRequest(method: string, path: string, duration: number, statusCode: number) {
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
 * Calculates the percentile of a given array of numbers.
 *
 * @param {number[]} arr - The array of numbers.
 * @param {number} p - The percentile to calculate (0-100).
 * @returns {number} The value at the given percentile.
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Formats the in-memory metrics into the Prometheus text format.
 *
 * @returns {string} The formatted metrics as a string.
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

/**
 * Handles GET requests to `/api/metrics` to expose Prometheus-compatible metrics.
 *
 * @returns {Promise<NextResponse>} A promise that resolves to a response with the formatted metrics.
 */
export async function GET() {
  // Return metrics in Prometheus text format
  const metricsText = formatPrometheusMetrics();

  return new NextResponse(metricsText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
