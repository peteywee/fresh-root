// [P0][AUTH][CODE] ProtectedRoute
// Tags: P0, AUTH, CODE
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, type ReactNode } from "react";

import { useAuth } from "../../lib/auth-context";

/**
 * A higher-order component that protects a route from unauthenticated access.
 *
 * @param {object} props - The props for the component.
 * @param {ReactNode} props.children - The child components to be rendered if the user is authenticated.
 * @returns {JSX.Element} The rendered child components or a loading indicator.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return React.createElement("div", { className: "p-6" }, "Loading…");
  return React.createElement(React.Fragment, null, children);
}
