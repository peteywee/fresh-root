// [P1][OPS][CODE] Observability dashboard page with Repomix deep analysis
// Tags: P1, OPS, CODE, dashboard, observability, repomix
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

interface CodebaseAnalysis {
  timestamp: string;
  repository: string;
  stats: {
    totalFiles: number;
    totalLines: number;
    byExtension: Record<string, { files: number; lines: number }>;
  };
  structure: {
    apps: string[];
    packages: string[];
    topLevelFiles: string[];
  };
  health: {
    hasTests: boolean;
    hasCI: boolean;
    hasTypeScript: boolean;
    hasLinting: boolean;
    hasSecurity: boolean;
  };
  metrics: {
    apiRoutes: number;
    components: number;
    schemas: number;
    testFiles: number;
  };
  _meta: {
    analysisTimeMs: number;
    cached: boolean;
  };
}

interface SystemMetrics {
  health: HealthStatus | null;
  apiLatency: number | null;
  lastChecked: Date | null;
  error: string | null;
  codebaseAnalysis: CodebaseAnalysis | null;
  analysisError: string | null;
  isAnalyzing: boolean;
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
    codebaseAnalysis: null,
    analysisError: null,
    isAnalyzing: false,
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

      setMetrics((prev) => ({
        ...prev,
        health,
        apiLatency: latency,
        lastChecked: new Date(),
        error: null,
      }));
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

  const fetchAnalysis = useCallback(async () => {
    setMetrics((prev) => ({ ...prev, isAnalyzing: true, analysisError: null }));

    try {
      const response = await fetch("/api/ops/analyze", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const analysis: CodebaseAnalysis = await response.json();

      setMetrics((prev) => ({
        ...prev,
        codebaseAnalysis: analysis,
        isAnalyzing: false,
      }));
    } catch (err) {
      setMetrics((prev) => ({
        ...prev,
        analysisError: err instanceof Error ? err.message : "Unknown error",
        isAnalyzing: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchAnalysis();
    // Refresh health every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics, fetchAnalysis]);

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

        {/* Codebase Analysis Section */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              📊 Codebase Deep Analysis
            </h2>
            <button
              onClick={fetchAnalysis}
              disabled={metrics.isAnalyzing}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {metrics.isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>

          {metrics.analysisError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <strong>Error:</strong> {metrics.analysisError}
            </div>
          )}

          {metrics.isAnalyzing && !metrics.codebaseAnalysis && (
            <div className="animate-pulse space-y-4">
              <div className="h-20 rounded bg-gray-100" />
              <div className="h-40 rounded bg-gray-100" />
            </div>
          )}

          {metrics.codebaseAnalysis && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {metrics.codebaseAnalysis.stats.totalFiles.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Files</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {metrics.codebaseAnalysis.stats.totalLines.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Lines of Code</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {metrics.codebaseAnalysis.metrics.apiRoutes}
                  </div>
                  <div className="text-sm text-purple-700">API Routes</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                  <div className="text-2xl font-bold text-orange-900">
                    {metrics.codebaseAnalysis.metrics.testFiles}
                  </div>
                  <div className="text-sm text-orange-700">Test Files</div>
                </div>
              </div>

              {/* Project Health */}
              <div>
                <h3 className="mb-3 font-medium text-gray-900">Project Health</h3>
                <div className="grid gap-2 sm:grid-cols-5">
                  <HealthIndicator
                    label="TypeScript"
                    enabled={metrics.codebaseAnalysis.health.hasTypeScript}
                  />
                  <HealthIndicator
                    label="Tests"
                    enabled={metrics.codebaseAnalysis.health.hasTests}
                  />
                  <HealthIndicator
                    label="CI/CD"
                    enabled={metrics.codebaseAnalysis.health.hasCI}
                  />
                  <HealthIndicator
                    label="Linting"
                    enabled={metrics.codebaseAnalysis.health.hasLinting}
                  />
                  <HealthIndicator
                    label="Security"
                    enabled={metrics.codebaseAnalysis.health.hasSecurity}
                  />
                </div>
              </div>

              {/* File Distribution */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium text-gray-900">
                    Files by Extension
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(metrics.codebaseAnalysis.stats.byExtension)
                      .sort((a, b) => b[1].lines - a[1].lines)
                      .slice(0, 8)
                      .map(([ext, data]) => (
                        <FileExtensionBar
                          key={ext}
                          extension={ext}
                          files={data.files}
                          lines={data.lines}
                          totalLines={metrics.codebaseAnalysis!.stats.totalLines}
                        />
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium text-gray-900">
                    Monorepo Structure
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Apps</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {metrics.codebaseAnalysis.structure.apps.map((app) => (
                          <span
                            key={app}
                            className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Packages
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {metrics.codebaseAnalysis.structure.packages.map((pkg) => (
                          <span
                            key={pkg}
                            className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800"
                          >
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="border-t pt-4 text-xs text-gray-400">
                Analysis completed in {metrics.codebaseAnalysis._meta.analysisTimeMs}ms
                • Last run: {new Date(metrics.codebaseAnalysis.timestamp).toLocaleString()}
              </div>
            </div>
          )}
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

function HealthIndicator({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border p-2 ${
        enabled ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <span className={enabled ? "text-green-600" : "text-gray-400"}>
        {enabled ? "✓" : "○"}
      </span>
      <span className={`text-sm ${enabled ? "text-green-800" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}

function FileExtensionBar({
  extension,
  files,
  lines,
  totalLines,
}: {
  extension: string;
  files: number;
  lines: number;
  totalLines: number;
}) {
  const percentage = Math.round((lines / totalLines) * 100);
  const barWidth = Math.max(percentage, 2); // Minimum 2% width for visibility

  const colorMap: Record<string, string> = {
    ".ts": "bg-blue-500",
    ".tsx": "bg-cyan-500",
    ".js": "bg-yellow-500",
    ".jsx": "bg-orange-500",
    ".json": "bg-gray-500",
    ".md": "bg-green-500",
    ".yml": "bg-purple-500",
    ".yaml": "bg-purple-500",
    ".css": "bg-pink-500",
    ".scss": "bg-rose-500",
  };

  const bgColor = colorMap[extension] || "bg-gray-400";

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-right text-xs font-mono text-gray-600">{extension}</div>
      <div className="flex-1">
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full ${bgColor} transition-all duration-500`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      <div className="w-20 text-right text-xs text-gray-500">
        {files} files
      </div>
      <div className="w-24 text-right text-xs font-medium text-gray-700">
        {lines.toLocaleString()} lines
      </div>
    </div>
  );
}
