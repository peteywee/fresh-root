// [P0][AUTH][LOGIN] Login page with Google and Magic Link auth
// Tags: P0, AUTH, LOGIN
"use client";

import { GoogleAuthProvider, isSignInWithEmailLink } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState, Suspense } from "react";

import { establishServerSession } from "../../../src/lib/auth-helpers";
import { auth } from "../../lib/firebaseClient";
import EmailMagicLinkAuth from "../../components/auth/EmailMagicLinkAuth";

// NOTE: Admin checks now happen server-side in /api/auth/check-role
// Never expose admin emails in client-side code

const LoginForm = React.memo(() => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params?.get("redirect");

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Determine redirect - role-based routing happens server-side after session established
  // The session bootstrap endpoint (/api/session/bootstrap) handles admin routing
  const getRedirectPath = useCallback(() => {
    // Always use redirect param if provided, otherwise go to home
    // Server-side middleware will redirect admins to dashboard based on token claims
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

  // Handle Google OAuth
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!auth) return;

    let mounted = true;

    (async () => {
      try {
        const firebaseui = await import("firebaseui");
        const AuthUI = (firebaseui as any).auth?.AuthUI;
        if (!AuthUI) throw new Error("firebaseui AuthUI not available");

        let ui = AuthUI.getInstance();
        if (!ui) {
          ui = new AuthUI(auth);
        }

        const uiConfig = {
          signInFlow: "popup",
          signInOptions: [GoogleAuthProvider.PROVIDER_ID],
          callbacks: {
            signInSuccessWithAuthResult: async (_authResult: unknown) => {
              try {
                if (!mounted) return false;
                setGoogleLoading(true);
                setError("");
                setStatus("Creating session...");
                await establishServerSession();
                router.replace(getRedirectPath());
              } catch (e) {
                console.error(e);
                setError("Signed in, but failed to create session. Please try again.");
              } finally {
                if (mounted) {
                  setGoogleLoading(false);
                  setStatus("");
                }
              }
              return false;
            },
            signInFailure: async (e: any) => {
              console.error(e);
              const code = e?.code as string | undefined;
              if (code === "auth/popup-closed-by-user") {
                setError(
                  "Sign-in popup closed. If this keeps happening, confirm:\n• Firebase Console: Google provider enabled\n• Authorized domains include localhost\n• Browser allows popups",
                );
              } else {
                setError(e?.message || "Authentication failed");
              }
              return;
            },
          },
          tosUrl: "/",
          privacyPolicyUrl: "/",
        };

        ui.start("#firebaseui-google-container", uiConfig);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load Google auth. Please try again.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, getRedirectPath]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
      <div className="card w-full max-w-md motion-safe:animate-slide-up" role="main" aria-labelledby="login-title">
        <div className="mb-8 space-y-2 text-center">
          <h1 id="login-title" className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-text-muted">Sign in or create your account</p>
        </div>

        {error && (
          <div 
            className="mb-6 motion-safe:animate-fade-in whitespace-pre-line rounded-lg border border-danger bg-danger/10 p-4 text-sm text-danger"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        {status && (
          <div 
            className="mb-6 motion-safe:animate-fade-in whitespace-pre-line rounded-lg border border-secondary bg-secondary/10 p-4 text-sm text-secondary"
            role="status"
            aria-live="polite"
          >
            {status}
          </div>
        )}

        <div className={loading || googleLoading ? "pointer-events-none opacity-70" : ""}>
          {/* Email Magic Link Component */}
          <EmailMagicLinkAuth
            onSuccess={() => {
              setLoading(true);
              setStatus("Check your email for the magic link...");
            }}
            onError={(errorMsg) => {
              setError(errorMsg);
            }}
          />
        </div>

        {/* Google OAuth Container - FirebaseUI renders here */}
        <div id="firebaseui-google-container" className="mt-6" />

        <div className="mt-8 text-center text-sm text-text-muted">
          <Link 
            href="/" 
            className="rounded-md transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
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
