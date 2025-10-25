'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isSignInWithEmailLink } from 'firebase/auth'
import Link from 'next/link'
import { loginWithGoogleSmart, sendEmailLinkRobust } from '../../../src/lib/auth-helpers'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [sending, setSending] = useState(false)

  const actionCodeSettings = useMemo(() => {
    // Not used directly anymore; kept as a stable object to avoid re-renders
    return {}
  }, [])

  // If the page loads with an email link, complete sign-in
  useEffect(() => {
    if (typeof window === 'undefined') return

    const href = window.location.href
    const code = params?.get('oobCode') || ''
    const looksLikeEmailLink = isSignInWithEmailLink({} as any, href) || !!code
    if (looksLikeEmailLink) {
      // Delegate handling to the dedicated callback route for consistency
      router.replace('/auth/callback')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSendMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('')
    if (!email) {
      setError('Please enter your email')
      return
    }
    try {
      setSending(true)
      await sendEmailLinkRobust(email)
      setStatus('Magic link sent! Check your email and click the link to finish signing in.')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to send magic link')
    } finally {
      setSending(false)
    }
  }, [email])

  const onGoogle = useCallback(async () => {
    setError('')
    setStatus('')
    try {
      await loginWithGoogleSmart()
      // For popup flow this will run; for redirect it won’t until the redirect completes
      router.replace('/auth/callback')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Google sign-in failed')
    }
  }, [router])

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-600">Choose Google or get a one-time magic link by email.</p>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}
        {status && (
          <div className="rounded border border-blue-200 bg-blue-50 text-blue-700 text-sm p-3">{status}</div>
        )}

        <button
          type="button"
          onClick={onGoogle}
          className="w-full rounded bg-black text-white py-2 text-sm hover:opacity-90"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={onSendMagicLink} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border rounded px-3 py-2 text-sm"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded border py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Email me a magic link'}
          </button>
        </form>

        <div className="text-xs text-gray-500">
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
