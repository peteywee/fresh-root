"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { getQueryClient } from "./queryClient";
import "../lib/firebaseClient";
import { AuthProvider } from "../lib/auth-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
