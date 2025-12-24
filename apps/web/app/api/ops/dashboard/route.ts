// [P0][OPS][API] Ops dashboard metrics endpoint
// Tags: P0, OPS, API, METRICS, DASHBOARD

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { trace } from "@opentelemetry/api";
import { NextResponse } from "next/server";

/**
 * GET /api/ops/dashboard
 * Aggregated metrics for ops dashboard
 */
export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  handler: async ({ request: _request, input: _input, context, params: _params }) => {
    const tracer = trace.getTracer("ops-dashboard");
    
    return await tracer.startActiveSpan("ops.dashboard.get", async (span) => {
      try {
        const now = Date.now();
        const uptimeSeconds = process.uptime();
        const memory = process.memoryUsage();

        // System metrics
        const systemMetrics = {
          uptime: {
            seconds: Math.floor(uptimeSeconds),
            formatted: formatUptime(uptimeSeconds),
          },
          memory: {
            heapUsed: formatBytes(memory.heapUsed),
            heapTotal: formatBytes(memory.heapTotal),
            rss: formatBytes(memory.rss),
            external: formatBytes(memory.external),
            heapUsedPercent: Math.round((memory.heapUsed / memory.heapTotal) * 100),
          },
          node: {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
          },
        };

        // Environment info (safe subset)
        const environment = {
          nodeEnv: process.env.NODE_ENV || "development",
          vercelEnv: process.env.VERCEL_ENV || "local",
          region: process.env.VERCEL_REGION || "local",
          sentryEnabled: !!process.env.SENTRY_DSN,
          otelEnabled: !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
          redisEnabled: process.env.USE_REDIS_RATE_LIMIT === "true",
        };

        // Feature flags status
        const featureFlags = {
          firestoreWrites: process.env.FIRESTORE_WRITES === "true",
          realAuth: process.env.REAL_AUTH === "true",
          useRedisRateLimit: process.env.USE_REDIS_RATE_LIMIT === "true",
        };

        // Rate limiting status (from Upstash if configured)
        const rateLimiting = {
          enabled: process.env.USE_REDIS_RATE_LIMIT === "true",
          provider: process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "in-memory",
          configured: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
        };

        // Build basic health indicators
        const health = {
          status: "healthy" as const,
          lastCheck: now,
          checks: {
            memory: memory.heapUsed / memory.heapTotal < 0.9 ? "pass" : "warn",
            uptime: uptimeSeconds > 60 ? "pass" : "starting",
          },
        };

        const dashboard = {
          timestamp: now,
          requestedBy: context.auth?.userId,
          system: systemMetrics,
          environment,
          featureFlags,
          rateLimiting,
          health,
          links: {
            sentry: process.env.SENTRY_DSN ? "https://sentry.io" : null,
            vercel: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
            upstash: process.env.UPSTASH_REDIS_REST_URL ? "https://console.upstash.com" : null,
          },
        };

        span.setAttribute("ops.dashboard.status", "success");
        span.end();

        return NextResponse.json({ success: true, data: dashboard });
      } catch (error) {
        span.recordException(error as Error);
        span.end();
        
        return NextResponse.json(
          { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch dashboard metrics" } },
          { status: 500 }
        );
      }
    });
  },
});

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  
  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
