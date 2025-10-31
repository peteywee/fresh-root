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
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("working");
      try {
        // Complete either email link or Google redirect if applicable
        const completedEmail = await completeEmailLinkIfPresent();
        const completedGoogle = await completeGoogleRedirectOnce();
        // For popup flows, getRedirectResult() is not used — the main window will already have
        // an authenticated user. If either redirect/email completed OR a current user exists,
        // establish the server session.
        const hasCurrentUser = !!(auth && auth.currentUser);
        if (completedEmail || completedGoogle || hasCurrentUser) {
          await establishServerSession();
        }
        if (!mounted) return;
        setStatus("done");
        router.replace("/");
      } catch (e) {
        reportError(e as any, { phase: "auth_callback" });
        if (!mounted) return;
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-semibold">Signing you in…</h1>
        <p className="text-gray-500">Completing authentication. You’ll be redirected shortly.</p>
        {status === "error" && (
          <p className="mt-4 text-red-600">
            Something went wrong. Please try again from the login page.
          </p>
        )}
      </div>
    </div>
  );
}
