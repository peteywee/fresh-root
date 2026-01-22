// [P0][AUTH][CODE] Auth callback page - handles magic link email verification
// Tags: P0, AUTH, CODE
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "../../../app/lib/firebaseClient";
import {
  completeEmailLinkIfPresent,
  completeGoogleRedirectOnce,
  establishServerSession,
} from "../../../src/lib/auth-helpers";
import { reportError } from "../../../src/lib/error/reporting";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "email-verified" | "error">("idle");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("working");
      try {
        // Complete either email link or Google redirect if applicable
        const completedEmail = await completeEmailLinkIfPresent();
        const completedGoogle = await completeGoogleRedirectOnce();

        // Get current user info
        const currentUser = auth?.currentUser;
        const hasCurrentUser = !!currentUser;

        if (currentUser?.email) {
          setUserEmail(currentUser.email);
        }

        // If email link was completed, show verification success
        if (completedEmail) {
          if (!mounted) return;
          setStatus("email-verified");
          // Brief pause to show success state
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        // Establish server session after verifying email
        if (completedEmail || completedGoogle || hasCurrentUser) {
          await establishServerSession();
        }

        if (!mounted) return;
        router.replace("/");
      } catch (e) {
        reportError(e instanceof Error ? e : new Error(String(e)), { phase: "auth_callback" });
        if (!mounted) return;
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
      <div className="card w-full max-w-md text-center">
        {status === "working" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary">Signing you in…</h1>
            <p className="text-text-muted">Verifying your email and completing authentication.</p>
          </>
        )}

        {status === "email-verified" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-success/10 p-3 animate-scale-up">
                <svg className="h-8 w-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary">Email Verified!</h1>
            <p className="text-text-muted">
              {userEmail && (
                <span className="block font-medium text-text-primary">{userEmail}</span>
              )}
              Setting up your account…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-danger/10 p-3">
                <svg className="h-8 w-8 text-danger" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-danger">Authentication Failed</h1>
            <p className="mb-4 text-text-muted">
              The link may have expired or is invalid. Please try signing in again.
            </p>
            <a
              href="/login"
              className="inline-block rounded-lg bg-primary px-6 py-2 font-medium text-white transition-all hover:bg-primary/90"
            >
              Return to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
