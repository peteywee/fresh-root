// [P0][AUTH][LOGIN] Login page with Google, Email/Password, and Magic Link
// Tags: P0, AUTH, LOGIN
"use client";

import { EmailAuthProvider, GoogleAuthProvider, isSignInWithEmailLink } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState, Suspense } from "react";

import { establishServerSession } from "../../../src/lib/auth-helpers";
import { auth } from "../../lib/firebaseClient";

// Super admin emails go straight to dashboard
const SUPER_ADMIN_EMAILS = ["admin@email.com"];

const LoginForm = React.memo(() => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params?.get("redirect");

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Determine redirect based on user type
  const getRedirectPath = useCallback(
    (userEmail: string) => {
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());
      // Super admins go to dashboard unless they explicitly requested another page
      if (isSuperAdmin && !redirectParam) {
        return "/dashboard";
      }
      return redirectParam || "/";
    },
    [redirectParam],
  );

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

  // FirebaseUI (Google + Email/Password + Email Link)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!auth) {
      setError("Firebase auth is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.");
      return;
    }

    let mounted = true;
    let ui: any;

    (async () => {
      try {
        const firebaseui = await import("firebaseui");
        const AuthUI = (firebaseui as any).auth?.AuthUI;
        if (!AuthUI) throw new Error("firebaseui AuthUI not available");

        ui = AuthUI.getInstance() || new AuthUI(auth);

        const uiConfig = {
          signInFlow: "popup",
          signInSuccessUrl: "/",
          signInOptions: [
            GoogleAuthProvider.PROVIDER_ID,
            {
              provider: EmailAuthProvider.PROVIDER_ID,
              signInMethod: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
            },
            {
              provider: EmailAuthProvider.PROVIDER_ID,
              signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
              emailLinkSignIn: () => ({
                url: `${window.location.origin}/auth/callback`,
                handleCodeInApp: true,
              }),
            },
          ],
          callbacks: {
            signInSuccessWithAuthResult: async (authResult: any) => {
              const userEmail = authResult?.user?.email || "";
              try {
                if (!mounted) return false;
                setLoading(true);
                setError("");
                setStatus("Creating session...");
                await establishServerSession();
                router.replace(getRedirectPath(userEmail));
              } catch (e) {
                console.error(e);
                setError("Signed in, but failed to create session. Please try again.");
              } finally {
                if (mounted) {
                  setLoading(false);
                  setStatus("");
                }
              }
              // Prevent FirebaseUI from doing its own redirect.
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
            uiShown: () => {
              if (!mounted) return;
              setStatus("");
            },
          },
          tosUrl: "/",
          privacyPolicyUrl: "/",
        };

        ui.start("#firebaseui-auth-container", uiConfig);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load Firebase UI. Please refresh and try again.");
      }
    })();

    return () => {
      mounted = false;
      try {
        ui?.reset?.();
      } catch {
        // ignore
      }
    };
  }, [router, getRedirectPath]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-text-muted">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 animate-fade-in whitespace-pre-line rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {status && (
          <div className="mb-4 animate-fade-in whitespace-pre-line rounded-lg border border-secondary bg-secondary/10 p-3 text-sm text-secondary">
            {status}
          </div>
        )}

        <div className={loading ? "pointer-events-none opacity-70" : ""}>
          <div id="firebaseui-auth-container" />
        </div>

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
