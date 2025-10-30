'use client'

import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isSignInWithEmailLink } from 'firebase/auth'
import Link from 'next/link'
import { loginWithGoogleSmart, sendEmailLinkRobust, startGooglePopup, establishServerSession } from '../../../src/lib/auth-helpers'

const LoginForm = React.memo(() => {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [sending, setSending] = useState(false)

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
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email')
      return
    }
    try {
      setSending(true)
      // Optimistically show sending status so user sees activity immediately
      setStatus('Sending magic link…')
      await sendEmailLinkRobust(trimmed)
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
      // Start the popup synchronously to avoid popup blockers, then await completion.
      // When the popup flow completes the returned credential will include a user
      // so we can establish a server session immediately and redirect home.
      const cred = await startGooglePopup()
      try {
        // Try to establish a server session directly after popup sign-in.
        await establishServerSession()
        router.replace('/')
        return
      } catch (sessErr) {
        // If session creation fails, fall back to callback route to retry the
        // session creation flow there.
        console.warn('Session creation after popup failed, falling back to callback', sessErr)
        router.replace('/auth/callback')
        return
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Google sign-in failed')
    }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-surface via-surface-card to-surface-accent">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-text-muted">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 text-red-400 text-sm p-3 animate-fade-in">
            {error}
          </div>
        )}
        {status && (
          <div className="rounded-lg border border-secondary bg-secondary/10 text-secondary text-sm p-3 animate-fade-in">
            {status}
          </div>
        )}

        <button
          type="button"
          onClick={onGoogle}
          aria-label="Continue with Google"
          className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-text-muted mb-4">
          <div className="h-px flex-1 bg-surface-accent" />
          <span>or</span>
          <div className="h-px flex-1 bg-surface-accent" />
        </div>

        <form onSubmit={onSendMagicLink} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field w-full"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-skeleton w-4 h-4 rounded-full"></div>
                Sending…
              </div>
            ) : (
              'Email me a magic link'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-text-muted hover:text-primary transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
})

LoginForm.displayName = 'LoginForm'

const LoginPage = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <LoginForm />
  </Suspense>
)

export default LoginPage
