// [P0][AUTH][LOGIN] Login page with Google, Email/Password, and Magic Link
// Tags: P0, AUTH, LOGIN
"use client";

import { isSignInWithEmailLink } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, Suspense } from "react";

import {
  sendEmailLinkRobust,
  startGooglePopup,
  signInWithPassword,
  signUpWithPassword,
  establishServerSession,
} from "../../../src/lib/auth-helpers";
import { auth } from "../../lib/firebaseClient";

type AuthMode = "signin" | "signup" | "magic-link";

// Super admin emails go straight to dashboard
const SUPER_ADMIN_EMAILS = ["admin@email.com"];

const LoginForm = React.memo(() => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params?.get("redirect");
  
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Determine redirect based on user type
  const getRedirectPath = useCallback((userEmail: string) => {
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());
    // Super admins go to dashboard unless they explicitly requested another page
    if (isSuperAdmin && !redirectParam) {
      return "/dashboard";
    }
    return redirectParam || "/";
  }, [redirectParam]);

  // If the page loads with an email link, complete sign-in
  useEffect(() => {
    if (typeof window === "undefined") return;

    const href = window.location.href;
    const code = params?.get("oobCode") || "";
    let looksLikeEmailLink = false;
    if (auth) {
      looksLikeEmailLink = isSignInWithEmailLink(auth, href) || !!code;
    } else {
      console.warn("Firebase auth instance is undefined; cannot check email link via SDK.");
      looksLikeEmailLink = !!code;
    }
    if (looksLikeEmailLink) {
      router.replace("/auth/callback");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setStatus("");
      
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError("Please enter your email");
        return;
      }
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      try {
        setLoading(true);
        
        if (mode === "signup") {
          setStatus("Creating account...");
          await signUpWithPassword(trimmedEmail, password);
        } else {
          setStatus("Signing in...");
          await signInWithPassword(trimmedEmail, password);
        }
        
        // Establish server session
        await establishServerSession();
        router.replace(getRedirectPath(trimmedEmail));
      } catch (e) {
        console.error(e);
        const err = e as { code?: string; message?: string };
        // Provide user-friendly error messages
        if (err.code === "auth/user-not-found") {
          setError("No account found with this email. Try signing up instead.");
        } else if (err.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else if (err.code === "auth/email-already-in-use") {
          setError("An account already exists with this email. Try signing in.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. Use at least 6 characters.");
        } else if (err.code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else {
          setError(err.message || "Authentication failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, router, getRedirectPath],
  );

  const handleMagicLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setStatus("");
      
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError("Please enter your email");
        return;
      }

      try {
        setLoading(true);
        setStatus("Sending magic link...");
        await sendEmailLinkRobust(trimmedEmail);
        setStatus("Magic link sent! Check your email and click the link to sign in.");
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Failed to send magic link";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  const handleGoogle = useCallback(async () => {
    setError("");
    setStatus("");
    try {
      setLoading(true);
      setStatus("Opening Google sign-in...");
      const result = await startGooglePopup() as { user?: { email?: string } } | null;
      const userEmail = result?.user?.email || "";
      
      try {
        await establishServerSession();
        router.replace(getRedirectPath(userEmail));
      } catch (sessErr) {
        console.warn("Session creation after popup failed, falling back to callback", sessErr);
        router.replace("/auth/callback");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Google sign-in failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router, getRedirectPath]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-text-muted">
            {mode === "signup" 
              ? "Sign up to get started with Fresh Schedules" 
              : "Sign in to access your dashboard"}
          </p>
        </div>

        {error && (
          <div className="mb-4 animate-fade-in rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {status && (
          <div className="mb-4 animate-fade-in rounded-lg border border-secondary bg-secondary/10 p-3 text-sm text-secondary">
            {status}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          aria-label="Continue with Google"
          className="btn-primary mb-4 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-text-muted">
          <div className="h-px flex-1 bg-surface-accent" />
          <span>or</span>
          <div className="h-px flex-1 bg-surface-accent" />
        </div>

        {/* Auth Mode Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-surface-accent/50 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "signin" 
                ? "bg-surface-card text-primary shadow-sm" 
                : "text-text-muted hover:text-primary"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "signup" 
                ? "bg-surface-card text-primary shadow-sm" 
                : "text-text-muted hover:text-primary"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode("magic-link")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "magic-link" 
                ? "bg-surface-card text-primary shadow-sm" 
                : "text-text-muted hover:text-primary"
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Email/Password Form */}
        {(mode === "signin" || mode === "signup") && (
          <form onSubmit={handleEmailPassword} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-muted">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </div>
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {/* Magic Link Form */}
        {mode === "magic-link" && (
          <form onSubmit={handleMagicLink} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="magic-email" className="mb-1 block text-sm font-medium text-text-muted">
                Email
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-text-muted">
              We&apos;ll send you a secure link to sign in without a password.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </div>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-text-muted transition-colors hover:text-primary">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
});

LoginForm.displayName = "LoginForm";

const LoginPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }
  >
    <LoginForm />
  </Suspense>
);

export default LoginPage;
