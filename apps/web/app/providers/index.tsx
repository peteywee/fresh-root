'use client'
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './queryClient'
import '../lib/firebaseClient'
import { AuthProvider } from '../lib/auth-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient()
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
