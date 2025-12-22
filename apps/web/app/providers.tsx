// [P2][APP][CODE] Providers
// Tags: P2, APP, CODE
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "../src/lib/auth-context";
import { OrgProvider } from "../src/lib/org-context";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider>
      <OrgProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
