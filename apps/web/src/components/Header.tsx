// [P1][UX][CODE] Header component with logout button
// Tags: P1, UX, CODE
"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { logoutEverywhere } from "../lib/auth-helpers";
import Logo from "../../components/Logo";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutEverywhere();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-[#0b0f14]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link prefetch href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="font-semibold tracking-wide">Fresh&nbsp;Schedules</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <Link href="/protected/schedules" className="hover:text-white">
                  Schedules
                </Link>
                <Link href="/protected/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
              </div>

              <div className="flex items-center gap-3 border-l border-neutral-800 pl-4">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-300">{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
