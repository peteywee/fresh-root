// [P1][UX][CODE] Sidebar navigation component
// Tags: P1, UX, CODE
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/protected", label: "Home", icon: "🏠" },
  { href: "/protected/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/protected/schedules", label: "Schedules", icon: "📅" },
  { href: "/demo", label: "Demo", icon: "🎯" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/protected") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-800 bg-[#0b0f14]">
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href as any}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(route.href)
                ? "bg-neutral-800 text-white font-medium"
                : "text-gray-400 hover:bg-neutral-900 hover:text-gray-200"
            }`}
          >
            <span className="text-lg">{route.icon}</span>
            <span>{route.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
