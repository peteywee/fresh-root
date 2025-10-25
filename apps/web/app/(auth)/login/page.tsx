'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../../lib/firebaseClient'
import Link from 'next/link'

const EMAIL_STORAGE_KEY = 'magiclink.email'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [sending, setSending] = useState(false)

  const actionCodeSettings = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return {
      url: `${origin}/login`,
      handleCodeInApp: true,
    }
  }, [])

  // If the page loads with an email link, complete sign-in
  useEffect(() => {
    const authInstance = auth
    if (!authInstance) return
    if (typeof window === 'undefined') return

    const href = window.location.href
    const code = params?.get('oobCode') || ''
    const isEmailLink = isSignInWithEmailLink(authInstance, href)
    if (isEmailLink || code) {
      // Try stored email first
      let stored = window.localStorage.getItem(EMAIL_STORAGE_KEY) || ''
      const completeEmailLinkSignIn = async () => {
        try {
          const chosenEmail = stored || email
          if (!chosenEmail) {
            // Ask the user to enter email if we don't have it
            setStatus('This looks like a magic link. Please enter your email to finish signing in.')
            return
          }
          let linkToUse = href
          // If it's not a recognized email link but we have an oobCode, reconstruct a minimal link
          if (!isEmailLink && code) {
            const origin = window.location.origin
            const apiKey = (authInstance as any)?.config?.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
            const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''
            if (apiKey && authDomain) {
              linkToUse = `https://${authDomain}/__/auth/action?mode=signIn&oobCode=${encodeURIComponent(code)}&apiKey=${encodeURIComponent(apiKey)}&continueUrl=${encodeURIComponent(origin + '/login')}`
            }
          }
          await signInWithEmailLink(authInstance, chosenEmail, linkToUse)
          window.localStorage.removeItem(EMAIL_STORAGE_KEY)
          setStatus('Signed in! Redirecting…')
          router.replace('/')
        } catch (e: any) {
          console.error(e)
          setError(e?.message || 'Failed to complete sign-in')
        }
      }
      ;(async () => {
        await completeEmailLinkSignIn()
      })()
    }
  }, [auth])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSendMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('')
    if (!auth) {
      setError('Auth not initialized')
      return
    }
    if (!email) {
      setError('Please enter your email')
      return
    }
    try {
      setSending(true)
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email)
      setStatus('Magic link sent! Check your email and click the link to finish signing in.')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to send magic link')
    } finally {
      setSending(false)
    }
  }, [auth, email, actionCodeSettings])

  const onGoogle = useCallback(async () => {
    setError('')
    setStatus('')
    if (!auth) {
      setError('Auth not initialized')
      return
    }
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Google sign-in failed')
    }
  }, [auth, router])

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
