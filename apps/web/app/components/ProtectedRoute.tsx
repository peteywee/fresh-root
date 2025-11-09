// [P1][API][CODE] ProtectedRoute
// Tags: P1, API, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useAuth } from "../lib/auth-context";

/**
 * A client-side component that protects a route from unauthenticated access.
 * It uses the `useAuth` hook to check the user's authentication status and redirects to the login page if the user is not authenticated.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered if the user is authenticated.
 * @returns {JSX.Element | null} The rendered child components, a loading indicator, or `null`.
 */
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
