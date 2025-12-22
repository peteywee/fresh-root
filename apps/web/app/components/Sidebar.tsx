// [P3][UX][CODE] Sidebar navigation component
// Tags: P3, UX, CODE, SIDEBAR, NAVIGATION
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../src/lib/auth-context";
import { useOrg } from "../../src/lib/org-context";

export default function Sidebar() {
  const { user } = useAuth();
  const { orgId } = useOrg();
  const pathname = usePathname();

  if (!user) return null;

  const routes = [
    { href: "/protected/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/protected/schedules", label: "Schedules", icon: "📅" },
    { href: "/protected/profile", label: "Profile", icon: "👤" },
    { href: "/ops", label: "Operations", icon: "⚙️" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <aside className="sticky left-0 top-0 hidden h-screen w-64 border-r border-neutral-900/80 bg-[#0b0f14] p-4 md:flex md:flex-col">
      {/* Org Info */}
      {orgId && (
        <div className="mb-6 rounded bg-neutral-900 p-3">
          <p className="text-xs font-semibold text-gray-400">Organization</p>
          <p className="truncate text-sm text-gray-300">{orgId}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center gap-3 rounded px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive(route.href)
                ? "bg-neutral-800 text-white"
                : "text-gray-300 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span className="text-lg">{route.icon}</span>
            {route.label}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-neutral-900 pt-4">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="h-10 w-10 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-gray-300">
              {user.displayName || "User"}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
