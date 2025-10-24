'use client'
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './queryClient'
import '../lib/firebaseClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient()
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}
