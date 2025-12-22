// [P1][OPS][CODE] Build performance page with trend charts
// Tags: P1, OPS, CODE, builds, charts
"use client";

import { useEffect, useState, useMemo } from "react";
import StatCard from "../_components/StatCard";
import TrendChart from "../_components/TrendChart";

type BuildPerformanceEntry = {
  id: string;
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
  cacheHit: boolean;
  createdAt: number;
};

interface ApiResponse {
  ok: boolean;
  source: string;
  data: BuildPerformanceEntry[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

function calculateStats(entries: BuildPerformanceEntry[]) {
  if (entries.length === 0) {
    return {
      avgTotal: 0,
      avgInstall: 0,
      avgBuild: 0,
      avgSdk: 0,
      cacheHitRate: 0,
      p50: 0,
      p95: 0,
      trend: "neutral" as const,
      trendPercent: 0,
    };
  }

  const totals = entries.map((e) => e.totalSeconds);
  const sorted = [...totals].sort((a, b) => a - b);

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const percentile = (arr: number[], p: number) => {
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const avgTotal = avg(totals);
  const cacheHits = entries.filter((e) => e.cacheHit).length;

  // Trend: compare last 5 to previous 5
  let trend: "up" | "down" | "neutral" = "neutral";
  let trendPercent = 0;

  if (entries.length >= 10) {
    const recent5 = avg(totals.slice(0, 5));
    const prev5 = avg(totals.slice(5, 10));
    const diff = ((recent5 - prev5) / prev5) * 100;
    trendPercent = Math.abs(diff);
    trend = diff < -5 ? "up" : diff > 5 ? "down" : "neutral";
  }

  return {
    avgTotal,
    avgInstall: avg(entries.map((e) => e.installSeconds)),
    avgBuild: avg(entries.map((e) => e.buildSeconds)),
    avgSdk: avg(entries.map((e) => e.sdkSeconds)),
    cacheHitRate: cacheHits / entries.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    trend,
    trendPercent,
  };
}

export default function BuildsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ops/build-performance?limit=50");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiResponse;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data?.data) return null;
    return calculateStats(data.data);
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((entry) => ({
      createdAt: new Date(entry.timestamp).getTime(),
      totalDurationSec: entry.totalSeconds,
    }));
  }, [data]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-900/20 p-4">
        <p className="text-sm text-red-400">Failed to load build performance: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Build Performance</h1>
        <p className="mt-1 text-sm text-slate-400">CI/CD build metrics from GitHub Actions</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Build Time"
          value={stats ? formatDuration(stats.avgTotal) : "-"}
          subtext={stats && stats.trend !== "neutral" ? `${stats.trendPercent.toFixed(0)}% ${stats.trend === "up" ? "improving" : "degrading"}` : "Stable"}
        />
        <StatCard title="P50 Duration" value={stats ? formatDuration(stats.p50) : "-"} />
        <StatCard title="P95 Duration" value={stats ? formatDuration(stats.p95) : "-"} />
        <StatCard
          title="Cache Hit Rate"
          value={stats ? `${(stats.cacheHitRate * 100).toFixed(0)}%` : "-"}
        />
      </div>

      <TrendChart data={chartData} />

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                SHA
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Install
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Build
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                SDK
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-slate-400">
                Cache
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                  No build data available
                </td>
              </tr>
            ) : (
              data?.data.slice(0, 20).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{entry.sha.slice(0, 7)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">
                    {formatDuration(entry.installSeconds)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">
                    {formatDuration(entry.buildSeconds)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">
                    {formatDuration(entry.sdkSeconds)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-100">
                    {formatDuration(entry.totalSeconds)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {entry.cacheHit ? "✅" : "❌"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
