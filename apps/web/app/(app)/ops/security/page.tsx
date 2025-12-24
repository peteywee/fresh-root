// [P1][OPS][CODE] Security scans page
// Tags: P1, OPS, CODE, security

import React from "react";
import StatCard from "../_components/StatCard";
import { requireOpsSuperAccess } from "@/src/lib/auth/requireOpsSuperAccess";

export default async function SecurityPage() {
  await requireOpsSuperAccess();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Security Scans</h1>
        <p className="mt-1 text-sm text-slate-400">
          Semgrep, CodeQL, and dependency scanning results
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Critical" value="—" subtext="Loading from GitHub API" />
        <StatCard title="High" value="—" subtext="Semgrep + CodeQL" />
        <StatCard title="Medium" value="—" subtext="Real-time scanning" />
        <StatCard title="Low" value="—" subtext="Informational only" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="text-sm font-semibold text-white">Coming Soon</div>
        <p className="mt-2 text-sm text-slate-300">
          Security scans integration with GitHub API. Displays latest Semgrep and CodeQL results for
          this repository.
        </p>
      </div>
    </div>
  );
}
