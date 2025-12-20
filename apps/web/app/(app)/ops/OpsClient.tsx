// [P1][OPS][CODE] Observability dashboard client component
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

interface BuildPerformanceEntry {
  timestamp: string;
  repository: string;
  ref: string;
  sha: string;
  runId: string;
  runAttempt: string;
  installSeconds: number;
  buildSeconds: number;
  sdkSeconds: number;
  totalSeconds: number;
  cacheHit: string;
}

interface SystemMetrics {
  health: HealthStatus | null;
  apiLatency: number | null;
  lastChecked: Date | null;
  error: string | null;
  codebaseAnalysis: CodebaseAnalysis | null;
  analysisError: string | null;
  isAnalyzing: boolean;
  buildPerformance: BuildPerformanceEntry[] | null;
  buildPerformanceError: string | null;
  isLoadingBuildPerformance: boolean;
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
          {metric.description && <p className="mt-1 text-xs text-gray-400">{metric.description}</p>}
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

export default function OpsClient({ orgId }: { orgId: string }) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    health: null,
    apiLatency: null,
    lastChecked: null,
    error: null,
    codebaseAnalysis: null,
    analysisError: null,
    isAnalyzing: false,
    buildPerformance: null,
    buildPerformanceError: null,
    isLoadingBuildPerformance: false,
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
        headers: { "x-org-id": orgId },
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
  }, [orgId]);

  const fetchBuildPerformance = useCallback(async () => {
    setMetrics((prev) => ({
      ...prev,
      isLoadingBuildPerformance: true,
      buildPerformanceError: null,
    }));

    try {
      const response = await fetch("/api/ops/build-performance?limit=12", {
        cache: "no-store",
        headers: { "x-org-id": orgId },
      });

      if (!response.ok) {
        throw new Error(`Build performance fetch failed: ${response.status}`);
      }

      const data: {
        ok: boolean;
        entries: BuildPerformanceEntry[];
        error?: string;
      } = await response.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Build performance unavailable");
      }

      setMetrics((prev) => ({
        ...prev,
        buildPerformance: data.entries,
        isLoadingBuildPerformance: false,
      }));
    } catch (err) {
      setMetrics((prev) => ({
        ...prev,
        buildPerformanceError: err instanceof Error ? err.message : "Unknown error",
        isLoadingBuildPerformance: false,
      }));
    }
  }, [orgId]);

  useEffect(() => {
    fetchMetrics();
    fetchAnalysis();
    fetchBuildPerformance();

    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics, fetchAnalysis, fetchBuildPerformance]);

  const cards: MetricCard[] = [
    {
      title: "System Health",
      value: metrics.health?.status ?? "Unknown",
      status: metrics.health?.ok ? "ok" : metrics.health ? "error" : "loading",
      description: metrics.health ? `Last updated: ${metrics.health.timestamp}` : undefined,
    },
    {
      title: "API Latency",
      value: metrics.apiLatency !== null ? `${metrics.apiLatency}ms` : "—",
      status: metrics.apiLatency !== null ? (metrics.apiLatency < 500 ? "ok" : "warning") : "loading",
      description: "Round-trip health check latency",
    },
    {
      title: "Uptime",
      value: metrics.health ? formatUptime(metrics.health.uptime) : "—",
      status: metrics.health ? "ok" : "loading",
      description: metrics.health ? metrics.health.environment : undefined,
    },
    {
      title: "Codebase Size",
      value: metrics.codebaseAnalysis ? `${metrics.codebaseAnalysis.stats.totalFiles} files` : "—",
      status: metrics.codebaseAnalysis ? "ok" : metrics.isAnalyzing ? "loading" : "warning",
      description: metrics.codebaseAnalysis
        ? `${metrics.codebaseAnalysis.stats.totalLines.toLocaleString()} lines`
        : "Deep analysis required",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ops Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Internal observability + CI trends</p>
        </div>
        <button
          onClick={() => {
            fetchMetrics();
            fetchAnalysis();
            fetchBuildPerformance();
          }}
          disabled={isRefreshing || metrics.isAnalyzing}
          className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((metric) => (
          <MetricCardComponent key={metric.title} metric={metric} />
        ))}
      </div>

      {(metrics.error || metrics.analysisError || metrics.buildPerformanceError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {metrics.error && <div>Health: {metrics.error}</div>}
          {metrics.analysisError && <div>Analysis: {metrics.analysisError}</div>}
          {metrics.buildPerformanceError && <div>Build performance: {metrics.buildPerformanceError}</div>}
        </div>
      )}

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">⚙️ CI Build Performance</h2>
          <button
            onClick={() => fetchBuildPerformance()}
            disabled={metrics.isLoadingBuildPerformance}
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {metrics.isLoadingBuildPerformance ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Timestamp</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">SHA</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Install (s)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Build (s)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">SDK (s)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Total (s)</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">Cache</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {(metrics.buildPerformance ?? []).map((e) => (
                <tr key={`${e.runId}-${e.runAttempt}`}> 
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">{e.timestamp}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-700">{e.sha.slice(0, 7)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-gray-700">{e.installSeconds}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-gray-700">{e.buildSeconds}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-gray-700">{e.sdkSeconds}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-gray-900">{e.totalSeconds}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-center text-gray-700">
                    {e.cacheHit === "true" ? "✅" : e.cacheHit === "false" ? "❌" : "—"}
                  </td>
                </tr>
              ))}
              {(!metrics.buildPerformance || metrics.buildPerformance.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                    {metrics.isLoadingBuildPerformance ? "Loading..." : "No data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">📦 Repomix Deep Analysis</h2>
          <button
            onClick={() => fetchAnalysis()}
            disabled={metrics.isAnalyzing}
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {metrics.isAnalyzing ? "Analyzing..." : "Re-run"}
          </button>
        </div>

        <div className="mt-3">
          {metrics.codebaseAnalysis ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium text-gray-700">Top-level structure</div>
                <div className="mt-1 text-sm text-gray-600">
                  Apps: {metrics.codebaseAnalysis.structure.apps.join(", ") || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  Packages: {metrics.codebaseAnalysis.structure.packages.join(", ") || "—"}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium text-gray-700">Health checks</div>
                <div className="mt-1 text-sm text-gray-600">
                  Tests: {metrics.codebaseAnalysis.health.hasTests ? "✅" : "❌"}
                </div>
                <div className="text-sm text-gray-600">CI: {metrics.codebaseAnalysis.health.hasCI ? "✅" : "❌"}</div>
                <div className="text-sm text-gray-600">
                  TypeScript: {metrics.codebaseAnalysis.health.hasTypeScript ? "✅" : "❌"}
                </div>
                <div className="text-sm text-gray-600">
                  Linting: {metrics.codebaseAnalysis.health.hasLinting ? "✅" : "❌"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">{metrics.isAnalyzing ? "Analyzing..." : "No analysis yet"}</div>
          )}
        </div>
      </section>
    </div>
  );
}
