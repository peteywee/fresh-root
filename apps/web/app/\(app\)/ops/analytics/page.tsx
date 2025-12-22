// [P1][OPS][CODE] Codebase analytics page
// Tags: P1, OPS, CODE, analytics

import React from "react";
import StatCard from "../_components/StatCard";
import { requireOpsSuperAccess } from "@/src/lib/auth/requireOpsSuperAccess";

export default async function AnalyticsPage() {
  await requireOpsSuperAccess();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Codebase Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Repository metrics and health indicators</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Files" value="—" subtext="Repomix analysis" />
        <StatCard title="Lines of Code" value="—" subtext="Across all packages" />
        <StatCard title="API Routes" value="—" subtext="nextjs/app-router" />
        <StatCard title="Components" value="—" subtext="React components" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="text-sm font-semibold text-white">Coming Soon</div>
        <p className="mt-2 text-sm text-slate-300">
          Codebase analytics using Repomix. Displays repository structure, file counts, language distribution, and health indicators.
        </p>
      </div>
    </div>
  );
}
