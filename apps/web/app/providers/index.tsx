// [P0][APP][CODE] Index
// Tags: P0, APP, CODE
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { getQueryClient } from "./queryClient";
import "../lib/firebaseClient";
import { AuthProvider } from "../lib/auth-context";

/**
 * @description A client-side component that wraps the application with necessary context providers.
 * This includes the React Query client and the authentication provider.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the providers.
 * @returns {React.ReactElement} The component with all the necessary providers.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
