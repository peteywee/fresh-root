"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  Hammer,
  Settings,
  FileText,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/ops", icon: LayoutDashboard },
  { label: "Analytics", href: "/ops/analytics", icon: BarChart3 },
  { label: "Build Status", href: "/ops/builds", icon: Hammer },
  { label: "Security & RBAC", href: "/ops/security", icon: ShieldAlert },
  { label: "System Health", href: "/ops/health", icon: Activity },
  { label: "Audit Logs", href: "/ops/audit-logs", icon: FileText },
  { label: "Settings", href: "/ops/settings", icon: Settings },
];

export function OpsHubNav() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      <div className="mb-4 px-2">
        <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-2">
          Core Modules
        </p>
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 group",
              isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent",
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-8 px-2">
        <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-2">
          External
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="w-4 h-4 flex items-center justify-center border border-muted-foreground rounded-[2px] text-[10px]">
            ↗
          </span>
          Public Site
        </Link>
      </div>
    </nav>
  );
}
