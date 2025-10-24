'use client'
import { QueryClient } from '@tanstack/react-query'

let _client: QueryClient | null = null

export function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          // Tuned for UX-first dev: fast refetch on focus, reasonable staleness
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 30_000,   // 30s
          gcTime: 5 * 60_000   // 5 min
        },
        mutations: {
          retry: 0
        }
      }
    })
  }
  return _client
}
