"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function formatTime(epochMs: number) {
  try {
    const d = new Date(epochMs);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function TrendChart({
  data,
  height = 260,
}: {
  data: Array<{ createdAt: number; totalDurationSec: number }>;
  height?: number;
}) {
  const rows = [...data]
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((r) => ({
      ...r,
      label: formatTime(r.createdAt),
      minutes: Math.round((r.totalDurationSec / 60) * 10) / 10,
    }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-3 text-sm font-semibold text-white">Build Duration Trend</div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="minutes" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Values shown in minutes. Use summary stats for p50/p95.
      </div>
    </div>
  );
}
