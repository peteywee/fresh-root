"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Shield, FileText } from "lucide-react";

type Props = { mobile?: boolean };

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-300 hover:bg-slate-900 hover:text-white",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function OpsHubNav({ mobile }: Props) {
  const pathname = usePathname();

  const routes = [
    { href: "/ops", label: "Overview", icon: Activity },
    { href: "/ops/builds", label: "Build Performance", icon: BarChart3 },
    { href: "/ops/security", label: "Security Scans", icon: Shield },
    { href: "/ops/analytics", label: "Codebase Analytics", icon: FileText },
  ];

  const activeMatch = (href: string) =>
    href === "/ops" ? pathname === "/ops" : pathname.startsWith(href);

  return (
    <div className={mobile ? "px-4 py-3" : "p-4 sticky top-0 h-screen"}>
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">Ops Hub</div>
        <div className="text-lg font-semibold text-white">Observability</div>
      </div>

      <nav className={mobile ? "flex gap-2 overflow-x-auto" : "flex flex-col gap-1"}>
        {routes.map((r) => (
          <div key={r.href} className={mobile ? "shrink-0" : ""}>
            <NavLink href={r.href} label={r.label} icon={r.icon} active={activeMatch(r.href)} />
          </div>
        ))}
      </nav>

      {!mobile && (
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-300">
          <div className="font-semibold text-slate-200 mb-1">Notes</div>
          <ul className="list-disc pl-4 space-y-1">
            <li>All endpoints are admin-gated.</li>
            <li>Build metrics are stored in Firestore (no JSONL appends).</li>
            <li>Retention defaults to 90 days (TTL-ready).</li>
          </ul>
        </div>
      )}
    </div>
  );
}
