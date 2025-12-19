// [P1][OPS][CODE] Observability dashboard page
// Tags: P1, OPS, CODE, dashboard, observability
"use client";

import React, { useEffect, useState, useCallback } from "react";

interface HealthStatus {
  ok: boolean;
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  status: "ok" | "warning" | "error" | "loading";
  description?: string;
}

interface SystemMetrics {
  health: HealthStatus | null;
  apiLatency: number | null;
  lastChecked: Date | null;
  error: string | null;
}

function StatusBadge({ status }: { status: MetricCard["status"] }) {
  const colors = {
    ok: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    loading: "bg-gray-100 text-gray-600 border-gray-200 animate-pulse",
  };

  const labels = {
    ok: "Healthy",
    warning: "Warning",
    error: "Error",
    loading: "Loading...",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{metric.title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
          {metric.description && (
            <p className="mt-1 text-xs text-gray-400">{metric.description}</p>
          )}
        </div>
        <StatusBadge status={metric.status} />
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function OpsPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    health: null,
    apiLatency: null,
    lastChecked: null,
    error: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = performance.now();

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const health: HealthStatus = await response.json();

      setMetrics({
        health,
        apiLatency: latency,
        lastChecked: new Date(),
        error: null,
      });
    } catch (err) {
      setMetrics((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
        lastChecked: new Date(),
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const cards: MetricCard[] = [
    {
      title: "System Health",
      value: metrics.health?.status ?? "Unknown",
      status: metrics.health?.ok ? "ok" : metrics.error ? "error" : "loading",
      description: metrics.error ?? undefined,
    },
    {
      title: "API Latency",
      value: metrics.apiLatency ? `${metrics.apiLatency}ms` : "—",
      status:
        metrics.apiLatency === null
          ? "loading"
          : metrics.apiLatency < 200
            ? "ok"
            : metrics.apiLatency < 500
              ? "warning"
              : "error",
      description: "Response time for /api/health",
    },
    {
      title: "Uptime",
      value: metrics.health?.uptime ? formatUptime(metrics.health.uptime) : "—",
      status: metrics.health?.uptime ? "ok" : "loading",
      description: "Process uptime since last restart",
    },
    {
      title: "Environment",
      value: metrics.health?.environment ?? "—",
      status:
        metrics.health?.environment === "production"
          ? "ok"
          : metrics.health?.environment
            ? "warning"
            : "loading",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ops Dashboard</h1>
            <p className="text-sm text-gray-500">
              System health and observability at a glance
            </p>
          </div>
          <div className="flex items-center gap-4">
            {metrics.lastChecked && (
              <span className="text-xs text-gray-400">
                Updated {metrics.lastChecked.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchMetrics}
              disabled={isRefreshing}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <MetricCardComponent key={card.title} metric={card} />
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Quick Links */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h2>
            <div className="space-y-2">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border p-3 hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Firebase Console</div>
                <div className="text-sm text-gray-500">
                  Firestore, Auth, Functions, Hosting
                </div>
              </a>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border p-3 hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Vercel Dashboard</div>
                <div className="text-sm text-gray-500">
                  Deployments, Analytics, Logs
                </div>
              </a>
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border p-3 hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Sentry</div>
                <div className="text-sm text-gray-500">
                  Error tracking and performance monitoring
                </div>
              </a>
              <a
                href="https://github.com/peteywee/fresh-root/security"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border p-3 hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">GitHub Security</div>
                <div className="text-sm text-gray-500">
                  Dependabot, Code scanning, Secrets
                </div>
              </a>
            </div>
          </div>

          {/* Health Details */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Health Details</h2>
            {metrics.health ? (
              <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(metrics.health, null, 2)}
              </pre>
            ) : metrics.error ? (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                <strong>Error:</strong> {metrics.error}
              </div>
            ) : (
              <div className="animate-pulse rounded-md bg-gray-100 p-4">
                Loading health data...
              </div>
            )}
          </div>
        </div>

        {/* Integrations Status */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Integrations</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IntegrationStatus
              name="OpenTelemetry"
              status="configured"
              description="Tracing & metrics via SDK"
            />
            <IntegrationStatus
              name="Sentry"
              status="configured"
              description="Error tracking & performance"
            />
            <IntegrationStatus
              name="Firebase"
              status="configured"
              description="Auth, Firestore, Functions"
            />
            <IntegrationStatus
              name="Semgrep"
              status="configured"
              description="Security scanning in CI"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Fresh Schedules v1.4.1 • Auto-refreshes every 30 seconds
        </div>
      </div>
    </main>
  );
}

function IntegrationStatus({
  name,
  status,
  description,
}: {
  name: string;
  status: "configured" | "not-configured" | "error";
  description: string;
}) {
  const statusColors = {
    configured: "text-green-600",
    "not-configured": "text-gray-400",
    error: "text-red-600",
  };

  const statusIcons = {
    configured: "✓",
    "not-configured": "○",
    error: "✗",
  };

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <span className={`text-lg ${statusColors[status]}`}>{statusIcons[status]}</span>
      <div>
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  );
}
