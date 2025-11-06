// [P1][API][CODE] ProtectedRoute
// Tags: P1, API, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useAuth } from "../lib/auth-context";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user) return null;
  return <>{children}</>;
}
