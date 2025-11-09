// [P2][APP][CODE] QueryClient
// Tags: P2, APP, CODE
"use client";
import { QueryClient } from "@tanstack/react-query";

let _client: QueryClient | null = null;

/**
 * @description Returns a singleton instance of the React Query client.
 * If the client has not been created yet, it will be instantiated with default options.
 * @returns {QueryClient} The singleton QueryClient instance.
 */
export function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          // Tuned for UX-first dev: fast refetch on focus, reasonable staleness
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 30_000, // 30s
          gcTime: 5 * 60_000, // 5 min
        },
        mutations: {
          retry: 0,
        },
      },
    });
  }
  return _client;
}
