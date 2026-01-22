// [P0][AUTH][COMPONENT] Email Magic Link Authentication Component
// Tags: P0, AUTH, COMPONENT

"use client";

import React, { useState, useCallback } from "react";
import { sendEmailLinkRobust } from "@/src/lib/auth-helpers";

export type AuthMode = "signin" | "signup";

interface EmailMagicLinkAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * EmailMagicLinkAuth Component
 *
 * Unified magic link authentication for both signin and signup flows.
 * Users choose their intent (signin vs signup), enter email, receive link.
 * Email verification is automatic for signup.
 *
 * Features:
 * - Clear visual separation between signin and signup
 * - Email validation before link send
 * - Resend with countdown timer (60s)
 * - Professional UX with inline feedback
 * - Accessible form with ARIA labels
 */
export default function EmailMagicLinkAuth({ onSuccess, onError }: EmailMagicLinkAuthProps) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"choose" | "enter-email" | "check-email">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Validate email format
  const isValidEmail = useCallback((e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  }, []);

  // Handle mode selection (signin vs signup)
  const handleModeSelect = useCallback((selectedMode: AuthMode) => {
    setMode(selectedMode);
    setStep("enter-email");
    setEmail("");
    setError("");
  }, []);

  // Handle back button
  const handleBack = useCallback(() => {
    setStep("choose");
    setMode(null);
    setEmail("");
    setError("");
  }, []);

  // Send magic link
  const handleSendLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isValidEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setLoading(true);
      setError("");

      try {
        await sendEmailLinkRobust(email);
        setStep("check-email");
        setResendCountdown(60);

        // Countdown timer for resend
        const interval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send magic link. Please try again.";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [email, isValidEmail, onSuccess, onError],
  );

  // Re-send magic link (with countdown)
  const handleResendLink = useCallback(async () => {
    if (resendCountdown > 0) return;

    setLoading(true);
    setError("");

    try {
      await sendEmailLinkRobust(email);
      setResendCountdown(60);

      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend magic link. Please try again.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, resendCountdown, onError]);

  // ============ CHOOSE MODE SCREEN ============
  if (step === "choose") {
    return (
      <div className="space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-text-primary">Welcome</h2>
          <p className="text-sm text-text-muted">Choose how you'd like to continue</p>
        </div>

        <div className="grid gap-3">
          {/* Sign In Button */}
          <button
            onClick={() => handleModeSelect("signin")}
            className="group relative overflow-hidden rounded-lg border-2 border-secondary bg-transparent p-4 text-left transition-all hover:border-secondary hover:bg-secondary/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label="Sign in with email magic link"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">Sign In</p>
                <p className="text-xs text-text-muted">Use email magic link</p>
              </div>
              <svg
                className="h-5 w-5 text-secondary transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Sign Up Button */}
          <button
            onClick={() => handleModeSelect("signup")}
            className="group relative overflow-hidden rounded-lg border-2 border-primary bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/15 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Create account with email magic link"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">Create Account</p>
                <p className="text-xs text-text-muted">Sign up with email</p>
              </div>
              <svg
                className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Google OAuth Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-muted">or continue with</span>
          </div>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-card p-3 transition-all hover:border-secondary hover:bg-surface hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          aria-label="Sign in with Google"
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
          <span className="text-sm font-medium text-text-primary">Google</span>
        </button>
      </div>
    );
  }

  // ============ ENTER EMAIL SCREEN ============
  if (step === "enter-email") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            aria-label="Go back"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-sm text-text-muted">
              {mode === "signin"
                ? "Enter your email to receive a sign-in link"
                : "Enter your email to get started"}
            </p>
          </div>
        </div>

        {error && (
          <div
            className="flex gap-2 rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger"
            role="alert"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSendLink} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              disabled={loading}
              required
              className="w-full rounded-lg border border-border bg-surface-card px-4 py-3 text-text-primary placeholder-text-muted transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p id="email-error" className="text-xs text-danger">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isValidEmail(email)}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending link...
              </div>
            ) : (
              "Send Magic Link"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted">
          {mode === "signup"
            ? "We'll send you a secure link to verify your email and create your account."
            : "We'll send you a secure link to sign in without a password."}
        </p>
      </div>
    );
  }

  // ============ CHECK EMAIL SCREEN ============
  if (step === "check-email") {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-success/10 p-3">
            <svg className="h-8 w-8 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">Check Your Email</h2>
          <p className="text-sm text-text-muted">
            We sent a magic link to{" "}
            <span className="font-medium text-text-primary" role="status">
              {email}
            </span>
          </p>
        </div>

        <div className="space-y-3 rounded-lg bg-surface-card p-4">
          <p className="text-sm text-text-muted">
            {mode === "signup"
              ? "Click the link in the email to create your account and verify your email in one step."
              : "Click the link in the email to sign in to your account."}
          </p>
          <p className="text-xs text-text-muted">The link will expire in 24 hours for security.</p>
        </div>

        {error && (
          <div
            className="flex gap-2 rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger"
            role="alert"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-xs text-text-muted">Didn't receive the email?</p>
          <button
            onClick={handleResendLink}
            disabled={loading || resendCountdown > 0}
            className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : loading
                ? "Sending..."
                : "Resend link"}
          </button>
        </div>

        <button
          onClick={handleBack}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-primary transition-all hover:bg-surface-card"
        >
          Use different email
        </button>
      </div>
    );
  }

  return null;
}
