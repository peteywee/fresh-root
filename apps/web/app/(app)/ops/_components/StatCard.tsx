import React from "react";

export default function StatCard({
  title,
  value,
  subtext,
}: {
  title: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {subtext ? <div className="mt-1 text-xs text-slate-400">{subtext}</div> : null}
    </div>
  );
}
