# Automated Refactoring Plan
**Generated:** 2025-11-15T13:01:20.426Z
**Files to Process:** 247
---
This plan contains a series of prompts to run with the `Refactor Compliance Agent` in VS Code. Copy each prompt into the chat window to get the compliant version of the file.

## Refactor: apps/web/app/(app)/demo/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/demo/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React, { useState, useCallback } from "react";

import { Button, Card, Input, Textarea, Loading, Spinner, Alert } from "../../components/ui";

/**
 * Demo page showcasing all UI components
 */
export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowAlert(true);
    }, 2000);
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  }, []);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, message: e.target.value }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Component Demo</h1>
          <p className="text-gray-600">
            Explore the reusable UI components available in Fresh Schedules
          </p>
        </div>

        {showAlert && (
          <Alert
            type="success"
            title="Success!"
            message="Form submitted successfully!"
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Buttons */}
        <Card title="Buttons" description="Various button styles and sizes">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">
                Primary Small
              </Button>
              <Button variant="primary" size="md">
                Primary Medium
              </Button>
              <Button variant="primary" size="lg">
                Primary Large
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Default Card" variant="default">
            <p className="text-gray-600">This is a default card with a border.</p>
          </Card>
          <Card title="Bordered Card" variant="bordered">
            <p className="text-gray-600">This card has a thicker border.</p>
          </Card>
          <Card title="Elevated Card" variant="elevated">
            <p className="text-gray-600">This card has a shadow for elevation.</p>
          </Card>
        </div>

        {/* Form Inputs */}
        <Card title="Form Example" description="Example form using Input and Textarea components">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              helperText="This field is required"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleEmailChange}
              fullWidth
            />

            <Textarea
              label="Message"
              placeholder="Enter your message"
              rows={4}
              value={formData.message}
              onChange={handleMessageChange}
              fullWidth
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                Submit
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Loading States */}
        <Card title="Loading States" description="Spinners and loading indicators">
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700">Spinner Sizes</h4>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Spinner size="sm" />
                  <p className="mt-2 text-xs text-gray-500">Small</p>
                </div>
                <div className="text-center">
                  <Spinner size="md" />
                  <p className="mt-2 text-xs text-gray-500">Medium</p>
                </div>
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-2 text-xs text-gray-500">Large</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700">Loading Component</h4>
              <div className="rounded-lg border bg-white p-8">
                <Loading text="Loading data..." />
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <Card title="Alerts" description="Different alert types for various scenarios">
          <div className="space-y-3">
            <Alert
              type="success"
              title="Success"
              message="Your changes have been saved successfully."
            />
            <Alert
              type="error"
              title="Error"
              message="There was an error processing your request."
            />
            <Alert
              type="warning"
              title="Warning"
              message="Your session will expire in 5 minutes."
            />
            <Alert type="info" message="New features have been added to the platform." />
          </div>
        </Card>

        {/* Card with Footer */}
        <Card
          title="Card with Footer"
          description="This card demonstrates the footer prop"
          footer={
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last updated: Just now</span>
              <Button size="sm">View Details</Button>
            </div>
          }
        >
          <p className="text-gray-700">
            Cards can have optional footers for actions or additional information. This is useful
            for displaying metadata or action buttons.
          </p>
        </Card>

        {/* Documentation Link */}
        <Card>
          <div className="py-4 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Component Documentation</h3>
            <p className="mb-4 text-gray-600">
              Learn more about these components and how to use them in your application.
            </p>
            <Button variant="primary">View Documentation</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

```


## Refactor: apps/web/app/(app)/protected/dashboard/loading.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/dashboard/loading.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Loading
// Tags: P2, APP, CODE
export default function Loading() {
  return (
    <div className="grid gap-4 p-4">
      <div className="h-10 w-48 animate-pulse rounded bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-neutral-800" />
    </div>
  );
}

```


## Refactor: apps/web/app/(app)/protected/dashboard/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/dashboard/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React, { useCallback, useState } from "react";

import { publishSchedule } from "../../../../src/lib/api/schedules";
import Inbox from "../../../components/Inbox";
import MonthView from "../../../components/MonthView";
import ProtectedRoute from "../../../components/ProtectedRoute";

const DashboardPage = React.memo(() => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPublish = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      // For demo: replace with real orgId/scheduleId selection
      const orgId = "orgA";
      const scheduleId = "demo-schedule";
      await publishSchedule({ orgId, scheduleId });
      setMessage("Published successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Publish failed";
      setMessage(errorMessage);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen animate-fade-in bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="py-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-primary">Dashboard</h1>
            <p className="text-lg text-text-muted">Manage your schedules and stay updated</p>
          </header>

          <section className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onPublish}
              disabled={busy}
              className="btn-primary px-6 py-3 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <div className="loading-skeleton h-5 w-5 rounded-full"></div>
                  Publishing…
                </div>
              ) : (
                "🚀 Publish Schedule"
              )}
            </button>
            {message && (
              <div
                className={`animate-slide-up rounded-lg px-4 py-2 text-sm ${
                  message.includes("successfully")
                    ? "border border-secondary bg-secondary/10 text-secondary"
                    : "border border-red-500 bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <MonthView />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Inbox />
            </div>
          </section>

          <section
            className="card animate-slide-up p-6 text-center"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="mb-4 text-2xl font-semibold text-primary">Quick Stats</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-accent p-4">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-text-muted">Active Schedules</div>
              </div>
              <div className="rounded-lg bg-surface-accent p-4">
                <div className="text-2xl font-bold text-secondary">5</div>
                <div className="text-text-muted">Pending Tasks</div>
              </div>
              <div className="rounded-lg bg-surface-accent p-4">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-text-muted">Uptime</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
});

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;

```


## Refactor: apps/web/app/(app)/protected/loading.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/loading.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Loading
// Tags: P2, APP, CODE
export default function Loading() {
  return (
    <div className="grid gap-3">
      <div className="h-8 w-40 animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
    </div>
  );
}

```


## Refactor: apps/web/app/(app)/protected/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useCreateItem } from "../../lib/useCreateItem";

export default function ProtectedDemoPage() {
  const createItem = useCreateItem();

  return (
    <ProtectedRoute>
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Protected Demo</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.elements.namedItem("name") as HTMLInputElement;
            const name = input.value.trim();
            if (name) createItem.mutate({ name });
            input.value = "";
          }}
        >
          <input
            name="name"
            placeholder="New item name"
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded border bg-black px-3 py-2 text-sm text-white"
            disabled={createItem.isPending}
          >
            {createItem.isPending ? "Creating…" : "Create"}
          </button>
        </form>
        {createItem.isError && (
          <div className="text-sm text-red-700">
            {createItem.error instanceof Error ? createItem.error.message : "Error"}
          </div>
        )}
        {createItem.isSuccess && (
          <pre className="rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(createItem.data, null, 2)}
          </pre>
        )}
      </main>
    </ProtectedRoute>
  );
}

```


## Refactor: apps/web/app/(app)/protected/schedules/loading.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/schedules/loading.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Loading
// Tags: P2, APP, CODE
// Streaming-friendly skeleton to avoid jank during route transitions.
export default function Loading() {
  return (
    <div className="grid gap-3">
      <div className="h-8 w-40 animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
    </div>
  );
}

```


## Refactor: apps/web/app/(app)/protected/schedules/page.server.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/schedules/page.server.ts`

**File Content:**
```typescript
// [P1][APP][SERVER] Schedules page server data fetcher
// Tags: P1, APP, SERVER, SCHEDULES
import { cookies } from "next/headers";

import { getFirebaseAdminAuth } from "../../../../lib/firebase-admin";

/**
 * Server-side function to get the authenticated user's organization ID
 * This uses the session cookie to verify the user and extract org context
 */
export async function getAuthenticatedOrgId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      console.warn("No session cookie found");
      return null;
    }

    const auth = getFirebaseAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Extract orgId from custom claims
    const orgId = decodedClaims.orgId as string | undefined;

    if (!orgId) {
      console.warn("No orgId in custom claims for user:", decodedClaims.uid);
      return null;
    }

    return orgId;
  } catch (error) {
    console.error("Failed to get authenticated org ID:", error);
    return null;
  }
}

/**
 * Server-side function to fetch recent schedules for an organization
 * Uses Firestore Admin SDK for server-side queries
 */
export async function fetchSchedules(orgId: string, _limit = 12) {
  try {
    // In production, fetch from Firestore using Admin SDK
    // For now, return mock data
    const mockSchedules = [
      {
        id: "schedule-1",
        orgId,
        name: "Week 1 Schedule",
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        venueId: "venue-main",
        status: "published",
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        id: "schedule-2",
        orgId,
        name: "Week 2 Schedule",
        weekStart: new Date().toISOString(),
        venueId: "venue-main",
        status: "draft",
        createdAt: Date.now(),
      },
    ];

    return mockSchedules;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
}

```


## Refactor: apps/web/app/(app)/protected/schedules/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(app)/protected/schedules/page.tsx`

**File Content:**
```typescript
// [P1][APP][PAGE] Schedules page component with real auth
// Tags: P1, APP, PAGE, SCHEDULES, AUTH
// Server component: schedules list uses session-based org gating + ISR
import { redirect } from "next/navigation";

import { getAuthenticatedOrgId, fetchSchedules } from "./page.server";

// 60s ISR; override to 'force-dynamic' only if you truly need live reads.
export const revalidate = 60;

export const metadata = {
  title: "Schedules | Fresh Schedules",
  description: "Recent schedules by week and venue.",
};

export default async function SchedulesPage() {
  // Get authenticated user's org from session cookie
  const orgId = await getAuthenticatedOrgId();

  // Redirect to login if not authenticated or no org
  if (!orgId) {
    redirect("/login");
  }

  // Fetch schedules for the authenticated org
  const rows = await fetchSchedules(orgId, 12);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Recent Schedules</h1>
        <span className="text-sm text-neutral-400">Org: {orgId}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/40">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Week Start</th>
              <th className="px-3 py-2 text-left">Venue</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.weekStart?.slice(0, 10)}</td>
                <td className="px-3 py-2 text-neutral-400">{r.venueId}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs ${
                      r.status === "published"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-neutral-500">{r.id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={5}>
                  No schedules yet. Create your first schedule to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Cached with ISR (60s) • Session-based org gating • Publishing invalidates via tag
      </p>
    </div>
  );
}

```


## Refactor: apps/web/app/(auth)/login/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/(auth)/login/page.tsx`

**File Content:**
```typescript
// [P0][AUTH][LOGGING] Page page component
// Tags: P0, AUTH, LOGGING
"use client";

import { isSignInWithEmailLink } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, Suspense } from "react";

import {
  sendEmailLinkRobust,
  startGooglePopup,
  establishServerSession,
} from "../../../src/lib/auth-helpers";
import { auth } from "../../lib/firebaseClient";

const LoginForm = React.memo(() => {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);

  // If the page loads with an email link, complete sign-in
  useEffect(() => {
    if (typeof window === "undefined") return;

    const href = window.location.href;
    const code = params?.get("oobCode") || "";
    // Use Firebase SDK to check if this is a valid email link, falling back to URL param check
    let looksLikeEmailLink = false;
    if (auth) {
      looksLikeEmailLink = isSignInWithEmailLink(auth, href) || !!code;
    } else {
      // If auth is not available, we cannot check the email link via Firebase SDK.
      // Optionally, log a warning for debugging.
      console.warn("Firebase auth instance is undefined; cannot check email link via SDK.");
      looksLikeEmailLink = !!code;
    }
    if (looksLikeEmailLink) {
      // Delegate handling to the dedicated callback route for consistency
      router.replace("/auth/callback");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSendMagicLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setStatus("");
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Please enter your email");
        return;
      }
      try {
        setSending(true);
        // Optimistically show sending status so user sees activity immediately
        setStatus("Sending magic link…");
        await sendEmailLinkRobust(trimmed);
        setStatus("Magic link sent! Check your email and click the link to finish signing in.");
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Failed to send magic link";
        setError(errorMessage);
      } finally {
        setSending(false);
      }
    },
    [email],
  );

  const onGoogle = useCallback(async () => {
    setError("");
    setStatus("");
    try {
      // Start the popup synchronously to avoid popup blockers, then await completion.
      // When the popup flow completes the returned credential will include a user
      // so we can establish a server session immediately and redirect home.
      await startGooglePopup();
      try {
        // Try to establish a server session directly after popup sign-in.
        await establishServerSession();
        router.replace("/");
        return;
      } catch (sessErr) {
        // If session creation fails, fall back to callback route to retry the
        // session creation flow there.
        console.warn("Session creation after popup failed, falling back to callback", sessErr);
        router.replace("/auth/callback");
        return;
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Google sign-in failed";
      setError(errorMessage);
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-text-muted">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="animate-fade-in rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {status && (
          <div className="animate-fade-in rounded-lg border border-secondary bg-secondary/10 p-3 text-sm text-secondary">
            {status}
          </div>
        )}

        <button
          type="button"
          onClick={onGoogle}
          aria-label="Continue with Google"
          className="btn-primary mb-4 flex w-full items-center justify-center gap-2"
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
            className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-skeleton h-4 w-4 rounded-full"></div>
                Sending…
              </div>
            ) : (
              "Email me a magic link"
            )}
          </button>
        </form>

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
    fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
  >
    <LoginForm />
  </Suspense>
);

export default LoginPage;

```


## Refactor: apps/web/app/RegisterServiceWorker.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/RegisterServiceWorker.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] RegisterServiceWorker
// Tags: P2, APP, CODE
"use client";
import { useEffect } from "react";

import { safeRegisterServiceWorker } from "./lib/registerServiceWorker";

export default function RegisterServiceWorker({ script = "/sw.js" }: { script?: string }) {
  useEffect(() => {
    void safeRegisterServiceWorker(script);
  }, [script]);

  return null;
}

```


## Refactor: apps/web/app/actions/createSchedule.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/actions/createSchedule.ts`

**File Content:**
```typescript
// [P0][APP][CODE] CreateSchedule
// Tags: P0, APP, CODE
"use server";

type CreatePayload = { orgId: string; startDate: number };

/**
 * Server action that calls the API (keeps secrets server-side).
 * In dev, we pass x-user-token (JSON) to simulate Firebase custom claims.
 * In prod, swap to a signed session/token and add a gateway in the API to decode it.
 */
export async function createSchedule(payload: CreatePayload) {
  // Validate orgId to prevent SSRF (allow only alphanumeric, hyphen, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(payload.orgId)) {
    throw new Error("Invalid orgId format");
  }
  const token = {
    uid: "u1-dev",
    orgId: payload.orgId,
    roles: ["manager"],
  };
  const res = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:4000"}/orgs/${payload.orgId}/schedules`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-token": JSON.stringify(token),
      },
      body: JSON.stringify({ startDate: payload.startDate }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    let errorPayload: { error: string } = { error: "unknown" };
    try {
      errorPayload = await res.json();
    } catch {
      errorPayload = { error: await res.text() };
    }
    throw new Error(`API error ${res.status}: ${errorPayload.error ?? "unknown"}`);
  }
  return res.json();
}

```


## Refactor: apps/web/app/actions/scheduleActions.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/actions/scheduleActions.ts`

**File Content:**
```typescript
// [P0][APP][CODE] ScheduleActions
// Tags: P0, APP, CODE
"use server";

import { invalidate } from "../lib/cache";
// import your admin/write path here (HTTP endpoint or function)

const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

export async function publishSchedule({
  orgId,
  scheduleId: _scheduleId,
}: {
  orgId: string;
  scheduleId: string;
}) {
  // TODO: perform the privileged write (e.g., call Cloud Function or route handler)
  // await callPublish(orgId, scheduleId);

  // Invalidate tag so lists/detail revalidate on next request
  invalidate(TAG_SCHEDULES(orgId));
}

```


## Refactor: apps/web/app/api/_shared/__tests__/validation.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_shared/__tests__/validation.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][VALIDATION] Validation Test tests
// Tags: P1, INTEGRITY, VALIDATION, TEST
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

import { badRequest, ok, serverError, parseJson } from '../validation'

describe('API Validation utilities', () => {
  describe('badRequest', () => {
    it('should return 400 with error structure', async () => {
      const response = badRequest('Invalid input')
      expect(response.status).toBe(400)
      
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('message', 'Invalid input')
      expect(body.error).toHaveProperty('code', 'BAD_REQUEST')
    })

    it('should include details when provided', async () => {
      const details = { field: 'email', issue: 'invalid format' }
      const response = badRequest('Validation failed', details)
      const body = await response.json()
      expect(body.error.details).toEqual(details)
    })
  })

  describe('serverError', () => {
    it('should return 500 with error structure', async () => {
      const response = serverError()
      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error.message).toBe('Internal Server Error')
      expect(body.error.code).toBe('INTERNAL')
    })
  })

  describe('ok', () => {
    it('should return 200 with data', async () => {
      const data = { success: true, items: [] }
      const response = ok(data)
      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body).toEqual(data)
    })
  })

  describe('parseJson', () => {
    it('should successfully parse valid JSON', async () => {
      const schema = z.object({ name: z.string() })
      const body = JSON.stringify({ name: 'Test' })
      const request = new Request('http://test.com', {
        method: 'POST',
        body,
      })

      const result = await parseJson(request, schema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ name: 'Test' })
      }
    })

    it('should return validation errors for invalid data', async () => {
      const schema = z.object({ name: z.string(), age: z.number() })
      const body = JSON.stringify({ name: 'Test' }) // missing age
      const request = new Request('http://test.com', {
        method: 'POST',
        body,
      })

      const result = await parseJson(request, schema)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.details).toBeDefined()
        expect(result.details.length).toBeGreaterThan(0)
      }
    })
  })
})

```


## Refactor: apps/web/app/api/_shared/logging.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_shared/logging.ts`

**File Content:**
```typescript
// [P1][OBSERVABILITY][LOGGING] Logging
// Tags: P1, OBSERVABILITY, LOGGING
/**
 * [P1][API][INFRA] Request logging + requestId middleware
 * Tags: api, infra, logging, observability
 *
 * Overview:
 * - Wraps API route handlers to:
 *   - Attach a unique requestId to the request
 *   - Log structured start/end records with duration and status
 * - Plays nicely with existing withSecurity middleware
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type BasicReq = {
  method?: string;
  url?: string;
  // Allow existing middleware to attach extra fields
  [key: string]: unknown;
};

type Handler<TReq extends BasicReq = BasicReq> = (
  req: TReq & { requestId: string },
) => Promise<Response> | Response;

function generateRequestId(): string {
  try {
    // Node 18+ / modern runtimes
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // fallthrough
  }
  const rand = Math.random().toString(16).slice(2);
  return `${Date.now().toString(16)}-${rand}`;
}

/**
 * Wrap a route handler with request logging.
 *
 * Usage:
 *   import { withRequestLogging } from "../_shared/logging";
 *   export const POST = withRequestLogging(
 *     withSecurity(myHandler, { requireAuth: true }),
 *   );
 */
export function withRequestLogging<TReq extends BasicReq>(
  handler: Handler<TReq> | ((req: TReq, ctx: Record<string, unknown>) => Promise<Response>),
): (req: TReq, ctx?: Record<string, unknown>) => Promise<Response> {
  return async (req: TReq, ctx?: Record<string, unknown>): Promise<Response> => {
    const requestId = generateRequestId();
    const start = Date.now();

    // Attach requestId to the request object for downstream handlers
    (req as any).requestId = requestId;

    const { method = "UNKNOWN", url = "UNKNOWN" } = req;

    // Structured "start" log

    console.log(
      JSON.stringify({
        level: "info",
        msg: "request_start",
        requestId,
        method,
        url,
        ts: new Date().toISOString(),
      }),
    );

    try {
      // Handle both single-arg and two-arg handlers
      const res = await (handler.length > 1
        ? handler(req as TReq & { requestId: string }, ctx || {})
        : (handler as Handler<TReq>)(req as TReq & { requestId: string }));
      const durationMs = Date.now() - start;

      // Structured "end" log

      console.log(
        JSON.stringify({
          level: "info",
          msg: "request_end",
          requestId,
          method,
          url,
          durationMs,
          status: res?.status ?? 0,
          ts: new Date().toISOString(),
        }),
      );

      return res;
    } catch (err) {
      const durationMs = Date.now() - start;

      // Structured error log

      console.error(
        JSON.stringify({
          level: "error",
          msg: "request_error",
          requestId,
          method,
          url,
          durationMs,
          error: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        }),
      );

      throw err;
    }
  };
}

```


## Refactor: apps/web/app/api/_shared/middleware.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_shared/middleware.ts`

**File Content:**
```typescript
// [P0][AUTH][MIDDLEWARE] API middleware for session verification
// Tags: P0, AUTH, MIDDLEWARE
import { trace, SpanStatusCode } from "@opentelemetry/api";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Compose helpers and internal tooling
import {
  cors,
  requestSizeLimit,
  rateLimit as inMemoryRateLimit,
  securityHeaders,
} from "./security";
import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
// Removed unused imports (csrfProtection, createRedisRateLimit) to satisfy lint no-unused-vars
import type { RedisClient } from "../../../src/lib/api/redis-rate-limit";
import { Logger } from "../../../src/lib/logger";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    customClaims?: Record<string, unknown>;
  };
  logger?: Logger;
}

/**
 * Middleware to require a valid session cookie on API routes.
 * Returns 401 if session is missing or invalid.
 */
export async function requireSession(
  req: AuthenticatedRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const startTime = Date.now();
  const reqLogger = Logger.fromRequest(req);

  const tracer = trace.getTracer("apps-web");
  return await tracer.startActiveSpan("auth.requireSession", async (span) => {
    try {
      const sessionCookie = req.cookies.get("session")?.value;

      if (!sessionCookie) {
        reqLogger.warn("Missing session cookie");
        span.setStatus({ code: SpanStatusCode.ERROR, message: "No session cookie" });
        span.setAttribute("http.status_code", 401);
        span.end();
        return NextResponse.json({ error: "Unauthorized: No session cookie" }, { status: 401 });
      }

      const auth = getFirebaseAdminAuth();
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

      // Attach user info and logger to request
      req.user = {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        customClaims: decodedClaims,
      };
      req.logger = reqLogger.child({ uid: decodedClaims.uid });

      // Set Sentry user context
      Sentry.setUser({
        id: decodedClaims.uid,
        email: decodedClaims.email,
      });

      const response = await handler(req);
      const latencyMs = Date.now() - startTime;

      span.setAttribute("enduser.id", decodedClaims.uid);
      span.setAttribute("http.status_code", response.status);
      span.setAttribute("http.route", req.nextUrl.pathname);
      span.end();

      reqLogger.info("Request authenticated", { uid: decodedClaims.uid, latencyMs });
      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      reqLogger.error("Session verification failed", error, { latencyMs });
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.end();
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }
  });
}

/**
 * Middleware to require 2FA for manager/admin operations.
 * Checks for 'mfa' claim in the session token.
 */
export async function require2FAForManagers(
  req: AuthenticatedRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  // First verify session
  const sessionResult = await requireSession(req, async (authenticatedReq) => {
    const tracer = trace.getTracer("apps-web");
    return tracer.startActiveSpan("auth.require2FAForManagers", async (span) => {
      const hasMFA = authenticatedReq.user?.customClaims?.mfa === true;

      if (!hasMFA) {
        authenticatedReq.logger?.warn("2FA required but not present", {
          uid: authenticatedReq.user?.uid,
        });
        span.setStatus({ code: SpanStatusCode.ERROR, message: "2FA required" });
        span.setAttribute("http.status_code", 403);
        span.end();
        return NextResponse.json(
          { error: "Forbidden: 2FA required for this operation" },
          { status: 403 },
        );
      }

      try {
        const res = await handler(authenticatedReq);
        span.setAttribute("http.status_code", res.status);
        span.end();
        return res;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw error;
      }
    });
  });

  return sessionResult;
}

// Compose helper: security + csrf + auth + optional redis rate limiter
// (imports moved to top for consistent ordering)

export interface WithSecurityOptions {
  requireAuth?: boolean;
  require2FA?: boolean;
  maxRequests?: number;
  windowMs?: number;
  redisClient?: RedisClient | null;
  redisRateLimit?: { max: number; windowSeconds: number } | null;
  corsAllowedOrigins?: string[];
  maxBodySize?: number;
}

export function withSecurity<
  C extends { params: Record<string, string> | Promise<Record<string, string>> } = {
    params: Record<string, string> | Promise<Record<string, string>>;
  },
>(
  handler: (
    req: AuthenticatedRequest | NextRequest,
    ctx: { params: Record<string, string>; [key: string]: unknown },
  ) => Promise<NextResponse>,
  options: WithSecurityOptions = {},
): (req: AuthenticatedRequest | NextRequest, ctx: C) => Promise<NextResponse> {
  return async (req: AuthenticatedRequest | NextRequest, ctx: C) => {
    try {
      // Resolve params if it's a Promise (Next.js 14+/16+)
      const resolvedParams = await Promise.resolve(ctx.params);
      const resolvedCtx = { ...ctx, params: resolvedParams } as {
        params: Record<string, string>;
        [key: string]: unknown;
      };

      // Apply CORS
      const corsMw = cors(options.corsAllowedOrigins || []);
      const afterCors = await corsMw(req as NextRequest, async (corsReq) => {
        // Apply request size limit
        const sizeMw = requestSizeLimit(options.maxBodySize || undefined);
        return await sizeMw(corsReq as NextRequest, async (sizeReq) => {
          // Apply rate limiting
          const maxReqs = options.maxRequests ?? 100;
          const windowMs = options.windowMs ?? 15 * 60 * 1000;
          const rateLimiter = inMemoryRateLimit(maxReqs, windowMs);
          return await rateLimiter(sizeReq as NextRequest, async (rlReq) => {
            // Skip CSRF in test mode to avoid middleware composition issues
            // CSRF should be tested separately via csrf.ts tests
            if (options.require2FA) {
              return require2FAForManagers(rlReq as AuthenticatedRequest, async (ra) => {
                return handler(ra as AuthenticatedRequest, resolvedCtx);
              });
            }

            if (options.requireAuth) {
              return requireSession(rlReq as AuthenticatedRequest, async (ra) => {
                return handler(ra as AuthenticatedRequest, resolvedCtx);
              });
            }

            return handler(rlReq as NextRequest, resolvedCtx);
          });
        });
      });
      return securityHeaders(afterCors);
    } catch (error) {
      console.error("withSecurity middleware error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

```


## Refactor: apps/web/app/api/_shared/security.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_shared/security.ts`

**File Content:**
```typescript
// [P0][SECURITY][MIDDLEWARE] Security middleware stack for API routes
// Tags: P0, SECURITY, MIDDLEWARE
import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers middleware using Helmet-style configuration
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;",
  );

  // Strict Transport Security (HSTS)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // X-Frame-Options
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-DNS-Prefetch-Control
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  );

  return response;
}

/**
 * Rate limiting store (in-memory - use Redis in production)
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple rate limiting middleware
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 */
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    // Get client identifier (IP or user ID from session)
    const clientId =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const entry = rateLimitStore.get(clientId);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    }

    if (!entry || entry.resetTime < now) {
      // Create new entry
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return handler(req);
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": entry.resetTime.toString(),
          },
        },
      );
    }

    // Increment count
    entry.count += 1;
    rateLimitStore.set(clientId, entry);

    const response = await handler(req);

    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
    response.headers.set("X-RateLimit-Reset", entry.resetTime.toString());

    return response;
  };
}

/**
 * CORS middleware
 * @param allowedOrigins - Array of allowed origins
 */
export function cors(allowedOrigins: string[] = []) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    const origin = req.headers.get("origin");
    const isAllowed =
      !origin ||
      origin === req.nextUrl.origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes("*");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin || "*" : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = await handler(req);

    if (isAllowed && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  };
}

/**
 * Request size limit middleware
 * @param maxBytes - Maximum request body size in bytes (default: 10MB)
 */
export function requestSizeLimit(maxBytes = 10 * 1024 * 1024) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    const contentLength = req.headers.get("content-length");

    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return NextResponse.json(
        { error: "Request body too large" },
        {
          status: 413,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return handler(req);
  };
}

/**
 * Combined security middleware stack
 * Applies all security measures in correct order
 */
export function securityStack(options?: {
  rateLimit?: { maxRequests?: number; windowMs?: number };
  cors?: { allowedOrigins?: string[] };
  maxBodySize?: number;
}) {
  const rateLimitMiddleware = rateLimit(
    options?.rateLimit?.maxRequests,
    options?.rateLimit?.windowMs,
  );
  const corsMiddleware = cors(options?.cors?.allowedOrigins);
  const sizeLimitMiddleware = requestSizeLimit(options?.maxBodySize);

  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    // Apply middleware in order: CORS → Size Limit → Rate Limit → Handler → Security Headers
    return corsMiddleware(req, (req1) =>
      sizeLimitMiddleware(req1, (req2) =>
        rateLimitMiddleware(req2, async (req3) => {
          const response = await handler(req3);
          return securityHeaders(response);
        }),
      ),
    );
  };
}

```


## Refactor: apps/web/app/api/_shared/validation.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_shared/validation.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][VALIDATION] Validation
// Tags: P1, INTEGRITY, VALIDATION
import { NextResponse } from "next/server";
import { z } from "zod";

/** Standard API error payload shape */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

/** Build a 400 error response with consistent shape */
export function badRequest(message: string, details?: unknown, code = "BAD_REQUEST") {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 400 });
}

/** Build a 500 error response with consistent shape */
export function serverError(
  message = "Internal Server Error",
  details?: unknown,
  code = "INTERNAL",
) {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 500 });
}

/** Build a 200 response */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

/** Utility to parse JSON request bodies against a Zod schema */
export async function parseJson<T>(req: Request, schema: z.ZodType<T>) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new Error("Invalid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return { success: false as const, details };
  }
  return { success: true as const, data: parsed.data };
}

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Schedule schemas
export const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// Shift schemas
export const ShiftStatus = z.enum(["draft", "published", "in_progress", "completed", "cancelled"]);

export const CreateShiftSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    requiredStaff: z.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const UpdateShiftSchema = z.object({
  positionId: z.string().min(1).optional(),
  venueId: z.string().optional(),
  zoneId: z.string().optional(),
  startTime: z.number().int().positive().optional(),
  endTime: z.number().int().positive().optional(),
  status: ShiftStatus.optional(),
  requiredStaff: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  breakMinutes: z.number().int().nonnegative().optional(),
});

/**
 * Admin Responsibility Form schema for onboarding
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.3
 */
export const CreateAdminResponsibilityFormSchema = z.object({
  legalBusinessName: z.string().min(1, "Legal business name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  businessAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required").max(2),
    zipCode: z.string().min(5, "Zip code is required"),
  }),
  adminName: z.string().min(1, "Administrator name is required"),
  adminEmail: z.string().email("Valid email is required"),
  adminPhone: z.string().min(10, "Valid phone number is required"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  acceptedAt: z.string().datetime().optional(),
});

export type CreateAdminResponsibilityFormInput = z.infer<
  typeof CreateAdminResponsibilityFormSchema
>;

```


## Refactor: apps/web/app/api/_template/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/_template/route.ts`

**File Content:**
```typescript
// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { NextResponse } from "next/server";

// Example secured handler pattern for copy-paste into new routes
// Example shows imports you will actually use in real routes:
// import { z } from "zod";
// import { SomeSchema } from "@fresh-schedules/types";
// import { requireSession, requireRole } from "@/src/lib/api";
// import { doWork } from "@/src/lib/someUseCase";

/**
 * Canonical thin-edge template (Layer 03).
 *
 * Pattern: parse → validate → authorize → app-lib → respond
 */

export const GET = () => {
  // your logic here
  return NextResponse.json({ ok: true }, { status: 200 });
};

export const POST = () => {
  try {
    // Example when you need the request in future:
    // export const POST = async (req: NextRequest) => {
    //   const session = await requireSession(req);
    //   const body = await req.json();
    //   const parsed = SomeSchema.parse(body);
    //   const result = await doWork(parsed, session);
    //   return NextResponse.json({ ok: true }, { status: 201 });
    // };
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const status = err instanceof Error && err.name === "ZodError" ? 400 : 500;
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
};

export const HEAD = () => new Response(null, { status: 200 });

// Optional examples; keep thin in real handlers.
export const DELETE = () => NextResponse.json({ ok: true });
export const PATCH = () => NextResponse.json({ ok: true });

```


## Refactor: apps/web/app/api/attendance/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/attendance/route.ts`

**File Content:**
```typescript
// [P1][API][ATTENDANCE] Attendance records API route handler
// [P1][API][ATTENDANCE] Attendance records API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][ATTENDANCE] Attendance records API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][ATTENDANCE] Attendance records API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, ATTENDANCE, validation, zod

import { CreateAttendanceRecordSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/attendance
 * List attendance records for an organization, shift, or schedule
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;
        const shiftId = searchParams.get("shiftId");
        const scheduleId = searchParams.get("scheduleId");
        const staffUid = searchParams.get("staffUid");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const records = [
          {
            id: "att-1",
            orgId,
            shiftId: shiftId || "shift-1",
            scheduleId: scheduleId || "sched-1",
            staffUid: staffUid || context.userId,
            status: "checked_in",
            scheduledStart: Date.now() - 2 * 60 * 60 * 1000,
            scheduledEnd: Date.now() + 6 * 60 * 60 * 1000,
            actualCheckIn: Date.now() - 2 * 60 * 60 * 1000,
            checkInMethod: "qr_code",
            scheduledDuration: 480, // 8 hours in minutes
            breakDuration: 30,
            createdAt: Date.now() - 2 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        // Apply filters
        let filtered = records;
        if (shiftId) filtered = filtered.filter((r) => r.shiftId === shiftId);
        if (scheduleId) filtered = filtered.filter((r) => r.scheduleId === scheduleId);
        if (staffUid) filtered = filtered.filter((r) => r.staffUid === staffUid);

        return ok({ records: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch attendance records");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/attendance
 * Create a new attendance record (requires scheduler+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateAttendanceRecordSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data; // typed via CreateAttendanceRecordSchema inference

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // Calculate scheduled duration in minutes
          const scheduledDuration = Math.floor(
            (data.scheduledEnd - data.scheduledStart) / (60 * 1000),
          );

          // In production, create in Firestore
          const newRecord = {
            id: `att-${Date.now()}`,
            ...data,
            status: "scheduled" as const,
            scheduledDuration,
            breakDuration: data.breakDuration || 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newRecord, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid attendance record data");
          }
          return serverError("Failed to create attendance record");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/auth/mfa/setup/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/auth/mfa/setup/route.ts`

**File Content:**
```typescript
// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
import { traceFn } from "@/app/api/_shared/otel";
// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
import { withGuards } from "@/app/api/_shared/security";
// [P0][AUTH][API] MFA setup endpoint - generates TOTP secret and QR code
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import { withSecurity } from "../../../_shared/middleware";
import { ok, serverError } from "../../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * POST /api/auth/mfa/setup
 * Generates a TOTP secret and QR code for MFA enrollment.
 * Requires valid session.
 */
export const POST = withSecurity(
  async (req: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      // Derive a stable label from user id for display if email is unknown client-side
      const userLabel = context.userId || "user";

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `FreshRoot (${userLabel})`,
        issuer: "FreshRoot",
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      console.warn("MFA setup initiated", { userId: context.userId });

      // Store secret temporarily in Firestore (or return to client for storage)
      // For simplicity, return to client. In production, store server-side.
      return ok({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: secret.otpauth_url,
      });
    } catch (error) {
      console.error("MFA setup failed", error);
      return serverError("Failed to generate MFA secret");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/auth/mfa/verify/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/auth/mfa/verify/route.ts`

**File Content:**
```typescript
// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
import { traceFn } from "@/app/api/_shared/otel";
// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
import { withGuards } from "@/app/api/_shared/security";
// [P0][AUTH][API] MFA verification endpoint - confirms TOTP and sets custom claim
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, AUTH, API
import { NextRequest } from "next/server";
import * as speakeasy from "speakeasy";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../../../lib/firebase-admin";
import { withSecurity } from "../../../_shared/middleware";
import type { AuthenticatedRequest } from "../../../_shared/middleware";
import { badRequest, serverError, ok } from "../../../_shared/validation";

// Rate limiting via withSecurity options

const verifySchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});

/**
 * POST /api/auth/mfa/verify
 * Verifies TOTP token and sets mfa=true custom claim.
 * Requires valid session.
 */
export const POST = withSecurity(
  async (req: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const body = await req.json();
      const { secret, token } = verifySchema.parse(body);

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2, // Allow 2 time steps before/after
      });

      if (!verified) {
        console.warn("Invalid MFA verification code", { uid: context.userId });
        return badRequest("Invalid verification code");
      }

      // Set mfa=true custom claim
      const auth = getFirebaseAdminAuth();
      // Prefer explicit context.userId, fall back to any authenticated request user attached by middleware
      const uid = context.userId ?? (req as AuthenticatedRequest).user?.uid;

      // For safety, preserve any existing custom claims you manage elsewhere
      await auth.setCustomUserClaims(uid, {
        mfa: true,
      });

      console.warn("MFA enabled successfully", { uid });

      // Store secret in Firestore for future verification (optional)
      // In production, hash the secret before storing

      return ok({
        success: true,
        message: "MFA enabled successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest("Invalid request", error.errors);
      }

      console.error("MFA verification failed", error);
      return serverError("Failed to verify MFA");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/health/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/health/route.ts`

**File Content:**
```typescript
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
import { traceFn } from "@/app/api/_shared/otel";
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
import { withGuards } from "@/app/api/_shared/security";
// [P1][OBSERVABILITY][HEALTH] Health check endpoint
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, OBSERVABILITY, HEALTH
import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Basic health check endpoint for uptime monitoring
 * Returns 200 with ok: true if service is running
 */
export function GET() {
  const healthStatus = {
    ok: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  return NextResponse.json(healthStatus, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

```


## Refactor: apps/web/app/api/healthz/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/healthz/route.ts`

**File Content:**
```typescript
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
/**
 * [P0][API][HEALTH] Health Check Endpoint
 * Tags: api, health, infra
 *
 * Overview:
 * - Simple liveness probe for load balancers and uptime monitoring
 * - Does NOT hit Firestore; use for "is the web app alive" checks
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      // You can hard-code or inject a version string later
      version: "v14-core",
    },
    { status: 200 },
  );
}

// Some monitors use HEAD for cheaper checks
export async function HEAD() {
  return new Response(null, { status: 200 });
}

```


## Refactor: apps/web/app/api/internal/backup/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/internal/backup/route.ts`

**File Content:**
```typescript
// [P1][OPS][BACKUP] Internal endpoint to trigger Firestore export
// [P1][OPS][BACKUP] Internal endpoint to trigger Firestore export
import { traceFn } from "@/app/api/_shared/otel";
// [P1][OPS][BACKUP] Internal endpoint to trigger Firestore export
import { withGuards } from "@/app/api/_shared/security";
// [P1][OPS][BACKUP] Internal endpoint to trigger Firestore export
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, OPS, BACKUP, FIRESTORE
import { GoogleAuth } from "google-auth-library";
import { NextRequest } from "next/server";

import { badRequest, serverError, ok } from "../../_shared/validation";

// Security: protect with static header token set in env and Cloud Scheduler
const HEADER_NAME = "x-backup-token";

async function exportFirestore(projectId: string, bucket: string, collections?: string[]) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
  const body = {
    outputUriPrefix: `gs://${bucket}/firestore-backups/${new Date().toISOString().replace(/[:.]/g, "-")}`,
    // Empty or omitted collectionIds means export all collections
    // If provided, export subset
    collectionIds: collections && collections.length > 0 ? collections : undefined,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const configuredToken = process.env.BACKUP_CRON_TOKEN;
    if (!configuredToken) {
      return serverError("Server not configured (BACKUP_CRON_TOKEN)");
    }

    const headerToken = req.headers.get(HEADER_NAME);
    if (!headerToken || headerToken !== configuredToken) {
      return badRequest("Invalid or missing backup token", null, "FORBIDDEN");
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const bucket = process.env.BACKUP_BUCKET;

    if (!projectId || !bucket) {
      return badRequest("Missing FIREBASE_PROJECT_ID or BACKUP_BUCKET");
    }

    const collectionsParam = req.nextUrl.searchParams.get("collections");
    const collections = collectionsParam
      ? collectionsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const result = await exportFirestore(projectId, bucket, collections);

    return ok({ success: true, operation: result });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Backup failed");
  }
}

export const runtime = "nodejs"; // Ensure Node runtime (not edge)

```


## Refactor: apps/web/app/api/items/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/items/route.ts`

**File Content:**
```typescript
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError } from "../_shared/validation";

/**
 * A simple example endpoint to demonstrate:
 * - Zod validation
 * - Standard error shape
 * - Returning JSON
 * - Session authentication
 */
const CreateItemInput = z.object({
  name: z.string().min(1, "name is required"),
});

// Rate limiting via withSecurity options

export const POST = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const parsed = await parseJson(request, CreateItemInput);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      const { name } = parsed.data;
      // Normally you'd write to Firestore here. We'll simulate a created item.
      const item = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        createdBy: context.userId,
      };
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      // Log the error for debugging; return a generic message to the client
      console.error("POST /api/items error:", err);
      return serverError("Unexpected error");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

// Optional: GET returns a static list (safe demo)
export const GET = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    return NextResponse.json([
      {
        id: "demo-1",
        name: "Sample",
        createdAt: 0,
        userId: context.userId,
      },
    ]);
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/join-tokens/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/join-tokens/route.ts`

**File Content:**
```typescript
// [P1][API][JOIN_TOKENS] Join tokens API route handler
// [P1][API][JOIN_TOKENS] Join tokens API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][JOIN_TOKENS] Join tokens API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][JOIN_TOKENS] Join tokens API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, JOIN_TOKENS, validation, zod

import { CreateJoinTokenSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * GET /api/join-tokens
 * List join tokens for an organization
 */
export const GET = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { searchParams } = new URL(request.url);
          const orgId = searchParams.get("orgId") || context.orgId;
          const status = searchParams.get("status");

          if (!orgId) {
            return badRequest("orgId query parameter is required");
          }

          // Mock data - in production, fetch from Firestore
          const tokens = [
            {
              id: "jt-1",
              orgId,
              token: "abc123def456xyz789",
              defaultRoles: ["staff"],
              status: "active",
              maxUses: 10,
              currentUses: 3,
              usedBy: ["user1", "user2", "user3"],
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
              description: "General staff invitation",
              createdBy: context.userId,
              createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
              updatedAt: Date.now(),
            },
          ];

          const filtered = status ? tokens.filter((t) => t.status === status) : tokens;

          return ok({ tokens: filtered, total: filtered.length });
        } catch {
          return serverError("Failed to fetch join tokens");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/join-tokens
 * Create a new join token (requires admin+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateJoinTokenSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data; // inferred from schema

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // Generate secure token
          const token = generateSecureToken();

          // In production, create in Firestore
          const newToken = {
            id: `jt-${Date.now()}`,
            ...data,
            token,
            status: "active" as const,
            currentUses: 0,
            usedBy: [],
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newToken, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid join token data");
          }
          return serverError("Failed to create join token");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/metrics/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/metrics/route.ts`

**File Content:**
```typescript
// [P1][OBSERVABILITY][METRICS] Prometheus-compatible metrics endpoint
// [P1][OBSERVABILITY][METRICS] Prometheus-compatible metrics endpoint
import { traceFn } from "@/app/api/_shared/otel";
// [P1][OBSERVABILITY][METRICS] Prometheus-compatible metrics endpoint
import { withGuards } from "@/app/api/_shared/security";
// [P1][OBSERVABILITY][METRICS] Prometheus-compatible metrics endpoint
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, OBSERVABILITY, METRICS
import { NextResponse } from "next/server";

/**
 * Metrics endpoint exposing Prometheus-compatible metrics.
 * This is a simple implementation that tracks basic counters.
 * For production, consider using @opentelemetry/api with a proper registry.
 */

// In-memory metrics store (will be replaced with proper instrumentation)
interface Metrics {
  http_requests_total: Record<string, number>;
  http_request_duration_seconds: Record<string, number[]>;
  http_errors_total: Record<string, number>;
}

// Global metrics object (temporary - will use OpenTelemetry in production)
const metrics: Metrics = {
  http_requests_total: {},
  http_request_duration_seconds: {},
  http_errors_total: {},
};

/**
 * Record a request metric
 */
export function recordRequest(method: string, path: string, duration: number, statusCode: number) {
  const key = `${method}_${path}`;

  // Count total requests
  metrics.http_requests_total[key] = (metrics.http_requests_total[key] || 0) + 1;

  // Record duration
  if (!metrics.http_request_duration_seconds[key]) {
    metrics.http_request_duration_seconds[key] = [];
  }
  metrics.http_request_duration_seconds[key].push(duration);

  // Count errors
  if (statusCode >= 400) {
    metrics.http_errors_total[key] = (metrics.http_errors_total[key] || 0) + 1;
  }
}

/**
 * Calculate percentile from array of values
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Format metrics in Prometheus text format
 */
function formatPrometheusMetrics(): string {
  const lines: string[] = [];

  // HTTP requests total
  lines.push("# HELP http_requests_total Total number of HTTP requests");
  lines.push("# TYPE http_requests_total counter");
  for (const [key, count] of Object.entries(metrics.http_requests_total)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    lines.push(`http_requests_total{method="${method}",path="${path}"} ${count}`);
  }

  // HTTP request duration (p50, p95, p99)
  lines.push("");
  lines.push("# HELP http_request_duration_seconds HTTP request duration in seconds");
  lines.push("# TYPE http_request_duration_seconds summary");
  for (const [key, durations] of Object.entries(metrics.http_request_duration_seconds)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    const p50 = percentile(durations, 50) / 1000; // Convert ms to seconds
    const p95 = percentile(durations, 95) / 1000;
    const p99 = percentile(durations, 99) / 1000;
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.5"} ${p50.toFixed(3)}`,
    );
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.95"} ${p95.toFixed(3)}`,
    );
    lines.push(
      `http_request_duration_seconds{method="${method}",path="${path}",quantile="0.99"} ${p99.toFixed(3)}`,
    );
  }

  // HTTP errors total
  lines.push("");
  lines.push("# HELP http_errors_total Total number of HTTP errors (4xx, 5xx)");
  lines.push("# TYPE http_errors_total counter");
  for (const [key, count] of Object.entries(metrics.http_errors_total)) {
    const [method, ...pathParts] = key.split("_");
    const path = pathParts.join("_");
    lines.push(`http_errors_total{method="${method}",path="${path}"} ${count}`);
  }

  return lines.join("\n") + "\n";
}

export async function GET() {
  // Return metrics in Prometheus text format
  const metricsText = formatPrometheusMetrics();

  return new NextResponse(metricsText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}

```


## Refactor: apps/web/app/api/onboarding/__tests__/activate-network.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/activate-network.test.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Activate Network Test tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][ONBOARDING] Activate Network Endpoint Tests
 * Tags: test, onboarding, network, activation, unit
 *
 * Note: These tests document the expected behavior of the activate-network endpoint.
 * The endpoint activates a pending network to active status (admin-only operation).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/onboarding/activate-network", () => {
  let _mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    _mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          update: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              status: "pending",
              ownerId: "test-uid-123",
            }),
          }),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
        },
      },
    } as any;
  });

  it("should require authenticated request", async () => {
    // The endpoint uses withSecurity(requireAuth: true), so unauthenticated
    // requests will be rejected at middleware level
    expect(mockReq.user).toBeDefined();
  });

  it("should require networkId in request body", async () => {
    // If networkId is missing, endpoint returns 422 missing_network_id
    const emptyBody = {};
    expect(emptyBody).not.toHaveProperty("networkId");
  });

  it("should activate a pending network to active status", async () => {
    // When given a valid networkId for a pending network owned by the user,
    // the endpoint should update status to "active"
    const validRequest = {
      networkId: "network-789",
    };

    expect(validRequest).toHaveProperty("networkId");
  });

  it("should emit network.activated event when activating", async () => {
    // The endpoint should log an event to Firestore events collection
    // with category: "network", type: "network.activated"
    const eventPayload = {
      category: "network",
      type: "network.activated",
      actorUserId: "test-uid-123",
      networkId: "network-789",
    };

    expect(eventPayload.type).toBe("network.activated");
  });

  it("should handle stub mode gracefully", async () => {
    // When adminDb is undefined (dev/test), endpoint returns stub response
    const stubResponse = {
      ok: true,
      networkId: "stub-network",
      status: "active",
    };

    expect(stubResponse.ok).toBe(true);
  });

  it("should return error if network does not exist", async () => {
    // When networkId refers to non-existent network, endpoint returns 404
    const missingNetworkError = {
      error: "network_not_found",
      status: 404,
    };

    expect(missingNetworkError.status).toBe(404);
  });

  it("should prevent activating already-active networks", async () => {
    // If network status is already "active", endpoint returns conflict
    const alreadyActiveResponse = {
      error: "network_already_active",
      status: 409,
    };

    expect(alreadyActiveResponse.status).toBe(409);
  });

  it("should enforce admin-only access control", async () => {
    // Only the network owner (admin) can activate their network
    // If requester is not owner, endpoint returns 403 forbidden
    const forbiddenResponse = {
      error: "not_authorized",
      status: 403,
    };

    expect(forbiddenResponse.status).toBe(403);
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/admin-form.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/admin-form.test.ts`

**File Content:**
```typescript
// [P0][FIREBASE][TEST] Admin Form Test tests
// Tags: P0, FIREBASE, TEST
/**
 * [P1][TEST][ONBOARDING] Admin Form Endpoint Tests
 * Tags: test, onboarding, admin-form, compliance, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { adminFormHandler } from "../admin-form/route";

describe("POST /api/onboarding/admin-form", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ status: "not_started" }),
          }),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await adminFormHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing required compliance fields", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      // missing email, taxId, etc.
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should validate email format", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "invalid-email",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("email");
  });

  it("should create compliance form entry and generate token", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corporation",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("token");
    expect(data.tokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it("should store form submission in Firestore", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "Jane Smith",
      adminEmail: "jane@example.com",
      taxId: "98-7654321",
      legalEntityName: "Jane's Ventures",
    });

    await adminFormHandler(mockReq, mockAdminDb);

    // Verify collection method was called with "compliance_forms"
    expect(mockAdminDb.collection).toHaveBeenCalledWith("compliance_forms");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
    expect(data).toHaveProperty("token");
  });

  it("should set token expiration to 30 days from now", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const now = Date.now();
    const response = await adminFormHandler(mockReq, mockAdminDb);
    const data = await response.json();

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expectedExpiration = now + thirtyDaysMs;

    // Allow 5 second variance
    expect(Math.abs(data.tokenExpiresAt - expectedExpiration)).toBeLessThan(5000);
  });

  it("should reject invalid tax ID format", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "invalid", // should be XX-XXXXXXX format
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("taxId");
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/create-network-corporate.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/create-network-corporate.test.ts`

**File Content:**
```typescript
// [P0][SECURITY][TEST] Create Network Corporate Test tests
// Tags: P0, SECURITY, TEST
/**
 * [P1][TEST][ONBOARDING] Create Network Corporate Endpoint Tests
 * Tags: test, onboarding, network, corporate, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { createNetworkCorporateHandler } from "../create-network-corporate/route";

describe("POST /api/onboarding/create-network-corporate", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              status: "not_started",
              stage: "profile",
              onboarding: {},
            }),
          }),
        }),
        add: vi.fn().mockResolvedValue({ id: "network-456" }),
      }),
      batch: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          batch: {
            set: vi.fn(),
            commit: vi.fn().mockResolvedValue(undefined),
          },
        }),
        commit: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "corporate-admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await createNetworkCorporateHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing networkName or companyName", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Corporate Network",
      // missing companyName
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should create network and corporate documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("networkId");
    expect(data).toHaveProperty("corporateId");
  });

  it("should emit network.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should emit corporate.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    await createNetworkCorporateHandler(mockReq, mockAdminDb);
  });

  it("should mark onboarding as complete for intent:create_corporate", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const _data = await response.json();

    expect(mockAdminDb.collection).toHaveBeenCalledWith("users");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
  });

  it("should reject networkName longer than 100 chars", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should set corporate status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });

  it("should allow optional industryType", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Enterprise Network",
      companyName: "Acme Corp",
      industryType: "Technology",
    });

    const response = await createNetworkCorporateHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/create-network-org.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/create-network-org.test.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Create Network Org Test tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][ONBOARDING] Create Network Org Endpoint Tests
 * Tags: test, onboarding, network, org, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { createNetworkOrgHandler } from "../create-network-org/route";

describe("POST /api/onboarding/create-network-org", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              status: "not_started",
              stage: "profile",
              onboarding: {},
            }),
          }),
        }),
        add: vi.fn().mockResolvedValue({ id: "network-123" }),
      }),
      batch: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          batch: {
            set: vi.fn(),
            commit: vi.fn().mockResolvedValue(undefined),
          },
        }),
        commit: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await createNetworkOrgHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing networkName or orgName", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "My Network",
      // missing orgName
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should create network and org documents", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("networkId");
    expect(data).toHaveProperty("orgId");
  });

  it("should emit network.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    // Events are logged asynchronously, so we just verify response is ok
    expect(response.status).toBe(200);
  });

  it("should emit org.created event", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    await createNetworkOrgHandler(mockReq, mockAdminDb);
    // Events are logged asynchronously
  });

  it("should mark onboarding as complete for intent:create_org", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);

    // Verify onboarding status was updated
    expect(mockAdminDb.collection).toHaveBeenCalledWith("users");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
  });

  it("should reject networkName longer than 100 chars", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "A".repeat(101),
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
  });

  it("should set network status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });

  it("should set org status to pending", async () => {
    mockReq.json.mockResolvedValue({
      networkName: "Test Network",
      orgName: "Test Org",
    });

    const response = await createNetworkOrgHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    // Verify through database calls
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/endpoints.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/endpoints.test.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Endpoints Test tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][ONBOARDING] Onboarding Endpoints Unit Tests
 * Tags: test, onboarding, api, unit
 *
 * Overview:
 * - Unit tests for all 6 ONB endpoints
 * - Tests verify Firestore interactions, event emission, validation
 * - Uses Vitest with mock adminDb
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock types
const mockAdminDb = {
  collection: vi.fn(),
};

const mockCollection = {
  doc: vi.fn(),
};

const mockDocRef = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
};

// Helper to create mock req
function createMockRequest(uid: string, body?: unknown) {
  return {
    user: { uid, customClaims: { email: `user-${uid}@example.com` } },
    json: async () => body || {},
  };
}

describe("Onboarding Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminDb.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDocRef);
  });

  describe("ONB-01: Verify Eligibility", () => {
    it("should verify user eligibility by role and email domain", async () => {
      // Mock: user exists in roles collection
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "admin", email: "user@example.com" }),
      });

      // Simulate endpoint logic
      const uid = "test-user-1";
      const req = createMockRequest(uid);

      // Basic eligibility check
      expect(req.user?.uid).toBe("test-user-1");
      expect(req.user?.customClaims?.email).toBe("user-test-user-1@example.com");
    });

    it("should reject user without required role", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: false,
      });

      const uid = "test-user-2";
      const req = createMockRequest(uid);

      // User not in eligible roles
      expect(req.user?.uid).toBe("test-user-2");
    });

    it("should enforce rate-limiting", async () => {
      // Mock: user has hit rate limit
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ requestCount: 5, lastRequestAt: Date.now() - 1000 }),
      });

      const uid = "rate-limited-user";
      const req = createMockRequest(uid);
      expect(req.user?.uid).toBe("rate-limited-user");
    });
  });

  describe("ONB-02: Admin Responsibility Form", () => {
    it("should validate and store admin form submission", async () => {
      const formData = {
        firstName: "John",
        lastName: "Doe",
        taxIdType: "ssn",
        taxIdLast4: "1234",
      };

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "admin-user-1";
      const req = createMockRequest(uid, formData);

      expect(req.user?.uid).toBe("admin-user-1");
      // Would verify form is stored
    });

    it("should generate join token after form submission", async () => {
      const formData = {
        firstName: "Jane",
        lastName: "Smith",
        taxIdType: "ein",
        taxIdLast4: "5678",
      };

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "admin-user-2";
      const req = createMockRequest(uid, formData);

      expect(req.user?.uid).toBe("admin-user-2");
      // Would verify token is generated and returned
    });

    it("should reject invalid tax ID format", async () => {
      const formData = {
        firstName: "Invalid",
        lastName: "User",
        taxIdType: "ssn",
        taxIdLast4: "ab", // Invalid
      };

      const uid = "invalid-tax-user";
      const req = createMockRequest(uid, formData);

      expect(req.user?.uid).toBe("invalid-tax-user");
      // Would verify validation error is returned
    });
  });

  describe("ONB-03: Create Network + Org", () => {
    it("should create network and org, emit events, mark onboarding complete", async () => {
      const payload = {
        networkName: "Acme Corp Network",
        orgName: "Acme Corp",
        intent: "create_org",
      };

      mockDocRef.set.mockResolvedValueOnce(undefined);
      mockDocRef.update.mockResolvedValueOnce(undefined);

      const uid = "org-creator-1";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("org-creator-1");
      // Would verify: network created, org created, events logged, onboarding marked complete
    });

    it("should validate network name is unique", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true, // Network already exists
      });

      const payload = {
        networkName: "Existing Network",
        orgName: "New Org",
        intent: "create_org",
      };

      const uid = "org-creator-2";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("org-creator-2");
      // Would verify uniqueness validation
    });

    it("should emit onboarding.completed event", async () => {
      const payload = {
        networkName: "Test Network",
        orgName: "Test Org",
        intent: "create_org",
      };

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "event-test-1";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("event-test-1");
      // Would verify event emission
    });
  });

  describe("ONB-04: Create Network + Corporate", () => {
    it("should create network and corporate entity, emit events", async () => {
      const payload = {
        networkName: "Corporate Network",
        corporateName: "Big Corp Inc",
        intent: "create_corporate",
      };

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "corporate-creator-1";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("corporate-creator-1");
      // Would verify: network created, corporate created, events logged
    });

    it("should validate corporate structure", async () => {
      const payload = {
        networkName: "Corp Network",
        corporateName: "Valid Corp",
        intent: "create_corporate",
      };

      const uid = "corporate-creator-2";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("corporate-creator-2");
      // Would verify corporate structure validation
    });

    it("should mark onboarding complete after corporate creation", async () => {
      const payload = {
        networkName: "Startup Network",
        corporateName: "Startup Inc",
        intent: "create_corporate",
      };

      mockDocRef.update.mockResolvedValueOnce(undefined);

      const uid = "startup-creator-1";
      const req = createMockRequest(uid, payload);

      expect(req.user?.uid).toBe("startup-creator-1");
      // Would verify onboarding.completed event
    });
  });

  describe("ONB-05: Activate Network", () => {
    it("should activate network (admin-only)", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "pending", adminId: "admin-user-1" }),
      });

      mockDocRef.update.mockResolvedValueOnce(undefined);

      const uid = "admin-user-1";
      const req = createMockRequest(uid, { networkId: "network-123" });

      expect(req.user?.uid).toBe("admin-user-1");
      // Would verify: network status updated to active, event emitted
    });

    it("should reject non-admin activation attempts", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "pending", adminId: "admin-user-1" }),
      });

      const uid = "non-admin-user";
      const req = createMockRequest(uid, { networkId: "network-123" });

      expect(req.user?.uid).toBe("non-admin-user");
      // Would verify 403 Forbidden response
    });

    it("should emit network.activated event", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "pending", adminId: "admin-user-1" }),
      });

      const uid = "admin-user-1";
      const req = createMockRequest(uid, { networkId: "network-123" });

      expect(req.user?.uid).toBe("admin-user-1");
      // Would verify event emission
    });
  });

  describe("ONB-06: Join with Token", () => {
    it("should join existing network with valid token", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          networkId: "network-123",
          orgId: "org-456",
          role: "staff",
          expiresAt: Date.now() + 86400000,
        }),
      });

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "joining-user-1";
      const req = createMockRequest(uid, { token: "join-token-123" });

      expect(req.user?.uid).toBe("joining-user-1");
      // Would verify: membership created, events logged, onboarding completed
    });

    it("should reject expired token", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          networkId: "network-123",
          orgId: "org-456",
          role: "staff",
          expiresAt: Date.now() - 1000, // Already expired
        }),
      });

      const uid = "joining-user-2";
      const req = createMockRequest(uid, { token: "expired-token" });

      expect(req.user?.uid).toBe("joining-user-2");
      // Would verify expired token rejection
    });

    it("should reject invalid or missing token", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: false,
      });

      const uid = "joining-user-3";
      const req = createMockRequest(uid, { token: "invalid-token" });

      expect(req.user?.uid).toBe("joining-user-3");
      // Would verify invalid token rejection
    });

    it("should emit membership.created and onboarding.completed events", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          networkId: "network-123",
          orgId: "org-456",
          role: "staff",
          expiresAt: Date.now() + 86400000,
        }),
      });

      const uid = "joining-user-4";
      const req = createMockRequest(uid, { token: "valid-token" });

      expect(req.user?.uid).toBe("joining-user-4");
      // Would verify both events are emitted
    });

    it("should respect token max-uses limit", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          networkId: "network-123",
          orgId: "org-456",
          role: "staff",
          expiresAt: Date.now() + 86400000,
          maxUses: 3,
          usedBy: ["user-1", "user-2", "user-3"], // Already at max
        }),
      });

      const uid = "joining-user-5";
      const req = createMockRequest(uid, { token: "maxed-token" });

      expect(req.user?.uid).toBe("joining-user-5");
      // Would verify max-uses limit enforcement
    });
  });

  describe("Session Bootstrap", () => {
    it("should create user profile on first sign-in", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: false, // First sign-in
      });

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "new-user-1";
      const req = createMockRequest(uid);

      expect(req.user?.uid).toBe("new-user-1");
      // Would verify profile created with baseline data
    });

    it("should backfill missing profile fields on subsequent sign-ins", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          profile: { email: "user@example.com" },
          onboarding: { status: "not_started" },
        }),
      });

      mockDocRef.set.mockResolvedValueOnce(undefined);

      const uid = "existing-user-1";
      const req = createMockRequest(uid);

      expect(req.user?.uid).toBe("existing-user-1");
      // Would verify profile fields are backfilled
    });

    it("should preserve existing onboarding state", async () => {
      mockDocRef.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          profile: { email: "user@example.com" },
          onboarding: {
            status: "in_progress",
            stage: "admin_form",
            intent: "create_org",
          },
        }),
      });

      const uid = "progressing-user-1";
      const req = createMockRequest(uid);

      expect(req.user?.uid).toBe("progressing-user-1");
      // Would verify onboarding state is not overwritten
    });
  });

  describe("Error Handling", () => {
    it("should return 401 when user is not authenticated", async () => {
      const req = {
        user: undefined, // Not authenticated
        json: async () => ({}),
      };

      expect(req.user).toBeUndefined();
      // Would verify 401 Unauthorized response
    });

    it("should return 500 on Firestore errors", async () => {
      mockDocRef.get.mockRejectedValueOnce(new Error("Firestore error"));

      const uid = "error-user-1";
      const req = createMockRequest(uid);

      expect(req.user?.uid).toBe("error-user-1");
      // Would verify 500 Internal Server Error response
    });

    it("should handle stub mode (no adminDb)", async () => {
      const uid = "stub-user-1";
      const req = createMockRequest(uid);

      // In stub mode, endpoints return minimal response
      expect(req.user?.uid).toBe("stub-user-1");
      // Would verify stub response is returned
    });
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/join-with-token.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/join-with-token.test.ts`

**File Content:**
```typescript
// [P0][AUTH][TEST] Join With Token Test tests
// Tags: P0, AUTH, TEST
/**
 * [P1][TEST][ONBOARDING] Join With Token Endpoint Tests
 * Tags: test, onboarding, join-token, membership, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/onboarding/join-with-token", () => {
  let _mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    _mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          update: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              networkId: "network-123",
              orgId: "org-456",
              role: "staff",
              expiresAt: Date.now() + 1000000,
              disabled: false,
              usedBy: [],
            }),
          }),
        }),
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            docs: [
              {
                id: "member-789",
                data: () => ({ userId: "test-uid" }),
              },
            ],
          }),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "user@example.com",
        },
      },
    } as any;
  });

  it("should require authenticated request", async () => {
    // The endpoint uses withSecurity(requireAuth: true)
    expect(mockReq.user).toBeDefined();
  });

  it("should require token in request body", async () => {
    // If token is missing, endpoint returns error
    const emptyBody = {};
    expect(emptyBody).not.toHaveProperty("token");
  });

  it("should validate token exists and is not expired", async () => {
    // Endpoint should check token exists in join_tokens collection
    // and verify expiresAt timestamp
    const tokenDoc = {
      networkId: "network-123",
      orgId: "org-456",
      expiresAt: Date.now() + 1000000, // future timestamp
    };

    expect(tokenDoc.expiresAt).toBeGreaterThan(Date.now());
  });

  it("should reject expired tokens", async () => {
    // If token.expiresAt < now, endpoint returns error
    const expiredToken = {
      error: "token_expired",
      status: 410,
    };

    expect(expiredToken.status).toBe(410);
  });

  it("should reject disabled tokens", async () => {
    // If token.disabled === true, endpoint returns error
    const disabledToken = {
      error: "token_disabled",
      status: 403,
    };

    expect(disabledToken.status).toBe(403);
  });

  it("should create membership document when joining", async () => {
    // Endpoint should create a doc in memberships collection
    const membershipPayload = {
      networkId: "network-123",
      orgId: "org-456",
      userId: "test-uid-123",
      role: "staff",
      joinedAt: Date.now(),
    };

    expect(membershipPayload).toHaveProperty("userId");
    expect(membershipPayload).toHaveProperty("role");
  });

  it("should emit membership.created event", async () => {
    // Event should be logged with category: "membership", type: "membership.created"
    const membershipEvent = {
      category: "membership",
      type: "membership.created",
      actorUserId: "test-uid-123",
      networkId: "network-123",
      orgId: "org-456",
      payload: {
        source: "onboarding.join-with-token",
        role: "staff",
        via: "join_token",
      },
    };

    expect(membershipEvent.type).toBe("membership.created");
  });

  it("should emit onboarding.completed event with intent:join_existing", async () => {
    // Onboarding event should have payload.intent = "join_existing"
    const onboardingEvent = {
      category: "onboarding",
      type: "onboarding.completed",
      payload: {
        intent: "join_existing",
      },
    };

    expect(onboardingEvent.payload.intent).toBe("join_existing");
  });

  it("should update user onboarding status to completed", async () => {
    // The endpoint should call markOnboardingComplete() to update users/{uid}.onboarding
    const onboardingUpdate = {
      status: "completed",
      stage: "completed",
      completedAt: Date.now(),
    };

    expect(onboardingUpdate.status).toBe("completed");
  });

  it("should return 404 if token does not exist", async () => {
    // If token document not found in join_tokens collection
    const notFoundError = {
      error: "token_not_found",
      status: 404,
    };

    expect(notFoundError.status).toBe(404);
  });

  it("should handle stub mode (no adminDb)", async () => {
    // When adminDb is undefined, endpoint returns stub response
    const stubResponse = {
      ok: true,
      networkId: "stub-network",
      orgId: "stub-org",
      role: "staff",
    };

    expect(stubResponse.ok).toBe(true);
  });

  it("should respect maxUses limit on token", async () => {
    // If usedBy.length >= maxUses, token should not work
    const tokenExhausted = {
      error: "token_exhausted",
      status: 403,
    };

    expect(tokenExhausted.status).toBe(403);
  });

  it("should add userId to token usedBy array", async () => {
    // When token is used, endpoint should append userId to join_tokens/{id}.usedBy
    const updatedToken = {
      usedBy: ["user-1", "user-2", "user-3"],
    };

    expect(updatedToken.usedBy.length).toBeGreaterThan(0);
  });

  it("should return response with networkId, orgId, and role", async () => {
    // Endpoint response should include the joined network/org info
    const successResponse = {
      ok: true,
      networkId: "network-123",
      orgId: "org-456",
      role: "staff",
    };

    expect(successResponse.ok).toBe(true);
    expect(successResponse).toHaveProperty("networkId");
    expect(successResponse).toHaveProperty("orgId");
  });
});

```


## Refactor: apps/web/app/api/onboarding/__tests__/verify-eligibility.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/__tests__/verify-eligibility.test.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Verify Eligibility Test tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][ONBOARDING] Verify Eligibility Endpoint Tests
 * Tags: test, onboarding, eligibility, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { verifyEligibilityHandler } from "../verify-eligibility/route";

describe("POST /api/onboarding/verify-eligibility", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn(),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "test@example.com",
          selfDeclaredRole: "manager",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await verifyEligibilityHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing required fields in request body", async () => {
    mockReq.json.mockResolvedValue({});
    const response = await verifyEligibilityHandler(mockReq, mockAdminDb);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("invalid_request");
  });

  it("should return 403 if role not in ALLOWED_ROLES", async () => {
    mockReq.json.mockResolvedValue({
      email: "test@example.com",
      role: "customer", // not in allowed roles
    });

    const response = await verifyEligibilityHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain("role");
  });

  it("should return 200 with eligibility_ok for valid request", async () => {
    mockReq.json.mockResolvedValue({
      email: "test@example.com",
      role: "manager",
    });

    const response = await verifyEligibilityHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.eligible).toBe(true);
  });

  it("should handle stub mode (no adminDb) gracefully", async () => {
    mockReq.json.mockResolvedValue({
      email: "test@example.com",
      role: "manager",
    });

    const response = await verifyEligibilityHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.isStub).toBe(true);
  });

  it("should include rate_limit_remaining in response", async () => {
    mockReq.json.mockResolvedValue({
      email: "test@example.com",
      role: "admin",
    });

    const response = await verifyEligibilityHandler(mockReq, mockAdminDb);
    const data = await response.json();
    expect(data).toHaveProperty("rate_limit_remaining");
  });

  it("should return 429 if rate limit exceeded", async () => {
    mockReq.json.mockResolvedValue({
      email: "test@example.com",
      role: "manager",
    });

    // Mock rate limit exceeded scenario
    const _mockCollection = vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({ attempts: 100, lastAttemptAt: Date.now() - 1000 }),
        }),
      }),
      where: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ docs: Array(10).fill({ data: () => ({}) }) }),
      }),
    });

    // This would return 429 if the rate limit check is properly implemented
    // The actual behavior depends on implementation details
  });
});

```


## Refactor: apps/web/app/api/onboarding/_shared/rateLimit.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/_shared/rateLimit.ts`

**File Content:**
```typescript
// [P0][SECURITY][RATE_LIMIT] RateLimit
// Tags: P0, SECURITY, RATE_LIMIT
/**
 * [P1][API][SHARED] Rate-Limiting Middleware
 * Tags: api, middleware, rate-limit, security
 *
 * Overview:
 * - Centralized rate-limiting for onboarding endpoints
 * - Uses in-memory store (or Firestore for persistence)
 * - Consistent limits across all ONB flows
 */

import { NextResponse } from "next/server";

import type { AuthenticatedRequest } from "../../_shared/middleware";

const MAX_REQUESTS_PER_WINDOW = 5;
const WINDOW_MS = 60000; // 1 minute

// In-memory store (in production, use Redis or Firestore)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(uid: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = `ratelimit:${uid}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // Window expired or first request
    const resetAt = now + WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetAt: entry.resetAt,
  };
}

export function withRateLimit(
  handler: (
    req: AuthenticatedRequest & {
      user?: { uid: string; customClaims?: Record<string, unknown> };
    },
  ) => Promise<NextResponse>,
) {
  return async (
    req: AuthenticatedRequest & {
      user?: { uid: string; customClaims?: Record<string, unknown> };
    },
  ) => {
    const uid = req.user?.uid;
    if (!uid) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }

    const limit = checkRateLimit(uid);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000),
        },
        { status: 429, headers: { "Retry-After": String(limit.resetAt) } },
      );
    }

    // Add rate limit info to response headers
    const response = await handler(req);
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
    response.headers.set("X-RateLimit-Reset", new Date(limit.resetAt).toISOString());

    return response;
  };
}

```


## Refactor: apps/web/app/api/onboarding/_shared/schemas.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/_shared/schemas.ts`

**File Content:**
```typescript
// [P0][INTEGRITY][VALIDATION] Schemas
// Tags: P0, INTEGRITY, VALIDATION
/**
 * [P1][API][SHARED] Onboarding API Schemas
 * Tags: api, validation, zod, onboarding
 *
 * Overview:
 * - Centralized Zod schemas for all onboarding endpoints
 * - Ensures consistent validation across all ONB routes
 * - Type-safe request/response handling
 */

import { z } from "zod";

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const VerifyEligibilityRequestSchema = z.object({
  selfDeclaredRole: z
    .enum([
      "owner_founder_director",
      "manager_supervisor",
      "hr_person",
      "scheduling_lead",
      "operations",
      "other",
    ])
    .describe("User's self-declared role"),
});

export type VerifyEligibilityRequest = z.infer<typeof VerifyEligibilityRequestSchema>;

export const AdminFormRequestSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  taxIdType: z.enum(["ssn", "ein"]),
  taxIdLast4: z.string().regex(/^\d{4}$/, "Must be last 4 digits"),
});

export type AdminFormRequest = z.infer<typeof AdminFormRequestSchema>;

export const CreateNetworkOrgRequestSchema = z.object({
  networkName: z.string().min(2, "Network name too short"),
  orgName: z.string().min(2, "Org name too short"),
  venueName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type CreateNetworkOrgRequest = z.infer<typeof CreateNetworkOrgRequestSchema>;

export const CreateNetworkCorporateRequestSchema = z.object({
  networkName: z.string().min(2, "Network name too short"),
  corporateName: z.string().min(2, "Corporate name too short"),
  venueName: z.string().optional(),
});

export type CreateNetworkCorporateRequest = z.infer<typeof CreateNetworkCorporateRequestSchema>;

export const ActivateNetworkRequestSchema = z.object({
  networkId: z.string().min(1, "Network ID required"),
});

export type ActivateNetworkRequest = z.infer<typeof ActivateNetworkRequestSchema>;

export const JoinWithTokenRequestSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export type JoinWithTokenRequest = z.infer<typeof JoinWithTokenRequestSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const EligibilityResponseSchema = z.object({
  ok: z.boolean(),
  allowed: z.boolean(),
  reason: z.string().nullable().optional(),
  effectiveRole: z.string().optional(),
});

export type EligibilityResponse = z.infer<typeof EligibilityResponseSchema>;

export const AdminFormResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string().optional(),
  message: z.string().optional(),
});

export type AdminFormResponse = z.infer<typeof AdminFormResponseSchema>;

export const CreateNetworkResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  orgId: z.string(),
  role: z.string(),
});

export type CreateNetworkResponse = z.infer<typeof CreateNetworkResponseSchema>;

export const ActivateNetworkResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  status: z.string(),
});

export type ActivateNetworkResponse = z.infer<typeof ActivateNetworkResponseSchema>;

export const JoinTokenResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  orgId: z.string(),
  role: z.string(),
});

export type JoinTokenResponse = z.infer<typeof JoinTokenResponseSchema>;

// ============================================================================
// ERROR SCHEMAS
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

```


## Refactor: apps/web/app/api/onboarding/activate-network/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/activate-network/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Activate Network Endpoint
//[P1][API][ONBOARDING] Activate Network Endpoint
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Activate Network Endpoint
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Activate Network Endpoint
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, network, activate

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb } from "@/src/lib/firebase.server";

export const POST = withSecurity(
  async (req: AuthenticatedRequest) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { networkId } = (body as Record<string, unknown>) || {};
    if (!networkId) return NextResponse.json({ error: "missing_network_id" }, { status: 422 });

    // Local/dev fallback
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    }

    const adb = adminDb;

    try {
      const networkRef = adb.collection("networks").doc(String(networkId));
      await networkRef.update({ status: "active", activatedAt: Date.now() });
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    } catch (err) {
      console.error("activate-network failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);

```


## Refactor: apps/web/app/api/onboarding/admin-form/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/admin-form/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function adminFormHandler(
  req: NextRequest & { user?: { uid: string } },
  injectedAdminDb = importedAdminDb,
) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parseResult = CreateAdminResponsibilityFormSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parseResult.error.format() },
      { status: 422 },
    );
  }

  const payload: CreateAdminResponsibilityFormInput = parseResult.data;

  // Use injected adminDb (tests) or imported adminDb for runtime
  const adminDb = injectedAdminDb;

  // If admin DB not initialized, return a stub token so the UI can progress in local/dev mode
  if (!adminDb) {
    const formToken = "stub-form-token";
    return NextResponse.json({ ok: true, formToken }, { status: 200 });
  }

  try {
    // url-safe random token
    const token = randomBytes(12).toString("base64url");

    const formsRoot = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms");
    const docRef = formsRoot.doc(token);

    const nowIso = new Date().toISOString();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 60 minutes TTL for onboarding form token

    await docRef.set({
      ...payload,
      createdAt: nowIso,
      status: "submitted",
      token,
      // v14 draft metadata used by create-network-* handlers
      expiresAt,
      immutable: false,
      attachedTo: null,
    });

    return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Keep Next.js route export for runtime; wrap the testable handler so Next.js
// doesn't pass the route `context` object as the second argument (which would
// be mistaken for an injected Firestore instance). The wrapper matches the
// expected Next.js signature: (req, ctx) => Response
export const POST = async (req: NextRequest, _ctx: { params?: unknown }) => {
  return await adminFormHandler(req as NextRequest & { user?: { uid: string } });
};

```


## Refactor: apps/web/app/api/onboarding/create-network-corporate/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/create-network-corporate/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, network, corporate, membership, events

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

export async function createNetworkCorporateHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb = importedAdminDb,
) {
  if (!injectedAdminDb) {
    // Stub for local/dev without Firestore
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        corpId: "stub-corp-id",
        status: "pending_verification",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb; // rely on injected type

  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  // For corporate creation, roles must be owner/founder/director or corporate_hq
  const allowedRoles = ["owner_founder_director", "corporate_hq"];
  const declared =
    (claims.selfDeclaredRole as string | undefined) || (claims.role as string | undefined);
  if (!declared || !allowedRoles.includes(declared)) {
    return NextResponse.json({ error: "role_not_allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { corporateName, brandName, industry, approxLocations, formToken } =
    (body as Record<string, unknown>) || {};

  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });
  if (String(formToken).includes("/")) {
    return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
  }

  const formsRoot = adminDb
    .collection("compliance")
    .doc("adminResponsibilityForms")
    .collection("forms");
  const formRef = formsRoot.doc(String(formToken));

  try {
    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    const formData = formSnap.data() as Record<string, unknown>;
    const nowMs = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < nowMs) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    const networkRef = adminDb.collection("networks").doc();
    const corporateCollectionRef = networkRef.collection("corporate");
    const corpRef = corporateCollectionRef.doc();

    await adminDb.runTransaction(async (tx: any) => {
      const createdAt = nowMs;

      // 1) Network
      tx.set(networkRef, {
        id: networkRef.id,
        name: corporateName || `Corporate Network ${new Date().toISOString()}`,
        displayName: corporateName || null,
        status: "pending_verification",
        kind: "corporate_network",
        industry: industry || null,
        approxLocations: approxLocations || null,
        ownerUserId: uid,
        createdAt,
        updatedAt: createdAt,
        createdBy: uid,
        adminFormToken: formToken,
      });

      // 2) Corporate node under this network
      tx.set(corpRef, {
        id: corpRef.id,
        networkId: networkRef.id,
        name: corporateName || "Corporate",
        brandName: brandName || null,
        industry: industry || null,
        approxLocations: approxLocations || null,
        contactUserId: uid,
        createdAt,
        updatedAt: createdAt,
        createdBy: uid,
      });

      // 3) Compliance doc under network
      const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");

      tx.set(complianceRef, {
        ...formData,
        networkId: networkRef.id,
        corporateId: corpRef.id,
        attachedFromToken: formToken,
        attachedBy: uid,
        attachedAt: createdAt,
      });

      // 4) Mark original form attached + immutable
      tx.update(formRef, {
        attachedTo: { networkId: networkRef.id, corpId: corpRef.id },
        immutable: true,
        status: "attached",
        attachedAt: createdAt,
      });

      // 5) Global membership for creator
      const membershipId = `${uid}_network_${networkRef.id}`;
      const membershipRef = adminDb.collection("memberships").doc(membershipId);
      tx.set(membershipRef, {
        userId: uid,
        networkId: networkRef.id,
        roles: ["network_owner", "corporate_admin"],
        createdAt,
        updatedAt: createdAt,
        createdBy: uid,
      });
    });

    // 6) Mark onboarding complete
    await markOnboardingComplete({
      adminDb,
      uid,
      intent: "create_corporate",
      networkId: networkRef.id,
      orgId: corpRef.id,
      venueId: undefined,
    });

    // 7) Emit platform events
    const now = Date.now();

    // network.created
    await logEvent(adminDb, {
      at: now,
      category: "network",
      type: "network.created",
      actorUserId: uid,
      networkId: networkRef.id,
      payload: {
        source: "onboarding.create-network-corporate",
        kind: "corporate_network",
      },
    });

    // membership.created (network_owner / corporate_admin)
    await logEvent(adminDb, {
      at: now,
      category: "membership",
      type: "membership.created",
      actorUserId: uid,
      networkId: networkRef.id,
      payload: {
        source: "onboarding.create-network-corporate",
        roles: ["network_owner", "corporate_admin"],
      },
    });

    // onboarding.completed (intent: create_corporate)
    await logEvent(adminDb, {
      at: now,
      category: "onboarding",
      type: "onboarding.completed",
      actorUserId: uid,
      networkId: networkRef.id,
      orgId: corpRef.id,
      payload: {
        intent: "create_corporate",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: networkRef.id,
        corpId: corpRef.id,
        status: "pending_verification",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("create-network-corporate failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const POST = withSecurity(
  async (req: AuthenticatedRequest, _ctx: unknown) => {
    return createNetworkCorporateHandler(req, importedAdminDb);
  },
  {
    requireAuth: true,
  },
);

```


## Refactor: apps/web/app/api/onboarding/create-network-org/route-new.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/create-network-org/route-new.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
// Tags: api, onboarding, network, org, venue

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function createNetworkOrgHandler(
  req: AuthenticatedRequest,
  injectedAdminDb = importedAdminDb,
) {
  // Use injected adminDb (tests) or imported adminDb for runtime
  if (!injectedAdminDb) {
    // In dev/local mode, return a stub response so the frontend can be exercised without Firestore
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        venueId: "stub-venue-id",
        status: "pending_verification",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb;

  // Authenticated request guaranteed by withSecurity (requireAuth below)
  const uid = req.user?.uid;
  const claims = (req.user as any)?.customClaims || {};

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  // Basic eligibility: email verified + allowed selfDeclaredRole
  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
  ];
  const declared =
    (claims.selfDeclaredRole as string | undefined) || (claims.role as string | undefined);
  if (!declared || !allowedRoles.includes(declared)) {
    return NextResponse.json({ error: "role_not_allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { orgName, venueName, formToken } = (body as Record<string, unknown>) || {};
  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });

  // Prevent path traversal attacks by ensuring formToken is a valid document ID segment.
  if (String(formToken).includes("/")) {
    return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
  }

  try {
    const formsRoot = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms");
    const formRef = formsRoot.doc(String(formToken));

    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    const formData = formSnap.data() as Record<string, unknown>;
    const now = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < now) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    // Prepare new docs
    const networkRef = adminDb.collection("networks").doc();
    const orgRef = adminDb.collection("orgs").doc();
    const venueRef = adminDb.collection("venues").doc();

    await adminDb.runTransaction(async (tx: any) => {
      tx.set(networkRef, {
        name: orgName || `Network ${new Date().toISOString()}`,
        status: "pending_verification",
        createdAt: Date.now(),
        adminFormToken: formToken,
      });

      tx.set(orgRef, {
        name: orgName || "Org",
        networkId: networkRef.id,
        createdAt: Date.now(),
      });

      tx.set(venueRef, {
        name: venueName || "Main Venue",
        orgId: orgRef.id,
        networkId: networkRef.id,
        createdAt: Date.now(),
      });

      // Copy admin responsibility form into a network-scoped compliance document
      const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
      tx.set(complianceRef, {
        ...formData,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        attachedFromToken: formToken,
        attachedBy: uid,
        attachedAt: now,
      });

      // Mark form as attached and immutable
      tx.update(formRef, {
        attachedTo: { networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id },
        immutable: true,
        status: "attached",
        attachedAt: Date.now(),
      });
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        status: "pending_verification",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("create-network-org failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Keep Next.js route export for runtime (secured)
export const POST = withSecurity(
  async (req: AuthenticatedRequest) => createNetworkOrgHandler(req, importedAdminDb),
  { requireAuth: true },
);

```


## Refactor: apps/web/app/api/onboarding/create-network-org/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/create-network-org/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, network, org, venue, membership, events

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { withRequestLogging } from "../../_shared/logging";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function createNetworkOrgHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb = importedAdminDb,
) {
  if (!injectedAdminDb) {
    // In dev/local mode, return a stub response so the frontend can be exercised without Firestore
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        venueId: "stub-venue-id",
        status: "pending_verification",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb;

  // Authenticated request guaranteed by withSecurity (requireAuth below)
  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  // Basic eligibility: email verified + allowed selfDeclaredRole
  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
  ];
  const declared =
    (claims.selfDeclaredRole as string | undefined) || (claims.role as string | undefined);
  if (!declared || !allowedRoles.includes(declared)) {
    return NextResponse.json({ error: "role_not_allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { orgName, venueName, formToken, location } = (body as Record<string, unknown>) || {};

  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });

  // Prevent path traversal attacks by ensuring formToken is a valid document ID segment.
  if (String(formToken).includes("/")) {
    return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
  }

  const locationData = (location || {}) as {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    timeZone?: string;
  };

  try {
    const formsRoot = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms");
    const formRef = formsRoot.doc(String(formToken));

    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    const formData = formSnap.data() as Record<string, unknown>;
    const nowMs = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < nowMs) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    // Prepare new docs
    const networkRef = adminDb.collection("networks").doc();
    const orgRef = adminDb.collection("orgs").doc();
    const venueRef = adminDb.collection("venues").doc();

    // Membership doc id in the existing global memberships collection
    const membershipId = `${uid}_${orgRef.id}`;
    const membershipRef = adminDb.collection("memberships").doc(membershipId);

    await adminDb.runTransaction(async (tx: any) => {
      const createdAt = nowMs;

      // 1) Network
      tx.set(networkRef, {
        id: networkRef.id,
        name: orgName || `Network ${new Date().toISOString()}`,
        status: "pending_verification",
        createdAt,
        updatedAt: createdAt,
        createdBy: uid,
        adminFormToken: formToken,
      });

      // 2) Org
      tx.set(orgRef, {
        id: orgRef.id,
        name: orgName || "Org",
        networkId: networkRef.id,
        ownerId: uid,
        memberCount: 1,
        status: "trial",
        createdAt,
        updatedAt: createdAt,
      });

      // 3) Venue (with optional location)
      tx.set(venueRef, {
        id: venueRef.id,
        name: venueName || "Main Venue",
        orgId: orgRef.id,
        networkId: networkRef.id,
        createdAt,
        updatedAt: createdAt,
        ...(Object.keys(locationData).length > 0
          ? {
              location: {
                street1: locationData.street1 || "",
                street2: locationData.street2 || "",
                city: locationData.city || "",
                state: locationData.state || "",
                postalCode: locationData.postalCode || "",
                countryCode: locationData.countryCode || "",
                timeZone: locationData.timeZone || "",
              },
            }
          : {}),
      });

      // 4) Copy admin responsibility form into a network-scoped compliance document
      const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");

      tx.set(complianceRef, {
        ...formData,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        attachedFromToken: formToken,
        attachedBy: uid,
        attachedAt: createdAt,
      });

      // 5) Mark original form as attached + immutable
      tx.update(formRef, {
        attachedTo: {
          networkId: networkRef.id,
          orgId: orgRef.id,
          venueId: venueRef.id,
        },
        immutable: true,
        status: "attached",
        attachedAt: createdAt,
      });

      // 6) Create global membership so legacy/org-based rules still work
      tx.set(membershipRef, {
        userId: uid,
        orgId: orgRef.id,
        networkId: networkRef.id,
        roles: ["org_owner", "admin", "manager"],
        createdAt,
        updatedAt: createdAt,
        createdBy: uid,
      });
    });

    // 7) Mark onboarding complete for this user
    await markOnboardingComplete({
      adminDb,
      uid,
      intent: "create_org",
      networkId: networkRef.id,
      orgId: orgRef.id,
      venueId: venueRef.id,
    });

    // 8) Emit platform events
    const now = Date.now();

    // network.created
    await logEvent(adminDb, {
      at: now,
      category: "network",
      type: "network.created",
      actorUserId: uid,
      networkId: networkRef.id,
      payload: {
        source: "onboarding.create-network-org",
      },
    });

    // org.created
    await logEvent(adminDb, {
      at: now,
      category: "org",
      type: "org.created",
      actorUserId: uid,
      networkId: networkRef.id,
      orgId: orgRef.id,
      payload: {
        source: "onboarding.create-network-org",
      },
    });

    // venue.created
    await logEvent(adminDb, {
      at: now,
      category: "venue",
      type: "venue.created",
      actorUserId: uid,
      networkId: networkRef.id,
      orgId: orgRef.id,
      venueId: venueRef.id,
      payload: {
        source: "onboarding.create-network-org",
      },
    });

    // onboarding.completed (for this intent)
    await logEvent(adminDb, {
      at: now,
      category: "onboarding",
      type: "onboarding.completed",
      actorUserId: uid,
      networkId: networkRef.id,
      orgId: orgRef.id,
      venueId: venueRef.id,
      payload: {
        intent: "create_org",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        status: "pending_verification",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("create-network-org failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Keep Next.js route export for runtime (secured + logged)
// Adapter wraps the test-friendly handler for use with withSecurity middleware
async function apiRoute(req: NextRequest, _ctx: Record<string, unknown>) {
  return createNetworkOrgHandler(req as AuthenticatedRequest);
}

export const POST = withRequestLogging(withSecurity(apiRoute, { requireAuth: true }));

```


## Refactor: apps/web/app/api/onboarding/join-with-token/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/join-with-token/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Join With Token Endpoint (server)
//[P1][API][ONBOARDING] Join With Token Endpoint (server)
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Join With Token Endpoint (server)
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Join With Token Endpoint (server)
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, join-token, membership, events

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

type JoinTokenDoc = {
  networkId: string;
  orgId: string;
  role: string;
  venueId?: string;
  expiresAt?: number;
  disabled?: boolean;
  usedBy?: string[];
  maxUses?: number;
};

export async function joinWithTokenHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb = importedAdminDb,
) {
  if (!injectedAdminDb) {
    // Stub for local/dev
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        role: "staff",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb;
  const uid = req.user?.uid;

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = (body as Record<string, unknown>)?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 422 });
  }
  if (token.includes("/")) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  try {
    const tokenRef = adminDb.collection("join_tokens").doc(token);
    const snap = await tokenRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "token_not_found" }, { status: 404 });
    }

    const data = snap.data() as JoinTokenDoc;
    const now = Date.now();

    if (data.disabled) {
      return NextResponse.json({ error: "token_disabled" }, { status: 403 });
    }

    if (typeof data.expiresAt === "number" && data.expiresAt < now) {
      return NextResponse.json({ error: "token_expired" }, { status: 410 });
    }

    const usedBy = Array.isArray(data.usedBy) ? data.usedBy : [];
    if (typeof data.maxUses === "number" && usedBy.length >= data.maxUses) {
      return NextResponse.json({ error: "token_exhausted" }, { status: 409 });
    }

    if (!data.networkId || !data.orgId || !data.role) {
      return NextResponse.json({ error: "token_misconfigured" }, { status: 500 });
    }

    const membershipId = `${uid}_${data.orgId}`;
    const membershipRef = adminDb.collection("memberships").doc(membershipId);

    await adminDb.runTransaction(async (tx: any) => {
      const existing = await tx.get(membershipRef);
      const createdAt = now;

      if (!existing.exists) {
        tx.set(membershipRef, {
          userId: uid,
          orgId: data.orgId,
          networkId: data.networkId,
          roles: [data.role],
          createdAt,
          updatedAt: createdAt,
          createdBy: uid,
        });
      } else {
        const cur = existing.data() as {
          roles?: string[];
          updatedAt?: number;
        };
        const roles = Array.isArray(cur.roles) ? cur.roles : [];
        if (!roles.includes(data.role)) roles.push(data.role);
        tx.update(membershipRef, {
          roles,
          updatedAt: createdAt,
          updatedBy: uid,
        });
      }

      const newUsedBy = usedBy.includes(uid) ? usedBy : [...usedBy, uid];
      tx.update(tokenRef, {
        usedBy: newUsedBy,
        lastUsedAt: createdAt,
      });
    });

    // Mark onboarding complete for join path
    await markOnboardingComplete({
      adminDb,
      uid,
      intent: "join_existing",
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
    });

    // Emit platform events
    const eventTime = Date.now();

    // membership.* event
    await logEvent(adminDb, {
      at: eventTime,
      category: "membership",
      type: "membership.created",
      actorUserId: uid,
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
      payload: {
        source: "onboarding.join-with-token",
        role: data.role,
        via: "join_token",
      },
    });

    // onboarding.completed (intent: join_existing)
    await logEvent(adminDb, {
      at: eventTime,
      category: "onboarding",
      type: "onboarding.completed",
      actorUserId: uid,
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
      payload: {
        intent: "join_existing",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: data.networkId,
        orgId: data.orgId,
        role: data.role,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("join-with-token failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const POST = withSecurity(
  async (req: AuthenticatedRequest, _ctx: unknown) => {
    return joinWithTokenHandler(req, importedAdminDb);
  },
  { requireAuth: true },
);

```


## Refactor: apps/web/app/api/onboarding/profile/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/profile/route.ts`

**File Content:**
```typescript
// [P0][API][CODE] Route API route handler
// [P0][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P0][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P0][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, API, CODE
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

const ProfileSchema = z.object({
  fullName: z.string().min(1),
  preferredName: z.string().min(1),
  phone: z.string().min(4),
  timeZone: z.string().min(1),
  selfDeclaredRole: z.string().min(1),
});

export async function profileHandler(
  req: AuthenticatedRequest & { user?: { uid: string } },
  injectedAdminDb = importedAdminDb,
) {
  const uid = req.user?.uid;
  if (!uid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const profile = parsed.data;
  const adminDb = injectedAdminDb;
  if (!adminDb) {
    // Dev stub: pretend success
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const now = Date.now();
  const userRef = adminDb.collection("users").doc(uid);

  await userRef.set(
    {
      profile: {
        ...profile,
        updatedAt: now,
      },
      onboarding: {
        status: "in_progress",
        stage: "profile_complete",
        lastUpdatedAt: now,
      },
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const POST = withSecurity(async (req: AuthenticatedRequest) => profileHandler(req), {
  requireAuth: true,
});

```


## Refactor: apps/web/app/api/onboarding/verify-eligibility/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/onboarding/verify-eligibility/route.ts`

**File Content:**
```typescript
//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: api, onboarding, eligibility

import { NextResponse } from "next/server";

import { withRequestLogging } from "../../_shared/logging";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

/**
 * ErrorResponse is a canonical shape for API error responses.
 * In the future, this should be imported from @fresh-schedules/types.
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Track rate limits in-memory (per uid, last 24h)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // requests per 24h
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(uid: string): number {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);

  if (!entry || entry.resetTime <= now) {
    // Reset window
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return RATE_LIMIT_MAX - 1;
  }

  entry.count++;
  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}

export async function verifyEligibilityHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  adminDb?: unknown,
) {
  const uid = req.user?.uid;
  const _claims = req.user?.customClaims || {};

  // Check authentication first
  if (!uid) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Not authenticated",
        code: "GEN_NOT_AUTHENTICATED",
      },
      { status: 401 },
    );
  }

  // Parse request body to validate required fields
  let body: any = {};
  if (req.json) {
    try {
      body = await req.json();
    } catch {
      // If no body or invalid JSON, treat as missing fields
      body = {};
    }
  }

  // Validate required fields
  if (!body.email || !body.role) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Missing email or role",
        code: "ONB_ELIGIBILITY_INVALID_REQUEST",
      },
      { status: 400 },
    );
  }

  // Validate role is allowed
  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
    "admin",
  ];

  if (!allowedRoles.includes(body.role)) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Role not allowed for onboarding",
        code: "ONB_ELIGIBILITY_ROLE_DENIED",
      },
      { status: 403 },
    );
  }

  // Check rate limit
  const rateLimitRemaining = checkRateLimit(uid);

  // Stub mode (no adminDb) or use adminDb if available
  const isStub = !adminDb;

  return NextResponse.json(
    {
      ok: true,
      eligible: true,
      email: body.email,
      role: body.role,
      isStub,
      rate_limit_remaining: rateLimitRemaining,
    },
    { status: 200 },
  );
}

// Adapter wraps the test-friendly handler for use with withSecurity middleware
async function apiRoute(
  req: AuthenticatedRequest,
  _ctx: { params: Record<string, string> | Promise<Record<string, string>> },
) {
  return verifyEligibilityHandler(req);
}

export const POST = withRequestLogging(
  withSecurity(apiRoute as any, {
    requireAuth: true,
  }),
);

```


## Refactor: apps/web/app/api/organizations/[id]/members/[memberId]/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/organizations/[id]/members/[memberId]/route.ts`

**File Content:**
```typescript
//[P1][API][CODE] Organization Member [memberId] API route handler
//[P1][API][CODE] Organization Member [memberId] API route handler
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][CODE] Organization Member [memberId] API route handler
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][CODE] Organization Member [memberId] API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE, validation, zod, rbac

import { UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../../../src/lib/api/sanitize";
import { serverError } from "../../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details (org membership required)
 */
export const GET = requireOrgMembership(async (request: NextRequest, context) => {
  // Apply rate limiting using the inline check pattern used elsewhere
  const rateLimitResult = await rateLimit(request, RateLimits.api);
  if (rateLimitResult) return rateLimitResult;

  const { params } = context;
  try {
    const { id: orgId, memberId } = await params;
    // In production, fetch from Firestore and check permissions
    const member = {
      id: memberId,
      orgId,
      uid: "user-123",
      roles: ["admin"],
      joinedAt: new Date().toISOString(),
      mfaVerified: true,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(member);
  } catch {
    return serverError("Failed to fetch member");
  }
});

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member roles or settings (admin+ only)
 */
export const PATCH = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request: NextRequest, context) => {
      // Inline rate-limiting check
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { userId } = context;
      try {
        const params = await context.params;
        const { id: orgId, memberId } = params;

        const body = await request.json();
        const validated = UpdateMembershipSchema.parse(body);
        const sanitized = sanitizeObject(validated);

        // In production: permission checks, update Firestore
        const updatedMember = {
          id: memberId,
          orgId,
          uid: "user-123",
          ...sanitized,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        };
        return NextResponse.json(updatedMember);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
        }
        return serverError("Failed to update member");
      }
    }),
  ),
);

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (admin+ only)
 */
export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request: NextRequest, context) => {
      // Inline rate-limiting check
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      try {
        const params = await context.params;
        const { id: orgId, memberId } = params;
        // In production: permission checks, delete from Firestore
        return NextResponse.json({
          message: "Member removed successfully",
          orgId,
          memberId,
        });
      } catch {
        return serverError("Failed to remove member");
      }
    }),
  ),
);

```


## Refactor: apps/web/app/api/organizations/[id]/members/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/organizations/[id]/members/route.ts`

**File Content:**
```typescript
// [P1][API][MEMBERSHIPS] Organization members API routes
// [P1][API][MEMBERSHIPS] Organization members API routes
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][MEMBERSHIPS] Organization members API routes
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][MEMBERSHIPS] Organization members API routes
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, MEMBERSHIPS, RBAC
import { CreateMembershipSchema, UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../src/lib/api/authorization";
import { withSecurity } from "../../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * Helper to get roles from custom claims
 */
// Helper left for potential future enhancements
function getUserRolesFallback(): string[] {
  return ["staff"];
}

/**
 * GET /api/organizations/[id]/members
 * List all members of an organization
 */
export const GET = withSecurity(
  requireOrgMembership(async (request, context) => {
    try {
      const orgId = context.orgId;
      const members = [
        {
          id: `${context.userId}_${orgId}`,
          uid: context.userId,
          orgId,
          roles: getUserRolesFallback(),
          status: "active",
          joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        },
      ];
      return ok({ members, total: members.length });
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return serverError("Failed to fetch members");
    }
  }),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/organizations/[id]/members
 * Add a new member to an organization (managers only)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const parsed = await parseJson(request, CreateMembershipSchema);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid membership data",
                details: parsed.details,
              },
            },
            { status: 422 },
          );
        }
        const data = parsed.data;
        if (data.orgId !== orgId) {
          return badRequest("Organization ID mismatch");
        }
        const now = Date.now();
        const newMember = {
          id: `${data.uid}_${orgId}`,
          uid: data.uid,
          orgId,
          roles: data.roles,
          status: data.status || "invited",
          invitedBy: context.userId,
          invitedAt: now,
          joinedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        return NextResponse.json(newMember, { status: 201 });
      } catch (error) {
        console.error("Failed to add member:", error);
        return serverError("Failed to add member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update a member's roles or status (managers only)
 *
 * Note: This should be implemented as a separate route at:
 * /api/organizations/[id]/members/[memberId]/route.ts
 *
 * For now, we can handle basic updates here via query param
 */
export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get("memberId");
        if (!memberId) {
          return badRequest("Member ID required");
        }
        const parsed = await parseJson(request, UpdateMembershipSchema);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid membership update data",
                details: parsed.details,
              },
            },
            { status: 422 },
          );
        }
        const data = parsed.data; // validated via schema
        const updatedMember = {
          id: memberId,
          orgId,
          ...data,
          updatedAt: Date.now(),
        };
        return ok(updatedMember);
      } catch (error) {
        console.error("Failed to update member:", error);
        return serverError("Failed to update member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (managers only)
 */
export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get("memberId");
        if (!memberId) {
          return badRequest("Member ID required");
        }
        // Prevent self-removal
        if (memberId === `${context.userId}_${orgId}`) {
          return badRequest("Cannot remove yourself from the organization");
        }
        // In production, soft delete or update status in Firestore
        return ok({ message: "Member removed successfully", memberId });
      } catch (error) {
        console.error("Failed to remove member:", error);
        return serverError("Failed to remove member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/organizations/[id]/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/organizations/[id]/route.ts`

**File Content:**
```typescript
// [P0][API][CODE] Route API route handler
// [P0][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P0][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P0][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, API, CODE
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { parseJson, badRequest, serverError } from "../../_shared/validation";

// Schema for updating organization
const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  settings: z
    .object({
      allowPublicSchedules: z.boolean().optional(),
      requireShiftApproval: z.boolean().optional(),
      defaultShiftDuration: z.number().positive().optional(),
    })
    .optional(),
});

// Rate limiting via withSecurity

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export const GET = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const id = context.params.id;
      // In production, fetch from database and check permissions
      const organization = {
        id,
        name: "Acme Corp",
        description: "A great company",
        industry: "Technology",
        size: "51-200",
        createdAt: new Date().toISOString(),
        settings: {
          allowPublicSchedules: false,
          requireShiftApproval: true,
          defaultShiftDuration: 8,
        },
        memberCount: 25,
      };
      return NextResponse.json(organization);
    } catch (_error) {
      return serverError("Failed to fetch organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
export const PATCH = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const id = context.params.id;
      const parsed = await parseJson(request, UpdateOrgSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      // In production, update in database after checking permissions
      const updatedOrg = {
        id,
        name: "Acme Corp",
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(updatedOrg);
    } catch (_error) {
      return serverError("Failed to update organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * DELETE /api/organizations/[id]
 * Delete an organization (admin only)
 */
export const DELETE = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const id = context.params.id;
      // In production, check if user is admin and delete from database
      return NextResponse.json({ message: "Organization deleted successfully", id });
    } catch {
      return serverError("Failed to delete organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/organizations/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/organizations/route.ts`

**File Content:**
```typescript
// [P0][API][CODE] Route API route handler
// [P0][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P0][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P0][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, API, CODE
import { CreateOrganizationSchema } from "@fresh-schedules/types";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withSecurity } from "../_shared/middleware";
import { parseJson, serverError } from "../_shared/validation";

// Rate limiting via withSecurity

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export const GET = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId?: string }) => {
    try {
      // In production, fetch from database based on authenticated user
      const organizations = [
        {
          id: "org-1",
          name: "Acme Corp",
          description: "A great company",
          role: "admin",
          createdAt: new Date().toISOString(),
          memberCount: 25,
          ownerId: context.userId,
        },
        {
          id: "org-2",
          name: "Tech Startup",
          description: "Innovative solutions",
          role: "manager",
          createdAt: new Date().toISOString(),
          memberCount: 10,
          ownerId: context.userId,
        },
      ];
      return NextResponse.json({ organizations, userId: context.userId });
    } catch {
      return serverError("Failed to fetch organizations");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId?: string }) => {
    try {
      const parsed = await parseJson(request, CreateOrganizationSchema);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid organization data",
              details: parsed.details,
            },
          },
          { status: 422 },
        );
      }
      // In production, create organization in database
      const data = parsed.data;
      const newOrg = {
        id: `org-${Date.now()}`,
        ...data,
        role: "admin", // Creator is admin
        ownerId: context.userId,
        createdAt: new Date().toISOString(),
        memberCount: 1,
      };
      return NextResponse.json(newOrg, { status: 201 });
    } catch {
      return serverError("Failed to create organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/positions/[id]/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/positions/[id]/route.ts`

**File Content:**
```typescript
//[P1][API][CODE] Positions [id] API route handler
//[P1][API][CODE] Positions [id] API route handler
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][CODE] Positions [id] API route handler
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][CODE] Positions [id] API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE, validation, zod

import { PositionSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/positions/[id]
 * Get position details (requires staff+ role)
 */
export const GET = requireOrgMembership(async (request, context) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimits.api);
  if (rateLimitResult) return rateLimitResult;

  const { params } = context;
  try {
    const { id } = params;

    // In production, fetch from Firestore and verify orgId matches
    const position = {
      id,
      orgId: context.orgId,
      title: "Server",
      description: "Front of house server position",
      hourlyRate: 15.0,
      color: "#2196F3",
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: "user-123",
    };

    return NextResponse.json(position);
  } catch {
    return serverError("Failed to fetch position");
  }
});

/**
 * PATCH /api/positions/[id]
 * Update position details (requires manager+ role)
 */
export const PATCH = csrfProtection()(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params } = context;
      try {
        const { id } = params;
        const body = await request.json();
        const sanitized = sanitizeObject(body);

        // Validate with Zod
        const validationResult = PositionSchema.safeParse(sanitized);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: "Invalid position data", details: validationResult.error.errors },
            { status: 400 },
          );
        }

        const data = validationResult.data;

        // In production, update in Firestore after verifying orgId matches
        const updatedPosition = {
          id,
          orgId: context.orgId,
          title: "Server",
          ...data,
          updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(updatedPosition);
      } catch {
        return serverError("Failed to update position");
      }
    }),
  ),
);

/**
 * DELETE /api/positions/[id]
 * Delete a position (requires admin+ role, soft delete - set isActive to false)
 */
export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request, context) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params } = context;
      try {
        const { id } = params;

        // In production, soft delete by setting isActive = false after verifying orgId
        return NextResponse.json({
          message: "Position deleted successfully",
          id,
        });
      } catch {
        return serverError("Failed to delete position");
      }
    }),
  ),
);

```


## Refactor: apps/web/app/api/positions/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/positions/route.ts`

**File Content:**
```typescript
// [P1][API][POSITIONS] Positions API route handler
// [P1][API][POSITIONS] Positions API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][POSITIONS] Positions API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][POSITIONS] Positions API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, POSITIONS, validation, zod

import { CreatePositionSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/positions
 * List positions for an organization
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const positions = [
          {
            id: "pos-1",
            orgId,
            name: "Event Manager",
            description: "Manages event operations",
            type: "full_time",
            skillLevel: "advanced",
            hourlyRate: 35,
            color: "#3B82F6",
            isActive: true,
            requiredCertifications: [],
            createdBy: context.userId,
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ positions, total: positions.length });
      } catch {
        return serverError("Failed to fetch positions");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/positions
 * Create a new position (requires manager+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreatePositionSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newPosition = {
            id: `pos-${Date.now()}`,
            ...data,
            isActive: true,
            requiredCertifications: data.requiredCertifications || [],
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newPosition, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid position data");
          }
          return serverError("Failed to create position");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/publish/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/publish/route.ts`

**File Content:**
```typescript
// [P0][API][SCHEDULE] Schedule publish endpoint
// [P0][API][SCHEDULE] Schedule publish endpoint
import { traceFn } from "@/app/api/_shared/otel";
// [P0][API][SCHEDULE] Schedule publish endpoint
import { withGuards } from "@/app/api/_shared/security";
// [P0][API][SCHEDULE] Schedule publish endpoint
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, API, SCHEDULE
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireOrgMembership, requireRole } from "../../../src/lib/api/authorization";
import { adminDb, adminSdk } from "../../../src/lib/firebase.server";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

const PublishSchema = z.object({
  scheduleId: z.string().min(1, "scheduleId is required"),
  orgId: z.string().min(1, "orgId is required"),
  publish: z.boolean().optional().default(true),
});

/**
 * POST /api/publish
 * Publish a schedule (requires manager+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        req: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(req, PublishSchema);
          if (!parsed.success) {
            return badRequest("Invalid payload", parsed.details);
          }

          const { scheduleId, orgId } = parsed.data;

          // Verify orgId matches the context
          if (orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          if (!adminDb || !adminSdk) {
            return serverError("Admin DB not initialized");
          }

          const FieldValue = adminSdk.firestore.FieldValue;
          const scheduleRef = adminDb.doc(`organizations/${orgId}/schedules/${scheduleId}`);
          await scheduleRef.set(
            { state: "published", publishedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );

          // Create notification message
          const msgRef = adminDb.collection(`organizations/${orgId}/messages`).doc();
          await msgRef.set({
            type: "publish_notice",
            title: "Schedule Published",
            body: "The latest schedule has been published. Check your shifts.",
            targets: "members",
            recipients: [],
            scheduleId,
            createdAt: FieldValue.serverTimestamp(),
          });

          return ok({ success: true, scheduleId, orgId });
        } catch (err: unknown) {
          const maybeMessage =
            err && typeof err === "object" && "message" in err
              ? (err as Record<string, unknown>)["message"]
              : undefined;
          const msg = typeof maybeMessage === "string" ? maybeMessage : String(err);
          return serverError(msg || "Unexpected error");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/schedules/[id]/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/schedules/[id]/route.ts`

**File Content:**
```typescript
//[P1][API][CODE] Schedules [id] API route handler
//[P1][API][CODE] Schedules [id] API route handler
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][CODE] Schedules [id] API route handler
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][CODE] Schedules [id] API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { withSecurity } from "../../_shared/middleware";
import { serverError, UpdateScheduleSchema } from "../../_shared/validation";

/**
 * GET /api/schedules/[id]
 * Get schedule details
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { id } = context.params;

        // In production, fetch from Firestore and check permissions
        const schedule = {
          id,
          orgId: context.orgId,
          name: "Week of Jan 15",
          description: "Weekly schedule",
          startDate: "2025-01-15T00:00:00Z",
          endDate: "2025-01-21T23:59:59Z",
          status: "published",
          createdAt: new Date().toISOString(),
          createdBy: "user-123",
        };

        return NextResponse.json(schedule);
      } catch {
        return serverError("Failed to fetch schedule");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/schedules/[id]
 * Update schedule details
 */
export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { id } = context.params;

          const body = await request.json();
          const validated = UpdateScheduleSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          // In production, update in Firestore after checking permissions
          const updatedSchedule = {
            id,
            orgId: context.orgId,
            name: "Week of Jan 15",
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };

          return NextResponse.json(updatedSchedule);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
          }
          return serverError("Failed to update schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule (only drafts can be deleted)
 */
export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { id } = context.params;

          // In production, check if schedule is draft before deleting
          return NextResponse.json({
            message: "Schedule deleted successfully",
            id,
          });
        } catch {
          return serverError("Failed to delete schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/schedules/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/schedules/route.ts`

**File Content:**
```typescript
// [P1][API][SCHEDULES] Schedules API route handler
// [P1][API][SCHEDULES] Schedules API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][SCHEDULES] Schedules API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][SCHEDULES] Schedules API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, SCHEDULES, validation, zod

import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/schedules
 * List schedules for an organization
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;
        const status = searchParams.get("status");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const schedules = [
          {
            id: "sched-1",
            orgId,
            name: "January 2025 Schedule",
            description: "Monthly event schedule",
            startDate: new Date("2025-01-01").getTime(),
            endDate: new Date("2025-01-31").getTime(),
            status: "published",
            visibility: "team",
            stats: {
              totalShifts: 42,
              assignedShifts: 38,
              unassignedShifts: 4,
              totalHours: 336,
              totalCost: 11760,
              conflictCount: 0,
            },
            aiGenerated: false,
            createdBy: context.userId,
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        const filtered = status ? schedules.filter((s) => s.status === status) : schedules;

        return ok({ schedules: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch schedules");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateScheduleSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newSchedule = {
            id: `sched-${Date.now()}`,
            ...data,
            status: "draft" as const,
            visibility: data.visibility || "team",
            stats: {
              totalShifts: 0,
              assignedShifts: 0,
              unassignedShifts: 0,
              totalHours: 0,
              totalCost: 0,
              conflictCount: 0,
            },
            aiGenerated: false,
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newSchedule, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid schedule data");
          }
          return serverError("Failed to create schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/session/bootstrap/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/session/bootstrap/route.ts`

**File Content:**
```typescript
// [P0][AUTH][SESSION] Route API route handler
// [P0][AUTH][SESSION] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P0][AUTH][SESSION] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P0][AUTH][SESSION] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, AUTH, SESSION
/**
 * [P1][API][SESSION] Session Bootstrap Endpoint (server)
 * Tags: api, session, user, profile, onboarding
 *
 * Overview:
 * - Called by the client after auth to bootstrap the session
 * - Ensures users/{uid} exists with a baseline profile and onboarding block
 * - Returns profile + onboarding + basic flags for the client
 */

import { Firestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { ensureUserProfile } from "@/src/lib/userProfile";

export async function bootstrapSessionHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb?: Firestore,
) {
  const uid = req.user?.uid;
  const claims = (req.user?.customClaims || {}) as Record<string, unknown>;

  if (!uid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const adminDb = injectedAdminDb;

  try {
    // 1) Ensure user profile exists and has at least baseline data
    await ensureUserProfile({
      adminDb,
      uid,
      claims,
    });

    if (!adminDb) {
      // Stub mode: return a simple session stub
      return NextResponse.json(
        {
          ok: true,
          uid,
          emailVerified: Boolean(claims.email_verified || claims.emailVerified),
          user: {
            id: uid,
            profile: {
              email: (claims.email as string | undefined) || null,
              displayName:
                (claims.displayName as string | undefined) ||
                (claims.name as string | undefined) ||
                null,
            },
            onboarding: {
              status: "not_started",
              stage: "profile",
            },
          },
          isStub: true,
        },
        { status: 200 },
      );
    }

    // 2) Re-read full user doc from Firestore as source of truth
    const usersRef = adminDb.collection("users").doc(uid);
    const snap = await usersRef.get();

    if (!snap.exists) {
      // This should not happen after ensureUserProfile, but handle defensively
      return NextResponse.json(
        {
          error: "user_doc_missing",
        },
        { status: 500 },
      );
    }

    const data = snap.data() as {
      profile?: unknown;
      onboarding?: unknown;
      [key: string]: unknown;
    };

    return NextResponse.json(
      {
        ok: true,
        uid,
        emailVerified: Boolean(claims.email_verified || claims.emailVerified),
        user: {
          id: uid,
          profile: data.profile || null,
          onboarding: data.onboarding || null,
        },
        // You can expose feature flags or role hints here later if needed
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("session/bootstrap failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const GET = withSecurity(
  async (req: AuthenticatedRequest) => bootstrapSessionHandler(req, importedAdminDb),
  { requireAuth: true },
);

export const POST = withSecurity(
  async (req: AuthenticatedRequest) => bootstrapSessionHandler(req, importedAdminDb),
  { requireAuth: true },
);

```


## Refactor: apps/web/app/api/session/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/session/route.ts`

**File Content:**
```typescript
// [P0][AUTH][SESSION] Session cookie management endpoints
// [P0][AUTH][SESSION] Session cookie management endpoints
import { traceFn } from "@/app/api/_shared/otel";
// [P0][AUTH][SESSION] Session cookie management endpoints
import { withGuards } from "@/app/api/_shared/security";
// [P0][AUTH][SESSION] Session cookie management endpoints
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P0, AUTH, SESSION
import { NextRequest } from "next/server";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Schema for session creation
const CreateSessionSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

/**
 * POST /api/session
 * Create a session cookie from a Firebase ID token
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJson(req, CreateSessionSchema);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }

    const { idToken } = parsed.data;

    const auth = getFirebaseAdminAuth();
    // Verify the idToken and create a session cookie (5 days default)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Set secure HttpOnly session cookie
    const response = ok({ ok: true });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000, // maxAge in seconds
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    // Return a generic message to avoid leaking internal error details
    return serverError("Invalid token or internal error", undefined, "UNAUTHORIZED");
  }
}

/**
 * DELETE /api/session
 * Clear the session cookie (logout)
 */
export async function DELETE() {
  // Clear session cookie
  const response = ok({ ok: true });
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

```


## Refactor: apps/web/app/api/shifts/[id]/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/shifts/[id]/route.ts`

**File Content:**
```typescript
//[P1][API][CODE] Shifts [id] API route handler
//[P1][API][CODE] Shifts [id] API route handler
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][CODE] Shifts [id] API route handler
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][CODE] Shifts [id] API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { withSecurity } from "../../_shared/middleware";
import { badRequest, serverError, UpdateShiftSchema } from "../../_shared/validation";

// Rate limiting via withSecurity options

export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { params } = context;
        const { id } = params;
        const shift = {
          id,
          scheduleId: "sched-1",
          positionId: "pos-1",
          userId: "user-123",
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "published",
          breakMinutes: 30,
          createdAt: new Date().toISOString(),
        };
        return NextResponse.json(shift);
      } catch {
        return serverError("Failed to fetch shift");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { params } = context;
          const { id } = params;
          const body = await request.json();
          const validated = UpdateShiftSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const updated = {
            id,
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };
          return NextResponse.json(updated);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid shift update");
          }
          return serverError("Failed to update shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { params } = context;
          const { id } = params;
          return NextResponse.json({ message: "Shift deleted successfully", id });
        } catch {
          return serverError("Failed to delete shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/shifts/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/shifts/route.ts`

**File Content:**
```typescript
//[P1][API][CODE] Shifts API route handler
//[P1][API][CODE] Shifts API route handler
import { traceFn } from "@/app/api/_shared/otel";
//[P1][API][CODE] Shifts API route handler
import { withGuards } from "@/app/api/_shared/security";
//[P1][API][CODE] Shifts API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { withSecurity } from "../_shared/middleware";
import { badRequest, serverError, CreateShiftSchema } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/shifts
 * List shifts (filter by scheduleId if provided)
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");
        const orgId = searchParams.get("orgId") || context.orgId;
        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }
        const shifts = [
          {
            id: "shift-1",
            scheduleId: scheduleId ?? "sched-1",
            positionId: "pos-1",
            userId: "user-123",
            startTime: "2025-01-15T09:00:00Z",
            endTime: "2025-01-15T17:00:00Z",
            status: "published",
            breakMinutes: 30,
            createdAt: new Date().toISOString(),
          },
        ];
        return NextResponse.json({ shifts, orgId });
      } catch {
        return serverError("Failed to fetch shifts");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/shifts
 * Create a new shift (requires scheduler+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { searchParams } = new URL(request.url);
          const scheduleIdFromQuery = searchParams.get("scheduleId");
          const body = await request.json();
          const validated = CreateShiftSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const scheduleId = scheduleIdFromQuery || validated.scheduleId;
          if (!scheduleId) {
            return badRequest("scheduleId is required in query or body");
          }
          const newShift = {
            id: `shift-${Date.now()}`,
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            createdBy: context.userId,
            ...sanitized,
          };
          return NextResponse.json(newShift, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid shift data");
          }
          return serverError("Failed to create shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/users/profile/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/users/profile/route.ts`

**File Content:**
```typescript
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
import { NextRequest } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../_shared/validation";

// Rate limiting via withSecurity options

// Schema for updating user profile
const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).optional(),
      notifications: z.boolean().optional(),
      language: z.string().length(2).optional(),
    })
    .optional(),
});

/**
 * GET /api/users/profile
 * Get the current user's profile
 */
export const GET = withSecurity(
  async (request, context: { params: Record<string, string>; userId: string }) => {
    try {
      // For now, return a mock profile based on authenticated user
      const userProfile = {
        id: context.userId,
        email: `${context.userId}@example.com`,
        displayName: "John Doe",
        bio: "Software developer",
        phoneNumber: "+1234567890",
        photoURL: null,
        createdAt: new Date().toISOString(),
        preferences: {
          theme: "light",
          notifications: true,
          language: "en",
        },
      };
      return ok(userProfile);
    } catch {
      return serverError("Failed to fetch user profile");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/users/profile
 * Update the current user's profile
 */
export const PATCH = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const parsed = await parseJson(request, UpdateProfileSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      // In production, update user in database
      // For now, return updated mock data
      const updatedProfile = {
        id: context.userId,
        email: `${context.userId}@example.com`,
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      return ok(updatedProfile);
    } catch {
      return serverError("Failed to update profile");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/venues/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/venues/route.ts`

**File Content:**
```typescript
// [P1][API][VENUES] Venues API route handler
// [P1][API][VENUES] Venues API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][VENUES] Venues API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][VENUES] Venues API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, VENUES, validation, zod

import { CreateVenueSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/venues
 * List venues for an organization
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const venues = [
          {
            id: "venue-1",
            orgId,
            name: "Main Convention Center",
            description: "Primary event venue",
            type: "indoor",
            address: {
              street: "123 Event Plaza",
              city: "San Francisco",
              state: "CA",
              zipCode: "94102",
              country: "US",
            },
            coordinates: {
              lat: 37.7749,
              lng: -122.4194,
            },
            capacity: 500,
            isActive: true,
            timezone: "America/Los_Angeles",
            contactPhone: "+1-555-0100",
            contactEmail: "venue@example.com",
            createdBy: context.userId,
            createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ venues, total: venues.length });
      } catch {
        return serverError("Failed to fetch venues");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/venues
 * Create a new venue (requires manager+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateVenueSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newVenue = {
            id: `venue-${Date.now()}`,
            ...data,
            isActive: true,
            timezone: data.timezone || "America/New_York",
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newVenue, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid venue data");
          }
          return serverError("Failed to create venue");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/api/widgets/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/widgets/route.ts`

**File Content:**
```typescript
// [P1][API][CODE] Route API route handler
// [P1][API][CODE] Route API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][CODE] Route API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][CODE] Route API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, CODE
// Template: CODE_NEXT_API_ROUTE
//
// Example API route implementation:
//
// export async function POST(req: NextRequest) {
//   return withRateLimit(async () => {
//     const session = await requireSession(req);
//     if (!session?.uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//
//     const json = await req.json().catch(() => ({}));
//     const parsed = Body.safeParse(json);
//     if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
//
//     return NextResponse.json({ ok: true }, { status: 200 });
//   });
// }

import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 200 });
}

```


## Refactor: apps/web/app/api/zones/route.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/api/zones/route.ts`

**File Content:**
```typescript
// [P1][API][ZONES] Zones API route handler
// [P1][API][ZONES] Zones API route handler
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][ZONES] Zones API route handler
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][ZONES] Zones API route handler
import { jsonOk, jsonError } from "@/app/api/_shared/response";
// Tags: P1, API, ZONES, validation, zod

import { CreateZoneSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/zones
 * List zones for an organization or venue
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;
        const venueId = searchParams.get("venueId");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const zones = [
          {
            id: "zone-1",
            orgId,
            venueId: venueId || "venue-1",
            name: "Main Stage",
            description: "Primary performance area",
            type: "production",
            capacity: 200,
            floor: "1",
            isActive: true,
            color: "#10B981",
            createdBy: context.userId,
            createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        const filtered = venueId ? zones.filter((z) => z.venueId === venueId) : zones;

        return ok({ zones: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch zones");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/zones
 * Create a new zone (requires manager+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateZoneSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newZone = {
            id: `zone-${Date.now()}`,
            ...data,
            isActive: true,
            type: data.type || "other",
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newZone, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid zone data");
          }
          return serverError("Failed to create zone");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

```


## Refactor: apps/web/app/auth/callback/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/auth/callback/page.tsx`

**File Content:**
```typescript
// [P0][AUTH][CODE] Page page component
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

```


## Refactor: apps/web/app/components/ErrorBoundary.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ErrorBoundary.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] ErrorBoundary
// Tags: P2, UI, CODE
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error;
  reset: () => void;
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, reset }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-center text-gray-900 transition-colors hover:bg-gray-300"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

```


## Refactor: apps/web/app/components/FirebaseSignIn.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/FirebaseSignIn.tsx`

**File Content:**
```typescript
// [P0][FIREBASE][FIREBASE] FirebaseSignIn
// Tags: P0, FIREBASE, FIREBASE
"use client";
import { getAuth } from "firebase/auth";
import * as firebaseui from "firebaseui";
import React, { useEffect, useRef } from "react";
import "firebaseui/dist/firebaseui.css";

// This component mounts FirebaseUI's sign-in widget into a container.
// It assumes you have initialized firebase in `apps/web/app/lib/firebaseClient.ts`.

export default function FirebaseSignIn() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const ui = new firebaseui.auth.AuthUI(auth);

    ui.start(containerRef.current!, {
      // Use provider IDs as strings to avoid SDK namespace/type differences.
      // See FirebaseUI docs for provider id strings.
      signInOptions: ["google.com", "email", "anonymous"],
      signInSuccessUrl: "/",
      tosUrl: "/",
      privacyPolicyUrl: "/",
    });

    return () => {
      try {
        ui.delete();
      } catch {
        // ignore if already deleted
      }
    };
  }, []);

  return <div ref={containerRef} />;
}

```


## Refactor: apps/web/app/components/Inbox.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/Inbox.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Inbox
// Tags: P2, UI, CODE
"use client";
import React, { useMemo } from "react";

const Inbox = React.memo(() => {
  // Memoized messages for performance
  const messages = useMemo(
    () => [
      {
        id: "m1",
        title: "Schedule Published",
        body: "Your schedule has been published successfully",
        type: "success",
        time: "2 hours ago",
      },
      {
        id: "m2",
        title: "New Message",
        body: "You have a new message from the team",
        type: "info",
        time: "1 day ago",
      },
      {
        id: "m3",
        title: "Receipt Generated",
        body: "Receipt for your recent transaction is ready",
        type: "neutral",
        time: "3 days ago",
      },
    ],
    [],
  );

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-secondary bg-secondary/5";
      case "info":
        return "border-primary bg-primary/5";
      default:
        return "border-surface-accent bg-surface-accent/50";
    }
  };

  return (
    <div className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-primary">Inbox</h3>
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${getTypeStyles(m.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-text">{m.title}</div>
                <div className="mt-1 text-sm text-text-muted">{m.body}</div>
              </div>
              <div className="ml-2 text-xs text-text-muted">{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      {messages.length === 0 && (
        <div className="py-8 text-center text-text-muted">
          <div className="mb-2 text-4xl">📭</div>
          <p>No messages yet</p>
        </div>
      )}
    </div>
  );
});

Inbox.displayName = "Inbox";

export default Inbox;

```


## Refactor: apps/web/app/components/MonthView.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/MonthView.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] MonthView
// Tags: P2, UI, CODE
"use client";
import React, { useMemo } from "react";

const MonthView = React.memo(({ month = new Date() }: { month?: Date }) => {
  // Optimized month grid with memoization for performance
  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const daysArray = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    return daysArray;
  }, [month]);

  return (
    <div className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-primary">
        {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </h3>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center font-medium text-text-muted">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center rounded-lg transition-all duration-200 ${
              day
                ? "cursor-pointer border border-surface-accent bg-surface-accent hover:bg-primary/10 hover:text-primary"
                : ""
            }`}
          >
            {day && <span className="font-medium">{day}</span>}
          </div>
        ))}
      </div>
    </div>
  );
});

MonthView.displayName = "MonthView";

export default MonthView;

```


## Refactor: apps/web/app/components/ProtectedRoute.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ProtectedRoute.tsx`

**File Content:**
```typescript
// [P1][API][CODE] ProtectedRoute
// Tags: P1, API, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useAuth } from "../lib/auth-context";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user) return null;
  return <>{children}</>;
}

```


## Refactor: apps/web/app/components/UploadStub.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/UploadStub.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] UploadStub
// Tags: P2, UI, CODE
"use client";

import React from "react";

export default function UploadStub() {
  return (
    <div className="rounded border p-4 text-sm">
      <div className="font-semibold">Upload (Stub)</div>
      <p className="mb-2 opacity-80">This only captures a file and logs it — no storage SDK yet.</p>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log("Selected file:", { name: file.name, size: file.size, type: file.type });
          }
        }}
      />
    </div>
  );
}

```


## Refactor: apps/web/app/components/ui/Alert.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/Alert.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Alert
// Tags: P2, UI, CODE
"use client";

import { clsx } from "clsx";
import React from "react";

export interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Alert component for displaying messages to users
 *
 * @example
 * ```tsx
 * <Alert type="success" title="Success" message="Profile updated successfully!" />
 * ```
 */
export function Alert({ type = "info", title, message, onClose, className }: AlertProps) {
  const typeStyles = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: "text-green-600",
      title: "text-green-800",
      message: "text-green-700",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-600",
      title: "text-red-800",
      message: "text-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-800",
      message: "text-yellow-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      title: "text-blue-800",
      message: "text-blue-700",
    },
  };

  const icons = {
    success: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    error: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  const styles = typeStyles[type];

  return (
    <div className={clsx("rounded-lg border p-4", styles.container, className)} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className={clsx("h-5 w-5", styles.icon)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[type]}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={clsx("text-sm font-medium", styles.title)}>{title}</h3>}
          <p className={clsx("text-sm", title ? "mt-1" : "", styles.message)}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 inline-flex flex-shrink-0 text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

```


## Refactor: apps/web/app/components/ui/Button.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/Button.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Button
// Tags: P2, UI, CODE
"use client";

import { clsx } from "clsx";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

```


## Refactor: apps/web/app/components/ui/Card.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/Card.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  variant?: "default" | "bordered" | "elevated";
}

/**
 * Card component for displaying content in a contained, styled box
 *
 * @example
 * ```tsx
 * <Card title="User Profile" description="View and edit your profile">
 *   <p>Content goes here</p>
 * </Card>
 * ```
 */
export function Card({
  title,
  description,
  children,
  className,
  footer,
  variant = "default",
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-gray-200",
    bordered: "bg-white border-2 border-gray-300",
    elevated: "bg-white shadow-lg",
  };

  return (
    <div className={clsx("overflow-hidden rounded-lg", variantStyles[variant], className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">{footer}</div>}
    </div>
  );
}

```


## Refactor: apps/web/app/components/ui/Input.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/Input.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
"use client";

import { clsx } from "clsx";
import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Input component with label, error, and helper text support
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (
      <div className={clsx("flex flex-col", fullWidth && "w-full")}>
        {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          className={clsx(
            "rounded-md border px-3 py-2 text-sm shadow-sm",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Textarea component for multi-line text input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (
      <div className={clsx("flex flex-col", fullWidth && "w-full")}>
        {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
        <textarea
          ref={ref}
          className={clsx(
            "rounded-md border px-3 py-2 text-sm shadow-sm",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

```


## Refactor: apps/web/app/components/ui/Loading.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/Loading.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Loading
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Spinner component for loading states
 *
 * @example
 * ```tsx
 * <Spinner size="md" />
 * ```
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <svg
      className={clsx("animate-spin text-blue-600", sizeStyles[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

/**
 * Loading component with spinner and optional text
 *
 * @example
 * ```tsx
 * <Loading text="Loading data..." />
 * ```
 */
export function Loading({ text = "Loading...", fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Spinner size="lg" />
        {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
      </div>
    </div>
  );
}

```


## Refactor: apps/web/app/components/ui/__tests__/Button.test.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/__tests__/Button.test.tsx`

**File Content:**
```typescript
// [P1][TEST][TEST] Button Test tests
// Tags: P1, TEST, TEST
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByText("Click me"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toHaveClass("bg-blue-600");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-gray-200");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger")).toHaveClass("bg-red-600");
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText("Loading")).toBeDisabled();
    expect(screen.getByRole("button")).toContainHTML("svg");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});

```


## Refactor: apps/web/app/components/ui/__tests__/Card.test.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/__tests__/Card.test.tsx`

**File Content:**
```typescript
// [P1][TEST][TEST] Card Test tests
// Tags: P1, TEST, TEST
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Card } from '../Card'

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with title and description', () => {
    render(
      <Card title="Test Title" description="Test Description">
        <p>Content</p>
      </Card>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <Card footer={<button>Footer Button</button>}>
        <p>Content</p>
      </Card>
    )
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Card variant="default">Content</Card>)
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('border-gray-200')
    
    rerender(<Card variant="elevated">Content</Card>)
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-lg')
  })
})

```


## Refactor: apps/web/app/components/ui/__tests__/Input.test.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/__tests__/Input.test.tsx`

**File Content:**
```typescript
// [P1][TEST][TEST] Input Test tests
// Tags: P1, TEST, TEST
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, expect } from "vitest";

import { Input, Textarea } from "../Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input label="Email" error="Invalid email" id="email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("displays helper text", () => {
    render(<Input label="Email" helperText="Enter your email address" id="email" />);
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);

    const input = screen.getByRole("textbox");
    await user.type(input, "John Doe");

    expect(input).toHaveValue("John Doe");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled label="Disabled" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("Textarea", () => {
  it("renders with label", () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("accepts multi-line input", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Line 1\nLine 2");

    expect(textarea).toHaveValue("Line 1\nLine 2");
  });
});

```


## Refactor: apps/web/app/components/ui/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/components/ui/index.ts`

**File Content:**
```typescript
// [P2][UI][CODE] Index
// Tags: P2, UI, CODE
// Export all UI components for easy importing
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Input, Textarea } from "./Input";
export type { InputProps, TextareaProps } from "./Input";

export { Spinner, Loading } from "./Loading";
export type { SpinnerProps, LoadingProps } from "./Loading";

export { Alert } from "./Alert";
export type { AlertProps } from "./Alert";

```


## Refactor: apps/web/app/fonts.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/fonts.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Fonts
// Tags: P2, APP, CODE
import { Inter } from "next/font/google";

/**
 * Self-hosted variable font with swap to avoid FOIT/FOUT.
 * Using a CSS variable keeps Tailwind/theming clean.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

```


## Refactor: apps/web/app/layout.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/layout.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Layout
// Tags: P2, APP, CODE
import type { Metadata, Viewport } from "next";
import Link from "next/link";

import "./globals.css"; // ensure this exists; keep Tailwind base/utilities here
import { inter } from "./fonts";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "Fresh Schedules",
  description: "Staff scheduling built for speed and control.",
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server layout; zero client JS here.
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-[#0b0f14] text-gray-100 antialiased">
        <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-[#0b0f14]/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link prefetch href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="font-semibold tracking-wide">Fresh&nbsp;Schedules</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <Link href="/protected/schedules" className="hover:text-white">
                Schedules
              </Link>
              <Link href="/protected/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Top Shelf Service LLC. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

```


## Refactor: apps/web/app/lib/__tests__/http.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/__tests__/http.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] Http Test tests
// Tags: P1, TEST, TEST
import { describe, expect, it, vi } from "vitest";

import { HttpError, apiFetch } from "../http";

describe("HttpError", () => {
  it("should create an HttpError with status and message", () => {
    const error = new HttpError(404, "Not found", "NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.code).toBe("NOT_FOUND");
  });

  it("should include details when provided", () => {
    const details = { field: "email" };
    const error = new HttpError(400, "Invalid email", "VALIDATION_ERROR", details);
    expect(error.details).toEqual(details);
  });
});

describe("apiFetch", () => {
  it("should throw HttpError on non-2xx response", async () => {
    // Mock fetch to return an error response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          error: { code: "NOT_FOUND", message: "Resource not found" },
        }),
    });

    await expect(apiFetch("/api/test")).rejects.toThrow(HttpError);
  });

  it("should return parsed JSON on successful response", async () => {
    const mockData = { id: 1, name: "Test" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify(mockData),
    });

    const result = await apiFetch("/api/test");
    expect(result).toEqual(mockData);
  });
});

```


## Refactor: apps/web/app/lib/auth-context.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/auth-context.tsx`

**File Content:**
```typescript
// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

import { auth } from "./firebaseClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

```


## Refactor: apps/web/app/lib/cache.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/cache.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Cache
// Tags: P2, APP, CODE
import {
  unstable_cache as nextCache,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache";

export type CacheCfg = { tag?: string; ttl?: number; noStore?: boolean };

/**
 * Wrap an async fetcher into a cached function with an optional tag and TTL.
 * Use `invalidate(tag)` after a write to refresh consumers.
 */
export function cached<TArgs extends unknown[], TRes>(
  key: string,
  fn: (...args: TArgs) => Promise<TRes>,
  cfg: CacheCfg = {},
) {
  const { tag, ttl, noStore: skip } = cfg;
  if (skip) {
    return async (...args: TArgs) => {
      noStore(); // opt out entirely
      return fn(...args);
    };
  }
  const tags = tag ? [tag] : undefined;
  const wrapped = nextCache(fn, [key], { revalidate: ttl ?? 60, tags });
  return (...args: TArgs) => wrapped(...args);
}

export function invalidate(tag: string) {
  "use server";
  revalidateTag(tag, {});
}

```


## Refactor: apps/web/app/lib/db.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/db.ts`

**File Content:**
```typescript
// [P0][APP][CODE] Db
// Tags: P0, APP, CODE
// Server-first Firestore read helpers with cache tags.
// NOTE: Keep this file importable by server components only.
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { cached } from "./cache";
import { ENV } from "./env";

const app = initializeApp({
  apiKey: ENV.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

export type ScheduleLite = {
  id: string;
  orgId: string;
  weekStart: string; // ISO string
  venueId: string;
  status: "draft" | "published";
};

type ScheduleDocData = {
  orgId: string;
  weekStart: { toDate: () => Date } | string;
  venueId: string;
  status: "draft" | "published";
  [key: string]: unknown;
};

const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

async function _fetchRecentSchedulesLite(orgId: string, max = 10): Promise<ScheduleLite[]> {
  // Ensure indexes exist: (weekStart DESC, venueId ASC) on schedules/{orgId}/{scheduleId}
  const ref = collection(db, "schedules", orgId, "schedules");
  const q = query(ref, orderBy("weekStart", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as ScheduleDocData;
    return {
      id: d.id,
      orgId: data.orgId,
      weekStart:
        typeof data.weekStart === "object" &&
        data.weekStart !== null &&
        typeof (data.weekStart as { toDate?: unknown }).toDate === "function"
          ? (data.weekStart as { toDate: () => Date }).toDate().toISOString()
          : (data.weekStart as string),
      venueId: data.venueId,
      status: data.status,
    };
  });
}

export const fetchRecentSchedulesLite = (orgId: string, max = 10) =>
  cached<
    Parameters<typeof _fetchRecentSchedulesLite>,
    Awaited<ReturnType<typeof _fetchRecentSchedulesLite>>
  >(`recentSchedules:${orgId}:${max}`, _fetchRecentSchedulesLite, {
    tag: TAG_SCHEDULES(orgId),
    ttl: 60,
  })(orgId, max);

export async function fetchScheduleDoc(orgId: string, scheduleId: string) {
  const ref = doc(db, "schedules", orgId, scheduleId);
  const s = await getDoc(ref);
  return { id: s.id, ...(s.data() as ScheduleDocData) };
}

export { TAG_SCHEDULES };

```


## Refactor: apps/web/app/lib/env.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/env.ts`

**File Content:**
```typescript
// [P0][CLIENT][ENV] Client-side environment validation with fail-fast
// Tags: P0, CLIENT, ENV, VALIDATION, NEXTJS
// Comprehensive Zod-based environment validation for all client-side variables.
// This module must be imported only on the client side (components, client actions).

import { z } from "zod";

/**
 * Client-side environment schema with comprehensive validation.
 * Enforces required variables and provides sensible defaults where appropriate.
 */
const ClientEnvSchema = z.object({
  // === Firebase Client SDK ===
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),

  // === Development & Testing ===
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Cached, validated client environment.
 * Initialized lazily on first access.
 */
let cachedEnv: ClientEnv | null = null;

/**
 * Load and validate client-side environment variables.
 * Fails fast with clear error messages if required variables are missing or invalid.
 *
 * @throws {Error} If environment validation fails
 * @returns Validated and typed environment object
 */
export function loadClientEnv(): ClientEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ClientEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`[env.client] Environment validation failed:\n${errors}`);
    throw new Error("Invalid client environment configuration");
  }

  const env = parsed.data;

  cachedEnv = env;
  return env;
}

/**
 * Helper to check if Firebase emulators should be used.
 *
 * @param env Client environment object
 * @returns true if emulators are enabled
 */
export function useEmulators(env: ClientEnv): boolean {
  return env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

// Validate environment immediately in non-production environments
// This ensures early detection of config issues during development
if (process.env.NODE_ENV !== "production") {
  try {
    loadClientEnv();
    // Environment validated successfully
  } catch (error) {
    console.error("[env.client] Failed to validate client environment:", error);
    // Allow development to continue with warnings
  }
}

/**
 * Exported validated environment object.
 * Use this for accessing environment variables throughout the client-side code.
 */
export const ENV = loadClientEnv();

```


## Refactor: apps/web/app/lib/firebaseClient.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/firebaseClient.ts`

**File Content:**
```typescript
// [P0][FIREBASE][FIREBASE] FirebaseClient
// Tags: P0, FIREBASE, FIREBASE
/**
 * @fileoverview
 * Client-side Firebase initialization and configuration.
 * Validates environment variables and provides singleton Firebase app instance.
 */
import { getApp, getApps, initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { z } from "zod";

// Validate expected NEXT_PUBLIC_ env vars used to initialize Firebase.
const EnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

const rawEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cfg = undefined as undefined | FirebaseOptions;

try {
  const parsed = EnvSchema.parse(rawEnv);
  cfg = {
    apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: parsed.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: parsed.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
} catch (err) {
  // In dev this will surface useful messages but won't crash the server build.
  // Consumers should still ensure they set the NEXT_PUBLIC_FIREBASE_* vars.

  console.warn("Firebase env validation failed:", err);
}

// Initialize exactly once on the client. Only attempt initialize if cfg is valid.
export const firebaseApp = ((): ReturnType<typeof getApp> | undefined => {
  if (typeof window === "undefined") return undefined;

  // In development, if validation failed, provide a harmless fallback config so the
  // client can initialize Firebase for local dev UI/testing without requiring secrets.
  if (!cfg && process.env.NODE_ENV === "development") {
    console.warn("Firebase env vars not set; using development fallback config for local testing");
    cfg = {
      apiKey: "fake-api-key",
      authDomain: "localhost",
      projectId: "local-demo",
      storageBucket: undefined,
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000",
      measurementId: undefined,
    };
  }

  if (!cfg) return undefined;
  return getApps().length ? getApp() : initializeApp(cfg);
})();

// Export auth and db instances
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
export const storage = firebaseApp ? getStorage(firebaseApp) : undefined;

// Conditionally initialize analytics when available and measurementId present
export const analytics = ((): ReturnType<typeof getAnalytics> | undefined => {
  try {
    if (typeof window === "undefined") return undefined;
    if (!firebaseApp) return undefined;
    // Only init analytics if measurementId is present on the config
    // @ts-ignore - access config via getApp().options
    const measurementId = (firebaseApp as any).options?.measurementId;
    if (!measurementId) return undefined;
    return getAnalytics(firebaseApp);
  } catch (err) {
    console.warn("Firebase analytics init failed:", err);
    return undefined;
  }
})();

```


## Refactor: apps/web/app/lib/http.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/http.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Http
// Tags: P2, APP, CODE
import type { ApiError } from "../api/_shared/validation";

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Typed fetch wrapper expecting JSON. Throws HttpError on non-2xx with normalized shape. */
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? JSON.parse(text || "{}") : text || "";
  if (!res.ok) {
    const apiErr = (body as ApiError)?.error;
    const code = apiErr?.code ?? String(res.status);
    const msg = apiErr?.message ?? "Request failed";
    const details = apiErr?.details;
    throw new HttpError(res.status, msg, code, details);
  }
  return body as T;
}

```


## Refactor: apps/web/app/lib/registerServiceWorker.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/registerServiceWorker.ts`

**File Content:**
```typescript
// [P2][APP][CODE] RegisterServiceWorker
// Tags: P2, APP, CODE
// Safe service worker registration helper
export async function safeRegisterServiceWorker(scriptUrl = "/sw.js") {
  try {
    if (typeof window === "undefined") return;
    if (!navigator.serviceWorker) {
      // Service worker not available in this browser
      return;
    }

    const ua = navigator.userAgent || "";
    const isEmbeddedWebView = /vscode|WebView|Electron|HeadlessChrome/i.test(ua);
    // Developer override: allow forcing registration in embedded contexts for debugging.
    // Override via any of:
    // - global flag: window.__ALLOW_SW_IN_EMBEDDED = true
    // - localStorage: localStorage.setItem('ALLOW_SW', '1')
    // - URL query param: ?allow_sw=1
    const urlAllows =
      typeof URL !== "undefined" && new URL(location.href).searchParams.get("allow_sw") === "1";
    const storageAllows =
      typeof localStorage !== "undefined" && localStorage.getItem("ALLOW_SW") === "1";
    const globalAllows =
      (window as Window & { __ALLOW_SW_IN_EMBEDDED?: boolean }).__ALLOW_SW_IN_EMBEDDED === true;
    if (isEmbeddedWebView && !(urlAllows || storageAllows || globalAllows)) {
      return;
    }

    if (!window.isSecureContext && location.hostname !== "localhost") {
      return;
    }

    // Wait for load to avoid interfering with early page lifecycle in webviews
    if (document.readyState === "complete") {
      try {
        await navigator.serviceWorker.register(scriptUrl);
      } catch {
        // Service worker registration failed (safe guard)
      }
      return;
    }

    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register(scriptUrl);
      } catch {
        // Service worker registration failed (safe guard)
      }
    });
  } catch (err) {
    console.error("Service worker safe registration encountered an error:", err);
  }
}

export async function unregisterAllServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch (err) {
    console.error("Error while unregistering service workers:", err);
  }
}

```


## Refactor: apps/web/app/lib/useCreateItem.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/lib/useCreateItem.ts`

**File Content:**
```typescript
// [P2][APP][CODE] UseCreateItem
// Tags: P2, APP, CODE
"use client";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "./http";

type Item = { id: string; name: string; createdAt: number };
type CreateItemInput = { name: string };

export function useCreateItem() {
  return useMutation({
    mutationFn: async (payload: CreateItemInput) => {
      const data = await apiFetch<Item>("/api/items", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data;
    },
    onError(err) {
      console.error("CreateItem failed:", err);
    },
  });
}

```


## Refactor: apps/web/app/middleware.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/middleware.ts`

**File Content:**
```typescript
// [P2][API][MIDDLEWARE] Next.js middleware for security headers
// Tags: P2, API, MIDDLEWARE
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global middleware for the web app. Applies basic security headers
 * and can later enforce auth / routing rules as needed.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Basic security headers (tune as needed).
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'self';",
  );

  return response;
}

// Limit middleware to app + onboarding routes (adjust as needed).
export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};

```


## Refactor: apps/web/app/onboarding/_wizard/OnboardingWizardContext.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/_wizard/OnboardingWizardContext.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] OnboardingWizardContext
// Tags: P2, APP, CODE
"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";

type OnboardingIntent = "create_org" | "create_corporate" | "join_existing" | null;

interface OnboardingWizardState {
  intent: OnboardingIntent;
  setIntent: (intent: OnboardingIntent) => void;

  formToken: string | null;
  setFormToken: (token: string | null) => void;

  networkId: string | null;
  setNetworkId: (id: string | null) => void;

  orgId: string | null;
  setOrgId: (id: string | null) => void;

  venueId: string | null;
  setVenueId: (id: string | null) => void;

  corpId: string | null;
  setCorpId: (id: string | null) => void;

  joinedRole: string | null;
  setJoinedRole: (role: string | null) => void;
}

const OnboardingWizardContext = createContext<OnboardingWizardState | undefined>(undefined);

export function OnboardingWizardProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<OnboardingIntent>(null);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [corpId, setCorpId] = useState<string | null>(null);
  const [joinedRole, setJoinedRole] = useState<string | null>(null);

  const value: OnboardingWizardState = {
    intent,
    setIntent,
    formToken,
    setFormToken,
    networkId,
    setNetworkId,
    orgId,
    setOrgId,
    venueId,
    setVenueId,
    corpId,
    setCorpId,
    joinedRole,
    setJoinedRole,
  };

  return (
    <OnboardingWizardContext.Provider value={value}>{children}</OnboardingWizardContext.Provider>
  );
}

export function useOnboardingWizard() {
  const ctx = useContext(OnboardingWizardContext);
  if (!ctx) {
    throw new Error("useOnboardingWizard must be used within an OnboardingWizardProvider");
  }
  return ctx;
}

```


## Refactor: apps/web/app/onboarding/admin-form/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/admin-form/page.tsx`

**File Content:**
```typescript
// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";
import React, { useState, useEffect } from "react";

export default function AdminFormStep() {
  const [company, setCompany] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // prefill from profile if present
    try {
      const p = localStorage.getItem("onb_profile");
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.fullName) setCompany(parsed.fullName + "'s org");
        if (parsed.phone) setEmail(parsed.phone);
      }
    } catch {}
  }, []);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          legalEntityName: company,
          taxIdNumber: taxId,
          businessEmail: email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "Failed to submit");
      } else {
        setFormToken(json.formToken);
        try {
          localStorage.setItem("onb_formToken", json.formToken);
        } catch {}
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitForm} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-300">Legal entity name</label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Tax ID (optional)</label>
          <input
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Business email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
            placeholder="admin@example.com"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a className="text-sm text-neutral-400 hover:underline" href="/onboarding/intent">
            Back
          </a>
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Save and continue"}
          </button>
        </div>
      </form>

      {formToken && (
        <div className="rounded border border-emerald-700 bg-emerald-900/10 p-3 text-sm">
          <p className="font-medium text-emerald-200">Form saved</p>
          <p className="text-neutral-300">Use this token to continue network creation.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-neutral-900 px-2 py-1 text-xs">{formToken}</code>
            <a href="/onboarding/create-network-org" className="text-emerald-400 hover:underline">
              Continue to create network
            </a>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-rose-400">{error}</div>}
    </div>
  );
}

```


## Refactor: apps/web/app/onboarding/admin-responsibility/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/admin-responsibility/page.tsx`

**File Content:**
```typescript
// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

export default function AdminResponsibilityPage() {
  const router = useRouter();
  const { intent, setFormToken } = useOnboardingWizard();

  const [legalEntityName, setLegalEntityName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [liabilityAcknowledged, setLiabilityAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [signature, setSignature] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        legalEntityName,
        taxId,
        countryCode,
        businessEmail,
        businessPhone,
        liabilityAcknowledged,
        termsAcceptedVersion: termsAccepted ? "TOS-2025-01" : "",
        privacyAcceptedVersion: privacyAccepted ? "PRIV-2025-01" : "",
        adminSignature: {
          type: "typed",
          value: signature,
        },
      };

      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.formToken) {
        setError(data.error || "Failed to submit admin responsibility form");
        setSubmitting(false);
        return;
      }

      setFormToken(data.formToken as string);

      if (intent === "create_corporate") {
        router.push("/onboarding/create-network-corporate");
      } else {
        router.push("/onboarding/create-network-org");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  if (!intent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">We need to know what you&apos;re setting up first.</p>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          onClick={() => router.push("/onboarding/intent")}
        >
          Back to intent selection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin responsibility</h1>
      <p className="text-sm text-slate-600">
        This step designates who is legally responsible for this workspace and the data in it.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Legal entity name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={legalEntityName}
            onChange={(e) => setLegalEntityName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Tax ID</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country code</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Business email</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Business phone</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={liabilityAcknowledged}
              onChange={(e) => setLiabilityAcknowledged(e.target.checked)}
            />
            <span>I understand I&apos;m responsible for how this workspace is used.</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>I agree to the Terms of Service.</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>I agree to the Privacy Policy.</span>
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Type your full name as signature</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

```


## Refactor: apps/web/app/onboarding/block-4/loading.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/block-4/loading.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Loading
// Tags: P2, APP, CODE
export default function Loading() {
  return <div style={{ padding: 24 }}>Loading Block 4…</div>;
}

```


## Refactor: apps/web/app/onboarding/block-4/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/block-4/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
// Onboarding completion / success step
"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

export default function Block4Page() {
  const router = useRouter();
  const { intent, networkId, orgId, venueId, corpId, joinedRole } = useOnboardingWizard();

  const description =
    intent === "join_existing"
      ? "You have joined an existing workspace."
      : "Your workspace has been created.";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">You&apos;re in.</h1>
      <p className="text-sm text-slate-600">{description}</p>

      <div className="space-y-1 rounded-md border px-4 py-3 text-xs text-slate-700">
        {networkId && (
          <div>
            <span className="font-medium">Network ID:</span> {networkId}
          </div>
        )}
        {orgId && (
          <div>
            <span className="font-medium">Org ID:</span> {orgId}
          </div>
        )}
        {venueId && (
          <div>
            <span className="font-medium">Venue ID:</span> {venueId}
          </div>
        )}
        {corpId && (
          <div>
            <span className="font-medium">Corporate ID:</span> {corpId}
          </div>
        )}
        {joinedRole && (
          <div>
            <span className="font-medium">Role:</span> {joinedRole}
          </div>
        )}
      </div>

      <button
        type="button"
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        onClick={() => router.push("/app")}
      >
        Go to the app
      </button>
    </div>
  );
}

```


## Refactor: apps/web/app/onboarding/blocked/email-not-verified/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/blocked/email-not-verified/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function EmailNotVerified() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Email not verified</h1>
        <p className="text-sm">
          Please verify your email address before continuing with onboarding. Check your inbox for a
          verification email.
        </p>
      </div>
    </ProtectedRoute>
  );
}

```


## Refactor: apps/web/app/onboarding/blocked/network-pending/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/blocked/network-pending/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "../../../components/ProtectedRoute";

export default function NetworkPending() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Network pending verification</h1>
        <p className="text-sm">
          Your network is pending verification. You may have to wait for manual review. We'll notify
          you when it's active.
        </p>
      </div>
    </ProtectedRoute>
  );
}

```


## Refactor: apps/web/app/onboarding/blocked/staff-invite/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/blocked/staff-invite/page.tsx`

**File Content:**
```typescript
// [P0][APP][CODE] Staff invite blocked page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React from "react";

// Narrow router type to the minimal surface we actually use to avoid any.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

export default function StaffInviteBlockedPage() {
  const router = useRouter();
  const nav: NavRouter = { push: router.push };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">You need an invite</h1>
        <p className="text-sm text-gray-600">
          It looks like you&apos;re trying to onboard as a staff member without an invite token.
          Staff access must be initiated by an admin or manager from an existing organization.
        </p>
      </header>

      <section className="space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
        <p className="font-medium">What you can do:</p>
        <ul className="list-disc pl-5">
          <li>Ask your manager or admin to send you a Fresh Schedules invite.</li>
          <li>
            Once you receive the invite token, return here and use the{" "}
            <span className="font-semibold">Join with token</span> step.
          </li>
        </ul>
      </section>

      <div className="flex items-center justify-start gap-4">
        <button
          type="button"
          onClick={() => nav.push("/onboarding/join")}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go to Join with token
        </button>

        <button
          type="button"
          onClick={() => nav.push("/onboarding")}
          className="text-sm text-gray-600 underline"
        >
          Back to onboarding index
        </button>
      </div>
    </main>
  );
}

```


## Refactor: apps/web/app/onboarding/create-network-corporate/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/create-network-corporate/page.tsx`

**File Content:**
```typescript
// [P0][CODE] Create corporate network page component
// Tags: P0, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

// Narrow router usage to only push to eliminate any.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

type CorporateFormState = {
  corporateName: string;
  brandName: string;
  hqCity: string;
  hqState: string;
  locationCount: string;
};

export default function CreateNetworkCorporatePage() {
  const router = useRouter();
  const nav: NavRouter = { push: router.push };
  const [form, setForm] = useState<CorporateFormState>({
    corporateName: "",
    brandName: "",
    hqCity: "",
    hqState: "",
    locationCount: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.corporateName.trim() || !form.brandName.trim()) {
      setError("Corporate entity name and brand are required.");
      return;
    }

    setError(null);

    // Real implementation would POST to /api/onboarding/create-network-corporate.
    nav.push("/onboarding/block-4");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 4: Create your corporate network</h1>
        <p className="text-sm text-gray-600">
          Define your corporate entity and brand so we can link your locations together under one
          network.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="corporateName" className="block text-sm font-medium text-gray-800">
            Corporate entity name
          </label>
          <input
            id="corporateName"
            name="corporateName"
            type="text"
            value={form.corporateName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Top Shelf Service Holdings, LLC"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="brandName" className="block text-sm font-medium text-gray-800">
            Brand name
          </label>
          <input
            id="brandName"
            name="brandName"
            type="text"
            value={form.brandName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Fresh Schedules Cafes"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label htmlFor="hqCity" className="block text-sm font-medium text-gray-800">
              HQ City
            </label>
            <input
              id="hqCity"
              name="hqCity"
              type="text"
              value={form.hqCity}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="w-24 space-y-1">
            <label htmlFor="hqState" className="block text-sm font-medium text-gray-800">
              State
            </label>
            <input
              id="hqState"
              name="hqState"
              type="text"
              value={form.hqState}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="TX"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationCount" className="block text-sm font-medium text-gray-800">
            Approximate location count
          </label>
          <input
            id="locationCount"
            name="locationCount"
            type="number"
            min={1}
            value={form.locationCount}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., 5"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nav.push("/onboarding/admin-responsibility")}
            className="text-sm text-gray-600 underline"
          >
            Back to Admin responsibilities
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Continue to Finalization
          </button>
        </div>
      </form>
    </main>
  );
}

```


## Refactor: apps/web/app/onboarding/create-network-org/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/create-network-org/page.tsx`

**File Content:**
```typescript
// [P0][APP][CODE] Create network organization page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

// Narrow router type to only the push method we use.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

type OrgFormState = {
  orgName: string;
  venueName: string;
  city: string;
  state: string;
};

export default function CreateNetworkOrgPage() {
  const router = useRouter();
  const nav: NavRouter = { push: router.push };
  const [form, setForm] = useState<OrgFormState>({
    orgName: "",
    venueName: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.orgName.trim() || !form.venueName.trim()) {
      setError("Organization name and primary venue are required.");
      return;
    }

    setError(null);

    // Real implementation would POST to /api/onboarding/create-network-org.
    nav.push("/onboarding/block-4");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 4: Create your organization</h1>
        <p className="text-sm text-gray-600">
          Define your primary organization and first venue. You can add more locations later.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-800">
            Organization name
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            value={form.orgName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Top Shelf Service – Main Location"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="venueName" className="block text-sm font-medium text-gray-800">
            Primary venue name
          </label>
          <input
            id="venueName"
            name="venueName"
            type="text"
            value={form.venueName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Arlington Cafe"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-800">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="w-24 space-y-1">
            <label htmlFor="state" className="block text-sm font-medium text-gray-800">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="TX"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nav.push("/onboarding/admin-responsibility")}
            className="text-sm text-gray-600 underline"
          >
            Back to Admin responsibilities
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Continue to Finalization
          </button>
        </div>
      </form>
    </main>
  );
}

```


## Refactor: apps/web/app/onboarding/intent/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/intent/page.tsx`

**File Content:**
```typescript
// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

type EligibilityResponse = {
  allowed: boolean;
  reason: string | null;
  effectiveRole?: string;
};

export default function IntentPage() {
  const router = useRouter();
  const { intent, setIntent } = useOnboardingWizard();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueFlow() {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/verify-eligibility", {
        method: "POST",
      });

      if (!res.ok) {
        setError("Eligibility check failed");
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as EligibilityResponse;
      if (!data.allowed) {
        switch (data.reason) {
          case "email_not_verified":
            router.push("/onboarding/blocked/email-not-verified");
            return;
          case "role_not_allowed":
            router.push("/onboarding/blocked/staff-invite");
            return;
          default:
            setError("You are not allowed to create a workspace from this account.");
            setSubmitting(false);
            return;
        }
      }

      if (intent === "join_existing") {
        router.push("/onboarding/join");
      } else {
        router.push("/onboarding/admin-responsibility");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error during eligibility check");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">What are you trying to do?</h1>
      <p className="text-sm text-slate-600">
        Choose the path that best matches your role and what you&apos;re setting up.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIntent("create_org")}
          className={`w-full rounded-md border px-4 py-3 text-left text-sm ${
            intent === "create_org" ? "border-slate-900 bg-slate-100" : "border-slate-300"
          }`}
        >
          I manage a single location or local team
        </button>

        <button
          type="button"
          onClick={() => setIntent("create_corporate")}
          className={`w-full rounded-md border px-4 py-3 text-left text-sm ${
            intent === "create_corporate" ? "border-slate-900 bg-slate-100" : "border-slate-300"
          }`}
        >
          I&apos;m corporate / HQ setting up a network
        </button>

        <button
          type="button"
          onClick={() => setIntent("join_existing")}
          className={`w-full rounded-md border px-4 py-3 text-left text-sm ${
            intent === "join_existing" ? "border-slate-900 bg-slate-100" : "border-slate-300"
          }`}
        >
          I&apos;m joining a company that already uses this
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!intent || submitting}
        onClick={continueFlow}
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {submitting ? "Checking..." : "Continue"}
      </button>
    </div>
  );
}

```


## Refactor: apps/web/app/onboarding/join/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/join/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Onboarding join page component
// Tags: P2, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

// Narrow router to only push to avoid any casting.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

type JoinFormState = {
  token: string;
  email: string;
};

export default function JoinPage() {
  const router = useRouter();
  const nav: NavRouter = { push: router.push };
  const [form, setForm] = useState<JoinFormState>({
    token: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.token.trim()) {
      setError("Invite token is required.");
      return;
    }

    setError(null);

    // Real implementation would POST to /api/onboarding/join-with-token.
    nav.push("/onboarding/block-4");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 3: Join with token</h1>
        <p className="text-sm text-gray-600">
          Enter the invite token sent by your organization to connect your account.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="token" className="block text-sm font-medium text-gray-800">
            Invite token
          </label>
          <input
            id="token"
            name="token"
            type="text"
            value={form.token}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Paste your invite token"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            Email (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Used for verification if required"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nav.push("/onboarding/intent")}
            className="text-sm text-gray-600 underline"
          >
            Back to Intent
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Continue
          </button>
        </div>
      </form>
    </main>
  );
}

```


## Refactor: apps/web/app/onboarding/layout.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/layout.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Layout
// Tags: P2, APP, CODE
import type { ReactNode } from "react";

import { OnboardingWizardProvider } from "./_wizard/OnboardingWizardContext";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingWizardProvider>
      <div className="flex min-h-screen flex-col items-center justify-start bg-slate-50">
        <div className="w-full max-w-3xl px-4 py-8">{children}</div>
      </div>
    </OnboardingWizardProvider>
  );
}

```


## Refactor: apps/web/app/onboarding/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/page.tsx`

**File Content:**
```typescript
// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
import Link from "next/link";

export default function OnboardingIndex() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Onboarding Wizard</h1>
      <p className="text-muted-foreground mt-2 text-sm">Start the onboarding flow</p>
      <ul className="mt-4 space-y-2">
        <li>
          <Link href="/onboarding/profile" className="text-blue-600 underline">
            Profile
          </Link>
        </li>
        <li>
          <Link href="/onboarding/intent" className="text-blue-600 underline">
            Intent
          </Link>
        </li>
        <li>
          <Link href="/onboarding/join" className="text-blue-600 underline">
            Join
          </Link>
        </li>
        <li>
          <Link href="/onboarding/create-network-org" className="text-blue-600 underline">
            Create Network (Org)
          </Link>
        </li>
        <li>
          <Link href="/onboarding/create-network-corporate" className="text-blue-600 underline">
            Create Network (Corporate)
          </Link>
        </li>
        <li>
          <Link href="/onboarding/admin-responsibility" className="text-blue-600 underline">
            Admin Responsibility Form
          </Link>
        </li>
      </ul>
    </main>
  );
}

```


## Refactor: apps/web/app/onboarding/profile/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/onboarding/profile/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

"use client";

import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeZone, setTimeZone] = useState("America/Chicago");
  const [selfDeclaredRole, setSelfDeclaredRole] = useState("owner_founder_director");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          preferredName,
          phone,
          timeZone,
          selfDeclaredRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = (data as { error?: string }).error;
        setError(err || "Failed to save profile");
        setSubmitting(false);
        return;
      }

      router.push("/onboarding/intent");
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tell us who you are</h1>
      <p className="text-sm text-slate-600">
        Before we set up any organizations or venues, we need a basic profile for you.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Preferred name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Time zone</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Which best describes you?</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={selfDeclaredRole}
            onChange={(e) => setSelfDeclaredRole(e.target.value)}
          >
            <option value="owner_founder_director">Owner / Founder / Director</option>
            <option value="manager_supervisor">Manager / Supervisor</option>
            <option value="corporate_hq">Corporate / HQ</option>
            <option value="manager">Manager (generic)</option>
            <option value="org_owner">Org owner (legacy)</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

```


## Refactor: apps/web/app/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Fresh Schedules</h1>
      <p className="mt-2 text-sm opacity-80">Scaffold is live.</p>
    </main>
  );
}

```


## Refactor: apps/web/app/planning/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/planning/page.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
export default function PlanningPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Planning</h1>
      <p className="text-gray-300">Planning features coming soon.</p>
    </div>
  );
}

```


## Refactor: apps/web/app/providers/index.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/providers/index.tsx`

**File Content:**
```typescript
// [P0][APP][CODE] Index
// Tags: P0, APP, CODE
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { getQueryClient } from "./queryClient";
import "../lib/firebaseClient";
import { AuthProvider } from "../lib/auth-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

```


## Refactor: apps/web/app/providers/queryClient.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/providers/queryClient.ts`

**File Content:**
```typescript
// [P2][APP][CODE] QueryClient
// Tags: P2, APP, CODE
"use client";
import { QueryClient } from "@tanstack/react-query";

let _client: QueryClient | null = null;

export function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          // Tuned for UX-first dev: fast refetch on focus, reasonable staleness
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 30_000, // 30s
          gcTime: 5 * 60_000, // 5 min
        },
        mutations: {
          retry: 0,
        },
      },
    });
  }
  return _client;
}

```


## Refactor: apps/web/app/schedules/builder/page.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/app/schedules/builder/page.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Page page component
// Tags: P2, UI, CODE
"use client";
import React, { useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleBuilder() {
  const [shifts, setShifts] = useState([
    { id: "s1", day: 0, start: "09:00", end: "13:00", title: "Morning" },
    { id: "s2", day: 2, start: "12:00", end: "18:00", title: "Afternoon" },
  ]);

  function addDemoShift(day = 0) {
    const id = `s-${Date.now()}`;
    setShifts((s) => [...s, { id, day, start: "10:00", end: "14:00", title: "New" }]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Week view (prototype)</h2>
        <div>
          <button
            onClick={() => addDemoShift(0)}
            className="rounded bg-emerald-600 px-3 py-1 text-sm"
          >
            Add shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={d} className="rounded border border-neutral-800 p-2">
            <div className="mb-2 text-sm font-medium text-neutral-300">{d}</div>
            <div className="space-y-2">
              {shifts
                .filter((sh) => sh.day === i)
                .map((sh) => (
                  <div key={sh.id} className="rounded bg-neutral-900 px-2 py-1 text-sm">
                    {sh.title} — {sh.start}-{sh.end}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

```


## Refactor: apps/web/components/Logo.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/components/Logo.tsx`

**File Content:**
```typescript
// [P1][OBSERVABILITY][LOGGING] Logo
// Tags: P1, OBSERVABILITY, LOGGING
import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  // Use next/image with explicit sizes to reduce LCP and bandwidth.
  return (
    <Image
      className={className}
      src="/logo.svg" // place a tiny monochrome svg in public/logo.svg (under 2KB)
      alt="Fresh Schedules"
      width={24}
      height={24}
      priority
      sizes="24px"
    />
  );
}

```


## Refactor: apps/web/components/ui/Button.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/components/ui/Button.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Button
// Tags: P2, UI, CODE
"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold transition";
const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
  secondary:
    "bg-neutral-800 text-gray-100 hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
  ghost:
    "bg-transparent text-gray-200 hover:bg-neutral-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${loading ? "cursor-wait opacity-75" : ""} ${className}`}
      {...props}
      disabled={loading || props.disabled}
    />
  );
}

```


## Refactor: apps/web/components/ui/Card.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/components/ui/Card.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import * as React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-neutral-900 bg-[#0f131a] shadow-lg ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-neutral-900 px-4 py-3 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-4 py-4 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-t border-neutral-900 px-4 py-3 ${className}`} {...props} />;
}

```


## Refactor: apps/web/components/ui/Input.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/components/ui/Input.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
"use client";

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export default function Input({ label, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? React.useId();
  return (
    <div className="grid gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-2xl border border-neutral-800 bg-[#0e1117] px-3 py-2 text-sm outline-none ring-0 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

```


## Refactor: apps/web/components/ui/Table.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/components/ui/Table.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Table
// Tags: P2, UI, CODE
import * as React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={`min-w-full text-sm ${className}`} {...props} />;
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-neutral-900/40" {...props} />;
}

export function TRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="border-t border-neutral-800" {...props} />;
}

export function TH({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-3 py-2 text-left ${className}`} {...props} />;
}

export function TD({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-3 py-2 ${className}`} {...props} />;
}

```


## Refactor: apps/web/instrumentation.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/instrumentation.ts`

**File Content:**
```typescript
// [P1][OBS][OTEL] Next.js instrumentation entrypoint (server-only)
// Tags: P1, OBS, OTEL
// NOTE: This file intentionally uses runtime `require()` to import OpenTelemetry
// packages only when running in the Node server runtime. Keeping these imports
// behind a runtime guard prevents Turbopack from attempting to bundle Node-only
// modules into Edge/client runtimes where they would cause __import_unsupported
// and similar errors.

let started = false;

export function register() {
  // Only run on Node runtime (not edge)
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (started) return;
  started = true;

  // === Fail-fast environment validation ===
  // Import and validate server environment at startup. Keep as a runtime
  // require so bundlers won't pull this into client bundles.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { loadServerEnv } = require("./src/lib/env.server");
    loadServerEnv();
  } catch (error) {
    console.error("[instrumentation] Failed to load server environment:", error);
    throw error; // Fail fast
  }

  // Dynamically require OpenTelemetry modules so they are only loaded in the
  // Node server runtime. If the optional packages are missing, warn and return
  // without crashing the server.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let diagModule: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    diagModule = require("@opentelemetry/api");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeSDK, resources } = require("@opentelemetry/sdk-node");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const semantic = require("@opentelemetry/semantic-conventions");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

    const { diag, DiagConsoleLogger, DiagLogLevel } = diagModule;

    // Minimal diagnostics
    if (process.env.OTEL_DEBUG === "1") {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    } else {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
    }

    const serviceName = process.env.OTEL_SERVICE_NAME || "apps-web";
    const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";
    const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;

    // Prefer OTLP HTTP exporter if endpoint provided, else fall back to console in dev
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const traceExporter = otlpEndpoint
      ? new OTLPTraceExporter({ url: `${otlpEndpoint.replace(/\/$/, "")}/v1/traces` })
      : environment === "development"
        ? new ConsoleSpanExporter()
        : undefined;

    const sdk = new NodeSDK({
      resource: resources.resourceFromAttributes({
        [semantic.SEMRESATTRS_SERVICE_NAME]: serviceName,
        [semantic.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
        [semantic.SEMRESATTRS_SERVICE_VERSION]: commitSha || "unknown",
      }),
      // When using ConsoleSpanExporter, NodeSDK will wrap it for us
      traceExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // Fire and forget
    void sdk.start();
  } catch (err) {
    // Optional instrumentation packages are not present or failed to load.
    // Warn but do not crash the server.
    // eslint-disable-next-line no-console
    console.warn("[instrumentation] OpenTelemetry not initialized (optional):", err);
    return;
  }
}

```


## Refactor: apps/web/lib/animations.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/animations.ts`

**File Content:**
```typescript
//[P2][UI][CODE] Framer Motion animation variants and utilities
// Tags: P2, UI, CODE, animations, framer-motion

import type { Variants } from "framer-motion";

/**
 * Calendar view transition variants
 * Usage: <motion.div variants={calendarTransition} initial="initial" animate="animate" exit="exit">
 */
export const calendarTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

/**
 * Slide in from right (for modals, sidebars)
 */
export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

/**
 * Fade and scale (for dialogs, popovers)
 */
export const fadeScale: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Stagger children animation (for lists)
 * Usage: parent has variants={staggerContainer}, children have variants={staggerItem}
 */
export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Drag and drop feedback
 */
export const dragFeedback = {
  drag: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    cursor: "grabbing",
  },
};

/**
 * Spring config presets for common interactions
 */
export const springs = {
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 20 },
  snappy: { type: "spring", stiffness: 500, damping: 35 },
} as const;

/**
 * Hover and tap interactions for buttons
 */
export const buttonInteraction = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

```


## Refactor: apps/web/lib/firebase-admin.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/firebase-admin.ts`

**File Content:**
```typescript
// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton for Next.js server-side operations
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK, NEXTJS
import { cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Singleton Firebase Admin SDK initialization
let app: App | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseProjectId(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set");
  }
  return projectId;
}

function getServiceAccount(): Record<string, unknown> {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON must be set");
  }
  try {
    return JSON.parse(credsJson) as Record<string, unknown>;
  } catch (e) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
  }
}

export function getFirebaseAdminApp(): App {
  if (!app) {
    const projectId = getFirebaseProjectId();
    const serviceAccount = getServiceAccount();

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }
  return app;
}

export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    const app = getFirebaseAdminApp();
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseAdminDb(): Firestore {
  if (!db) {
    const app = getFirebaseAdminApp();
    db = getFirestore(app);
  }
  return db;
}

```


## Refactor: apps/web/lib/onboarding/adminFormDrafts.mts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/onboarding/adminFormDrafts.mts`

**File Content:**
```typescript
// [P0][FIREBASE][CODE] AdminFormDrafts
// Tags: P0, FIREBASE, CODE
export * from "./adminFormDrafts";

```


## Refactor: apps/web/lib/onboarding/adminFormDrafts.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/onboarding/adminFormDrafts.ts`

**File Content:**
```typescript
// [P0][FIREBASE][CODE] AdminFormDrafts
// Tags: P0, FIREBASE, CODE
import { db } from "@/lib/firebaseAdmin";
import {
  CreateAdminResponsibilityFormSchema,
  type AdminResponsibilityForm,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { z } from "zod";

const AdminFormDraftDocSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  status: z.enum(["active", "consumed", "expired"]),
  form: CreateAdminResponsibilityFormSchema,
  taxValidation: z.object({
    isValid: z.boolean(),
    reason: z.string().optional(),
    checkedAt: z.date().optional(),
  }),
});

export type AdminFormDraftDoc = z.infer<typeof AdminFormDraftDocSchema>;

/**
 * Creates a pre-network admin responsibility form draft and returns a token
 * that can be used later by /api/onboarding/create-network-*
 */
export async function createAdminFormDraft(params: {
  userId: string;
  form: CreateAdminResponsibilityFormInput;
  taxValidation: {
    isValid: boolean;
    reason?: string;
  };
  ttlMinutes?: number;
}): Promise<{ formToken: string }> {
  const { userId, form, taxValidation, ttlMinutes = 60 } = params;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  const draft: AdminFormDraftDoc = {
    userId,
    createdAt: now,
    expiresAt,
    status: "active",
    form,
    taxValidation: {
      isValid: taxValidation.isValid,
      reason: taxValidation.reason,
      checkedAt: now,
    },
  };

  const ref = db.collection("adminFormDrafts").doc();
  await ref.set(draft);

  return { formToken: ref.id };
}

/**
 * Peek a draft without consuming it (for debugging or re-checks).
 */
export async function getAdminFormDraft(formToken: string) {
  const snap = await db.collection("adminFormDrafts").doc(formToken).get();
  if (!snap.exists) return null;

  const raw = snap.data();
  if (!raw) return null;

  const parsed = AdminFormDraftDocSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid adminFormDraft document", parsed.error.format());
    return null;
  }

  const draft = parsed.data;
  if (draft.status !== "active") return null;
  if (draft.expiresAt.getTime() < Date.now()) return null;

  return { id: snap.id, ...draft };
}

/**
 * Atomically consume a draft. Returns the stored form or null if
 * token is invalid/expired/already used.
 */
export async function consumeAdminFormDraft(params: {
  formToken: string;
  expectedUserId?: string;
}): Promise<{
  form: AdminResponsibilityForm;
  taxValidation: { isValid: boolean; reason?: string };
} | null> {
  const { formToken, expectedUserId } = params;

  const ref = db.collection("adminFormDrafts").doc(formToken);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;

    const raw = snap.data();
    if (!raw) return null;

    const parsed = AdminFormDraftDocSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Invalid adminFormDraft in consume", parsed.error.format());
      return null;
    }

    const draft = parsed.data;

    // Hard constraints
    if (draft.status !== "active") return null;
    if (draft.expiresAt.getTime() < Date.now()) return null;
    if (expectedUserId && draft.userId !== expectedUserId) return null;

    // Mark as consumed, but keep record for audit
    tx.update(ref, {
      status: "consumed",
      consumedAt: new Date(),
    });

    return {
      form: draft.form as AdminResponsibilityForm,
      taxValidation: {
        isValid: draft.taxValidation.isValid,
        reason: draft.taxValidation.reason,
      },
    };
  });
}

```


## Refactor: apps/web/lib/onboarding/createNetworkOrg.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/onboarding/createNetworkOrg.ts`

**File Content:**
```typescript
// [P0][APP][CODE] CreateNetworkOrg
// Tags: P0, APP, CODE
// apps/web/lib/onboarding/createNetworkOrg.ts
import type { Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "../firebase-admin";
import { consumeAdminFormDraft } from "./adminFormDrafts";

// Minimal payload shape used by this helper. Keep local to avoid coupling on types package here.
export type CreateNetworkOrgPayload = {
  basics: {
    orgName: string;
    hasCorporateAboveYou?: boolean;
    segment?: string;
    approxLocations?: number;
  };
  venue: {
    venueName: string;
    timeZone?: string;
  };
  formToken: string;
};

const dbDefault = getFirebaseAdminDb();

export type CreateNetworkOrgResult = {
  networkId: string;
  orgId: string;
  venueId: string;
  status: string;
};

export async function createNetworkWithOrgAndVenue(
  adminUid: string,
  payload: CreateNetworkOrgPayload,
  injectedDb?: Firestore,
): Promise<CreateNetworkOrgResult> {
  const db = injectedDb ?? dbDefault;
  const { basics, venue, formToken } = payload;

  const consumed = await consumeAdminFormDraft({ formToken, expectedUserId: adminUid });
  if (!consumed) throw new Error("admin_form_not_found");

  const draftForm = consumed.form;

  const batch = db.batch();

  const networkRef = db.collection("networks").doc();
  const networkId = networkRef.id;

  const now = new Date();

  const networkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basics.orgName,
    legalName: (draftForm as { legalName?: string }).legalName ?? basics.orgName,
    kind: basics.hasCorporateAboveYou ? "franchise_network" : "independent_org",
    segment: basics.segment,
    status: "pending_verification",
    ownerUserId: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(networkRef, networkDoc);

  const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
  const formDoc = {
    networkId,
    adminUid,
    ...draftForm,
    createdAt: now,
    createdBy: adminUid,
  };

  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc();
  const orgId = orgRef.id;
  const orgDoc = {
    id: orgId,
    networkId,
    displayName: basics.orgName,
    legalName: (draftForm as { legalName?: string }).legalName ?? basics.orgName,
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(orgRef, orgDoc);

  const venueRef = networkRef.collection("venues").doc();
  const venueId = venueRef.id;
  const venueDoc = {
    id: venueId,
    networkId,
    name: venue.venueName,
    timeZone: venue.timeZone,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(venueRef, venueDoc);

  const membershipRef = networkRef.collection("memberships").doc();
  const membershipId = membershipRef.id;
  const membershipDoc = {
    id: membershipId,
    networkId,
    userId: adminUid,
    roles: ["network_owner", "network_admin"],
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
    active: true,
  };

  batch.set(membershipRef, membershipDoc);

  await batch.commit();

  // mark consumption handled by consumeAdminFormDraft above (atomic)

  return { networkId, orgId, venueId, status: "pending_verification" };
}

```


## Refactor: apps/web/lib/telemetry.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/telemetry.ts`

**File Content:**
```typescript
// [P2][APP][OTEL] Telemetry
// Tags: P2, APP, OTEL
import type { NextRequest } from "next/server";

/**
 * Minimal stdout logger for API calls. Controlled by:
 * - NODE_ENV === "production"  OR
 * - TELEMETRY_STDOUT === "1"   (force in dev)
 */
export function logApiCall(
  method: string,
  path: string,
  userId?: string,
  status?: number,
  durationMs?: number,
  extras?: Record<string, unknown>
) {
  const enable =
    process.env.NODE_ENV === "production" ||
    process.env.TELEMETRY_STDOUT === "1";

  if (!enable) return;

  const payload = {
    timestamp: Date.now(),
    type: "api_call",
    method,
    path,
    userId,
    status,
    durationMs,
    ...extras,
  };

  // Intentionally one-line JSON for easy ingestion
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

/**
 * Try to read a request ID if provided by proxies/CDN.
 */
function readRequestId(req: NextRequest | any): string | undefined {
  try {
    const id =
      (typeof req?.headers?.get === "function" &&
        req.headers.get("x-request-id")) ||
      (req?.headers?.["x-request-id"] as string | undefined) ||
      undefined;
    return id || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extract a reasonable HTTP status from a Next.js route result.
 */
function getStatus(result: unknown): number {
  try {
    // Prefer a numeric `status` property when present (covers NextResponse and plain objects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybe = result as any;
    if (typeof maybe?.status === "number") return maybe.status;
    return 200;
  } catch {
    return 500;
  }
}

/**
 * Generic safe wrapper for Next.js Route Handlers.
 * Works with signatures like:
 *   export const GET  = withTelemetry(async (req: NextRequest) => NextResponse.json(...), "/api/foo");
 *   export const POST = withTelemetry(async (req: NextRequest) => ..., "/api/foo");
 */
export function withTelemetry<T extends (req: any, ...args: any[]) => Promise<any>>(
  handler: T,
  route: string
): T {
  return (async (req: NextRequest | any, ...args: any[]) => {
    const start = Date.now();
    try {
      const result = await handler(req, ...args);
      const status = getStatus(result);
      logApiCall(
        (req as any)?.method ?? "UNKNOWN",
        route,
        (req as any)?.userToken?.uid,
        status,
        Date.now() - start,
        { requestId: readRequestId(req) }
      );
      return result;
    } catch (error) {
      logApiCall(
        (req as any)?.method ?? "UNKNOWN",
        route,
        (req as any)?.userToken?.uid,
        500,
        Date.now() - start,
        { requestId: readRequestId(req), error: (error as Error)?.name }
      );
      throw error;
    }
  }) as unknown as T;
}

```


## Refactor: apps/web/lib/urlState.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/lib/urlState.ts`

**File Content:**
```typescript
//[P2][UI][CODE] Type-safe URL state management with nuqs
// Tags: P2, UI, CODE, url-state, nuqs

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
  parseAsIsoDateTime,
  parseAsBoolean,
} from "nuqs";

/**
 * Schedule view modes
 */
export type ScheduleView = "day" | "week" | "month";

/**
 * Hook: Calendar view state (day/week/month)
 * URL: ?view=week
 */
export function useScheduleView(defaultValue: ScheduleView = "week") {
  return useQueryState(
    "view",
    parseAsStringEnum<ScheduleView>(["day", "week", "month"]).withDefault(defaultValue),
  );
}

/**
 * Hook: Selected date state
 * URL: ?date=2025-11-06
 */
export function useSelectedDate(defaultValue?: Date) {
  return useQueryState("date", parseAsIsoDateTime.withDefault(defaultValue || new Date()));
}

/**
 * Hook: Filter by position ID
 * URL: ?position=pos-123
 */
export function usePositionFilter() {
  return useQueryState("position", parseAsString);
}

/**
 * Hook: Filter by user ID
 * URL: ?user=user-456
 */
export function useUserFilter() {
  return useQueryState("user", parseAsString);
}

/**
 * Hook: Show archived schedules
 * URL: ?archived=true
 */
export function useShowArchived() {
  return useQueryState("archived", parseAsBoolean.withDefault(false));
}

/**
 * Hook: Pagination - page number
 * URL: ?page=2
 */
export function usePage() {
  return useQueryState("page", parseAsInteger.withDefault(1));
}

/**
 * Hook: Pagination - items per page
 * URL: ?limit=50
 */
export function usePageSize(defaultSize = 25) {
  return useQueryState("limit", parseAsInteger.withDefault(defaultSize));
}

/**
 * Hook: Search query
 * URL: ?q=search+term
 */
export function useSearchQuery() {
  return useQueryState("q", parseAsString.withDefault(""));
}

/**
 * Combined hook for schedule filters
 * Returns all common filters in one object
 */
export function useScheduleFilters() {
  const [view, setView] = useScheduleView();
  const [date, setDate] = useSelectedDate();
  const [position, setPosition] = usePositionFilter();
  const [user, setUser] = useUserFilter();
  const [archived, setArchived] = useShowArchived();

  return {
    view,
    setView,
    date,
    setDate,
    position,
    setPosition,
    user,
    setUser,
    archived,
    setArchived,
  };
}

```


## Refactor: apps/web/next-env.d.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/next-env.d.ts`

**File Content:**
```typescript
// [P2][APP][ENV] Next Env D type definitions
// Tags: P2, APP, ENV
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```


## Refactor: apps/web/proxy.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/proxy.ts`

**File Content:**
```typescript
// [P0][APP][CODE] Proxy
// Tags: P0, APP, CODE
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Gate: if user has no org membership/profile, redirect to /onboarding.
 * Assumes a server-managed cookie "orgId" set after onboarding.
 * Replace this with a real session check (e.g., iron-session / Firebase session) when wired.
 *
 * TEMPORARY: Set BYPASS_ONBOARDING_GUARD=true in env to disable for development.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Public routes: sign-in, onboarding, assets, api
  const PUBLIC = [/^\/onboarding/, /^\/signin/, /^\/api/, /^\/_next/, /^\/favicon\.ico$/];
  if (PUBLIC.some((rx) => rx.test(pathname))) return NextResponse.next();

  // TEMPORARY: Allow bypassing the guard for development only
  if (process.env.BYPASS_ONBOARDING_GUARD === "true" && process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const orgId = req.cookies.get("orgId")?.value;
  if (!orgId) {
    const dest = new URL("/onboarding", req.url);
    return NextResponse.redirect(dest);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

```


## Refactor: apps/web/sentry.client.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/sentry.client.config.ts`

**File Content:**
```typescript
// [P0][OBS][SENTRY] Sentry client-side configuration
// Tags: P0, OBS, SENTRY
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust in production (e.g., 0.1 = 10%)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Note: if you want to override the automatic release value, do so here
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

    // Additional options
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // Network errors
      "NetworkError",
      "Failed to fetch",
    ],

    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
          frame.filename?.includes("extension://"),
        )
      ) {
        return null;
      }
      return event;
    },
  });
}

```


## Refactor: apps/web/sentry.edge.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/sentry.edge.config.ts`

**File Content:**
```typescript
// [P0][OBS][SENTRY] Sentry Edge Runtime configuration
// Tags: P0, OBS, SENTRY
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",
  });
}

```


## Refactor: apps/web/sentry.server.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/sentry.server.config.ts`

**File Content:**
```typescript
// [P0][OBS][SENTRY] Sentry server-side configuration
// Tags: P0, OBS, SENTRY
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust in production (e.g., 0.05 = 5%)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Note: if you want to override the automatic release value, do so here
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

    // Server-side error handling
    beforeSend(event, hint) {
      // Add server context
      if (event.request) {
        event.tags = {
          ...event.tags,
          server: "true",
        };
      }
      return event;
    },
  });
}

```


## Refactor: apps/web/src/__tests__/api-security.spec.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/api-security.spec.ts`

**File Content:**
```typescript
// [P0][TEST][AUTH] API authentication and authorization regression tests
// Tags: P0, TEST, AUTH
import { describe, test, expect } from "vitest";

/**
 * Security regression tests for API authentication and authorization
 * Tests for 401 (Unauthorized) and 403 (Forbidden) responses
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Mock session cookie for testing

describe("API Security Regression Tests", () => {
  describe("401 Unauthorized - No Session", () => {
    test("GET /api/items returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/items returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Item" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("GET /api/organizations returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/organizations returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Org" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("401 Unauthorized - Invalid Session", () => {
    test("GET /api/items returns 401 with invalid session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=invalid-cookie-value",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/items returns 401 with expired session", async () => {
      // Use a session cookie that would be expired
      const expiredCookie = "session=expired.session.cookie";

      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: expiredCookie,
        },
        body: JSON.stringify({ name: "Test Item" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("403 Forbidden - Missing 2FA", () => {
    test("POST /api/organizations returns 403 without 2FA claim", async () => {
      // This test assumes we have a session without MFA
      // In real scenario, you'd create a session for a user without 2FA enabled
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=no-mfa-session",
        },
        body: JSON.stringify({
          name: "Test Org",
          description: "Test organization",
        }),
      });

      // Should return either 401 (if session invalid) or 403 (if no 2FA)
      expect([401, 403]).toContain(response.status);
      const data = await response.json();
      expect(data.error).toMatch(/Unauthorized|Forbidden|2FA/i);
    });
  });

  describe("200 Success - Valid Authentication", () => {
    test("GET /api/health returns 200 without authentication", async () => {
      // Health endpoint should be public
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });

    test("POST /api/session with valid idToken creates session", async () => {
      // This is a mock test - in real scenario you'd use a valid Firebase token
      const mockIdToken = "mock-firebase-id-token";

      const response = await fetch(`${API_BASE}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: mockIdToken }),
      });

      // Will return 401 for invalid token in real scenario
      // But structure should be correct
      expect([200, 401]).toContain(response.status);
    });

    test("DELETE /api/session clears session cookie", async () => {
      const response = await fetch(`${API_BASE}/session`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);

      // Check that Set-Cookie header is present to clear the cookie
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        expect(setCookie).toContain("session=");
        expect(setCookie).toContain("Max-Age=0");
      }
    });
  });

  describe("Security Headers", () => {
    test("API responses include security headers", async () => {
      const response = await fetch(`${API_BASE}/health`);

      // Check for key security headers
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("x-frame-options")).toBeTruthy();
      expect(response.headers.get("referrer-policy")).toBeTruthy();
    });
  });

  describe("Rate Limiting", () => {
    test("API returns 429 after exceeding rate limit", async () => {
      // Make many rapid requests to trigger rate limit
      const requests = Array.from({ length: 110 }, () =>
        fetch(`${API_BASE}/health`, { method: "GET" }),
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0);

      if (rateLimited.length > 0) {
        const data = await rateLimited[0].json();
        expect(data.error).toMatch(/too many requests/i);

        // Should have retry-after header
        expect(rateLimited[0].headers.get("retry-after")).toBeTruthy();
      }
    }, 15000); // Increase timeout for this test
  });

  describe("Request Size Limit", () => {
    test("API rejects requests exceeding size limit", async () => {
      // Create a large payload (> 10MB if that's the limit)
      const largePayload = {
        name: "Test",
        data: "x".repeat(11 * 1024 * 1024), // 11MB of data
      };

      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(largePayload),
      });

      expect(response.status).toBe(413);
      const data = await response.json();
      expect(data.error).toMatch(/too large/i);
    });
  });
});

```


## Refactor: apps/web/src/__tests__/auth-helpers.spec.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/auth-helpers.spec.ts`

**File Content:**
```typescript
// [P0][AUTH][TEST] Auth Helpers Spec tests
// Tags: P0, AUTH, TEST
import * as firebaseAuth from 'firebase/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as helpers from '../lib/auth-helpers';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
  return {
    ...actual,
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    sendSignInLinkToEmail: vi.fn(),
    signInWithEmailLink: vi.fn(),
    getRedirectResult: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  
  // Mock indexedDB for pendingEmail.store
  const mockIDB = {
    open: vi.fn().mockResolvedValue({
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue(undefined),
          put: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  };
  (global as unknown as { indexedDB: typeof mockIDB }).indexedDB = mockIDB;
  
  type MockStorage = Map<string, string> & {
    getItem: (k: string) => string | undefined;
    setItem: (k: string, v: string) => void;
    removeItem: (k: string) => void;
  };
  
  const mockLocalStorage = new Map() as MockStorage;
  mockLocalStorage.getItem = (k: string) => mockLocalStorage.get(k);
  mockLocalStorage.setItem = (k: string, v: string) => mockLocalStorage.set(k, v);
  mockLocalStorage.removeItem = (k: string) => mockLocalStorage.delete(k);
  
  (global as unknown as { window: { location: Location; localStorage: MockStorage; prompt: typeof vi.fn } }).window = { 
    location: { href: 'http://localhost/auth/callback', origin: 'http://localhost' } as Location, 
    localStorage: mockLocalStorage,
    prompt: vi.fn(),
  };
});

describe('Google popup -> redirect fallback', () => {
  it('falls back to redirect on popup error', async () => {
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue(new Error('popup blocked'));
    vi.mocked(firebaseAuth.signInWithRedirect).mockResolvedValue(undefined as never);
    await expect(helpers.loginWithGoogleSmart()).resolves.toBeUndefined();
    expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
  });
});

describe('Email link completion', () => {
  it('prompts for email if not stored and link present', async () => {
    vi.mocked(firebaseAuth.isSignInWithEmailLink).mockReturnValue(true);
    vi.mocked(firebaseAuth.signInWithEmailLink).mockResolvedValue({} as firebaseAuth.UserCredential);
    vi.spyOn(window, 'prompt').mockReturnValue('user@test.com');
    await expect(helpers.completeEmailLinkIfPresent()).resolves.toBe(true);
  });
});

describe('Google redirect completion idempotent', () => {
  it('swallows duplicate getRedirectResult calls', async () => {
    vi.mocked(firebaseAuth.getRedirectResult).mockResolvedValueOnce({ user: { uid: '1' } } as firebaseAuth.UserCredential).mockResolvedValueOnce(null);
    const first = await helpers.completeGoogleRedirectOnce();
    const second = await helpers.completeGoogleRedirectOnce();
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});

```


## Refactor: apps/web/src/__tests__/login-page.spec.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/login-page.spec.tsx`

**File Content:**
```typescript
// [P1][OBSERVABILITY][LOGGING] Login Page Spec tests
// Tags: P1, OBSERVABILITY, LOGGING, TEST
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginPage from "../../app/(auth)/login/page";

describe("LoginPage", () => {
  it("renders controls", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
  });
});

```


## Refactor: apps/web/src/__tests__/mfa.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/mfa.test.ts`

**File Content:**
```typescript
// [P0][TEST][AUTH] MFA endpoint tests
// Tags: P0, TEST, AUTH, MFA
import { describe, test, expect } from "vitest";

/**
 * Tests for MFA endpoints:
 * - POST /api/auth/mfa/setup
 * - POST /api/auth/mfa/verify
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

describe("POST /api/auth/mfa/setup", () => {
  test("returns 401 without session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    const message = typeof data.error === "string" ? data.error : data.error?.message;
    expect(message).toContain("Unauthorized");
  });

  test("returns 401 with invalid session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=invalid",
      },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    const message = typeof data.error === "string" ? data.error : data.error?.message;
    expect(message).toContain("Unauthorized");
  });

  test.skip("returns 200 with valid session and generates TOTP secret", async () => {
    // This test requires a valid session cookie
    // Skip in CI unless Firebase emulator is running with test user

    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    if (!sessionCookie) return;

    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.secret).toBeTruthy();
    expect(data.qrCode).toBeTruthy();
    expect(data.otpauthUrl).toBeTruthy();

    // Verify QR code is base64 data URL
    expect(data.qrCode).toMatch(/^data:image\/png;base64,/);

    // Verify otpauth URL format
    expect(data.otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
  });
});

describe("POST /api/auth/mfa/verify", () => {
  test("returns 401 without session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "ABC123", token: "123456" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    const message = typeof data.error === "string" ? data.error : data.error?.message;
    expect(message).toContain("Unauthorized");
  });

  test("returns 400 for missing secret", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ token: "123456" }),
    });

    // Will return 401 due to invalid cookie, but validates schema first
    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test("returns 400 for missing token", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ secret: "ABC123" }),
    });

    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test("returns 400 for invalid token length", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ secret: "ABC123", token: "12345" }), // 5 digits instead of 6
    });

    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test.skip("returns 400 for invalid TOTP token", async () => {
    // This test requires a valid session cookie
    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    if (!sessionCookie) return;

    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
      body: JSON.stringify({ secret: "INVALIDSECRET", token: "000000" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid verification code");
  });

  test.skip("returns 200 and sets mfa claim for valid token", async () => {
    // This test requires:
    // 1. Valid session cookie
    // 2. Valid TOTP secret from setup
    // 3. Current TOTP token generated from that secret

    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    const totpSecret = process.env.TEST_TOTP_SECRET;
    const totpToken = process.env.TEST_TOTP_TOKEN; // Must be current 6-digit code

    if (!sessionCookie || !totpSecret || !totpToken) return;

    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
      body: JSON.stringify({ secret: totpSecret, token: totpToken }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("MFA enabled");
  });
});

```


## Refactor: apps/web/src/__tests__/middleware.spec.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/middleware.spec.ts`

**File Content:**
```typescript
// [P1][TEST][MIDDLEWARE] Middleware Spec middleware
// Tags: P1, TEST, MIDDLEWARE, TEST
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "../../middleware";

function req(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? ({ cookie } as HeadersInit) : undefined,
  });
}

describe("middleware", () => {
  it("exempts /auth/callback", () => {
    const res = middleware(req("/auth/callback"));
    expect(res).toBeTruthy(); // NextResponse.next()
  });

  it("blocks /dashboard without __session", () => {
    const res = middleware(req("/dashboard"));
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toContain("/login");
  });

  it("redirects /login to /dashboard if __session present", () => {
    const res = middleware(req("/login", "__session=x"));
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toContain("/dashboard");
  });
});

```


## Refactor: apps/web/src/__tests__/security.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/security.test.ts`

**File Content:**
```typescript
// [P1][TEST][API] Security regression tests for API endpoints
// Tags: P1, TEST, API
import { describe, expect, test } from "vitest";

/**
 * Security regression tests for authentication flows
 * Tests 401 (unauthorized), 403 (forbidden), and successful auth scenarios
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

describe("Security Regression Tests", () => {
  describe("Session Authentication (401 Tests)", () => {
    test("GET /api/items without session returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Unauthorized");
    });

    test("POST /api/items without session returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Item" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Unauthorized");
    });

    test("GET /api/organizations without session returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/organizations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Unauthorized");
    });

    test("POST /api/organizations without session returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Org" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Unauthorized");
    });

    test("Invalid session cookie returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=invalid-token-12345",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Unauthorized");
    });
  });

  describe("2FA Requirements (403 Tests)", () => {
    test("POST /api/organizations without 2FA returns 403", async () => {
      // This test assumes we have a valid session but no MFA
      // In a real test, you'd create a valid session first
      const response = await fetch(`${API_BASE_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // In real test: include valid session cookie without mfa claim
        },
        body: JSON.stringify({
          name: "Test Organization",
          description: "Test",
        }),
      });

      // Will be 401 in this test since no session, but shows the pattern
      expect([401, 403]).toContain(response.status);
    });
  });

  describe("Session Cookie Management", () => {
    test("POST /api/session with invalid token returns 401", async () => {
      const response = await fetch(`${API_BASE_URL}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: "invalid-firebase-token" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toBeDefined();
    });

    test("POST /api/session with missing token returns 400", async () => {
      const response = await fetch(`${API_BASE_URL}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      const message = typeof data.error === "string" ? data.error : data.error?.message;
      expect(message).toContain("Missing or invalid idToken");
    });

    test("DELETE /api/session clears session cookie", async () => {
      const response = await fetch(`${API_BASE_URL}/api/session`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);

      // Check that Set-Cookie header clears the session
      const setCookie = response.headers.get("set-cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("session=");
      expect(setCookie).toContain("Max-Age=0");
    });
  });

  describe("Security Headers", () => {
    test("API responses include security headers", async () => {
      // Test with health endpoint (no auth required)
      const response = await fetch(`${API_BASE_URL}/api/health`);

      expect(response.status).toBe(200);
      // Document what we expect in production
      // expect(response.headers.get("x-frame-options")).toBeTruthy();
      // expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      // expect(response.headers.get("referrer-policy")).toBeTruthy();
    });
  });

  describe("Rate Limiting", () => {
    test("Excessive requests should be rate limited", async () => {
      // Note: This test is expensive and should be skipped in CI unless specifically testing rate limits
      if (process.env.SKIP_RATE_LIMIT_TESTS === "true") {
        return;
      }

      const requests = [];
      // Make 150 rapid requests (assuming limit is 100/15min)
      for (let i = 0; i < 150; i++) {
        requests.push(
          fetch(`${API_BASE_URL}/api/health`, {
            method: "GET",
          }),
        );
      }

      const responses = await Promise.all(requests);

      // In production with rate limiting enabled, expect some 429s
      expect(responses.filter((r) => r.status === 429).length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout
  });

  describe("CORS", () => {
    test("OPTIONS request returns correct CORS headers", async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
        },
      });

      expect([200, 204]).toContain(response.status);
      // Document expected CORS headers
      // expect(response.headers.get("access-control-allow-origin")).toBeTruthy();
    });
  });

  describe("Request Size Limits", () => {
    test("should reject requests larger than size limit", async () => {
      // Note: This requires a valid session but tests size limit enforcement
      // Skip if SESSION_COOKIE not available
      if (!process.env.TEST_SESSION_COOKIE) {
        return;
      }

      await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${process.env.TEST_SESSION_COOKIE}`,
        },
        body: JSON.stringify({ data: "x".repeat(20 * 1024 * 1024) }), // 20MB
      });

      // Should be rejected by middleware before reaching handler
      // Note: This test may need adjustment based on actual size limit configuration
    });
  });
});

describe("Successful Authentication Scenarios", () => {
  // These tests require Firebase emulator and valid tokens
  // Skip if emulator not running
  const skipAuth = !process.env.FIRESTORE_EMULATOR_HOST;

  test.skipIf(skipAuth)("Valid session allows access to protected routes", async () => {
    // This test requires:
    // 1. Firebase emulator running
    // 2. Creating a test user
    // 3. Getting a valid ID token
    // 4. Creating a session
    // 5. Making authenticated requests

    // Placeholder for full integration test
    expect(true).toBe(true);
  });

  test.skipIf(skipAuth)("Valid session with MFA allows org creation", async () => {
    // This test requires:
    // 1. Valid session with mfa=true claim
    // 2. Attempting to create organization
    // 3. Verifying success

    // Placeholder for full integration test
    expect(true).toBe(true);
  });
});

```


## Refactor: apps/web/src/__tests__/session-api.spec.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/session-api.spec.ts`

**File Content:**
```typescript
// [P0][AUTH][SESSION] Session Api Spec tests
// Tags: P0, AUTH, SESSION, TEST
import { NextRequest } from "next/server";

// If you have the `@` alias configured (Next.js tsconfig paths), this should work:
import { POST } from "../../app/api/session/route";
// If that import fails, replace the line above with the relative path, e.g.:
// import { POST } from "../../app/api/session/route";

describe("/api/session", () => {
  it("rejects missing idToken", async () => {
    // Build a NextRequest with an empty JSON body (no idToken)
    const req = new NextRequest("http://localhost/api/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}), // intentionally missing idToken
    });

    const res = await POST(req);

    // Should be a 400 Bad Request
    expect(res.status).toBe(400);

    const json = await res.json();

    // New error shape: error is an OBJECT, not a string
    expect(json.error).toBeDefined();
    expect(typeof json.error).toBe("object");

    // We only assert on the message so we don't depend on exact code structure
    // (e.g. whether you use BAD_REQUEST, MISSING_ID_TOKEN, etc.)
    expect(json.error.message).toMatch(/missing idtoken/i);
  });
});

```


## Refactor: apps/web/src/__tests__/session.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/__tests__/session.test.ts`

**File Content:**
```typescript
// [P1][TEST][AUTH] Unit tests for session authentication endpoints
// Tags: P1, TEST, AUTH
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { describe, expect, test } from "vitest";

/**
 * Tests for /api/session endpoints (POST, DELETE)
 * Requires Firebase Admin SDK for creating test tokens
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Initialize Firebase Admin for test token generation
let testUid: string;
let testIdToken: string;

beforeAll(async () => {
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS
      ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
      : undefined;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  // Create a test user and generate an ID token
  // Note: This requires FIREBASE_ADMIN_CREDENTIALS to be set
  if (getApps().length > 0) {
    const auth = getAuth();
    testUid = `test-${Date.now()}`;

    try {
      // Create test user
      const userRecord = await auth.createUser({
        uid: testUid,
        email: `test-${testUid}@example.com`,
      });

      // Generate custom token and exchange for ID token (simplified for tests)
      const customToken = await auth.createCustomToken(userRecord.uid);
      testIdToken = customToken; // In real tests, exchange this for ID token
    } catch (error) {
      console.warn("Could not create test user:", error);
    }
  }
});

describe("POST /api/session", () => {
  test("returns 400 for missing idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing or invalid idToken");
  });

  test("returns 400 for invalid idToken type", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: 123 }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing or invalid idToken");
  });

  test("returns 401 for malformed idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "invalid.token.here" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Invalid token");
  });

  test.skipIf(!testIdToken)("returns 200 and sets session cookie for valid idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: testIdToken }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    // Check for session cookie
    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("session=");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
  });
});

describe("DELETE /api/session", () => {
  test("returns 200 and clears session cookie", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    // Check that session cookie is cleared (maxAge=0)
    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("session=");
    expect(setCookieHeader).toContain("Max-Age=0");
  });

  test("clears session cookie properties correctly", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "DELETE",
    });

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
    expect(setCookieHeader).toContain("Path=/");
  });
});

```


## Refactor: apps/web/src/components/auth/ProtectedRoute.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/components/auth/ProtectedRoute.tsx`

**File Content:**
```typescript
// [P0][AUTH][CODE] ProtectedRoute
// Tags: P0, AUTH, CODE
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, type ReactNode } from "react";

import { useAuth } from "../../lib/auth-context";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return React.createElement("div", { className: "p-6" }, "Loading…");
  return React.createElement(React.Fragment, null, children);
}

```


## Refactor: apps/web/src/lib/actionCodeSettings.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/actionCodeSettings.ts`

**File Content:**
```typescript
// [P0][APP][CODE] ActionCodeSettings
// Tags: P0, APP, CODE
import type { ActionCodeSettings } from "firebase/auth";

// Build a client-safe action code settings object.
// Uses a callback path that will complete sign-in and then establish a session if desired.
const origin = typeof window !== "undefined" ? window.location.origin : "";
export const actionCodeSettings: ActionCodeSettings = {
  url: `${origin}/auth/callback`,
  handleCodeInApp: true,
};

```


## Refactor: apps/web/src/lib/api/__tests__/security-integration.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/__tests__/security-integration.test.ts`

**File Content:**
```typescript
//[P1][API][TEST] Security integration tests
// Tags: test, security, integration, authorization, rate-limiting, csrf
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { requireOrgMembership, requireRole, canAccessResource } from "../authorization";
import { csrfProtection, generateCSRFToken } from "../csrf";
import { rateLimit, RateLimits } from "../rate-limit";

// Mock Firestore
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        where: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn(),
            })),
          })),
          limit: vi.fn(() => ({
            get: vi.fn(),
          })),
        })),
        limit: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
    })),
  })),
}));

describe("Security Integration Tests", () => {
  describe("Cross-Organization Access Control", () => {
    it("should deny access when user is not a member of the organization", async () => {
      // Mock user not being a member
      const { getFirestore } = await import("firebase-admin/firestore");
      const mockGet = vi.fn().mockResolvedValue({ empty: true });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(async (_request, context) => {
        return NextResponse.json({ success: true, orgId: context.orgId });
      });

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        headers: { "x-user-id": "user456" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("not a member");
    });

    it("should allow access when user is a member of the organization", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");
      const mockGet = vi.fn().mockResolvedValue({ empty: false });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(async (_request, context) => {
        return NextResponse.json({ success: true, orgId: context.orgId });
      });

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should use canAccessResource helper to check membership and role", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock membership exists
      const mockGetMembership = vi.fn().mockResolvedValue({ empty: false });
      // Mock role retrieval
      const mockGetRoles = vi.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ roles: ["admin"] }) }],
      });

      const mockGet = vi
        .fn()
        .mockResolvedValueOnce(mockGetMembership()) // isOrgMember call
        .mockResolvedValueOnce(mockGetRoles()); // getUserRoles call

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const result = await canAccessResource("user123", "org123", "staff");

      expect(result.allowed).toBe(true);
      expect(result.roles).toContain("admin");
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("should deny access when user role is insufficient", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock membership with staff role
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["staff"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("Requires admin");
    });

    it("should allow access when user has admin role", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["admin"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should allow access when user has org_owner role (highest privilege)", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["org_owner"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.roles).toContain("org_owner");
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      // Rate limiter uses in-memory storage, each test gets fresh state
    });

    it("should return 429 after exceeding rate limit", async () => {
      const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "192.168.1.100" },
      });

      // First two requests should succeed
      const response1 = await handler(request, { params: {} });
      expect(response1.status).toBe(200);

      const response2 = await handler(request, { params: {} });
      expect(response2.status).toBe(200);

      // Third request should be rate limited
      const response3 = await handler(request, { params: {} });
      expect(response3.status).toBe(429);

      const body = await response3.json();
      expect(body.error).toContain("Rate limit exceeded");
      expect(response3.headers.get("Retry-After")).toBeTruthy();
    });

    it("should include rate limit headers in response", async () => {
      const handler = rateLimit(RateLimits.WRITE)(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/write", {
        headers: { "x-forwarded-for": "192.168.1.101" },
      });

      const response = await handler(request, { params: {} });

      expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
      expect(response.headers.get("X-RateLimit-Remaining")).toBeTruthy();
      expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });
  });

  describe("CSRF Protection", () => {
    it("should reject POST request without CSRF token", async () => {
      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF token missing");
    });

    it("should reject POST request with mismatched CSRF tokens", async () => {
      const cookieToken = generateCSRFToken();
      const headerToken = generateCSRFToken();

      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: {
          cookie: `csrf-token=${cookieToken}`,
          "x-csrf-token": headerToken,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF token mismatch");
    });

    it("should allow POST request with matching CSRF tokens", async () => {
      const token = generateCSRFToken();

      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: {
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should allow GET request without CSRF token", async () => {
      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "GET",
      });

      const response = await handler(request, { params: {} });

      expect(response.status).toBe(200);
    });
  });

  describe("Combined Security Layers", () => {
    it("should apply all security layers in correct order", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock org membership with admin role
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["admin"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const token = generateCSRFToken();

      // Full security stack: rate limit -> CSRF -> org membership -> role check
      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(
          requireOrgMembership(
            requireRole("admin")(async (_request, context) => {
              return NextResponse.json({
                success: true,
                orgId: context.orgId,
                roles: context.roles,
              });
            }),
          ),
        ),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/update", {
        method: "POST",
        headers: {
          "x-user-id": "user123",
          "x-forwarded-for": "192.168.1.200",
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.orgId).toBe("org123");
      expect(body.roles).toContain("admin");

      // Verify rate limit headers are present
      expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
    });

    it("should fail at first security layer (rate limit)", async () => {
      const handler = rateLimit({ max: 1, windowSeconds: 60 })(
        csrfProtection()(async () => {
          return NextResponse.json({ success: true });
        }),
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.1.201" },
      });

      // First request uses up the limit
      await handler(request, { params: {} });

      // Second request should be rate limited (before CSRF check)
      const response = await handler(request, { params: {} });

      expect(response.status).toBe(429);
    });

    it("should fail at CSRF layer (after rate limit passes)", async () => {
      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(async () => {
          return NextResponse.json({ success: true });
        }),
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.1.202" },
        // No CSRF token
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF");
    });

    it("should fail at authorization layer (after rate limit and CSRF pass)", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock user NOT being a member
      const mockGet = vi.fn().mockResolvedValue({ empty: true });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const token = generateCSRFToken();

      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(
          requireOrgMembership(async (_request, context) => {
            return NextResponse.json({ success: true, orgId: context.orgId });
          }),
        ),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        method: "POST",
        headers: {
          "x-user-id": "user999",
          "x-forwarded-for": "192.168.1.203",
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("not a member");
    });
  });
});

```


## Refactor: apps/web/src/lib/api/__tests__/security.bench.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/__tests__/security.bench.ts`

**File Content:**
```typescript
// [P0][SECURITY][TEST] Security Bench tests
// Tags: P0, SECURITY, TEST

```


## Refactor: apps/web/src/lib/api/authorization.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/authorization.test.ts`

**File Content:**
```typescript
//[P1][API][TEST] Authorization middleware unit tests
// Tags: test, authorization, rbac, vitest
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

import {
  extractOrgId,
  isOrgMember,
  getUserRoles,
  hasRequiredRole,
  canAccessResource,
} from "./authorization";

// Mock Firestore
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        where: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn(),
            })),
          })),
          limit: vi.fn(() => ({
            get: vi.fn(),
          })),
        })),
        limit: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
    })),
  })),
}));

describe("extractOrgId", () => {
  it("should extract org ID from URL path", () => {
    const request = new NextRequest("http://localhost/api/organizations/org123");
    expect(extractOrgId(request)).toBe("org123");
  });

  it("should extract org ID from query params", () => {
    const request = new NextRequest("http://localhost/api/items?orgId=org456");
    expect(extractOrgId(request)).toBe("org456");
  });

  it("should return null if no org ID found", () => {
    const request = new NextRequest("http://localhost/api/items");
    expect(extractOrgId(request)).toBeNull();
  });
});

describe("hasRequiredRole", () => {
  it("should allow staff role for staff requirement", () => {
    expect(hasRequiredRole(["staff"], "staff")).toBe(true);
  });

  it("should allow admin role for staff requirement", () => {
    expect(hasRequiredRole(["admin"], "staff")).toBe(true);
  });

  it("should allow org_owner role for any requirement", () => {
    expect(hasRequiredRole(["org_owner"], "staff")).toBe(true);
    expect(hasRequiredRole(["org_owner"], "admin")).toBe(true);
  });

  it("should deny staff role for admin requirement", () => {
    expect(hasRequiredRole(["staff"], "admin")).toBe(false);
  });

  it("should allow user with multiple roles", () => {
    expect(hasRequiredRole(["staff", "admin"], "admin")).toBe(true);
    expect(hasRequiredRole(["staff", "scheduler"], "manager")).toBe(false);
  });

  it("should allow corporate role for staff requirement", () => {
    expect(hasRequiredRole(["corporate"], "staff")).toBe(true);
  });

  it("should deny corporate role for manager requirement", () => {
    expect(hasRequiredRole(["corporate"], "manager")).toBe(false);
  });

  it("should allow manager role for corporate requirement", () => {
    expect(hasRequiredRole(["manager"], "corporate")).toBe(true);
  });
});

describe("isOrgMember", () => {
  it("should return true when membership exists", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: false });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await isOrgMember("user123", "org123");
    expect(result).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith("memberships");
  });

  it("should return false when membership does not exist", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await isOrgMember("user123", "org123");
    expect(result).toBe(false);
  });
});

describe("getUserRoles", () => {
  it("should return user roles when membership exists", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ roles: ["admin", "staff"] }) }],
    });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await getUserRoles("user123", "org123");
    expect(result).toEqual(["admin", "staff"]);
  });

  it("should return null when membership does not exist", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await getUserRoles("user123", "org123");
    expect(result).toBeNull();
  });
});

describe("canAccessResource", () => {
  it("should allow access for valid member with sufficient role", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi
      .fn()
      .mockResolvedValueOnce({ empty: false }) // isOrgMember
      .mockResolvedValueOnce({
        // getUserRoles
        empty: false,
        docs: [{ data: () => ({ roles: ["admin"] }) }],
      });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await canAccessResource("user123", "org123", "staff");
    expect(result.allowed).toBe(true);
    expect(result.roles).toEqual(["admin"]);
  });

  it("should deny access for non-member", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await canAccessResource("user123", "org123", "staff");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Not a member of organization");
  });
});

```


## Refactor: apps/web/src/lib/api/authorization.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/authorization.ts`

**File Content:**
```typescript
//[P1][API][AUTH] Authorization and RBAC middleware (minimal)
// Tags: authorization, rbac, middleware, security

import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type OrgRole = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

export function extractOrgId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const orgIndex = pathParts.indexOf("organizations");
  if (orgIndex !== -1 && pathParts[orgIndex + 1]) return pathParts[orgIndex + 1];
  return url.searchParams.get("orgId");
}

export function requireOrgMembership(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string; orgId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> | Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });

    const orgId = extractOrgId(request);
    if (!orgId)
      return NextResponse.json(
        { error: "Bad Request - No organization ID provided" },
        { status: 400 },
      );

    // Resolve params if it's a Promise (Next.js 14+)
    const resolvedParams = await Promise.resolve(context.params);

    // NOTE: In a full implementation, verify membership in Firestore here.
    return handler(request, { params: resolvedParams, userId, orgId });
  };
}

export function requireRole(requiredRole: OrgRole) {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string; roles: OrgRole[] },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: {
        params: Record<string, string> | Promise<Record<string, string>>;
        userId: string;
        orgId: string;
      },
    ): Promise<NextResponse> => {
      // Minimal: read roles from header for now (e.g., "x-roles: admin,manager")
      const rolesHeader = request.headers.get("x-roles") || "";
      const roles = rolesHeader
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean) as OrgRole[];

      const userLevel = roles.length ? Math.max(...roles.map((r) => hierarchy.indexOf(r))) : -1;
      const requiredLevel = hierarchy.indexOf(requiredRole);
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `Forbidden - Requires ${requiredRole} role or higher` },
          { status: 403 },
        );
      }

      // Resolve params if it's a Promise (Next.js 14+)
      const resolvedParams = await Promise.resolve(context.params);

      return handler(request, {
        params: resolvedParams,
        userId: context.userId,
        orgId: context.orgId,
        roles,
      });
    };
  };
}

// Pure helper: determine if any of the user's roles satisfies the required role by hierarchy
export function hasRequiredRole(userRoles: OrgRole[], requiredRole: OrgRole): boolean {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  const userLevel = userRoles.length ? Math.max(...userRoles.map((r) => hierarchy.indexOf(r))) : -1;
  const requiredLevel = hierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

// Data access: check if a membership document exists for the user in the org
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const db = getFirestore();
  const snapshot = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();
  return !snapshot.empty;
}

// Data access: retrieve user roles from the membership document
export async function getUserRoles(userId: string, orgId: string): Promise<OrgRole[] | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data() as { roles?: OrgRole[] };
  return (data.roles || []) as OrgRole[];
}

// High-level helper: check access combining membership and role requirement
export async function canAccessResource(
  userId: string,
  orgId: string,
  requiredRole: OrgRole,
): Promise<{ allowed: boolean; roles?: OrgRole[]; reason?: string }> {
  const member = await isOrgMember(userId, orgId);
  if (!member) return { allowed: false, reason: "Not a member of organization" };
  const roles = (await getUserRoles(userId, orgId)) || [];
  const allowed = hasRequiredRole(roles, requiredRole);
  if (!allowed) return { allowed: false, roles, reason: `Requires ${requiredRole} role or higher` };
  return { allowed: true, roles };
}

```


## Refactor: apps/web/src/lib/api/csrf.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/csrf.test.ts`

**File Content:**
```typescript
//[P1][API][TEST] CSRF protection middleware unit tests
// Tags: test, csrf, security, vitest

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect } from "vitest";

import { generateCSRFToken, verifyCSRFToken, csrfProtection } from "./csrf";

describe("generateCSRFToken", () => {
  it("should generate token of correct length", () => {
    const token = generateCSRFToken(32);
    const decoded = Buffer.from(token, "base64url");
    expect(decoded.length).toBe(32);
  });

  it("should generate unique tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});

describe("verifyCSRFToken", () => {
  it("should return true for matching tokens", () => {
    const token = generateCSRFToken();
    expect(verifyCSRFToken(token, token)).toBe(true);
  });

  it("should return false for different tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(verifyCSRFToken(token1, token2)).toBe(false);
  });

  it("should return false for empty tokens", () => {
    expect(verifyCSRFToken("", "")).toBe(false);
    expect(verifyCSRFToken("token", "")).toBe(false);
    expect(verifyCSRFToken("", "token")).toBe(false);
  });

  it("should return false for tokens of different lengths", () => {
    expect(verifyCSRFToken("short", "muchchchchlonger")).toBe(false);
  });
});

describe("csrfProtection", () => {
  it("should allow GET requests without CSRF token", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should allow HEAD requests without CSRF token", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "HEAD",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should reject POST without CSRF cookie", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token missing from cookie");
  });

  it("should reject POST without CSRF header", async () => {
    const token = generateCSRFToken();
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `csrf-token=${token}`,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token missing from");
  });

  it("should reject POST with mismatched CSRF tokens", async () => {
    const cookieToken = generateCSRFToken();
    const headerToken = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = {
      method: "POST",
      headers: new Headers({
        cookie: `csrf-token=${cookieToken}`,
        "x-csrf-token": headerToken,
      }),
      cookies: { get: (_name: string) => ({ value: cookieToken }) },
    } as unknown as NextRequest;
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token mismatch");
  });

  it("should allow POST with matching CSRF tokens", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = {
      method: "POST",
      headers: new Headers({
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      }),
      cookies: { get: (_name: string) => ({ value: token }) },
    } as unknown as NextRequest;
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should protect PUT requests", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = {
      method: "PUT",
      headers: new Headers({
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      }),
      cookies: { get: (_name: string) => ({ value: token }) },
    } as unknown as NextRequest;
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should protect DELETE requests", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = {
      method: "DELETE",
      headers: new Headers({
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      }),
      cookies: { get: (_name: string) => ({ value: token }) },
    } as unknown as NextRequest;
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should use custom cookie and header names", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection({
      cookieName: "custom-csrf",
      headerName: "x-custom-csrf",
    })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = {
      method: "POST",
      headers: new Headers({
        cookie: `custom-csrf=${token}`,
        "x-custom-csrf": token,
      }),
      cookies: { get: (_name: string) => ({ value: token }) },
    } as unknown as NextRequest;
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });
});

```


## Refactor: apps/web/src/lib/api/csrf.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/csrf.ts`

**File Content:**
```typescript
//[P1][API][SECURITY] CSRF protection middleware
// Tags: csrf, security, double-submit-cookie

import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface CSRFConfig {
  cookieName?: string;
  headerName?: string;
  tokenLength?: number;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
  };
}

const DEFAULT_CONFIG: Required<CSRFConfig> = {
  cookieName: "csrf-token",
  headerName: "x-csrf-token",
  tokenLength: 32,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400,
  },
};

export function generateCSRFToken(length: number = 32): string {
  return randomBytes(length).toString("base64url");
}

export function verifyCSRFToken(token1: string, token2: string): boolean {
  if (!token1 || !token2 || token1.length !== token2.length) return false;
  try {
    const buffer1 = Buffer.from(token1);
    const buffer2 = Buffer.from(token2);
    return timingSafeEqual(buffer1, buffer2);
  } catch {
    return false;
  }
}

function extractTokenFromRequest(request: NextRequest, headerName: string): string | null {
  const headerToken = request.headers.get(headerName);
  if (headerToken) return headerToken;
  return null;
}

export function setCSRFCookie(
  response: NextResponse,
  token: string,
  config: Required<CSRFConfig> = DEFAULT_CONFIG,
): void {
  const { cookieName, cookieOptions } = config;
  const cookieValue = [
    `${cookieName}=${token}`,
    `Path=/`,
    `Max-Age=${cookieOptions.maxAge}`,
    `SameSite=${cookieOptions.sameSite}`,
    cookieOptions.httpOnly ? "HttpOnly" : "",
    cookieOptions.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  response.headers.set("Set-Cookie", cookieValue);
}

export function csrfProtection<Ctx extends Record<string, unknown> = {}>(config: CSRFConfig = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  type C = Ctx & { params: Record<string, string> };
  return function (handler: (request: NextRequest, context: C) => Promise<NextResponse>) {
    return async (request: NextRequest, context: C): Promise<NextResponse> => {
      const method = request.method.toUpperCase();
      if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return handler(request, context);
      }

      // Simplified extraction: prefer the public cookies API when available,
      // otherwise fall back to the Cookie header. Avoid inspecting internal
      // runtime properties to stay compatible across Next.js runtimes.
      let cookieToken: string | null = null;

      try {
        // runtime may expose request.cookies.get(name)
        const maybeCookies = (
          request as unknown as { cookies?: { get?: (name: string) => { value?: string } } }
        ).cookies;
        if (maybeCookies && typeof maybeCookies.get === "function") {
          cookieToken = maybeCookies.get(fullConfig.cookieName)?.value ?? null;
        }
      } catch {
        // ignore and fall back to header parsing
      }

      if (!cookieToken) {
        const cookiesHeader = request.headers.get("cookie") || "";
        const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
        cookieToken = cookieMatch?.[1] ?? null;
      }

      if (!cookieToken) {
        return NextResponse.json(
          { error: "Forbidden - CSRF token missing from cookie", code: "CSRF_COOKIE_MISSING" },
          { status: 403 },
        );
      }

      const requestToken = extractTokenFromRequest(request, fullConfig.headerName);
      if (!requestToken) {
        return NextResponse.json(
          {
            error: `Forbidden - CSRF token missing from ${fullConfig.headerName} header`,
            code: "CSRF_HEADER_MISSING",
          },
          { status: 403 },
        );
      }

      if (!verifyCSRFToken(cookieToken, requestToken)) {
        return NextResponse.json(
          { error: "Forbidden - CSRF token mismatch", code: "CSRF_TOKEN_INVALID" },
          { status: 403 },
        );
      }

      return handler(request, context);
    };
  };
}

export function withCSRFToken<Ctx extends Record<string, unknown> = {}>(
  handler: (
    request: NextRequest,
    context: Ctx & { params: Record<string, string> },
  ) => Promise<NextResponse>,
  config: CSRFConfig = {},
): (
  request: NextRequest,
  context: Ctx & { params: Record<string, string> },
) => Promise<NextResponse> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return async (
    request: NextRequest,
    context: Ctx & { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Prefer the public cookies API when available; otherwise fallback to Cookie header.
    let token: string | null = null;
    try {
      const maybeCookies = (
        request as unknown as { cookies?: { get?: (name: string) => { value?: string } } }
      ).cookies;
      if (maybeCookies && typeof maybeCookies.get === "function") {
        token = maybeCookies.get(fullConfig.cookieName)?.value ?? null;
      }
    } catch {
      // ignore and fall back
    }

    if (!token) {
      const cookiesHeader = request.headers.get("cookie") || "";
      const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
      token = cookieMatch?.[1] ?? null;
    }

    const hadCookie = token != null;
    if (!token) token = generateCSRFToken(fullConfig.tokenLength);
    const response = await handler(request, context);
    if (!hadCookie) {
      setCSRFCookie(response, token, fullConfig);
    }
    return response;
  };
}

export const verifyCsrf = verifyCSRFToken;
export const withCsrf = csrfProtection;

```


## Refactor: apps/web/src/lib/api/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/index.ts`

**File Content:**
```typescript
// [P1][API][CODE] Index
// Tags: P1, API, CODE
// Central API exports for consistent imports across routes
export * from "./session";
export * from "./authorization";
export * from "./csrf";
export { default as redisAdapter } from "./redis";
export { createRedisRateLimit } from "./redis-rate-limit";

import redisAdapter from "./redis";
import type { RateLimitConfig } from "./redis-rate-limit";
import { createRedisRateLimit } from "./redis-rate-limit";

/**
 * Convenience factory: create a rate limiter using the shared redis adapter
 */
export function createRateLimiter(config: RateLimitConfig) {
  return createRedisRateLimit(redisAdapter, config);
}

```


## Refactor: apps/web/src/lib/api/rate-limit.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/rate-limit.test.ts`

**File Content:**
```typescript
//[P1][API][TEST] Rate limiting middleware unit tests
// Tags: test, rate-limiting, security, vitest

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect, beforeEach } from "vitest";

import { rateLimit, RateLimits } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Rate limiter uses in-memory storage, so tests are isolated
  });

  it("should allow requests within limit", async () => {
    const handler = rateLimit({ max: 3, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.1" },
    });

    // First request should succeed
    const response1 = await handler(request, { params: {} });
    expect(response1.status).toBe(200);
    expect(response1.headers.get("X-RateLimit-Remaining")).toBe("2");

    // Second request should succeed
    const response2 = await handler(request, { params: {} });
    expect(response2.status).toBe(200);
    expect(response2.headers.get("X-RateLimit-Remaining")).toBe("1");

    // Third request should succeed
    const response3 = await handler(request, { params: {} });
    expect(response3.status).toBe(200);
    expect(response3.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("should rate limit after exceeding max requests", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.2" },
    });

    // First two requests succeed
    await handler(request, { params: {} });
    await handler(request, { params: {} });

    // Third request should be rate limited
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.error).toContain("Rate limit exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  it("should use different limits for different IPs", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request1 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.3" },
    });

    const request2 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.4" },
    });

    // Use up IP1's limit
    await handler(request1, { params: {} });
    await handler(request1, { params: {} });

    // IP1 should be rate limited
    const response1 = await handler(request1, { params: {} });
    expect(response1.status).toBe(429);

    // IP2 should still be allowed
    const response2 = await handler(request2, { params: {} });
    expect(response2.status).toBe(200);
  });

  it("should include user ID in rate limit key when authenticated", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "192.168.1.5",
        "x-user-id": "user123",
      },
    });

    // Use up limit
    await handler(request, { params: {} });
    await handler(request, { params: {} });

    // Should be rate limited
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(429);
  });

  it("should use custom key generator", async () => {
    const handler = rateLimit({
      max: 2,
      windowSeconds: 60,
      keyGenerator: () => "custom-key",
    })(async () => {
      return NextResponse.json({ success: true });
    });

    const request1 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.6" },
    });

    const request2 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.7" },
    });

    // Both requests use same key, so they share the limit
    await handler(request1, { params: {} });
    await handler(request2, { params: {} });

    // Third request from either IP should be rate limited
    const response = await handler(request1, { params: {} });
    expect(response.status).toBe(429);
  });

  describe("RateLimits presets", () => {
    it("should have STRICT preset", () => {
      expect(RateLimits.STRICT).toEqual({ max: 10, windowSeconds: 60 });
    });

    it("should have STANDARD preset", () => {
      expect(RateLimits.STANDARD).toEqual({ max: 100, windowSeconds: 60 });
    });

    it("should have AUTH preset", () => {
      expect(RateLimits.AUTH).toEqual({ max: 5, windowSeconds: 60 });
    });

    it("should have WRITE preset", () => {
      expect(RateLimits.WRITE).toEqual({ max: 30, windowSeconds: 60 });
    });
  });
});

```


## Refactor: apps/web/src/lib/api/rate-limit.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/rate-limit.ts`

**File Content:**
```typescript
//[P1][API][SECURITY] Rate limiting middleware (in-memory)
// Tags: rate-limiting, security, dos-protection

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowSeconds * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }

    if (entry.count >= max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    this.requests.set(key, entry);
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }
}

const limiter = new InMemoryRateLimiter();
setInterval(() => limiter.cleanup(), 60000);

function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return `${request.nextUrl.pathname}:${ip}`;
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimits.default,
): Promise<NextResponse | null> {
  const keyFn = config.keyGenerator ?? defaultKeyGenerator;
  const key = keyFn(request);

  const result = await limiter.checkLimit(key, config.max, config.windowSeconds);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.max.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetAt.toString(),
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  return null;
}

export const RateLimits = {
  default: { max: 60, windowSeconds: 60 },
  strict: { max: 10, windowSeconds: 60 },
  auth: { max: 5, windowSeconds: 300 },
  api: { max: 100, windowSeconds: 60 },
};

```


## Refactor: apps/web/src/lib/api/redis-rate-limit.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/redis-rate-limit.ts`

**File Content:**
```typescript
//[P0][API][SECURITY] Redis-based rate limiting for production
// Tags: rate-limiting, security, redis, production, horizontal-scaling

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

export class RedisRateLimiter {
  constructor(private redis: RedisClient) {}

  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const rateLimitKey = `rate_limit:${key}`;
    try {
      const count = await this.redis.incr(rateLimitKey);
      if (count === 1) {
        await this.redis.expire(rateLimitKey, windowSeconds);
      }
      const ttl = await this.redis.ttl(rateLimitKey);
      const resetAt = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);
      if (count > max) {
        return { allowed: false, remaining: 0, resetAt };
      }
      return { allowed: true, remaining: max - count, resetAt };
    } catch {
      // Fail closed: block request if Redis is down
      return { allowed: false, remaining: 0, resetAt: now + windowSeconds * 1000 };
    }
  }
}

function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `${ip}:${userId}` : ip;
}

export function createRedisRateLimit(redis: RedisClient, config: RateLimitConfig) {
  const { max, windowSeconds, keyGenerator = defaultKeyGenerator } = config;
  const limiter = new RedisRateLimiter(redis);
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> },
  ): Promise<NextResponse | null> {
    const key = keyGenerator(request);
    const result = await limiter.checkLimit(key, max, windowSeconds);
    if (!result.allowed) {
      const resetDate = new Date(result.resetAt).toISOString();
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            details: {
              retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
              resetAt: resetDate,
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetDate,
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        },
      );
    }
    return null;
  };
}

export class UpstashRedisAdapter implements RedisClient {
  constructor(
    private client: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<unknown>;
      ttl: (key: string) => Promise<number>;
    },
  ) {}
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }
}

```


## Refactor: apps/web/src/lib/api/redis.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/redis.ts`

**File Content:**
```typescript
//[P0][API][INFRA] Shared Redis adapter singleton
// Tags: redis, upstash, ioredis, adapter
/**
 * @fileoverview
 * Provides a singleton Redis adapter for rate limiting and caching.
 * Attempts Upstash REST client first, falls back to ioredis or in-memory storage.
 */

type SimpleRedisClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
};

// In-memory fallback for local development and builds. Not suitable for production.
const memoryMap = new Map<string, { count: number; resetAt: number }>();
const memoryAdapter: SimpleRedisClient = {
  async incr(key: string) {
    const now = Date.now();
    const entry = memoryMap.get(key);
    if (!entry || entry.resetAt < now) {
      const resetAt = now + 60 * 1000;
      memoryMap.set(key, { count: 1, resetAt });
      return 1;
    }
    entry.count++;
    memoryMap.set(key, entry);
    return entry.count;
  },
  async expire(key: string, seconds: number) {
    const entry = memoryMap.get(key);
    if (entry) entry.resetAt = Date.now() + seconds * 1000;
  },
  async ttl(key: string) {
    const entry = memoryMap.get(key);
    if (!entry) return -2; // key does not exist
    const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  },
};

// Use in-memory adapter by default; will be replaced at runtime if Redis is available
let adapter: SimpleRedisClient = memoryAdapter;

// Initialize Redis adapter at runtime (not at build time)
// This avoids static module resolution issues during Next.js builds
async function initializeRedisAdapter() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      // Dynamic import to avoid build-time static resolution. Use an indirect
      // dynamic import (via Function) so Turbopack/Next doesn't statically
      // analyze the literal package name and fail the build when package is
      // absent in the project graph.

      // @ts-ignore - optional dependency
      const dynamicImport = new Function("pkg", "return import(pkg)");
      // @ts-ignore
      const upstashModule = await dynamicImport("@upstash/redis");
      const { Redis } = upstashModule;
      const client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      adapter = {
        async incr(key: string) {
          const res = await client.incr(key);
          return typeof res === "number" ? res : Number(res);
        },
        async expire(key: string, seconds: number) {
          await client.expire(key, seconds);
        },
        async ttl(key: string) {
          const res = await client.ttl(key);
          return typeof res === "number" ? res : Number(res);
        },
      };
      return;
    } catch {
      // Fall through to next option if package not found
    }
  }

  if (process.env.REDIS_URL) {
    try {
      // Dynamic import via Function to avoid static analysis by Turbopack

      // @ts-ignore - optional dependency
      const dynamicImport = new Function("pkg", "return import(pkg)");
      // @ts-ignore
      const ioredisModule = await dynamicImport("ioredis");
      const IORedis = ioredisModule.default || ioredisModule;
      const client = new IORedis(process.env.REDIS_URL);
      adapter = {
        async incr(key: string) {
          return await client.incr(key);
        },
        async expire(key: string, seconds: number) {
          await client.expire(key, seconds);
        },
        async ttl(key: string) {
          return await client.ttl(key);
        },
      };
      return;
    } catch {
      // Fall through to in-memory fallback if package not found
    }
  }

  // Using in-memory fallback
  console.warn(
    "No Redis configuration found — using in-memory fallback. Configure UPSTASH_REDIS_REST_URL+TOKEN or REDIS_URL for production.",
  );
}

// Initialize on first import (only in Node.js runtime, not at build time)
if (typeof window === "undefined" && process.env.NODE_ENV !== "development") {
  initializeRedisAdapter().catch((err) => {
    console.error("Failed to initialize Redis adapter:", err);
  });
}

export default adapter;
//[P0][API][SECURITY] Shared Redis client and rate limiter factory
// Tags: redis, rate-limiting, upstash, production, singleton

import { NextRequest, NextResponse } from "next/server";

import { UpstashRedisAdapter, type RedisClient, createRedisRateLimit } from "./redis-rate-limit";

// Minimal Upstash REST client implementing only incr/expire/ttl
class UpstashRestClient implements RedisClient {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async exec<T = unknown>(command: string, ...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) {
      throw new Error(`Upstash request failed: ${res.status}`);
    }
    const json = (await res.json()) as { result: T };
    return json.result;
  }

  async incr(key: string): Promise<number> {
    return await this.exec<number>("INCR", key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.exec<number>("EXPIRE", key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.exec<number>("TTL", key);
  }
}

// Singleton adapter (Upstash if configured)
let singletonAdapter: RedisClient | null = null;
function _getRedisAdapter(): RedisClient | null {
  if (singletonAdapter) return singletonAdapter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const client = new UpstashRestClient(url, token);
    singletonAdapter = new UpstashRedisAdapter(client);
  } else {
    singletonAdapter = null;
  }
  return singletonAdapter;
}

export type RateLimitConfig = {
  max: number;
  windowSeconds: number;
};

// In-memory fallback limiter (scoped per process)
class InMemoryLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, max: number, windowSeconds: number) {
    const now = Date.now();
    const entry = this.requests.get(key);
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowSeconds * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }
    if (entry.count >= max) return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    entry.count++;
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }
}

const localLimiter = new InMemoryLimiter();

function defaultKey(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `${ip}:${userId}` : ip;
}

// Factory returning an inline check: await rateLimit(req, ctx) -> NextResponse | null
export function createRateLimiter(config: RateLimitConfig) {
  // Use the module-scoped adapter singleton (handles Upstash, ioredis, or in-memory fallback)
  const redisAdapter = singletonAdapter;
  if (redisAdapter) {
    const limiter = createRedisRateLimit(redisAdapter, config);
    return limiter; // (req, ctx) => Promise<NextResponse|null>
  }
  // Fallback to in-memory per-instance limiter. Accepts ctx.params as Promise|Record
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> | Promise<Record<string, string>> },
  ): Promise<NextResponse | null> {
    const resolvedParams = await Promise.resolve(_context.params);
    // resolvedParams currently unused in the in-memory fallback, but we await it
    // to ensure the handler matches Next.js 14+/16+ signatures and avoid type errors.
    void resolvedParams;

    const { max, windowSeconds } = config;
    const key = defaultKey(request);
    const result = await localLimiter.check(key, max, windowSeconds);
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          },
        },
      );
    }
    return null;
  };
}

```


## Refactor: apps/web/src/lib/api/sanitize.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/sanitize.ts`

**File Content:**
```typescript
//[P1][API][SECURITY] Input sanitization utilities
// Tags: sanitization, xss-prevention, security

export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export function sanitizeText(text: string): string {
  return escapeHtml(stripHtmlTags(text));
}

export function sanitizeUrl(url: string): string {
  try {
    // For relative URLs, provide a dummy base. If url is absolute, it's used as-is.
    // This allows us to consistently parse both absolute and relative URLs.
    const parsedUrl = new URL(url, "https://example.com");
    const safeProtocols = ["https:", "http:", "mailto:"];

    // If the protocol is not in the safe list, reject the URL.
    // This handles protocols like javascript:, data:, vbscript:, file:, etc.
    if (!safeProtocols.includes(parsedUrl.protocol)) {
      return "about:blank";
    }
  } catch {
    // The URL is malformed, which could be an attack attempt.
    return "about:blank";
  }

  return url;
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { skipFields?: string[]; urlFields?: string[] } = {},
): T {
  const { skipFields = [], urlFields = [] } = options;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] = urlFields.includes(key) ? sanitizeUrl(value) : sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

```


## Refactor: apps/web/src/lib/api/schedules.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/schedules.ts`

**File Content:**
```typescript
// [P0][API][CODE] Schedules
// Tags: P0, API, CODE
import { collection, doc, getDocs, query, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../../../app/lib/firebaseClient";

type CreateScheduleArgs = { orgId: string; startDate: string; endDate: string };
type PublishArgs = { orgId: string; scheduleId: string };
type AddShiftArgs = {
  orgId: string;
  scheduleId: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
};
type ListArgs = { orgId: string; scheduleId: string; startISO: string; endISO: string };

interface Shift {
  id: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
  createdAt: unknown;
}

export async function createWeekOrMonth({ orgId, startDate, endDate }: CreateScheduleArgs) {
  if (!db)
    throw new Error(
      "Firestore database is not initialized. Check your Firebase configuration and NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  const ref = doc(collection(db, `organizations/${orgId}/schedules`));
  await setDoc(ref, { startDate, endDate, createdAt: serverTimestamp(), state: "draft" });
  return { scheduleId: ref.id };
}

export async function addShift({ orgId, scheduleId, userId, role, startTs, endTs }: AddShiftArgs) {
  if (!db) throw new Error("Firestore database is not initialized");
  const ref = doc(collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const body = { userId, role, startTs, endTs, createdAt: serverTimestamp() };
  await setDoc(ref, body);
  return { id: ref.id, ...body };
}

export async function listShiftsForRange({ orgId, scheduleId, startISO, endISO }: ListArgs) {
  // Basic: fetch all and filter client-side. For prod, add composite indexes and range query.
  if (!db) throw new Error("Firestore database is not initialized");
  const qs = query(collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const snap = await getDocs(qs);
  const rows: Shift[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Shift);
  return rows.filter((s) => s.startTs >= startISO && s.startTs <= endISO);
}

export async function publishSchedule({ orgId, scheduleId }: PublishArgs) {
  if (!db) throw new Error("Firestore database is not initialized");
  const scheduleRef = doc(db, `organizations/${orgId}/schedules/${scheduleId}`);
  await setDoc(
    scheduleRef,
    { state: "published", publishedAt: serverTimestamp() },
    { merge: true },
  );

  // Create in-app message
  const msgRef = doc(collection(db, `organizations/${orgId}/messages`));
  await setDoc(msgRef, {
    type: "publish_notice",
    title: "Schedule Published",
    body: "The latest schedule has been published. Check your shifts.",
    targets: "members",
    recipients: [], // members implied by targets
    scheduleId,
    createdAt: serverTimestamp(),
  });

  // OPTIONAL: trigger FCM via callable function or HTTP (not included here)
  return { ok: true };
}

```


## Refactor: apps/web/src/lib/api/session.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/session.ts`

**File Content:**
```typescript
//[P1][API][AUTH] Next.js-compatible session authentication middleware
// Tags: session, jwt, nextjs, firebase, security

import { getAuth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Require a valid Firebase session cookie (JWT)
 * Usage: Wrap API route handlers to enforce authentication
 */
export function requireSession(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Get session cookie from Next.js request cookies
    const cookie = request.cookies.get("session")?.value;
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 });
    }
    let decoded;
    try {
      const auth = getAuth();
      decoded = await auth.verifySessionCookie(cookie, true);
    } catch {
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 });
    }
    // Set x-user-id header for downstream middleware
    const modifiedRequest = new NextRequest(request.url, request);
    modifiedRequest.headers.set("x-user-id", decoded.uid);
    return handler(modifiedRequest, { ...context, userId: decoded.uid });
  };
}

```


## Refactor: apps/web/src/lib/api/validation.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/validation.test.ts`

**File Content:**
```typescript
//[P1][API][TEST] Validation middleware unit tests
// Tags: test, validation, api, vitest

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  ValidationError,
  validateRequest,
  validateQuery,
  withValidation,
  validatePagination,
  validateSorting,
  validateDateRange,
} from "./validation";

describe("ValidationError", () => {
  it("should create error with field-level messages", () => {
    const error = new ValidationError({
      name: ["Name is required"],
      email: ["Email is invalid", "Email already exists"],
    });

    expect(error.name).toBe("ValidationError");
    expect(error.statusCode).toBe(422);
    expect(error.fields).toEqual({
      name: ["Name is required"],
      email: ["Email is invalid", "Email already exists"],
    });
  });

  it("should serialize to JSON", () => {
    const error = new ValidationError({ name: ["Required"] });
    const json = error.toJSON();

    expect(json).toEqual({
      error: "Validation failed",
      fields: { name: ["Required"] },
      statusCode: 422,
    });
  });
});

describe("validateRequest", () => {
  const testSchema = z.object({
    name: z.string().min(3),
    age: z.number().int().positive(),
  });

  it("should validate valid request body", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "John", age: 30 }),
    });

    const result = await validateRequest(request, testSchema);

    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should reject non-JSON content type", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not json",
    });

    await expect(validateRequest(request, testSchema)).rejects.toThrow(ValidationError);

    try {
      await validateRequest(request, testSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(415);
        expect(error.fields._root).toContain("Content-Type must be application/json");
      }
    }
  });

  it("should reject invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not valid json",
    });

    await expect(validateRequest(request, testSchema)).rejects.toThrow(ValidationError);

    try {
      await validateRequest(request, testSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(400);
        expect(error.fields._root).toContain("Invalid JSON in request body");
      }
    }
  });

  it("should reject body failing schema validation", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "AB", age: -5 }),
    });

    try {
      await validateRequest(request, testSchema);
      expect.fail("Should have thrown ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(422);
        expect(error.fields.name).toBeDefined();
        expect(error.fields.age).toBeDefined();
      }
    }
  });

  it("should reject oversized request body", async () => {
    const largeBody = "x".repeat(2 * 1024 * 1024); // 2MB
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(largeBody.length),
      },
      body: largeBody,
    });

    try {
      await validateRequest(request, testSchema);
      expect.fail("Should have thrown ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(413);
        expect(error.fields._root?.[0]).toContain("Request body too large");
      }
    }
  });
});

describe("validateQuery", () => {
  const querySchema = z.object({
    page: z.coerce.number().int().positive(),
    search: z.string().optional(),
  });

  it("should validate valid query parameters", () => {
    const request = new NextRequest("http://localhost/api/test?page=2&search=hello");

    const result = validateQuery(request, querySchema);

    expect(result).toEqual({ page: 2, search: "hello" });
  });

  it("should coerce string numbers to numbers", () => {
    const request = new NextRequest("http://localhost/api/test?page=5");

    const result = validateQuery(request, querySchema);

    expect(result.page).toBe(5);
    expect(typeof result.page).toBe("number");
  });

  it("should reject invalid query parameters", () => {
    const request = new NextRequest("http://localhost/api/test?page=invalid");

    expect(() => validateQuery(request, querySchema)).toThrow(ValidationError);

    try {
      validateQuery(request, querySchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(422);
        expect(error.fields.page).toBeDefined();
      }
    }
  });
});

describe("withValidation", () => {
  const testSchema = z.object({
    message: z.string(),
  });

  it("should pass validated data to handler", async () => {
    const handler = withValidation(testSchema, async (_request, data) => {
      return NextResponse.json({ received: data.message });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    });

    const response = await handler(request);
    const body = await response.json();

    expect(body).toEqual({ received: "hello" });
  });

  it("should return validation error response", async () => {
    const handler = withValidation(testSchema, async (_request, data) => {
      return NextResponse.json({ received: data.message });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: 123 }), // wrong type
    });

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Validation failed");
    expect(body.fields).toBeDefined();
  });
});

describe("validatePagination", () => {
  it("should validate and return pagination params", () => {
    const request = new NextRequest("http://localhost/api/test?page=3&limit=50");

    const result = validatePagination(request);

    expect(result).toEqual({ page: 3, limit: 50 });
  });

  it("should apply defaults for missing params", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validatePagination(request);

    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("should reject limit > 100", () => {
    const request = new NextRequest("http://localhost/api/test?limit=200");

    expect(() => validatePagination(request)).toThrow(ValidationError);
  });
});

describe("validateSorting", () => {
  it("should validate sorting params", () => {
    const request = new NextRequest("http://localhost/api/test?sortBy=name&sortOrder=desc");

    const result = validateSorting(request);

    expect(result).toEqual({ sortBy: "name", sortOrder: "desc" });
  });

  it("should apply defaults", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validateSorting(request);

    expect(result.sortOrder).toBe("asc");
  });

  it("should reject invalid sortOrder", () => {
    const request = new NextRequest("http://localhost/api/test?sortOrder=invalid");

    expect(() => validateSorting(request)).toThrow(ValidationError);
  });
});

describe("validateDateRange", () => {
  it("should validate date range", () => {
    const request = new NextRequest(
      "http://localhost/api/test?startDate=2025-01-01&endDate=2025-12-31",
    );

    const result = validateDateRange(request);

    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("should reject startDate > endDate", () => {
    const request = new NextRequest(
      "http://localhost/api/test?startDate=2025-12-31&endDate=2025-01-01",
    );

    expect(() => validateDateRange(request)).toThrow(ValidationError);

    try {
      validateDateRange(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.fields.dateRange).toContain("startDate must be less than or equal to endDate");
      }
    }
  });

  it("should allow missing dates", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validateDateRange(request);

    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
  });
});

```


## Refactor: apps/web/src/lib/api/validation.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/api/validation.ts`

**File Content:**
```typescript
//[P1][API][VALIDATION] Request validation middleware and helpers
// Tags: zod, validation, api, middleware, error-handling

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Maximum request body size (1MB)
 */
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/**
 * Custom validation error class with detailed field-level errors
 */
export class ValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string[]>,
    public readonly statusCode: number = 422,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }

  toJSON() {
    return {
      error: "Validation failed",
      fields: this.fields,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Convert Zod error to field-level error messages
 */
function zodErrorToFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const key = path || "_root";

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}

/**
 * Validate request body against Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ValidationError if validation fails
 *
 * @example
 * const data = await validateRequest(request, OrganizationCreateSchema);
 */
export async function validateRequest<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  // Check content type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ValidationError(
      {
        _root: ["Content-Type must be application/json"],
      },
      415,
    );
  }

  // Check body size (approximate check before parsing)
  const contentLength = request.headers.get("content-length");
  // NOTE: debug logging removed. Enable DEBUG_VALIDATION_HEADERS=1 locally
  // and re-run tests to reproduce header issues; diagnostics intentionally
  // disabled in committed code to avoid noisy test output.
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    throw new ValidationError(
      {
        _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
      },
      413,
    );
  }

  // Parse raw text so we can reliably enforce size limits even when
  // the Content-Length header is missing or not set by the test harness.
  let body: unknown;
  // First, try to read the raw text. Some test environments may throw on text(),
  // so fall back to request.json() in that case to preserve previous behavior.
  try {
    const rawText = await request.text();
    // debug logging removed

    // Enforce size limit based on actual body length
    if (rawText.length > MAX_BODY_SIZE) {
      // debug logging removed
      throw new ValidationError(
        {
          _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
        },
        413,
      );
    }

    try {
      body = JSON.parse(rawText || "null");
    } catch {
      throw new ValidationError({ _root: ["Invalid JSON in request body"] }, 400);
    }
  } catch (textErr) {
    // If we threw a ValidationError above (e.g. due to oversized rawText),
    // don't swallow it — re-throw immediately.
    if (textErr instanceof ValidationError) throw textErr as ValidationError;
    // text() failed in this environment (some runtimes throw for large bodies).
    // If Content-Length header indicates the body is too large, surface 413.
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      throw new ValidationError(
        {
          _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
        },
        413,
      );
    }

    // Try to inspect the raw ArrayBuffer length if available (some runtimes
    // expose arrayBuffer even when text() throws). If it is too large, return 413.
    try {
      const buf = await request.arrayBuffer();
      if (buf && buf.byteLength > MAX_BODY_SIZE) {
        // debug logging removed
        throw new ValidationError(
          {
            _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
          },
          413,
        );
      }
    } catch {
      // Ignore errors reading arrayBuffer and fall back to parsing below.
    }

    // Otherwise fall back to request.json() to detect invalid JSON and produce a 400.
    try {
      body = await request.json();
    } catch {
      throw new ValidationError({ _root: ["Invalid JSON in request body"] }, 400);
    }
  }

  // Validate against schema
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(zodErrorToFieldErrors(error));
    }
    throw error;
  }
}

/**
 * Validate request query parameters against Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated query params
 * @throws ValidationError if validation fails
 *
 * @example
 * const params = validateQuery(request, z.object({ page: z.coerce.number() }));
 */
export function validateQuery<T>(request: NextRequest, schema: ZodSchema<T>): T {
  const { searchParams } = new URL(request.url);
  const query: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  try {
    return schema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(zodErrorToFieldErrors(error));
    }
    throw error;
  }
}

/**
 * Create error response from ValidationError
 *
 * @param error - ValidationError instance
 * @returns NextResponse with error details
 */
export function createValidationErrorResponse(error: ValidationError): NextResponse {
  return NextResponse.json(error.toJSON(), { status: error.statusCode });
}

/**
 * Higher-order function to wrap API route handlers with validation
 *
 * @param schema - Zod schema for request body validation
 * @param handler - Async handler function receiving validated data
 * @returns Next.js route handler with validation
 *
 * @example
 * export const POST = withValidation(
 *   OrganizationCreateSchema,
 *   async (request, data) => {
 *     // data is typed and validated
 *     const org = await createOrganization(data);
 *     return NextResponse.json(org);
 *   }
 * );
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const data = await validateRequest(request, schema);
      return await handler(request, data);
    } catch (error) {
      if (error instanceof ValidationError) {
        return createValidationErrorResponse(error);
      }

      // Re-throw unexpected errors
      throw error;
    }
  };
}

/**
 * Common query parameter schemas
 */
export const QuerySchemas = {
  /**
   * Pagination query params
   */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  /**
   * Sorting query params
   */
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),

  /**
   * Date range query params
   */
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),

  /**
   * Search query params
   */
  search: z.object({
    q: z.string().min(1).optional(),
  }),
};

/**
 * Validate pagination and return safe values
 */
export function validatePagination(request: NextRequest) {
  return validateQuery(request, QuerySchemas.pagination);
}

/**
 * Validate sorting and return safe values
 */
export function validateSorting(request: NextRequest) {
  return validateQuery(request, QuerySchemas.sorting);
}

/**
 * Validate date range and ensure startDate <= endDate
 */
export function validateDateRange(request: NextRequest) {
  const range = validateQuery(request, QuerySchemas.dateRange);

  if (range.startDate && range.endDate && range.startDate > range.endDate) {
    throw new ValidationError({
      dateRange: ["startDate must be less than or equal to endDate"],
    });
  }

  return range;
}

```


## Refactor: apps/web/src/lib/auth-context.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/auth-context.tsx`

**File Content:**
```typescript
// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
  user: Record<string, unknown> | null;
  isLoading: boolean;
};

// ...you can replace the placeholder implementation with your real auth logic...
const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: replace with real initialization (fetch session, etc.)
    const init = async () => {
      // simulate async auth check
      setTimeout(() => {
        setUser(null);
        setIsLoading(false);
      }, 10);
    };
    void init();
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // If provider is missing, return a safe default.
    return { user: null, isLoading: false };
  }
  return ctx;
}

```


## Refactor: apps/web/src/lib/auth-helpers.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/auth-helpers.ts`

**File Content:**
```typescript
// [P0][AUTH][CODE] Auth Helpers
// Tags: P0, AUTH, CODE
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  getRedirectResult,
} from "firebase/auth";

import { actionCodeSettings } from "./actionCodeSettings";
import { setPendingEmail, getPendingEmail, clearPendingEmail } from "./auth/pendingEmail.store";
import { reportError } from "./error/reporting";
import { auth } from "../../app/lib/firebaseClient";

// Extend Navigator to include non-standard iOS standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function shouldUseRedirect(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);
  const isStandalone = (navigator as NavigatorWithStandalone).standalone === true;
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  return isIOS || isSafari || isStandalone || smallScreen;
}

export async function loginWithGoogleSmart() {
  const provider = new GoogleAuthProvider();
  try {
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth!, provider);
    } else {
      await signInWithPopup(auth!, provider);
    }
  } catch (e) {
    reportError(e as unknown, { phase: "google_sign_in" });
    // Fallback: try redirect if popup failed (e.g., blocked)
    try {
      await signInWithRedirect(auth!, provider);
    } catch (e2) {
      reportError(e2 as unknown, { phase: "google_sign_in_fallback" });
      throw e2;
    }
  }
}

// Open the Google popup immediately from a user gesture. This calls the SDK synchronously
// so browsers will treat it as a user-initiated popup and not block it.
export function startGooglePopup(): Promise<unknown> {
  const provider = new GoogleAuthProvider();
  // call signInWithPopup synchronously; the returned Promise can be awaited by the caller.
  return signInWithPopup(auth!, provider) as Promise<unknown>;
}

export async function completeGoogleRedirectOnce(): Promise<boolean> {
  try {
    const res = await getRedirectResult(auth!);
    return !!res?.user;
  } catch (e) {
    reportError(e as unknown, { phase: "google_redirect_complete" });
    return false;
  }
}

export async function sendEmailLinkRobust(email: string) {
  try {
    if (!auth)
      throw new Error(
        "Firebase auth is not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set or enable emulators.",
      );
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    await setPendingEmail(email);
  } catch (e) {
    reportError(e as unknown, { phase: "send_email_link" });
    throw e;
  }
}

export async function completeEmailLinkIfPresent(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isSignInWithEmailLink(auth!, window.location.href)) return false;

  let email = await getPendingEmail();
  if (!email) {
    // Fallback: prompt to supply email
    email = window.prompt("Please confirm your email to complete sign-in") || "";
  }
  if (!email) return false;

  try {
    await signInWithEmailLink(auth!, email, window.location.href);
  } catch (e) {
    reportError(e as unknown, { phase: "complete_email_link" });
    throw e;
  } finally {
    await clearPendingEmail();
  }
  return true;
}

export async function establishServerSession() {
  const idToken = await auth?.currentUser?.getIdToken(true);
  if (!idToken) throw new Error("Missing idToken");
  const resp = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    reportError(new Error("Session POST failed"), { body: msg });
    throw new Error("Failed to create session");
  }
}

export async function logoutEverywhere() {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch (e) {
    reportError(e as unknown, { phase: "session_delete" });
  }
  try {
    const { signOut } = await import("firebase/auth");
    await signOut(auth!);
  } catch (e) {
    reportError(e as unknown, { phase: "client_signout" });
  }
}

```


## Refactor: apps/web/src/lib/auth/pendingEmail.store.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/auth/pendingEmail.store.ts`

**File Content:**
```typescript
// [P0][AUTH][CODE] PendingEmail Store
// Tags: P0, AUTH, CODE
import { kvSet, kvGet, kvDelete } from "../storage/kv";

const KEY = "emailForSignIn";
const TTL_MS_DEFAULT = 15 * 60 * 1000; // 15 minutes

export async function setPendingEmail(email: string, ttlMs: number = TTL_MS_DEFAULT) {
  await kvSet(KEY, email, ttlMs);
}

export async function getPendingEmail(): Promise<string | null> {
  return kvGet<string>(KEY);
}

export async function clearPendingEmail() {
  await kvDelete(KEY);
}

```


## Refactor: apps/web/src/lib/env.server.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/env.server.ts`

**File Content:**
```typescript
// [P0][SECURITY][ENV] Server-side environment validation with fail-fast
// Tags: P0, SECURITY, ENV, VALIDATION, SERVER, NEXTJS
// Comprehensive Zod-based environment validation for all server-side variables.
// This module must be imported only on the server side (API routes, server actions, instrumentation).

import { z } from "zod";

/**
 * Server-side environment schema with comprehensive validation.
 * Enforces required variables and provides sensible defaults where appropriate.
 */
const ServerEnvSchema = z.object({
  // === Core Runtime ===
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("3000"),

  // === Firebase Admin SDK ===
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required for admin SDK"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "GOOGLE_APPLICATION_CREDENTIALS_JSON must be valid JSON" },
    ),

  // === Session & Security ===
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters for security"),
  SESSION_COOKIE_MAX_AGE: z
    .string()
    .optional()
    .default("604800000") // 7 days in milliseconds
    .transform((val) => parseInt(val, 10)),

  // === Backup & Cron ===
  BACKUP_CRON_TOKEN: z.string().optional(),
  FIRESTORE_BACKUP_BUCKET: z.string().optional(),

  // === Cache & Storage ===
  REDIS_URL: z.string().optional(),

  // === CORS & Rate Limiting ===
  CORS_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default("60000") // 1 minute
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .optional()
    .default("100")
    .transform((val) => parseInt(val, 10)),

  // === Observability ===
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().optional().default("fresh-schedules-web"),

  // === Development & Testing ===
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
  BYPASS_ONBOARDING_GUARD: z.enum(["true", "false"]).optional().default("false"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Cached, validated server environment.
 * Initialized lazily on first access.
 */
let cachedEnv: ServerEnv | null = null;

/**
 * Load and validate server-side environment variables.
 * Fails fast with clear error messages if required variables are missing or invalid.
 *
 * @throws {Error} If environment validation fails
 * @returns Validated and typed environment object
 */
export function loadServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ServerEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`[env.server] Environment validation failed:\n${errors}`);
    throw new Error("Invalid server environment configuration");
  }

  const env = parsed.data;

  // === Additional runtime validations ===

  // Require credentials in production
  if (env.NODE_ENV === "production") {
    if (!env.GOOGLE_APPLICATION_CREDENTIALS && !env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.error(
        "[env.server] Production requires GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS_JSON",
      );
      throw new Error("Missing Firebase admin credentials in production");
    }

    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      console.error("[env.server] Production requires SESSION_SECRET with at least 32 characters");
      throw new Error("Invalid SESSION_SECRET in production");
    }

    if (!env.CORS_ORIGINS || env.CORS_ORIGINS.trim().length === 0) {
      console.error("[env.server] Production requires CORS_ORIGINS to be configured");
      throw new Error("Missing CORS_ORIGINS in production");
    }
  }

  // Warn if backup token is missing in production
  if (env.NODE_ENV === "production" && !env.BACKUP_CRON_TOKEN) {
    console.warn("[env.server] BACKUP_CRON_TOKEN not set - backup endpoint will be unsecured");
  }

  cachedEnv = env;
  return env;
}

/**
 * Helper to parse comma-separated CORS origins into a trimmed array.
 *
 * @param env Server environment object
 * @returns Array of CORS origin strings
 */
export function getCorsOrigins(env: ServerEnv): string[] {
  const val = env.CORS_ORIGINS;
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Helper to check if Firebase emulators should be used.
 *
 * @param env Server environment object
 * @returns true if emulators are enabled
 */
export function useEmulators(env: ServerEnv): boolean {
  return env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

/**
 * Helper to get parsed Firebase credentials from JSON string.
 *
 * @param env Server environment object
 * @returns Parsed credentials object or null
 */
export function getFirebaseCredentials(env: ServerEnv): Record<string, unknown> | null {
  const json = env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Validate environment immediately in non-production environments
// This ensures early detection of config issues during development
if (process.env.NODE_ENV !== "production") {
  try {
    loadServerEnv();
    // Environment validated successfully
  } catch (error) {
    console.error("[env.server] Failed to validate server environment:", error);
    // Allow development to continue with warnings
  }
}

```


## Refactor: apps/web/src/lib/env.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/env.ts`

**File Content:**
```typescript
// [P0][SECURITY][ENV] Client-side environment validation for Next.js web app
// Tags: P0, SECURITY, ENV, VALIDATION, NEXTJS, CLIENT
// Note: Only NEXT_PUBLIC_ variables are exposed to the client bundle.

import { z } from "zod";

/**
 * Client-side environment schema.
 * Only NEXT_PUBLIC_ prefixed variables are available in the browser.
 */
const ClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(""),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Validated client-side environment variables.
 * Fails fast on invalid configuration.
 */
export const webEnv: ClientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_USE_EMULATORS: process.env.NEXT_PUBLIC_USE_EMULATORS,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

/**
 * Helper to check if Firebase emulators should be used.
 */
export function useEmulators(): boolean {
  return webEnv.NEXT_PUBLIC_USE_EMULATORS === "true";
}

```


## Refactor: apps/web/src/lib/error/ErrorContext.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/error/ErrorContext.tsx`

**File Content:**
```typescript
// [P2][APP][CODE] ErrorContext
// Tags: P2, APP, CODE
"use client";
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

type ErrorState = { messages: string[] };

type Action = { type: "PUSH"; message: string } | { type: "CLEAR" } | { type: "POP" };

function reducer(state: ErrorState, action: Action): ErrorState {
  switch (action.type) {
    case "PUSH":
      return { messages: [...state.messages, action.message] };
    case "POP": {
      const next = state.messages.slice();
      next.pop();
      return { messages: next };
    }
    case "CLEAR":
      return { messages: [] };
    default:
      return state;
  }
}

const ErrorCtx = createContext<{
  messages: string[];
  pushError: (m: string) => void;
  popError: () => void;
  clearErrors: () => void;
}>({ messages: [], pushError: () => {}, popError: () => {}, clearErrors: () => {} });

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { messages: [] });

  const api = useMemo(
    () => ({
      messages: state.messages,
      pushError: (m: string) => dispatch({ type: "PUSH", message: m }),
      popError: () => dispatch({ type: "POP" }),
      clearErrors: () => dispatch({ type: "CLEAR" }),
    }),
    [state.messages],
  );

  return (
    <ErrorCtx.Provider value={api}>
      {children}
      {/* Minimal inline surface; swap for toast or shadcn Alert if desired */}
      {state.messages.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2 rounded border bg-white p-3 text-sm shadow">
          {state.messages.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
          <button className="rounded border px-2 py-1 text-xs" onClick={api.clearErrors}>
            Dismiss
          </button>
        </div>
      )}
    </ErrorCtx.Provider>
  );
}

export function useErrorBus() {
  return useContext(ErrorCtx);
}

```


## Refactor: apps/web/src/lib/error/reporting.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/error/reporting.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Reporting
// Tags: P2, APP, CODE
// Centralized error reporting with Sentry integration
import * as Sentry from "@sentry/nextjs";

import { logger } from "../logger";

/**
 * Report error to Sentry and fallback to structured logging
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  // Always log locally with structured logger
  logger.error("Application error", error, context);

  // Send to Sentry if configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: context,
          level: "error",
        });
      } else {
        Sentry.captureMessage(String(error), {
          extra: context,
          level: "error",
        });
      }
    } catch (sentryError) {
      // Fallback: if Sentry fails, log to console
      const errorMessage = sentryError instanceof Error ? sentryError.message : String(sentryError);
      logger.warn(`Failed to send error to Sentry: ${errorMessage}`);
    }
  }
}

/**
 * Set user context for error reporting
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: "info",
    });
  }
}

```


## Refactor: apps/web/src/lib/eventLog.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/eventLog.ts`

**File Content:**
```typescript
// [P0][OBSERVABILITY][LOGGING] EventLog
// Tags: P0, OBSERVABILITY, LOGGING
/**
 * [P1][PLATFORM][EVENTS] Event logging helper (server)
 * Tags: platform, events, audit, analytics
 *
 * Overview:
 * - Provides a single function to append events to the Firestore event log
 * - Used by onboarding + network APIs for auditability and analytics
 * - Uses the v14 EventSchema from @fresh-schedules/types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewEventSchema, type NewEvent } from "@fresh-schedules/types";
import type { Firestore } from "firebase-admin/firestore";

export async function logEvent(adminDb: Firestore | any, input: NewEvent): Promise<void> {
  if (!adminDb) {
    // In local/stub mode, just console.log instead of writing to Firestore.
    // This keeps the call sites simple and prevents crashes when adminDb is undefined.
    console.log("[eventLog] stub event:", input);
    return;
  }

  const parsed = NewEventSchema.safeParse(input);
  if (!parsed.success) {
    // If the event doesn't match our schema, fail FAST in dev.
    // In production, you might want to send this to an error tracker instead.
    console.error("[eventLog] schema validation failed:", parsed.error);
    console.error("[eventLog] invalid event payload", parsed.error.flatten());
    return;
  }

  const event = parsed.data;
  const eventsCollection = adminDb.collection("events");
  const docRef = eventsCollection.doc();

  await docRef.set({
    id: docRef.id,
    ...event,
  });
}

```


## Refactor: apps/web/src/lib/firebase.server.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/firebase.server.ts`

**File Content:**
```typescript
// [P0][FIREBASE][FIREBASE] Firebase Server
// Tags: P0, FIREBASE, FIREBASE
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();
  // Preferred: allow a base64-encoded service account JSON in env (good for CI/local secrets)
  const saB64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_B64;
  if (saB64) {
    try {
      const saJson = JSON.parse(Buffer.from(saB64, "base64").toString("utf8"));
      const {
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey,
      } = saJson as Record<string, string>;
      if (privateKey && clientEmail && projectId) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          projectId,
        });
        return admin.app();
      }
    } catch (err) {
      // fall through to other initialization methods and surface a warning below
      console.warn("Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_B64:", err);
    }
  }

  // Use explicit private key env if provided (avoid committing secrets)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
    return admin.app();
  }

  // Fallback to default application credentials (workload identity / gcloud env)
  try {
    admin.initializeApp();
    return admin.app();
  } catch {
    // If admin cannot initialize (e.g., no credentials), export undefined handles.
    // Callers should handle missing admin (e.g., in local dev use client-side flows/emulators).
    console.warn("Firebase Admin SDK not initialized (missing credentials).");
    return null as unknown as AdminAppType | null;
  }
}

// Infer admin types from runtime helpers to avoid referencing an ambient `admin` namespace
type AdminAppType = ReturnType<typeof admin.app>;
type AdminAuthType = ReturnType<typeof admin.auth>;
type AdminFirestoreType = ReturnType<typeof admin.firestore>;
type AdminStorageType = ReturnType<typeof admin.storage>;

const app: AdminAppType | null = initAdmin();
export const adminSdk = admin;
export const adminAuth: AdminAuthType | undefined = app ? admin.auth() : undefined;
export const adminDb: AdminFirestoreType | undefined = app ? admin.firestore() : undefined;
export const adminStorage: AdminStorageType | undefined = app ? admin.storage() : undefined;

type VerifyIdTokenReturn = AdminAuthType extends { verifyIdToken(token: string): Promise<infer R> }
  ? R
  : unknown;
export async function verifyIdToken(token?: string): Promise<VerifyIdTokenReturn> {
  if (!adminAuth) throw new Error("Admin auth not initialized");
  if (!token) throw new Error("No token");
  return adminAuth.verifyIdToken(token);
}

export function isManagerClaims(
  claims: VerifyIdTokenReturn | Record<string, unknown> | undefined,
  orgId?: string,
): boolean {
  if (!claims) return false;
  const c = claims as unknown as Record<string, unknown>;
  if (typeof c["role"] === "string" && c["role"] === "manager") return true;
  if (typeof c["custom:role"] === "string" && c["custom:role"] === "manager") return true;
  // check namespaced roles object
  const roles =
    ((claims as unknown as Record<string, unknown>)["roles"] as
      | Record<string, string>
      | undefined) ||
    ((claims as unknown as Record<string, unknown>)["rolesMap"] as
      | Record<string, string>
      | undefined) ||
    ((claims as unknown as Record<string, unknown>)["orgRoles"] as
      | Record<string, string>
      | undefined);
  if (orgId && roles && typeof roles === "object") {
    const r = roles[orgId] || roles[String(orgId)];
    if (r && ["org_owner", "org_admin", "admin", "manager"].includes(r)) return true;
  }
  return false;
}

```


## Refactor: apps/web/src/lib/imports/_template.import.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/imports/_template.import.ts`

**File Content:**
```typescript
// [P2][APP][CODE]  Template Import
// Tags: P2, APP, CODE
import { parse } from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";

export const RowSchema = z.record(z.any()); // replace with concrete schema per import type

export type ImportResult<T> = {
  records: T[];
  warnings: string[];
  rejected: { row: number; reason: string }[];
};

export async function importFile(file: File): Promise<ImportResult<z.infer<typeof RowSchema>>> {
  const name = file.name.toLowerCase();
  let rows: unknown[] = [];

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = parse(text, { header: true, skipEmptyLines: true });
    rows = parsed.data as unknown[];
  } else if (name.endsWith(".xlsx")) {
    const wb = XLSX.read(await file.arrayBuffer());
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws) as unknown[];
  } else {
    throw new Error("Unsupported file type");
  }

  const records: z.infer<typeof RowSchema>[] = [];
  const rejected: { row: number; reason: string }[] = [];
  const warnings: string[] = [];

  rows.forEach((r, i) => {
    const ok = RowSchema.safeParse(r);
    if (ok.success) records.push(ok.data);
    else rejected.push({ row: i + 1, reason: ok.error.message });
  });

  return { records, warnings, rejected };
}

```


## Refactor: apps/web/src/lib/labor/computeLaborBudget.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/labor/computeLaborBudget.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] ComputeLaborBudget Test tests
// Tags: P1, TEST, TEST
import { describe, it, expect } from "vitest";

import { computeLaborBudget } from "./computeLaborBudget";

describe("computeLaborBudget", () => {
  it("computes dollars and hours for typical inputs", () => {
    const result = computeLaborBudget(10000, 20, 25); // $10k sales, 20%, $25/hr
    // allowedDollars = 10000 * 0.2 = 2000
    // allowedHours = 2000 / 25 = 80
    expect(result.allowedDollars).toBeCloseTo(2000);
    expect(result.allowedHours).toBeCloseTo(80);
  });

  it("handles zero sales producing zero budget", () => {
    const result = computeLaborBudget(0, 15, 30);
    expect(result.allowedDollars).toBe(0);
    expect(result.allowedHours).toBe(0);
  });

  it("throws for negative forecast sales", () => {
    expect(() => computeLaborBudget(-1, 15, 25)).toThrow(/forecastSales/);
  });

  it("throws for laborPercent out of range", () => {
    expect(() => computeLaborBudget(1000, -5, 25)).toThrow(/laborPercent/);
    expect(() => computeLaborBudget(1000, 105, 25)).toThrow(/laborPercent/);
  });

  it("throws for non-positive avgWage", () => {
    expect(() => computeLaborBudget(1000, 20, 0)).toThrow(/avgWage/);
  });
});

```


## Refactor: apps/web/src/lib/labor/computeLaborBudget.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/labor/computeLaborBudget.ts`

**File Content:**
```typescript
// [P2][APP][LABOR] Compute allowed labor dollars and hours from the sales forecast
// Tags: labor, scheduling, budgeting, utility

/**
 * Contract
 * - Inputs
 *   - forecastSales: number (>= 0)
 *   - laborPercent: number (0..100)
 *   - avgWage: number (> 0)
 * - Output
 *   - { allowedDollars: number, allowedHours: number }
 * - Error modes
 *   - Throws RangeError for invalid inputs
 * - Success criteria
 *   - allowedDollars = forecastSales * (laborPercent / 100)
 *   - allowedHours = allowedDollars / avgWage
 */
export function computeLaborBudget(
  forecastSales: number,
  laborPercent: number,
  avgWage: number,
): { allowedDollars: number; allowedHours: number } {
  // Validate inputs with explicit, predictable errors
  if (!Number.isFinite(forecastSales) || forecastSales < 0) {
    throw new RangeError("forecastSales must be a finite number >= 0");
  }
  if (!Number.isFinite(laborPercent) || laborPercent < 0 || laborPercent > 100) {
    throw new RangeError("laborPercent must be a finite number in [0, 100]");
  }
  if (!Number.isFinite(avgWage) || avgWage <= 0) {
    throw new RangeError("avgWage must be a finite number > 0");
  }

  const allowedDollars = forecastSales * (laborPercent / 100);
  const allowedHours = allowedDollars / avgWage;

  return { allowedDollars, allowedHours };
}

export default computeLaborBudget;

```


## Refactor: apps/web/src/lib/logger.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/logger.ts`

**File Content:**
```typescript
// [P0][OBS][LOGGER] Shared JSON logger with structured fields
// Tags: P0, OBS, LOGGER
import { NextRequest } from "next/server";

/**
 * Log levels following standard severity hierarchy
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * Structured log entry with common fields
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  reqId?: string;
  uid?: string;
  orgId?: string;
  latencyMs?: number;
  method?: string;
  path?: string;
  statusCode?: number;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  [key: string]: unknown; // Allow additional custom fields
}

/**
 * Logger class for structured JSON logging
 */
export class Logger {
  private context: Partial<LogEntry>;

  constructor(context: Partial<LogEntry> = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<LogEntry>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Create logger from NextRequest with automatic reqId
   */
  static fromRequest(req: NextRequest, additionalContext?: Partial<LogEntry>): Logger {
    const reqId = req.headers.get("x-request-id") || crypto.randomUUID();
    return new Logger({
      reqId,
      method: req.method,
      path: req.nextUrl.pathname,
      ...additionalContext,
    });
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Log at INFO level
   */
  info(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log at ERROR level
   */
  error(message: string, error?: Error | unknown, meta?: Partial<LogEntry>): void {
    const errorMeta: Partial<LogEntry> = {};

    if (error instanceof Error) {
      errorMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorMeta.error = {
        message: String(error),
      };
    }

    this.log(LogLevel.ERROR, message, { ...errorMeta, ...meta });
  }

  /**
   * Log at FATAL level (critical errors)
   */
  fatal(message: string, error?: Error | unknown, meta?: Partial<LogEntry>): void {
    const errorMeta: Partial<LogEntry> = {};

    if (error instanceof Error) {
      errorMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorMeta.error = {
        message: String(error),
      };
    }

    this.log(LogLevel.FATAL, message, { ...errorMeta, ...meta });
  }

  /**
   * Core logging method that outputs structured JSON
   */
  private log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta,
    };

    // Human-readable format
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelLabel = entry.level.toUpperCase().padEnd(5);
    // Use console.error to comply with ESLint rules (only warn/error allowed)
    console.error(
      `[${timestamp}] ${levelLabel} ${entry.message}`,
      entry.metadata ? entry.metadata : "",
    );
  }

  /**
   * Helper to measure and log request latency
   */
  async withLatency<T>(
    fn: () => Promise<T>,
    message: string,
    meta?: Partial<LogEntry>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const latencyMs = Date.now() - start;
      this.info(message, { latencyMs, ...meta });
      return result;
    } catch (error) {
      const latencyMs = Date.now() - start;
      this.error(message, error, { latencyMs, ...meta });
      throw error;
    }
  }
}

/**
 * Default global logger instance
 */
export const logger = new Logger();

/**
 * Express/Next.js middleware to add request logging
 */
export function requestLogger(req: NextRequest, startTime: number = Date.now()) {
  const reqLogger = Logger.fromRequest(req);

  return {
    logger: reqLogger,
    finish: (statusCode: number, additionalMeta?: Partial<LogEntry>) => {
      const latencyMs = Date.now() - startTime;
      reqLogger.info("Request completed", {
        statusCode,
        latencyMs,
        ...additionalMeta,
      });
    },
  };
}

```


## Refactor: apps/web/src/lib/onboarding/adminFormDrafts.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/onboarding/adminFormDrafts.ts`

**File Content:**
```typescript
// [P1][FIREBASE][HELPER] Admin form drafts helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { CreateAdminResponsibilityFormInput } from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import type { Firestore, DocumentReference } from "firebase-admin/firestore";

import { adminDb, adminSdk } from "@/src/lib/firebase.server";

const db = adminDb as Firestore | undefined;

export type AdminFormDraft = {
  id: string;
  userId: string;
  payload: CreateAdminResponsibilityFormInput;
  ipAddress: string;
  userAgent: string;
  createdAt: ReturnType<typeof adminSdk.firestore.Timestamp.now> | number;
  consumedAt?: ReturnType<typeof adminSdk.firestore.Timestamp.now> | null;
};

function generateFormToken() {
  return randomBytes(24).toString("hex");
}

export async function saveAdminFormDraft(
  userId: string,
  payload: CreateAdminResponsibilityFormInput,
  meta: { ipAddress: string; userAgent: string },
  injectedDb?: Firestore,
): Promise<string> {
  const token = generateFormToken();
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin-db-not-initialized");

  const docRef = root.collection("adminFormDrafts").doc(token) as DocumentReference<AdminFormDraft>;

  const draft: AdminFormDraft = {
    id: token,
    userId,
    payload,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    createdAt: adminSdk.firestore.Timestamp.now(),
    consumedAt: null,
  };

  await docRef.set(draft);
  return token;
}

export async function loadAdminFormDraft(
  formToken: string,
  injectedDb?: Firestore,
): Promise<AdminFormDraft | null> {
  if (!formToken) return null;
  const root = injectedDb ?? db;
  if (!root) return null;

  const docRef = root.collection("adminFormDrafts").doc(formToken);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const data = snap.data() as AdminFormDraft;
  return data;
}

export async function markAdminFormDraftConsumed(formToken: string, injectedDb?: Firestore) {
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin-db-not-initialized");
  const docRef = root
    .collection("adminFormDrafts")
    .doc(formToken) as DocumentReference<AdminFormDraft>;
  await docRef.update({ consumedAt: adminSdk.firestore.Timestamp.now() });
}

export default {
  saveAdminFormDraft,
  loadAdminFormDraft,
  markAdminFormDraftConsumed,
};

```


## Refactor: apps/web/src/lib/onboarding/createNetworkOrg.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/onboarding/createNetworkOrg.test.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] CreateNetworkOrg Test tests
// Tags: P0, TEST, TEST
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";

// Prevent the real firebase-admin from being imported in tests (it prints a
// warning when loaded in non-server environments). Mock the project's
// firebase.server wrapper so tests can run cleanly.
vi.mock("@/src/lib/firebase.server", () => {
  return {
    adminDb: undefined,
    adminSdk: {
      firestore: {
        Timestamp: {
          now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
        },
      },
    },
  };
});

import { createNetworkWithOrgAndVenue } from "./createNetworkOrg";

// Mock the local adminFormDrafts module used by createNetworkWithOrgAndVenue
vi.mock("./adminFormDrafts", () => {
  return {
    loadAdminFormDraft: async (token: string) => {
      // return a valid draft for tests
      return {
        id: token,
        userId: "admin-uid",
        payload: {
          data: { legalName: "Test Legal" },
        },
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      };
    },
    markAdminFormDraftConsumed: async () => {
      /* no-op in tests */
    },
  };
});

// Minimal fake Firestore that implements the subset used by the helper
function makeFakeFirestore() {
  let idCounter = 1;
  return {
    collection(_name: string) {
      return {
        doc(id?: string) {
          const docId = id ?? `doc_${idCounter++}`;
          const ref = {
            id: docId,
            collection(sub: string) {
              return {
                doc: (subId?: string) => ({ id: subId ?? `${docId}_${sub}_${idCounter++}` }),
              };
            },
          };
          return ref;
        },
      };
    },
    batch() {
      const ops: Array<unknown> = [];
      return {
        set(ref: unknown, data: unknown) {
          (ops as Array<any>).push({ op: "set", ref, data });
        },
        commit() {
          return Promise.resolve(ops);
        },
      };
    },
  };
}

describe("createNetworkWithOrgAndVenue (helper)", () => {
  it("creates network/org/venue and returns ids", async () => {
    const fakeDb = makeFakeFirestore() as unknown as any;

    const payload = {
      basics: { orgName: "Test Org", hasCorporateAboveYou: false, segment: "restaurant" },
      venue: { venueName: "Main Venue", timeZone: "UTC" },
      formToken: "token-123",
    } as any;

    const result = await createNetworkWithOrgAndVenue("admin-uid", payload, fakeDb);

    expect(result).toBeDefined();
    expect(typeof result.networkId).toBe("string");
    expect(typeof result.orgId).toBe("string");
    expect(typeof result.venueId).toBe("string");
    expect(result.status).toBe("pending_verification");
  });
});

```


## Refactor: apps/web/src/lib/onboarding/createNetworkOrg.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/onboarding/createNetworkOrg.ts`

**File Content:**
```typescript
// [P1][FIREBASE][HELPER] Create network/org/venue helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { CreateNetworkOrgPayload } from "@fresh-schedules/types";
import type { Firestore, DocumentReference, WriteBatch } from "firebase-admin/firestore";

import { loadAdminFormDraft, markAdminFormDraftConsumed } from "./adminFormDrafts";

import { adminDb, adminSdk } from "@/src/lib/firebase.server";

const db = adminDb as Firestore | undefined;

export type CreateNetworkOrgResult = {
  networkId: string;
  orgId: string;
  venueId: string;
  status: string;
};

export async function createNetworkWithOrgAndVenue(
  adminUid: string,
  payload: CreateNetworkOrgPayload,
  injectedDb?: Firestore,
): Promise<CreateNetworkOrgResult> {
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin_db_not_initialized");

  const { basics, venue, formToken } = payload;

  const draft = await loadAdminFormDraft(formToken, injectedDb);
  if (!draft) throw new Error("admin_form_not_found");
  if (draft.userId !== adminUid) throw new Error("admin_form_ownership_mismatch");

  const networkRef = root.collection("networks").doc() as DocumentReference<
    Record<string, unknown>
  >;
  const networkId = networkRef.id;
  const now = adminSdk.firestore.Timestamp.now();

  const batch: WriteBatch = root.batch();

  const networkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basics?.orgName ?? networkId,
    legalName: draft.payload.data?.legalName ?? basics?.orgName ?? null,
    status: "pending_verification",
    ownerUserId: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(networkRef, networkDoc);

  const complianceRef = networkRef
    .collection("compliance")
    .doc("adminResponsibilityForm") as DocumentReference<Record<string, unknown>>;
  const formDoc = {
    networkId,
    adminUid,
    ...draft.payload,
    ipAddress: draft.ipAddress,
    userAgent: draft.userAgent,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc() as DocumentReference<Record<string, unknown>>;
  const orgId = orgRef.id;
  batch.set(orgRef, {
    id: orgId,
    networkId,
    displayName: basics?.orgName ?? "Org",
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
  });

  const venueRef = networkRef.collection("venues").doc() as DocumentReference<
    Record<string, unknown>
  >;
  const venueId = venueRef.id;
  batch.set(venueRef, {
    id: venueId,
    networkId,
    name: venue?.venueName ?? "Main Venue",
    timeZone: venue?.timeZone ?? "UTC",
    createdAt: now,
    createdBy: adminUid,
  });

  const membershipRef = networkRef.collection("memberships").doc() as DocumentReference<
    Record<string, unknown>
  >;
  batch.set(membershipRef, {
    id: membershipRef.id,
    networkId,
    userId: adminUid,
    roles: ["network_owner"],
    createdAt: now,
    createdBy: adminUid,
  });

  // Commit batch
  if (typeof batch.commit === "function") {
    await batch.commit();
  } else {
    // Fallback: some injected mock dbs may expose commit directly (non-batch style)
    const maybeRoot = root as unknown as { commit?: () => Promise<unknown> };
    if (maybeRoot.commit) {
      await maybeRoot.commit();
    }
  }

  await markAdminFormDraftConsumed(formToken, injectedDb);

  return { networkId, orgId, venueId, status: "pending_verification" };
}

export default { createNetworkWithOrgAndVenue };

```


## Refactor: apps/web/src/lib/otel.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/otel.ts`

**File Content:**
```typescript
// [P2][OBS][OTEL] Helpers for manual spans
// Tags: P2, OBS, OTEL
import { trace, SpanStatusCode } from "@opentelemetry/api";

export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attrs?: Record<string, unknown>,
): Promise<T> {
  const tracer = trace.getTracer("apps-web");
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          // OTel attributes may be string | number | boolean | Array of those
          if (Array.isArray(v)) {
            if (v.every((x) => typeof x === "string")) {
              span.setAttribute(k, v as string[]);
            } else if (v.every((x) => typeof x === "number")) {
              span.setAttribute(k, v as number[]);
            } else if (v.every((x) => typeof x === "boolean")) {
              span.setAttribute(k, v as boolean[]);
            } else {
              span.setAttribute(k, v.map(String));
            }
          } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            span.setAttribute(k, v);
          } else {
            span.setAttribute(k, String(v));
          }
        }
      }
      const result = await fn();
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}

```


## Refactor: apps/web/src/lib/storage/kv.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/storage/kv.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Kv
// Tags: P2, APP, CODE
// Small IndexedDB KV store using idb.
// Avoids localStorage perf/size pitfalls and is resilient across tabs.

import { openDB } from "idb";

type KV = { key: string; value: unknown; expiresAt?: number };

const DB_NAME = "fresh-schedules-kv";
const STORE = "kv";
const VERSION = 1;

async function db() {
  return openDB(DB_NAME, VERSION, {
    upgrade(d: IDBDatabase) {
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath: "key" });
        s.createIndex("by-expiry", "expiresAt");
      }
    },
  });
}

export async function kvSet(key: string, value: unknown, ttlMs?: number) {
  const now = Date.now();
  const expiresAt = ttlMs ? now + ttlMs : undefined;
  const handle = await db();
  await handle.put(STORE, { key, value, expiresAt });
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const handle = await db();
  const row = (await handle.get(STORE, key)) as KV | undefined;
  if (!row) return null;
  if (row.expiresAt && row.expiresAt < Date.now()) {
    await handle.delete(STORE, key);
    return null;
  }
  return row.value as T;
}

export async function kvDelete(key: string) {
  const handle = await db();
  await handle.delete(STORE, key);
}

export async function kvCleanupExpired() {
  const handle = await db();
  const tx = handle.transaction(STORE, "readwrite");
  const idx = tx.store.index("by-expiry");
  let cur = await idx.openCursor();
  const now = Date.now();
  while (cur) {
    const val = cur.value as KV;
    if (val.expiresAt && val.expiresAt < now) await cur.delete();
    cur = await cur.continue();
  }
  await tx.done;
}

```


## Refactor: apps/web/src/lib/store.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/store.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Store
// Tags: P2, APP, CODE
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlanningState {
  avgWage: number;
  laborPct: number;
  forecastSales: number;
}

interface AppState {
  planning: PlanningState;
  setPlanning: (updates: Partial<PlanningState>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      planning: {
        avgWage: 15,
        laborPct: 25,
        forecastSales: 20000,
      },
      setPlanning: (updates) =>
        set((state) => ({
          planning: { ...state.planning, ...updates },
        })),
    }),
    { name: "app-storage" },
  ),
);

```


## Refactor: apps/web/src/lib/userOnboarding.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/userOnboarding.ts`

**File Content:**
```typescript
// [P1][HELPERS][ONBOARDING] User Onboarding Helpers
// Tags: P1, HELPERS, ONBOARDING, FIREBASE
/**
 * @fileoverview
 * Helpers for managing canonical user onboarding state (users/{uid}.onboarding).
 * markOnboardingComplete is called after all successful onboarding flows to mark completion.
 */
import { Firestore } from "firebase-admin/firestore";

export type OnboardingIntent = "create_org" | "create_corporate" | "join_existing";

export async function markOnboardingComplete(params: {
  adminDb: import("firebase-admin/firestore").Firestore | undefined;
  uid: string;
  intent: OnboardingIntent;
  networkId: string;
  orgId?: string | null;
  venueId?: string | null;
}): Promise<void> {
  const { adminDb, uid, intent, networkId, orgId = null, venueId = null } = params;

  if (!adminDb) return; // preserve stub/test behavior

  const now = Date.now();

  try {
    await (adminDb as Firestore)
      .collection("users")
      .doc(uid)
      .set(
        {
          onboarding: {
            status: "complete",
            stage: "network_created",
            intent,
            primaryNetworkId: networkId,
            primaryOrgId: orgId,
            primaryVenueId: venueId,
            completedAt: now,
            lastUpdatedAt: now,
          },
        },
        { merge: true },
      );
  } catch (_e) {
    // Don't surface errors to callers; keep original endpoint semantics.
    // Optionally log via a logger if available in the future.
    console.debug("[userOnboarding] Failed to mark onboarding complete", {
      uid,
      intent,
      networkId,
      orgId,
      venueId,
      error: _e,
    });
  }
}

```


## Refactor: apps/web/src/lib/userProfile.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/lib/userProfile.ts`

**File Content:**
```typescript
// [P0][APP][CODE] UserProfile
// Tags: P0, APP, CODE
/**
 * [P1][APP][USER] User profile bootstrap + helpers
 * Tags: user, profile, onboarding, session
 *
 * Overview:
 * - Ensures a users/{uid} profile document exists on first sign-in
 * - Populates basic identity + initial onboarding state
 * - Safe to call on every session bootstrap (idempotent)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Firestore } from "firebase-admin/firestore";

export type AuthUserClaims = {
  email?: string;
  name?: string;
  displayName?: string;
  picture?: string;
  selfDeclaredRole?: string;
  role?: string;
  [key: string]: unknown;
};

export async function ensureUserProfile(args: {
  adminDb: Firestore | any;
  uid: string;
  claims: AuthUserClaims;
}): Promise<void> {
  const { adminDb, uid, claims } = args;

  if (!adminDb) {
    // Stub mode, nothing to persist
    console.log("[userProfile] stub ensureUserProfile", { uid, claims });
    return;
  }

  const usersRef = adminDb.collection("users").doc(uid);
  const snap = await usersRef.get();
  const now = Date.now();

  const baseProfile = {
    email: (claims.email as string | undefined) || null,
    displayName:
      (claims.displayName as string | undefined) || (claims.name as string | undefined) || null,
    avatarUrl: (claims.picture as string | undefined) || null,
    selfDeclaredRole:
      (claims.selfDeclaredRole as string | undefined) ||
      (claims.role as string | undefined) ||
      null,
  };

  if (!snap.exists) {
    // First-time sign-in → create full user doc with initial onboarding state
    await usersRef.set({
      id: uid,
      createdAt: now,
      updatedAt: now,
      profile: baseProfile,
      onboarding: {
        status: "not_started",
        stage: "profile",
        intent: null,
        primaryNetworkId: null,
        primaryOrgId: null,
        primaryVenueId: null,
        completedAt: null,
        lastUpdatedAt: now,
      },
    });
    return;
  }

  // If the doc exists, we still may want to backfill missing profile fields
  const existing = snap.data() as any;

  const profile = {
    ...(existing.profile || {}),
    ...baseProfile,
  };

  await usersRef.set(
    {
      profile,
      updatedAt: now,
      onboarding: existing.onboarding || {
        status: "not_started",
        stage: "profile",
        intent: null,
        primaryNetworkId: null,
        primaryOrgId: null,
        primaryVenueId: null,
        completedAt: null,
        lastUpdatedAt: now,
      },
    },
    { merge: true },
  );
}

```


## Refactor: apps/web/src/middleware.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/middleware.ts`

**File Content:**
```typescript
// [P2][API][MIDDLEWARE] Re-export for test compatibility
// Tags: P2, API, MIDDLEWARE

// Re-export from app/middleware.ts for test imports
// Note: config cannot be re-exported; it must be defined in app/middleware.ts directly
export { middleware } from "../app/middleware";

```


## Refactor: apps/web/src/types/fresh-schedules-types.d.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/types/fresh-schedules-types.d.ts`

**File Content:**
```typescript
// [P1][TYPES][SCHEMAS] Fresh-schedules types shim
// Tags: P1, TYPES, SCHEMAS

/**
 * Type shim for @fresh-schedules/types module
 * Declares all exported types from the workspace types package
 */

declare module "@fresh-schedules/types" {
  import { z } from "zod";
  // Helper alias for broad, unconstrained object shapes without using `any`
  type ZAnyObj = z.ZodObject<{ [k: string]: z.ZodTypeAny }>;

  // Role enum
  export const Role: z.ZodEnum<["admin", "manager", "staff"]>;
  export type Role = "admin" | "manager" | "staff";

  // ============================================================================
  // ATTENDANCE TYPES
  // ============================================================================
  export const AttendanceStatus: z.ZodEnum<
    ["scheduled", "checked_in", "checked_out", "no_show", "excused_absence", "late"]
  >;
  export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

  export const CheckMethod: z.ZodEnum<["manual", "qr_code", "nfc", "geofence", "admin_override"]>;
  export type CheckMethod = z.infer<typeof CheckMethod>;

  export const LocationSchema: ZAnyObj;
  export type Location = z.infer<typeof LocationSchema>;

  export const AttendanceRecordSchema: ZAnyObj;
  export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

  export const CreateAttendanceRecordSchema: ZAnyObj;
  export type CreateAttendanceRecordInput = z.infer<typeof CreateAttendanceRecordSchema>;

  export const CheckInSchema: ZAnyObj;
  export type CheckInInput = z.infer<typeof CheckInSchema>;

  export const CheckOutSchema: ZAnyObj;
  export type CheckOutInput = z.infer<typeof CheckOutSchema>;

  export const UpdateAttendanceRecordSchema: ZAnyObj;
  export type UpdateAttendanceRecordInput = z.infer<typeof UpdateAttendanceRecordSchema>;

  export const ListAttendanceRecordsQuerySchema: ZAnyObj;
  export type ListAttendanceRecordsQuery = z.infer<typeof ListAttendanceRecordsQuerySchema>;

  // ============================================================================
  // JOIN TOKENS TYPES
  // ============================================================================
  export const JoinTokenStatus: z.ZodEnum<["active", "used", "expired", "disabled"]>;
  export type JoinTokenStatus = z.infer<typeof JoinTokenStatus>;

  export const JoinTokenSchema: ZAnyObj;
  export type JoinToken = z.infer<typeof JoinTokenSchema>;

  export const CreateJoinTokenSchema: ZAnyObj;
  export type CreateJoinTokenInput = z.infer<typeof CreateJoinTokenSchema>;

  export const UpdateJoinTokenSchema: ZAnyObj;
  export type UpdateJoinTokenInput = z.infer<typeof UpdateJoinTokenSchema>;

  // ============================================================================
  // ORGANIZATIONS TYPES
  // ============================================================================
  export const OrganizationStatusEnum: z.ZodEnum<["active", "inactive", "archived"]>;
  export type OrganizationStatus = z.infer<typeof OrganizationStatusEnum>;

  export const OrganizationSchema: ZAnyObj;
  export type Organization = z.infer<typeof OrganizationSchema>;

  export const CreateOrganizationSchema: ZAnyObj;
  export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

  export const UpdateOrganizationSchema: ZAnyObj;
  export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

  // ============================================================================
  // MEMBERSHIPS TYPES
  // ============================================================================
  export const MembershipSchema: ZAnyObj;
  export type Membership = z.infer<typeof MembershipSchema>;

  export const CreateMembershipSchema: ZAnyObj;
  export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

  export const UpdateMembershipSchema: ZAnyObj;
  export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

  export const MembershipUpdateSchema: ZAnyObj;
  export type MembershipUpdateInput = z.infer<typeof MembershipUpdateSchema>;

  // ============================================================================
  // POSITIONS TYPES
  // ============================================================================
  export const PositionSchema: ZAnyObj;
  export type Position = z.infer<typeof PositionSchema>;

  export const CreatePositionSchema: ZAnyObj;
  export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

  export const PositionUpdateSchema: ZAnyObj;
  export type PositionUpdateInput = z.infer<typeof PositionUpdateSchema>;

  // ============================================================================
  // SCHEDULES TYPES
  // ============================================================================
  export const ScheduleRecurrenceType: z.ZodEnum<
    ["once", "daily", "weekly", "biweekly", "monthly", "custom"]
  >;
  export type ScheduleRecurrenceType = z.infer<typeof ScheduleRecurrenceType>;

  export const ScheduleSchema: ZAnyObj;
  export type Schedule = z.infer<typeof ScheduleSchema>;

  export const CreateScheduleSchema: ZAnyObj;
  export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

  export const UpdateScheduleSchema: ZAnyObj;
  export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;

  // ============================================================================
  // SHIFTS TYPES
  // ============================================================================
  export const ShiftSchema: ZAnyObj;
  export type Shift = z.infer<typeof ShiftSchema>;

  export const CreateShiftSchema: ZAnyObj;
  export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;

  export const UpdateShiftSchema: ZAnyObj;
  export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

  // ============================================================================
  // VENUES TYPES
  // ============================================================================
  export const VenueSchema: ZAnyObj;
  export type Venue = z.infer<typeof VenueSchema>;

  export const CreateVenueSchema: ZAnyObj;
  export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

  export const UpdateVenueSchema: ZAnyObj;
  export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

  // ============================================================================
  // ZONES TYPES
  // ============================================================================
  export const ZoneSchema: ZAnyObj;
  export type Zone = z.infer<typeof ZoneSchema>;

  export const CreateZoneSchema: ZAnyObj;
  export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

  export const UpdateZoneSchema: ZAnyObj;
  export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

  // ============================================================================
  // NETWORKS TYPES
  // ============================================================================
  export const NetworkSchema: ZAnyObj;
  export type Network = z.infer<typeof NetworkSchema>;

  export const CreateNetworkSchema: ZAnyObj;
  export type CreateNetworkInput = z.infer<typeof CreateNetworkSchema>;

  export const UpdateNetworkSchema: ZAnyObj;
  export type UpdateNetworkInput = z.infer<typeof UpdateNetworkSchema>;

  // ============================================================================
  // CORPORATES TYPES
  // ============================================================================
  export const CorporateSchema: ZAnyObj;
  export type Corporate = z.infer<typeof CorporateSchema>;

  export const CreateCorporateSchema: ZAnyObj;
  export type CreateCorporateInput = z.infer<typeof CreateCorporateSchema>;

  export const UpdateCorporateSchema: ZAnyObj;
  export type UpdateCorporateInput = z.infer<typeof UpdateCorporateSchema>;

  // ============================================================================
  // COMPLIANCE FORMS TYPES
  // ============================================================================
  // Using ZodString placeholder until enumerated values are finalized in types package
  export const AdminResponsibilityRole: z.ZodString;
  export type AdminResponsibilityRole = string;

  export const AdminResponsibilityStatus: z.ZodString;
  export type AdminResponsibilityStatus = string;

  export const CertificationSchema: ZAnyObj;
  export type Certification = z.infer<typeof CertificationSchema>;

  export const AdminResponsibilityFormSchema: ZAnyObj;
  export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

  export const CreateAdminResponsibilityFormSchema: ZAnyObj;
  export type CreateAdminResponsibilityFormInput = z.infer<
    typeof CreateAdminResponsibilityFormSchema
  >;

  export const UpdateAdminResponsibilityFormSchema: ZAnyObj;
  export type UpdateAdminResponsibilityFormInput = z.infer<
    typeof UpdateAdminResponsibilityFormSchema
  >;

  // ============================================================================
  // ONBOARDING TYPES
  // ============================================================================
  export const CreateCorporateOnboardingSchema: ZAnyObj;
  export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;

  export const JoinWithTokenSchema: ZAnyObj;
  export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;

  export const CreateOrgOnboardingSchema: ZAnyObj;
  export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

  export const CreateNetworkOrgPayload: ZAnyObj;
  export type CreateNetworkOrgPayload = z.infer<typeof CreateNetworkOrgPayload>;

  export const OnboardingIntent: z.ZodEnum<["create_org", "create_corporate", "join_existing"]>;
  export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

  export const OnboardingStatus: z.ZodEnum<["not_started", "in_progress", "complete"]>;
  export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

  export const OnboardingStateSchema: ZAnyObj;
  export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

  // ============================================================================
  // EVENTS TYPES
  // ============================================================================
  export const NewEventSchema: ZAnyObj;
  export type NewEvent = z.infer<typeof NewEventSchema>;

  // ============================================================================
  // RBAC TYPES
  // ============================================================================
  export const RBAC_RULES: Record<string, unknown>;
}

```


## Refactor: apps/web/src/types/idb.d.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/src/types/idb.d.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Idb D type definitions
// Tags: P2, APP, CODE
declare module "idb";

```


## Refactor: apps/web/tailwind.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/tailwind.config.ts`

**File Content:**
```typescript
// [P2][APP][ENV] Tailwind Config
// Tags: P2, APP, ENV
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6366f1", dark: "#4f46e5" },
        secondary: { DEFAULT: "#10b981", dark: "#059669" },
        surface: {
          DEFAULT: "#0f172a",
          light: "#f8fafc",
          card: "#1e293b",
          accent: "#334155",
        },
        text: {
          DEFAULT: "#f1f5f9",
          muted: "#94a3b8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

```


## Refactor: apps/web/tests/e2e/onboarding-full-flow.spec.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/tests/e2e/onboarding-full-flow.spec.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Onboarding Full Flow Spec tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][E2E] Onboarding Happy-Path E2E Test
 * Tags: e2e, onboarding, playwright, test
 *
 * Overview:
 * - End-to-end test covering full onboarding flow
 * - Tests: sign-up → bootstrap → verify-eligibility → create-network → complete
 * - Uses Playwright for browser automation
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Onboarding Happy Path", () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

  test("should complete full onboarding flow: create-org", async ({ page }: { page: Page }) => {
    // 1. Sign in / Navigate to onboarding
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "test-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to onboarding
    await page.waitForURL(`${baseUrl}/onboarding/**`);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/onboarding");

    // 2. Bootstrap session (auto-runs on layout load)
    const bootstrapResponse = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    expect(bootstrapResponse.ok()).toBe(true);
    const sessionData = await bootstrapResponse.json();
    expect(sessionData.user).toBeDefined();
    expect(sessionData.user.onboarding).toBeDefined();

    // 3. Fill profile page
    await page.goto(`${baseUrl}/onboarding/profile`);
    await page.fill('input[name="fullName"]', "John Doe");
    await page.fill('input[name="preferredName"]', "John");
    await page.fill('input[name="phone"]', "555-1234");
    await page.selectOption('select[name="timeZone"]', "America/New_York");
    await page.selectOption('select[name="selfDeclaredRole"]', "owner_founder_director");
    await page.click('button:has-text("Next")');

    // 4. Verify eligibility
    const eligibilityResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: {
          selfDeclaredRole: "owner_founder_director",
        },
      },
    );
    expect(eligibilityResponse.ok()).toBe(true);
    const eligibilityData = await eligibilityResponse.json();
    expect(eligibilityData.allowed).toBe(true);

    // 5. Select intent (create-org)
    await page.goto(`${baseUrl}/onboarding/intent`);
    await page.click('button:has-text("Create New Organization")');
    await page.waitForURL(`${baseUrl}/onboarding/**`);

    // 6. Fill admin form
    await page.goto(`${baseUrl}/onboarding/admin-form`);
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.selectOption('select[name="taxIdType"]', "ssn");
    await page.fill('input[name="taxIdLast4"]', "1234");
    await page.click('button:has-text("Submit")');

    // Verify form submission
    const adminFormResponse = await page.request.post(`${baseUrl}/api/onboarding/admin-form`, {
      data: {
        firstName: "John",
        lastName: "Doe",
        taxIdType: "ssn",
        taxIdLast4: "1234",
      },
    });
    expect(adminFormResponse.ok()).toBe(true);

    // 7. Create network + org
    await page.goto(`${baseUrl}/onboarding/create-network-org`);
    await page.fill('input[name="orgName"]', "Acme Corp");
    await page.fill('input[name="venueName"]', "Main Office");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.click('button:has-text("Create Network")');

    // Verify network creation
    const createNetworkResponse = await page.request.post(
      `${baseUrl}/api/onboarding/create-network-org`,
      {
        data: {
          networkName: "Acme Corp Network",
          orgName: "Acme Corp",
          venueName: "Main Office",
          city: "New York",
          state: "NY",
        },
      },
    );
    expect(createNetworkResponse.ok()).toBe(true);
    const networkData = await createNetworkResponse.json();
    expect(networkData.networkId).toBeDefined();
    expect(networkData.orgId).toBeDefined();

    // 8. Verify onboarding is marked complete
    const finalBootstrap = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    const finalSessionData = await finalBootstrap.json();
    expect(finalSessionData.user.onboarding.status).toBe("completed");

    // 9. Verify user is redirected to app dashboard
    await page.goto(`${baseUrl}/app`);
    expect(page.url()).toContain("/app");
    expect(await page.isVisible("text=Welcome")).toBe(true);
  });

  test("should complete full onboarding flow: join-with-token", async ({
    page,
  }: {
    page: Page;
  }) => {
    // 1. Sign in
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "join-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    // 2. Bootstrap session
    await page.waitForURL(`${baseUrl}/onboarding/**`);
    const bootstrapResponse = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    expect(bootstrapResponse.ok()).toBe(true);

    // 3. Fill profile
    await page.goto(`${baseUrl}/onboarding/profile`);
    await page.fill('input[name="fullName"]', "Jane Smith");
    await page.fill('input[name="preferredName"]', "Jane");
    await page.selectOption('select[name="selfDeclaredRole"]', "manager_supervisor");
    await page.click('button:has-text("Next")');

    // 4. Verify eligibility
    const eligibilityResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: {
          selfDeclaredRole: "manager_supervisor",
        },
      },
    );
    expect(eligibilityResponse.ok()).toBe(true);

    // 5. Select intent (join-existing)
    await page.goto(`${baseUrl}/onboarding/intent`);
    await page.click('button:has-text("Join Existing Organization")');

    // 6. Enter join token
    const testToken = process.env.TEST_JOIN_TOKEN || "test-token-12345";
    await page.goto(`${baseUrl}/onboarding/join`);
    await page.fill('input[name="token"]', testToken);
    await page.click('button:has-text("Join")');

    // Verify token join
    const joinResponse = await page.request.post(`${baseUrl}/api/onboarding/join-with-token`, {
      data: {
        token: testToken,
      },
    });
    expect(joinResponse.ok()).toBe(true);
    const joinData = await joinResponse.json();
    expect(joinData.networkId).toBeDefined();
    expect(joinData.orgId).toBeDefined();

    // 7. Verify onboarding is marked complete
    const finalBootstrap = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    const finalSessionData = await finalBootstrap.json();
    expect(finalSessionData.user.onboarding.status).toBe("completed");

    // 8. Verify user can access app
    await page.goto(`${baseUrl}/app`);
    expect(page.url()).toContain("/app");
  });

  test("should reject invalid join token", async ({ page }: { page: Page }) => {
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "invalid-token-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    await page.goto(`${baseUrl}/onboarding/join`);
    await page.fill('input[name="token"]', "invalid-token-xyz");
    await page.click('button:has-text("Join")');

    // Verify error is shown
    const errorMessage = await page.locator("text=Invalid token").isVisible();
    expect(errorMessage).toBe(true);
  });

  test("should enforce rate-limiting on verify-eligibility", async ({ page }: { page: Page }) => {
    const testToken = "rate-limit-test-token";

    // Make 5 requests (should all succeed)
    for (let i = 0; i < 5; i++) {
      const response = await page.request.post(`${baseUrl}/api/onboarding/verify-eligibility`, {
        data: { selfDeclaredRole: "owner_founder_director" },
      });
      expect([200, 401]).toContain(response.status()); // 401 if not auth, 200 if valid
    }

    // 6th request should be rate-limited
    const rateLimitedResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: { selfDeclaredRole: "owner_founder_director" },
      },
    );

    // Should get 429 Too Many Requests
    expect(rateLimitedResponse.status()).toBe(429);
  });
});

```


## Refactor: apps/web/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2022", "DOM"],
    "types": ["node"],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      // @ maps to the web app root, enabling @/app/* and @/src/* imports
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["app", "src", "next-env.d.ts", ".next/types/**/*.ts", "vitest.d.ts"],
  "exclude": ["node_modules", "**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"]
}

```


## Refactor: apps/web/vitest.bench.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/vitest.bench.config.ts`

**File Content:**
```typescript
//[P1][APP][CONFIG] Vitest benchmark configuration for performance testing
// Tags: test, benchmark, performance, vitest

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.bench.ts"],
    benchmark: {
      include: ["**/*.bench.ts"],
      exclude: ["node_modules", "dist", "build"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/components": path.resolve(__dirname, "./src/components"),
    },
  },
});

```


## Refactor: apps/web/vitest.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/vitest.config.ts`

**File Content:**
```typescript
// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    // Limit workers by default in local dev to reduce memory usage.
    // Developers can override via CLI flags if they want faster runs.
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.config.*", "**/node_modules/**", "**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

```


## Refactor: apps/web/vitest.d.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/vitest.d.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] Vitest D tests
// Tags: P1, TEST, TEST
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import "@testing-library/jest-dom/vitest";

```


## Refactor: apps/web/vitest.setup.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `apps/web/vitest.setup.ts`

**File Content:**
```typescript
// [P0][TEST][TEST] Vitest Setup tests
// Tags: P0, TEST, TEST
import "@testing-library/jest-dom/vitest";
// Polyfill IndexedDB for tests that use idb in a DOM-like environment
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Make vi globally available
declare global {
  const vi: (typeof import("vitest"))["vi"];
}

// Mock Firebase environment variables for tests
vi.stubGlobal("process", {
  ...process,
  env: {
    ...process.env,
    NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef123456",
    NODE_ENV: "test",
  },
});

// Global mock for server-side firebase wrapper to avoid importing firebase-admin
// in unit tests which can be heavy and may emit environment warnings.
vi.mock("@/src/lib/firebase.server", () => {
  return {
    adminDb: undefined,
    adminSdk: {
      firestore: {
        Timestamp: {
          now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
        },
      },
    },
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

```


## Refactor: firestore.rules
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `firestore.rules`

**File Content:**
```typescript
// [P1][INTEGRITY][RULES] Firestore security rules for multi-tenant RBAC
// Tags: P1, INTEGRITY, FIRESTORE, RULES, SECURITY, RBAC, TENANT_ISOLATION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function uid() { return request.auth.uid; }
    function userOrgId() { return request.auth.token.orgId; }
    function userRoles() { return request.auth.token.roles; }

    // Token-based role checking (new style with custom claims)
    function hasAnyRole(roles) {
      return isSignedIn() && userRoles() != null && userRoles().hasAny(roles);
    }

    // Org membership checking (legacy style with membership docs)
    function isOrgMember(orgId) {
      return exists(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId));
    }

    // Legacy role checking using membership documents
    function hasAnyRoleLegacy(orgId, roles) {
      return isOrgMember(orgId) &&
        get(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId)).data.roles.hasAny(roles);
    }

    // Combined check: token-based (preferred) or legacy membership doc
    function isManager() {
      return hasAnyRole(['org_owner','admin','manager']);
    }

    function sameOrg(resourceOrgId) {
      return isSignedIn() && userOrgId() == resourceOrgId;
    }

    // Users: self only; no enumeration
    match /users/{userId} {
      allow read, create, update: if isSignedIn() && userId == uid();
      allow list: if false;
    }

    // Orgs - read by members, write by org_owner
    match /orgs/{orgId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      allow create: if isSignedIn();
      // Only org_owner (token) or legacy owner/admin can update/delete
  allow update, delete: if isSignedIn() && ((hasAnyRole(['org_owner']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin']));
      allow list: if false;

      // Schedules as subcollection under orgs
      match /schedules/{scheduleId} {
  allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
      }

      // Positions as subcollection under orgs
      match /positions/{positionId} {
  allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      }

      // Shifts as subcollection under schedules
      match /schedules/{scheduleId}/shifts/{shiftId} {
        // Allow reading (including listing) within org
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        // Allow scheduler+/manager/owner writes
        allow write: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
        // Allow staff to update their own shift with limited fields only
        allow update: if isSignedIn() && sameOrg(orgId) && resource.data.userId == uid() &&
          request.resource.data.diff(resource.data).changedKeys().hasOnly(['notes','checkInTime','updatedAt']);
      }

      // Join tokens - managers can create/manage
      match /join_tokens/{tokenId} {
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      }
    }

    // Organizations (alternate path) - alias for orgs
    match /organizations/{orgId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      allow create: if isSignedIn();
  allow update, delete: if isSignedIn() && ((hasAnyRole(['org_owner']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin']));
      allow list: if false;

      // Messages - managers can create, all members can read
      match /messages/{messageId} {
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      }

      // Receipts - members can create their own receipts only
      match /receipts/{receiptId} {
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow create: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId)) && request.resource.data.userId == uid();
        allow update, delete: if isSignedIn() && resource.data.userId == uid();
      }

      // Schedules as subcollection under organizations
      match /schedules/{scheduleId} {
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
      }

      // Positions as subcollection under organizations
      match /positions/{positionId} {
        allow read: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
        allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      }
    }

    // Memberships: id = uid_orgId
    // Token-based: managers can create/update
    // Legacy: users can create their own
    match /memberships/{membershipId} {
      allow read: if isSignedIn() && (
        resource.data.uid == uid() ||
        (isManager() && sameOrg(resource.data.orgId)) ||
        hasAnyRoleLegacy(resource.data.orgId, ['owner','admin','manager'])
      );
      allow create: if isSignedIn() && (
        request.resource.data.uid == uid() ||
        (isManager() && sameOrg(request.resource.data.orgId))
      );
      allow update, delete: if isSignedIn() && (
        (isManager() && sameOrg(resource.data.orgId)) ||
        hasAnyRoleLegacy(resource.data.orgId, ['owner','admin','manager'])
      );
      allow list: if false;
    }

    // Org-scoped resources (top-level per org) — block listing by using get instead of read
    match /venues/{orgId}/venues/{venueId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      // Create/Update by manager+, Delete by owner/admin only
      allow create, update: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow delete: if isSignedIn() && ((hasAnyRole(['org_owner','admin']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin']));
      allow list: if false;
    }

    match /zones/{orgId}/zones/{zoneId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow list: if false;
    }

    match /positions/{orgId}/positions/{positionId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      allow write: if isSignedIn() && ((isManager() && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow list: if false;
    }

    // Schedules (top-level per org) - manager+ can write, block listing
    match /schedules/{orgId}/schedules/{scheduleId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      // Create/Update by scheduler+, but restrict delete to manager+ (no scheduler)
      allow create, update: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
      allow delete: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow list: if false;
    }

    // Shifts (top-level per org) - block listing; writes by scheduler+; staff can update own limited fields
    match /shifts/{orgId}/shifts/{shiftId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      // Create/Update by scheduler+/manager/owner; delete by manager+ only (no scheduler)
      allow create, update: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
      allow delete: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      // Staff self-service limited updates
      allow update: if isSignedIn() && sameOrg(orgId) && resource.data.userId == uid() &&
        request.resource.data.diff(resource.data).changedKeys().hasOnly(['notes','checkInTime','updatedAt']);
      allow list: if false;
    }

    // Attendance (top-level per org) — block listing; writes by scheduler+/manager/owner only
    match /attendance_records/{orgId}/records/{recordId} {
      allow get: if isSignedIn() && (sameOrg(orgId) || isOrgMember(orgId));
      // Only scheduler+/manager/owner can create/update/delete
      allow create, update: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager','scheduler']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager','scheduler']));
      allow delete: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow list: if false;
    }

    // Join tokens (non-enumerable) — owner/admin only
    match /join_tokens/{orgId}/join_tokens/{tokenId} {
      // Managers can read token metadata; write restricted to owner/admin
      allow get: if isSignedIn() && ((hasAnyRole(['org_owner','admin','manager']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin','manager']));
      allow create, update, delete: if isSignedIn() && ((hasAnyRole(['org_owner','admin']) && sameOrg(orgId)) || hasAnyRoleLegacy(orgId, ['owner','admin']));
      allow list: if false;
    }

    // ---------------------------------------------------------------------------
    // Network (tenant root) rules – v14.0.0

    // Global compliance forms (admin responsibility, etc.) are written by Admin SDK
    // via onboarding flows. Clients must never touch these directly.
    match /compliance/{complianceDocId} {
      allow read, write: if false;
    }

    // Network root documents
    match /networks/{networkId} {

      // Networks are created and managed only by the backend (Admin SDK).
      // Do not allow clients to create/update/delete networks directly.
      allow create, update, delete: if false;

      // Authenticated users may read network metadata.
      allow get: if isSignedIn();
      allow list: if false;

      // Future-proof: if you introduce nested collections under /networks later,
      // define them explicitly here. For now, most org/venue data is still in
      // top-level /orgs and /venues with a networkId field.
      match /orgs/{orgId} {
        allow get: if isSignedIn();
        allow list: if false;
        allow create, update, delete: if false;
      }

      match /venues/{venueId} {
        allow get: if isSignedIn();
        allow list: if false;
        allow create, update, delete: if false;
      }

      // Network-level memberships (reserved for future v14+ work)
      match /memberships/{membershipId} {
        allow read: if isSignedIn();
        allow create, update, delete: if false;
      }

      // Network-scoped compliance docs such as /networks/{id}/compliance/adminResponsibilityForm
      match /compliance/{complianceId} {
        // For now, keep these fully server-only. You can later relax this for
        // network_owner or similar roles once UX is defined.
        allow read, write: if false;
      }
    }

  }
}

```


## Refactor: packages/config/src/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/config/src/index.ts`

**File Content:**
```typescript
// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
export const APP_CONFIG = {
  name: "Fresh Schedules",
  version: "0.1.0",
  description: "Modern staff scheduling PWA",
} as const;

export const FIREBASE_CONFIG = {
  // These will be overridden by environment variables
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeout: 30000,
} as const;

export const UI_CONFIG = {
  defaultTheme: "light",
  supportedThemes: ["light", "dark"] as const,
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  } as const,
} as const;

```


## Refactor: packages/config/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/config/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```


## Refactor: packages/env/src/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/env/src/index.ts`

**File Content:**
```typescript
// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
import { z } from "zod";

const bool = z.enum(["true", "false"]).transform((v) => v === "true");

const SharedSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),

  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.string().optional(),

  FIREBASE_EMULATORS: z.string().optional().default("false").pipe(bool),
  FIREBASE_EMULATOR_HOST: z.string().optional().default("127.0.0.1"),
  FIREBASE_AUTH_EMULATOR_PORT: z.string().optional().default("9099"),
  FIRESTORE_EMULATOR_PORT: z.string().optional().default("8080"),
  FIREBASE_STORAGE_EMULATOR_PORT: z.string().optional().default("9199"),
});

const AdminEitherSchema = z.union([
  z.object({
    GOOGLE_APPLICATION_CREDENTIALS_B64: z.string().min(10),
  }),
  z.object({
    FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
    FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(40),
  }),
]);

const EnvSchema = SharedSchema.and(AdminEitherSchema);

const parsed = EnvSchema.safeParse(process.env as Record<string, string | undefined>);
if (!parsed.success) {
  const formatted = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(
    `❌ Environment validation failed.\nPlease check your .env settings:\n${formatted}`,
  );
}

type Shared = z.infer<typeof SharedSchema>;
type AdminEither = z.infer<typeof AdminEitherSchema>;
type Env = Shared & AdminEither;

const env = parsed.data as Env;

export function getAdminCredentials(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  if ("GOOGLE_APPLICATION_CREDENTIALS_B64" in env) {
    const json = Buffer.from(env.GOOGLE_APPLICATION_CREDENTIALS_B64, "base64").toString("utf8");
    const parsedJson = JSON.parse(json);
    return {
      projectId: parsedJson.project_id,
      clientEmail: parsedJson.client_email,
      privateKey: parsedJson.private_key,
    };
  }
  const pk = (env as any).FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
  return {
    projectId: (env as any).FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: (env as any).FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pk,
  };
}

export const ENV = {
  FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET,

  NEXT_PUBLIC_FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME ?? "App",
  NEXT_PUBLIC_APP_ENV: env.NEXT_PUBLIC_APP_ENV ?? "local",

  FIREBASE_EMULATORS: env.FIREBASE_EMULATORS,
  FIREBASE_EMULATOR_HOST: env.FIREBASE_EMULATOR_HOST,
  FIREBASE_AUTH_EMULATOR_PORT: env.FIREBASE_AUTH_EMULATOR_PORT,
  FIRESTORE_EMULATOR_PORT: env.FIRESTORE_EMULATOR_PORT,
  FIREBASE_STORAGE_EMULATOR_PORT: env.FIREBASE_STORAGE_EMULATOR_PORT,
} as const;

```


## Refactor: packages/mcp-server/src/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/mcp-server/src/index.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Index
// Tags: P2, APP, CODE
/**


Minimal MCP-like stdio JSON-RPC server (read-only).


Methods:



repo.search { q: string, globs?: string[] }




repo.read   { path: string }




repo.paths  { globs?: string[] }
*/
import fg from "fast-glob";
import { parse, success, error } from "jsonrpc-lite";
import fs from "node:fs/promises";
import { createInterface } from "node:readline";

type Req = { id: string | number | null; method: string; params?: unknown };
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
async function repoSearch(q: string, globs: string[] = ["/*"]) {
  const paths = await fg(globs, {
    dot: true,
    ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
  });
  const res: Array<{ path: string; line: number; text: string }> = [];
  for (const p of paths) {
    if (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".woff")) continue;
    const text = await fs.readFile(p, "utf8").catch(() => "");
    if (!text) continue;
    const lines = text.split("\n");
    lines.forEach((ln, i) => {
      if (ln.toLowerCase().includes(q.toLowerCase()))
        res.push({ path: p, line: i + 1, text: ln.trim() });
    });
  }
  return res.slice(0, 500);
}
async function repoRead(path: string) {
  const text = await fs.readFile(path, "utf8");
  if (path.startsWith(".env")) return "[REDACTED_ENV]";
  return text;
}
async function repoPaths(globs: string[] = ["/*"]) {
  return await fg(globs, {
    dot: true,
    ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
  });
}
type SearchParams = { q?: string; globs?: string[] };
type ReadParams = { path: string };
type PathsParams = { globs?: string[] };

async function dispatch(req: Req) {
  const { method, params } = req;
  if (method === "repo.search") {
    const p = (params ?? {}) as SearchParams;
    return await repoSearch(p.q ?? "", p.globs);
  }
  if (method === "repo.read") {
    const p = (params ?? {}) as ReadParams;
    return await repoRead(p.path);
  }
  if (method === "repo.paths") {
    const p = (params ?? {}) as PathsParams;
    return await repoPaths(p.globs);
  }
  throw new Error(`Unknown method: ${method}`);
}
rl.on("line", async (line) => {
  try {
    const parsed = parse(line) as { type: string; payload?: unknown };
    if (parsed.type !== "request") return;
    const req = parsed.payload as Req;
    const result = await dispatch(req);
    process.stdout.write(JSON.stringify(success(req.id ?? null, result)) + "\n");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    process.stdout.write(JSON.stringify(error(null, { code: -32603, message })) + "\n");
  }
});

```


## Refactor: packages/mcp-server/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/mcp-server/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "ES2022",
    "target": "ES2022",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src"]
}

```


## Refactor: packages/rules-tests/package.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/rules-tests/package.json`

**File Content:**
```typescript
{
  "name": "@fresh-root/rules-tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@firebase/rules-unit-testing": "^5.0.0",
    "firebase": "^12.0.0",
    "firebase-admin": "^13.6.0",
    "vitest": "^4.0.6"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}

```


## Refactor: packages/rules-tests/src/rbac.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/rules-tests/src/rbac.test.ts`

**File Content:**
```typescript
// [P0][RBAC][TEST] RBAC tests
// Tags: P0, RBAC, TEST
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Load rules from repository root - use process.cwd() which points to package directory
  // then navigate up to repo root
  const rulesPath = join(process.cwd(), "../../firestore.rules");

  interface FirestoreOptions {
    rules: string;
    host: string;
    port: number;
  }

  const firestoreOptions: FirestoreOptions = {
    rules: readFileSync(rulesPath, "utf8"),
    host: "localhost",
    port: 8080,
  };

  const firestoreHost =
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
  if (firestoreHost) {
    const parts = firestoreHost.split(":");
    if (parts.length === 2 && parts[0]) {
      firestoreOptions.host = parts[0];
      firestoreOptions.port = Number(parts[1]);
    }
  }

  testEnv = await initializeTestEnvironment({
    projectId: "demo-fresh-rbac",
    firestore: firestoreOptions,
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

describe("RBAC Rules Tests", () => {
  describe("Organization Access", () => {
    test("org_owner can write to org", async () => {
      const ctx = testEnv.authenticatedContext("u1", {
        orgId: "orgA",
        roles: ["org_owner"],
      });
      const db = ctx.firestore();

      await expect(setDoc(doc(db, "orgs/orgA"), { name: "Org A" })).resolves.toBeUndefined();
    });

    test("manager cannot write to org (only read)", async () => {
      const ctx = testEnv.authenticatedContext("u2", {
        orgId: "orgA",
        roles: ["manager"],
      });
      const db = ctx.firestore();
      await expect(setDoc(doc(db, "orgs/orgA"), { name: "Org A Modified" })).rejects.toThrow();
    });

    test("staff cannot write to org", async () => {
      const ctx = testEnv.authenticatedContext("u3", {
        orgId: "orgA",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(setDoc(doc(db, "orgs/orgA"), { name: "Org A" })).rejects.toThrow();
    });
  });

  describe("Schedule Access", () => {
    test("manager can create schedule in their org", async () => {
      const ctx = testEnv.authenticatedContext("u4", {
        orgId: "orgB",
        roles: ["manager"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "schedules/orgB/s1"), {
          orgId: "orgB",
          name: "Week 1",
          startDate: 1234567890,
        }),
      ).resolves.toBeUndefined();
    });

    test("scheduler can create schedule in their org", async () => {
      const ctx = testEnv.authenticatedContext("u5", {
        orgId: "orgB",
        roles: ["scheduler"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "schedules/orgB/s2"), {
          orgId: "orgB",
          name: "Week 2",
        }),
      ).resolves.toBeUndefined();
    });

    test("staff cannot create schedule", async () => {
      const ctx = testEnv.authenticatedContext("u6", {
        orgId: "orgB",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "schedules/orgB/s3"), {
          orgId: "orgB",
          name: "Week 3",
        }),
      ).rejects.toThrow();
    });

    test("staff can read schedule from their org", async () => {
      const ctx = testEnv.authenticatedContext("u7", {
        orgId: "orgC",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(getDoc(doc(db, "schedules/orgC/s1"))).resolves.toBeTruthy();
    });

    test("user cannot read schedule from different org", async () => {
      const ctx = testEnv.authenticatedContext("u8", {
        orgId: "orgD",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(getDoc(doc(db, "schedules/orgC/s1"))).rejects.toThrow();
    });
  });

  describe("Membership Access", () => {
    test("manager can create membership in their org", async () => {
      const ctx = testEnv.authenticatedContext("u9", {
        orgId: "orgE",
        roles: ["manager"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "memberships/newuser_orgE"), {
          uid: "newuser",
          orgId: "orgE",
          roles: ["staff"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ).resolves.toBeUndefined();
    });

    test("admin can create membership in their org", async () => {
      const ctx = testEnv.authenticatedContext("u10", {
        orgId: "orgE",
        roles: ["admin"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "memberships/anotheruser_orgE"), {
          uid: "anotheruser",
          orgId: "orgE",
          roles: ["scheduler"],
        }),
      ).resolves.toBeUndefined();
    });

    test("staff cannot create membership for others", async () => {
      const ctx = testEnv.authenticatedContext("u11", {
        orgId: "orgF",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "memberships/newuser_orgF"), {
          uid: "newuser",
          orgId: "orgF",
          roles: ["staff"],
        }),
      ).rejects.toThrow();
    });

    test("user can create their own membership", async () => {
      const ctx = testEnv.authenticatedContext("u11b", {
        orgId: "orgF",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "memberships/u11b_orgF"), {
          uid: "u11b",
          orgId: "orgF",
          roles: ["staff"],
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("User Profile Access", () => {
    test("user can read their own profile", async () => {
      const ctx = testEnv.authenticatedContext("u12", {
        orgId: "orgG",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(getDoc(doc(db, "users/u12"))).resolves.toBeTruthy();
    });

    test("user can write their own profile", async () => {
      const ctx = testEnv.authenticatedContext("u13", {
        orgId: "orgG",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(
        setDoc(doc(db, "users/u13"), {
          name: "User 13",
          email: "u13@example.com",
        }),
      ).resolves.toBeUndefined();
    });

    test("user cannot read another user profile", async () => {
      const ctx = testEnv.authenticatedContext("u14", {
        orgId: "orgG",
        roles: ["staff"],
      });
      const db = ctx.firestore();
      await expect(getDoc(doc(db, "users/u13"))).rejects.toThrow();
    });
  });
});

```


## Refactor: packages/rules-tests/src/rules.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/rules-tests/src/rules.test.ts`

**File Content:**
```typescript
// [P1][TEST][RULES] Firestore Rules Unit Tests
// Tags: P1, TEST, RULES, VITEST, FIRESTORE
/**
 * @fileoverview
 * Unit tests for firestore.rules: access control for orgs, join_tokens, memberships, and other collections.
 * Uses Firebase Rules Testing SDK to verify authenticated and unauthenticated access patterns.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import { beforeAll, afterAll, test } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Navigate to workspace root to find firestore.rules
  const rulesPath = join(process.cwd(), "../../firestore.rules");
  testEnv = await initializeTestEnvironment({
    projectId: "demo-fresh",
    firestore: {
      rules: readFileSync(rulesPath, "utf8"),
      host: "127.0.0.1",
      port: 8080
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authed(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function unauth() {
  return testEnv.unauthenticatedContext().firestore();
}

test("deny unauthenticated read of org doc", async () => {
  const db = unauth();
  const ref = doc(db, "orgs/demo-org");
  await assertFails(getDoc(ref));
});

test("member can read their org", async () => {
  // seed membership
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await setDoc(doc(unauthDb, "memberships", "u1_demo-org"), { uid: "u1", orgId: "demo-org", roles: ["manager"] });

  const db = authed("u1");
  const ref = doc(db, "orgs", "demo-org");
  await assertSucceeds(getDoc(ref));
});

test("non-member cannot read org", async () => {
  const db = authed("u2");
  const ref = doc(db, "orgs", "demo-org");
  await assertFails(getDoc(ref));
});

test("authenticated user can read join token", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  // Seed a join token
  await setDoc(doc(unauthDb, "join_tokens", "test-token-1"), {
    networkId: "network-1",
    orgId: "org-1",
    role: "staff",
    expiresAt: Date.now() + 86400000,
    disabled: false,
  });

  const db = authed("u1");
  const ref = doc(db, "join_tokens", "test-token-1");
  await assertSucceeds(getDoc(ref));
});

test("unauthenticated user cannot read join token", async () => {
  const db = unauth();
  const ref = doc(db, "join_tokens", "test-token-1");
  await assertFails(getDoc(ref));
});


```


## Refactor: packages/rules-tests/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/rules-tests/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "moduleResolution": "Bundler",
    "verbatimModuleSyntax": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}

```


## Refactor: packages/rules-tests/vitest.config.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/rules-tests/vitest.config.ts`

**File Content:**
```typescript
// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [],
  },
});

```


## Refactor: packages/types/src/__tests__/adminResponsibilityForm.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/adminResponsibilityForm.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] AdminResponsibilityForm schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, COMPLIANCE
import { Timestamp } from "firebase-admin/firestore";
import { describe, it, expect } from "vitest";

import { AdminResponsibilityFormSchema } from "../compliance/adminResponsibilityForm";

describe("AdminResponsibilityFormSchema", () => {
  it("validates a full form", () => {
    const now = Timestamp.now();
    const obj = {
      formId: "f1",
      networkId: "n1",
      uid: "u1",
      role: "network_owner",
      status: "submitted",
      certification: {
        acknowledgesDataProtection: true,
        acknowledgesGDPRCompliance: true,
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = AdminResponsibilityFormSchema.safeParse(obj);
    expect(result.success).toBe(true);
  });

  it("requires certification booleans to be true", () => {
    const now = Timestamp.now();
    const obj = {
      formId: "f2",
      networkId: "n1",
      uid: "u1",
      role: "network_admin",
      certification: {
        acknowledgesDataProtection: true,
        acknowledgesGDPRCompliance: false, // invalid
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = AdminResponsibilityFormSchema.safeParse(obj);
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/attendance.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/attendance.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Attendance schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ATTENDANCE
import { describe, it, expect } from "vitest";

import {
  AttendanceRecordSchema,
  CreateAttendanceRecordSchema,
  UpdateAttendanceRecordSchema,
  ListAttendanceRecordsQuerySchema,
  AttendanceStatus,
  CheckMethod,
  LocationSchema,
} from "../attendance";

describe("AttendanceRecordSchema", () => {
  it("validates a complete attendance record", () => {
    const record = {
      id: "a1",
      orgId: "o1",
      shiftId: "sh1",
      scheduleId: "sc1",
      staffUid: "u1",
      status: "checked_in" as const,
      scheduledStart: Date.now() - 3600_000,
      scheduledEnd: Date.now() + 3600_000,
      actualCheckIn: Date.now() - 1800_000,
      actualCheckOut: undefined,
      checkInMethod: "qr_code" as const,
      checkInLocation: { lat: 40.0, lng: -70.0 },
      scheduledDuration: 120,
      actualDuration: 90,
      breakDuration: 10,
      notes: "On time",
      managerNotes: "Good",
      overriddenBy: "admin1",
      overriddenAt: Date.now(),
      createdAt: Date.now() - 4000,
      updatedAt: Date.now() - 1000,
    };
    const result = AttendanceRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("requires core fields", () => {
    const result = AttendanceRecordSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("orgId");
      expect(fields).toContain("shiftId");
      expect(fields).toContain("scheduleId");
      expect(fields).toContain("staffUid");
      expect(fields).toContain("scheduledStart");
      expect(fields).toContain("scheduledEnd");
      expect(fields).toContain("scheduledDuration");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts valid status enum values", () => {
    const statuses: Array<typeof AttendanceStatus._type> = [
      "scheduled",
      "checked_in",
      "checked_out",
      "no_show",
      "excused_absence",
      "late",
    ];
    statuses.forEach((status) => {
      const ok = AttendanceStatus.safeParse(status);
      expect(ok.success).toBe(true);
    });
  });

  it("accepts valid check methods and location", () => {
    const methods: Array<typeof CheckMethod._type> = [
      "manual",
      "qr_code",
      "nfc",
      "geofence",
      "admin_override",
    ];
    methods.forEach((m) => {
      expect(CheckMethod.safeParse(m).success).toBe(true);
    });

    const locOk = LocationSchema.safeParse({ lat: 10, lng: 10, accuracy: 5 });
    expect(locOk.success).toBe(true);
  });
});

describe("CreateAttendanceRecordSchema", () => {
  it("validates creation input", () => {
    const input = {
      orgId: "o1",
      shiftId: "sh1",
      scheduleId: "sc1",
      staffUid: "u1",
      scheduledStart: Date.now(),
      scheduledEnd: Date.now() + 3600_000,
      breakDuration: 0,
      notes: "First shift",
    };
    const result = CreateAttendanceRecordSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires minimum fields", () => {
    const result = CreateAttendanceRecordSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("orgId");
      expect(fields).toContain("shiftId");
      expect(fields).toContain("scheduleId");
      expect(fields).toContain("staffUid");
      expect(fields).toContain("scheduledStart");
      expect(fields).toContain("scheduledEnd");
    }
  });
});

describe("UpdateAttendanceRecordSchema", () => {
  it("allows partial override updates", () => {
    const result = UpdateAttendanceRecordSchema.safeParse({
      status: "checked_out",
      actualCheckOut: Date.now(),
      breakDuration: 5,
      managerNotes: "Approved by manager",
    });
    expect(result.success).toBe(true);
  });
});

describe("ListAttendanceRecordsQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListAttendanceRecordsQuerySchema.safeParse({
      orgId: "o1",
      scheduleId: "sc1",
      status: "scheduled",
      startAfter: Date.now() - 1000,
      startBefore: Date.now() + 1000,
      limit: 25,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListAttendanceRecordsQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/corpOrgLinks.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/corpOrgLinks.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] CorpOrgLinks Test tests
// Tags: P1, TEST, TEST
// Tests for corp-org link schemas
// TODO-v14: TEN-03 / TEN-05 - this test validates the v14 `CorpOrgLinkSchema` and is part of the link-schema
// test coverage requested in docs/TODO-v14.md
import { describe, it, expect } from "vitest";

import {
  CorpOrgLinkSchema,
  CreateCorpOrgLinkSchema,
  UpdateCorpOrgLinkSchema,
} from "../links/corpOrgLinks";

describe("CorpOrgLinkSchema", () => {
  it("validates a full corp-org link with number timestamp", () => {
    const link = {
      linkId: "l1",
      networkId: "n1",
      corporateId: "c1",
      orgId: "o1",
      relationType: "partner",
      status: "active",
      createdAt: Date.now(),
    };
    const result = CorpOrgLinkSchema.safeParse(link);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = CorpOrgLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("Create schema accepts minimal create shape and rejects empty ids", () => {
    const ok = CreateCorpOrgLinkSchema.safeParse({
      networkId: "n1",
      corporateId: "c1",
      orgId: "o1",
      relationType: "r",
      status: "active",
    });
    expect(ok.success).toBe(true);

    const bad = CreateCorpOrgLinkSchema.safeParse({
      networkId: "",
      corporateId: "",
      orgId: "",
      relationType: "",
      status: "",
    });
    expect(bad.success).toBe(false);
  });

  it("Update schema allows partial updates", () => {
    const res = UpdateCorpOrgLinkSchema.safeParse({ status: "suspended" });
    expect(res.success).toBe(true);
  });
});

```


## Refactor: packages/types/src/__tests__/corpOrgLinks.v14.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/corpOrgLinks.v14.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] CorpOrgLinks V14 Test tests
// Tags: P1, TEST, TEST
import { it, expect } from "vitest";

// TODO-v14: TEN-03 - placeholder v14 test for corpOrgLinks
it("placeholder v14 corpOrgLinks test", () => {
  expect(true).toBe(true);
});

```


## Refactor: packages/types/src/__tests__/join-tokens.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/join-tokens.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Join tokens schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, JOIN_TOKENS
import { describe, it, expect } from "vitest";

import {
  JoinTokenSchema,
  CreateJoinTokenSchema,
  UpdateJoinTokenSchema,
  RedeemJoinTokenSchema,
  ListJoinTokensQuerySchema,
  JoinTokenStatus,
} from "../join-tokens";
import { MembershipRole } from "../memberships";

describe("JoinTokenSchema", () => {
  it("validates a full join token", () => {
    const token = {
      id: "t1",
      orgId: "o1",
      token: "1234567890abcdef",
      defaultRoles: ["staff"] as Array<typeof MembershipRole._type>,
      status: "active" as const,
      maxUses: 10,
      currentUses: 1,
      usedBy: ["u1"],
      expiresAt: Date.now() + 3600_000,
      description: "Invite for seasonal staff",
      createdBy: "admin1",
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 1000,
    };
    const result = JoinTokenSchema.safeParse(token);
    expect(result.success).toBe(true);
  });

  it("requires core fields", () => {
    const result = JoinTokenSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("orgId");
      expect(fields).toContain("token");
      expect(fields).toContain("defaultRoles");
      expect(fields).toContain("createdBy");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts status enum values", () => {
    ["active", "used", "expired", "revoked"].forEach((s) => {
      expect(JoinTokenStatus.safeParse(s).success).toBe(true);
    });
  });
});

describe("CreateJoinTokenSchema", () => {
  it("validates creation input", () => {
    const input = {
      orgId: "o1",
      defaultRoles: ["staff"],
      maxUses: 5,
      description: "Temporary",
    };
    const result = CreateJoinTokenSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId and defaultRoles", () => {
    const result = CreateJoinTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("UpdateJoinTokenSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateJoinTokenSchema.safeParse({ status: "revoked", maxUses: 100 });
    expect(result.success).toBe(true);
  });
});

describe("RedeemJoinTokenSchema", () => {
  it("requires a token string", () => {
    const ok = RedeemJoinTokenSchema.safeParse({ token: "1234567890abcdef" });
    expect(ok.success).toBe(true);
    const bad = RedeemJoinTokenSchema.safeParse({ token: "short" });
    expect(bad.success).toBe(false);
  });
});

describe("ListJoinTokensQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListJoinTokensQuerySchema.safeParse({
      orgId: "o1",
      status: "active",
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListJoinTokensQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/memberships.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/memberships.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Memberships schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, MEMBERSHIPS
import { describe, expect, it } from "vitest";

import {
  MembershipSchema,
  CreateMembershipSchema,
  UpdateMembershipSchema,
  MembershipRole,
  MembershipStatus,
} from "../memberships";

describe("MembershipSchema", () => {
  it("validates a complete membership", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
      status: "active" as const,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });

  it("requires uid", () => {
    const invalidMembership = {
      orgId: "org456",
      roles: ["staff" as const],
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(invalidMembership);
    expect(result.success).toBe(false);
  });

  it("requires at least one role", () => {
    const invalidMembership = {
      uid: "user123",
      orgId: "org456",
      roles: [],
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(invalidMembership);
    expect(result.success).toBe(false);
  });

  it("accepts multiple roles", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["manager" as const, "scheduler" as const],
      status: "active" as const,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });

  it("accepts optional invitedBy and invitedAt", () => {
    const validMembership = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
      status: "invited" as const,
      invitedBy: "admin789",
      invitedAt: Date.now() - 1000,
      joinedAt: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const result = MembershipSchema.safeParse(validMembership);
    expect(result.success).toBe(true);
  });
});

describe("CreateMembershipSchema", () => {
  it("validates creation payload", () => {
    const validInput = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
    };

    const result = CreateMembershipSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults status to invited", () => {
    const input = {
      uid: "user123",
      orgId: "org456",
      roles: ["staff" as const],
    };

    const result = CreateMembershipSchema.parse(input);
    expect(result.status).toBe("invited");
  });

  it("requires at least one role", () => {
    const invalidInput = {
      uid: "user123",
      orgId: "org456",
      roles: [],
    };

    const result = CreateMembershipSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("UpdateMembershipSchema", () => {
  it("allows updating roles", () => {
    const validUpdate = {
      roles: ["manager" as const, "staff" as const],
    };

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows updating status", () => {
    const validUpdate = {
      status: "suspended" as const,
    };

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rejects empty roles array", () => {
    const invalidUpdate = {
      roles: [],
    };

    const result = UpdateMembershipSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("allows partial updates", () => {
    const validUpdate = {};

    const result = UpdateMembershipSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});

describe("MembershipRole enum", () => {
  it("accepts valid roles", () => {
    const roles = ["org_owner", "admin", "manager", "scheduler", "staff"];
    roles.forEach((role) => {
      const result = MembershipRole.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid roles", () => {
    const result = MembershipRole.safeParse("super_admin");
    expect(result.success).toBe(false);
  });
});

describe("MembershipStatus enum", () => {
  it("accepts valid statuses", () => {
    const statuses = ["active", "suspended", "invited", "removed"];
    statuses.forEach((status) => {
      const result = MembershipStatus.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid statuses", () => {
    const result = MembershipStatus.safeParse("banned");
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/networks.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/networks.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Networks schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, NETWORKS
import { Timestamp } from "firebase-admin/firestore";
import { describe, it, expect } from "vitest";

import { NetworkSchema } from "../networks";

describe("NetworkSchema", () => {
  it("validates a complete network object", () => {
    const now = Timestamp.now();
    const network = {
      id: "n1",
      slug: "acme-corp",
      displayName: "Acme Corp",
      legalName: "Acme Corporation",
      kind: "corporate_network",
      segment: "retail",
      status: "pending_verification",
      environment: "production",
      primaryRegion: "US",
      timeZone: "America/Chicago",
      currency: "USD",
      plan: "free",
      billingMode: "none",
      maxVenues: null,
      maxActiveOrgs: null,
      maxActiveUsers: null,
      maxShiftsPerDay: null,
      requireMfaForAdmins: true,
      ipAllowlistEnabled: false,
      features: {},
      ownerUserId: "user_1",
      createdAt: now,
      createdBy: "user_1",
      updatedAt: now,
    };

    const result = NetworkSchema.safeParse(network);
    expect(result.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const result = NetworkSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("id");
      expect(paths).toContain("slug");
      expect(paths).toContain("displayName");
      expect(paths).toContain("kind");
      expect(paths).toContain("segment");
      expect(paths).toContain("status");
    }
  });
});

```


## Refactor: packages/types/src/__tests__/onboarding.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/onboarding.test.ts`

**File Content:**
```typescript
// [P1][TEST][ONBOARDING] Onboarding Schemas Unit Tests
// Tags: P1, TEST, ONBOARDING, VITEST
/**
 * @fileoverview
 * Unit tests for v14 onboarding schemas (CreateOrgOnboardingSchema, CreateCorporateOnboardingSchema, JoinWithTokenSchema, etc.).
 * Validates schema parsing, validation errors, and type inference.
 */
import { describe, it, expect } from "vitest";

import { CreateCorporateOnboardingSchema, JoinWithTokenSchema } from "..";
import { CreateOrgOnboardingSchema, OnboardingStateSchema } from "../onboarding";

describe("onboarding schemas", () => {
  it("parses valid create corporate payload", () => {
    const payload = { corporateName: "Acme Corp", brandName: "Acme" };
    const parsed = CreateCorporateOnboardingSchema.parse(payload);
    expect(parsed.corporateName).toBe("Acme Corp");
  });

  it("rejects empty join token", () => {
    expect(() => JoinWithTokenSchema.parse({ joinToken: "" })).toThrow();
  });
});

describe("CreateOrgOnboardingSchema and OnboardingStateSchema", () => {
  it("parses valid create org payload", () => {
    const payload = {
      orgName: "Acme Org",
      venueName: "Acme HQ",
      formToken: "form-123",
      location: {
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        countryCode: "US",
        timeZone: "America/Los_Angeles",
      },
    };

    const parsed = CreateOrgOnboardingSchema.safeParse(payload);
    expect(parsed.success).toBe(true);

    const state = {
      status: "complete",
      intent: "create_org",
      stage: "network_created",
      primaryNetworkId: "net_1",
      primaryOrgId: "org_1",
      primaryVenueId: "venue_1",
      completedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    const parsedState = OnboardingStateSchema.safeParse(state);
    expect(parsedState.success).toBe(true);
  });
});

```


## Refactor: packages/types/src/__tests__/org-network.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/org-network.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] Org Network Test tests
// Tags: P1, TEST, TEST
// Tests for network-aware fields on organization schemas
import { describe, it, expect } from "vitest";

import { CreateOrganizationInput, Organization, UpdateOrganizationInput } from "../orgs";

describe("Organization networkId handling", () => {
  it("accepts an optional networkId when creating an organization", () => {
    const input = { name: "Org with network", networkId: "network-1" };
    const result = CreateOrganizationInput.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.networkId).toBe("network-1");
  });

  it("rejects an empty string for networkId", () => {
    const input = { name: "Bad Org", networkId: "" };
    const result = CreateOrganizationInput.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("allows Organization document to include networkId", () => {
    const org = {
      id: "org-1",
      name: "Org",
      ownerId: "user-1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memberCount: 0,
      networkId: "network-1",
    } as const;

    const result = Organization.safeParse(org);
    expect(result.success).toBe(true);
  });

  it("UpdateOrganizationInput accepts networkId when present and rejects empty string", () => {
    expect(UpdateOrganizationInput.safeParse({ networkId: "network-2" }).success).toBe(true);
    expect(UpdateOrganizationInput.safeParse({ networkId: "" }).success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/orgVenueAssignments.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/orgVenueAssignments.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] OrgVenueAssignments Test tests
// Tags: P1, TEST, TEST
// Tests for OrgVenueAssignments link schemas
import { describe, it, expect } from "vitest";

import {
  OrgVenueAssignmentSchema,
  CreateOrgVenueAssignmentSchema,
  UpdateOrgVenueAssignmentSchema,
} from "../links/orgVenueAssignments";

describe("OrgVenueAssignmentSchema", () => {
  it("validates a full org-venue assignment (id form)", () => {
    const a = {
      id: "av1",
      orgId: "o1",
      venueId: "v1",
      role: "primary",
      networkId: "n1",
      createdBy: "u1",
      createdAt: Date.now(),
    };

    const r = OrgVenueAssignmentSchema.safeParse(a);
    if (!r.success) console.error("DEBUG parse error", JSON.stringify(r.error.issues, null, 2));
    expect(r.success).toBe(true);
  });

  it("validates a full org-venue assignment (assignmentId form)", () => {
    const assignment = {
      id: "a1",
      networkId: "n1",
      orgId: "o1",
      venueId: "v1",
      role: "manager",
      status: "active",
      createdAt: Date.now(),
    };
    const result = OrgVenueAssignmentSchema.safeParse(assignment);
    expect(result.success).toBe(true);
  });

  it("Create schema accepts minimal valid shape", () => {
    const ok = CreateOrgVenueAssignmentSchema.safeParse({ orgId: "o1", venueId: "v1" });
    expect(ok.success).toBe(true);
  });

  it("Create schema rejects empty ids", () => {
    const bad = CreateOrgVenueAssignmentSchema.safeParse({ orgId: "", venueId: "" });
    expect(bad.success).toBe(false);
  });

  it("Update schema allows partial updates", () => {
    const res = UpdateOrgVenueAssignmentSchema.safeParse({ status: "inactive" });
    expect(res.success).toBe(true);
  });

  // TODO-v14: TEN-03 / TEN-05 - this test validates `OrgVenueAssignmentSchema` for v14 link semantics
  // See docs/TODO-v14.md for the TEN-03 and TEN-05 requirements
});

```


## Refactor: packages/types/src/__tests__/orgVenueAssignments.v14.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/orgVenueAssignments.v14.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] OrgVenueAssignments V14 Test tests
// Tags: P1, TEST, TEST
import { it, expect } from "vitest";

// TODO-v14: TEN-03 - placeholder v14 test for orgVenueAssignments
it("placeholder v14 orgVenueAssignments test", () => {
  expect(true).toBe(true);
});

```


## Refactor: packages/types/src/__tests__/organizations.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/organizations.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Organization Zod schema validation tests
// Tags: P1, INTEGRITY, TEST, zod, validation

import { describe, it, expect } from "vitest";

import {
  Organization,
  OrganizationSize,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
} from "../orgs";

describe("OrganizationSize enum", () => {
  it("should accept valid organization sizes", () => {
    expect(OrganizationSize.parse("1-10")).toBe("1-10");
    expect(OrganizationSize.parse("11-50")).toBe("11-50");
    expect(OrganizationSize.parse("51-200")).toBe("51-200");
    expect(OrganizationSize.parse("201-500")).toBe("201-500");
    expect(OrganizationSize.parse("500+")).toBe("500+");
  });

  it("should reject invalid organization sizes", () => {
    expect(() => OrganizationSize.parse("invalid")).toThrow();
    expect(() => OrganizationSize.parse("0-10")).toThrow();
    expect(() => OrganizationSize.parse("1000+")).toThrow();
  });
});

describe("Organization schema", () => {
  const validOrg = {
    id: "org-123",
    name: "Test Organization",
    description: "A test organization",
    industry: "Technology",
    size: "11-50" as const,
    ownerId: "user-456",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    memberCount: 5,
  };

  it("should validate a complete valid organization", () => {
    const result = Organization.parse(validOrg);
    expect(result).toEqual(validOrg);
  });

  it("should validate organization with minimal required fields", () => {
    const minimal = {
      id: "org-123",
      name: "Minimal Org",
      ownerId: "user-456",
      createdAt: "2025-01-01T00:00:00Z",
      memberCount: 1,
    };
    const result = Organization.parse(minimal);
    expect(result).toMatchObject(minimal);
  });

  it("should reject organization with missing required fields", () => {
    const missingId = { ...validOrg };
    delete (missingId as Record<string, unknown>).id;
    expect(() => Organization.parse(missingId)).toThrow();

    const missingName = { ...validOrg };
    delete (missingName as Record<string, unknown>).name;
    expect(() => Organization.parse(missingName)).toThrow();

    const missingOwnerId = { ...validOrg };
    delete (missingOwnerId as Record<string, unknown>).ownerId;
    expect(() => Organization.parse(missingOwnerId)).toThrow();

    const missingCreatedAt = { ...validOrg };
    delete (missingCreatedAt as Record<string, unknown>).createdAt;
    expect(() => Organization.parse(missingCreatedAt)).toThrow();

    const missingMemberCount = { ...validOrg };
    delete (missingMemberCount as Record<string, unknown>).memberCount;
    expect(() => Organization.parse(missingMemberCount)).toThrow();
  });

  it("should reject organization with invalid field types", () => {
    expect(() => Organization.parse({ ...validOrg, name: 123 })).toThrow();
    expect(() => Organization.parse({ ...validOrg, memberCount: "5" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, size: "invalid" })).toThrow();
  });

  it("should enforce name length constraints (min 1, max 100)", () => {
    expect(() => Organization.parse({ ...validOrg, name: "" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, name: "a".repeat(101) })).toThrow();
    expect(Organization.parse({ ...validOrg, name: "a" }).name).toBe("a");
    expect(Organization.parse({ ...validOrg, name: "a".repeat(100) }).name).toHaveLength(100);
  });

  it("should enforce description max length (500)", () => {
    expect(() => Organization.parse({ ...validOrg, description: "a".repeat(501) })).toThrow();
    const result = Organization.parse({ ...validOrg, description: "a".repeat(500) });
    expect(result.description).toHaveLength(500);
  });

  it("should enforce memberCount is non-negative integer", () => {
    expect(() => Organization.parse({ ...validOrg, memberCount: -1 })).toThrow();
    expect(() => Organization.parse({ ...validOrg, memberCount: 1.5 })).toThrow();
    expect(Organization.parse({ ...validOrg, memberCount: 0 }).memberCount).toBe(0);
    expect(Organization.parse({ ...validOrg, memberCount: 100 }).memberCount).toBe(100);
  });

  it("should validate datetime format for createdAt and updatedAt", () => {
    expect(() => Organization.parse({ ...validOrg, createdAt: "invalid-date" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, createdAt: "2025-01-01" })).toThrow();
    expect(() => Organization.parse({ ...validOrg, updatedAt: "not-a-datetime" })).toThrow();
  });
});

describe("CreateOrganizationInput schema", () => {
  it("should validate valid organization creation input", () => {
    const input = {
      name: "New Organization",
      description: "A new test org",
      industry: "Healthcare",
      size: "11-50" as const,
    };
    const result = CreateOrganizationInput.parse(input);
    expect(result).toEqual(input);
  });

  it("should validate with minimal required fields (name only)", () => {
    const minimal = { name: "Minimal Org" };
    const result = CreateOrganizationInput.parse(minimal);
    expect(result).toEqual(minimal);
  });

  it("should reject input missing required name", () => {
    expect(() => CreateOrganizationInput.parse({})).toThrow();
    expect(() => CreateOrganizationInput.parse({ description: "No name" })).toThrow();
  });

  it("should enforce name length constraints", () => {
    expect(() => CreateOrganizationInput.parse({ name: "" })).toThrow();
    expect(() => CreateOrganizationInput.parse({ name: "a".repeat(101) })).toThrow();
  });

  it("should enforce description max length", () => {
    expect(() =>
      CreateOrganizationInput.parse({ name: "Test", description: "a".repeat(501) }),
    ).toThrow();
  });

  it("should validate size enum", () => {
    expect(CreateOrganizationInput.parse({ name: "Test", size: "51-200" }).size).toBe("51-200");
    expect(() => CreateOrganizationInput.parse({ name: "Test", size: "invalid" })).toThrow();
  });
});

describe("UpdateOrganizationInput schema", () => {
  it("should allow partial updates (all fields optional)", () => {
    expect(UpdateOrganizationInput.parse({})).toEqual({});
    expect(UpdateOrganizationInput.parse({ name: "Updated" })).toEqual({ name: "Updated" });
    expect(UpdateOrganizationInput.parse({ description: "New desc" })).toEqual({
      description: "New desc",
    });
  });

  it("should validate name length when provided", () => {
    expect(() => UpdateOrganizationInput.parse({ name: "" })).toThrow();
    expect(() => UpdateOrganizationInput.parse({ name: "a".repeat(101) })).toThrow();
    expect(UpdateOrganizationInput.parse({ name: "Valid" }).name).toBe("Valid");
  });

  it("should validate description length when provided", () => {
    expect(() => UpdateOrganizationInput.parse({ description: "a".repeat(501) })).toThrow();
  });

  it("should validate size enum when provided", () => {
    expect(UpdateOrganizationInput.parse({ size: "201-500" }).size).toBe("201-500");
    expect(() => UpdateOrganizationInput.parse({ size: "bad-size" })).toThrow();
  });

  it("should allow multiple fields to be updated", () => {
    const update = {
      name: "Updated Name",
      description: "Updated description",
      industry: "Finance",
      size: "500+" as const,
    };
    const result = UpdateOrganizationInput.parse(update);
    expect(result).toEqual(update);
  });
});

describe("OrganizationCreateSchema and OrganizationUpdateSchema aliases", () => {
  it("should be aliases for Create and Update schemas", () => {
    expect(OrganizationCreateSchema).toBe(CreateOrganizationInput);
    expect(OrganizationUpdateSchema).toBe(UpdateOrganizationInput);
  });
});

```


## Refactor: packages/types/src/__tests__/orgs.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/orgs.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Organizations schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ORGANIZATIONS
import { describe, it, expect } from "vitest";

import {
  OrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  ListOrganizationsQuerySchema,
  OrganizationSize,
  OrganizationStatus,
  SubscriptionTier,
  OrganizationSettingsSchema,
} from "../orgs";

describe("OrganizationSchema", () => {
  it("validates a complete organization", () => {
    const org = {
      id: "o1",
      name: "Acme Events",
      description: "Event management company",
      industry: "Events",
      size: "11-50" as const,
      status: "active" as const,
      subscriptionTier: "starter" as const,
      ownerId: "u1",
      memberCount: 10,
      settings: {
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        weekStartsOn: 1,
        allowSelfScheduling: true,
        requireShiftConfirmation: true,
        enableGeofencing: false,
        geofenceRadius: 150,
      },
      logoUrl: "https://example.com/logo.png",
      websiteUrl: "https://example.com",
      contactEmail: "info@example.com",
      contactPhone: "+1-555-1234",
      createdAt: Date.now() - 10_000,
      updatedAt: Date.now() - 5_000,
      trialEndsAt: Date.now() + 86_400_000,
      subscriptionEndsAt: Date.now() + 172_800_000,
    };

    const result = OrganizationSchema.safeParse(org);
    expect(result.success).toBe(true);
  });

  it("requires id, name, ownerId, createdAt, updatedAt", () => {
    const result = OrganizationSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0] as string);
      expect(fields).toContain("id");
      expect(fields).toContain("name");
      expect(fields).toContain("ownerId");
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
    }
  });

  it("accepts enum values and defaults", () => {
    ["1-10", "11-50", "51-200", "201-500", "500+"].forEach((sz) => {
      expect(OrganizationSize.safeParse(sz).success).toBe(true);
    });
    ["active", "suspended", "trial", "cancelled"].forEach((st) => {
      expect(OrganizationStatus.safeParse(st).success).toBe(true);
    });
    ["free", "starter", "professional", "enterprise"].forEach((tier) => {
      expect(SubscriptionTier.safeParse(tier).success).toBe(true);
    });
  });

  it("validates settings schema", () => {
    const ok = OrganizationSettingsSchema.safeParse({
      timezone: "UTC",
      timeFormat: "24h",
      weekStartsOn: 0,
      geofenceRadius: 200,
    });
    expect(ok.success).toBe(true);
  });
});

describe("CreateOrganizationSchema", () => {
  it("validates creation input", () => {
    const input = {
      name: "New Org",
      description: "Desc",
      settings: { timezone: "UTC" },
      contactEmail: "co@example.com",
    };
    const result = CreateOrganizationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = CreateOrganizationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("UpdateOrganizationSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateOrganizationSchema.safeParse({
      name: "Updated",
      status: "suspended",
      logoUrl: "https://example.com/logo.png",
    });
    expect(result.success).toBe(true);
  });
});

describe("ListOrganizationsQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListOrganizationsQuerySchema.safeParse({
      status: "active",
      size: "11-50",
      limit: 25,
    });
    expect(result.success).toBe(true);
  });
});

```


## Refactor: packages/types/src/__tests__/positions.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/positions.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Positions schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, POSITIONS
import { describe, expect, it } from "vitest";

import {
  PositionSchema,
  CreatePositionSchema,
  UpdatePositionSchema,
  PositionType,
  SkillLevel,
} from "../positions";

describe("PositionSchema", () => {
  it("validates a complete position", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Event Staff",
      type: "part_time" as const,
      skillLevel: "entry" as const,
      isActive: true,
      requiredCertifications: [],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("validates position with hourly rate", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Senior Manager",
      type: "full_time" as const,
      skillLevel: "expert" as const,
      hourlyRate: 35.5,
      isActive: true,
      requiredCertifications: ["CPR", "First Aid"],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      type: "part_time" as const,
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      hourlyRate: -10,
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });

  it("validates hex color format", () => {
    const validPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      color: "#FF5733",
      isActive: true,
      requiredCertifications: [],
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(validPosition);
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color", () => {
    const invalidPosition = {
      id: "pos123",
      orgId: "org456",
      name: "Staff",
      color: "red",
      createdBy: "user789",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = PositionSchema.safeParse(invalidPosition);
    expect(result.success).toBe(false);
  });
});

describe("CreatePositionSchema", () => {
  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      name: "Security Staff",
    };

    const result = CreatePositionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults type to part_time", () => {
    const input = {
      orgId: "org456",
      name: "Staff",
    };

    const result = CreatePositionSchema.parse(input);
    expect(result.type).toBe("part_time");
  });

  it("defaults skillLevel to entry", () => {
    const input = {
      orgId: "org456",
      name: "Staff",
    };

    const result = CreatePositionSchema.parse(input);
    expect(result.skillLevel).toBe("entry");
  });

  it("enforces max name length", () => {
    const invalidInput = {
      orgId: "org456",
      name: "A".repeat(101),
    };

    const result = CreatePositionSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("UpdatePositionSchema", () => {
  it("allows updating name", () => {
    const validUpdate = {
      name: "Updated Position Name",
    };

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows updating isActive", () => {
    const validUpdate = {
      isActive: false,
    };

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows partial updates", () => {
    const validUpdate = {};

    const result = UpdatePositionSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("validates hourly rate when provided", () => {
    const invalidUpdate = {
      hourlyRate: -5,
    };

    const result = UpdatePositionSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe("PositionType enum", () => {
  it("accepts valid types", () => {
    const types = ["full_time", "part_time", "contractor", "volunteer"];
    types.forEach((type) => {
      const result = PositionType.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid types", () => {
    const result = PositionType.safeParse("intern");
    expect(result.success).toBe(false);
  });
});

describe("SkillLevel enum", () => {
  it("accepts valid skill levels", () => {
    const levels = ["entry", "intermediate", "advanced", "expert"];
    levels.forEach((level) => {
      const result = SkillLevel.safeParse(level);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid skill levels", () => {
    const result = SkillLevel.safeParse("beginner");
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/schedules.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/schedules.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Schedules schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, SCHEDULES
import { describe, expect, it } from "vitest";

import { ScheduleSchema, CreateScheduleSchema, PublishScheduleSchema } from "../schedules";

describe("ScheduleSchema", () => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  it("validates a complete schedule", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Week 1 Schedule",
      startDate: now,
      endDate: now + oneWeek,
      status: "draft" as const,
      visibility: "team" as const,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("requires endDate after startDate", () => {
    const invalidSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Invalid Schedule",
      startDate: now,
      endDate: now - 1000,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(invalidSchedule);
    expect(result.success).toBe(false);
  });

  it("validates schedule with statistics", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "Week 1 Schedule",
      startDate: now,
      endDate: now + oneWeek,
      stats: {
        totalShifts: 50,
        assignedShifts: 45,
        unassignedShifts: 5,
        totalHours: 400,
        totalCost: 8000,
        conflictCount: 2,
      },
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("validates AI-generated schedule", () => {
    const validSchedule = {
      id: "sch123",
      orgId: "org456",
      name: "AI Generated Schedule",
      startDate: now,
      endDate: now + oneWeek,
      aiGenerated: true,
      aiModel: "gemini-1.5-pro",
      aiGeneratedAt: now,
      createdBy: "ai-scheduler",
      createdAt: now,
      updatedAt: now,
    };

    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });
});

describe("CreateScheduleSchema", () => {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      name: "New Schedule",
      startDate: now,
      endDate: now + oneWeek,
    };

    const result = CreateScheduleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults visibility to team", () => {
    const input = {
      orgId: "org456",
      name: "New Schedule",
      startDate: now,
      endDate: now + oneWeek,
    };

    const result = CreateScheduleSchema.parse(input);
    expect(result.visibility).toBe("team");
  });

  it("requires endDate after startDate", () => {
    const invalidInput = {
      orgId: "org456",
      name: "Invalid Schedule",
      startDate: now,
      endDate: now - 1000,
    };

    const result = CreateScheduleSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("PublishScheduleSchema", () => {
  it("validates publish payload", () => {
    const validInput = {
      notifyStaff: true,
      message: "New schedule is available!",
    };

    const result = PublishScheduleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults notifyStaff to true", () => {
    const input = {};

    const result = PublishScheduleSchema.parse(input);
    expect(result.notifyStaff).toBe(true);
  });
});

```


## Refactor: packages/types/src/__tests__/shifts.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/shifts.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Shifts schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, SHIFTS
import { describe, expect, it } from "vitest";

import { ShiftSchema, CreateShiftSchema, AssignShiftSchema } from "../shifts";

describe("ShiftSchema", () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  it("validates a complete shift", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      status: "draft" as const,
      assignments: [],
      requiredStaff: 1,
      breakMinutes: 15,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("requires endTime after startTime", () => {
    const invalidShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now - 1000, // Before start time
      assignments: [],
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(invalidShift);
    expect(result.success).toBe(false);
  });

  it("validates shift with assignments", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      assignments: [
        {
          uid: "user1",
          status: "assigned" as const,
          assignedAt: now,
          assignedBy: "manager1",
        },
      ],
      requiredStaff: 2,
      createdBy: "user789",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("validates AI-generated metadata", () => {
    const validShift = {
      id: "shift123",
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
      assignments: [],
      aiGenerated: true,
      aiConfidence: 0.95,
      createdBy: "ai-scheduler",
      createdAt: now,
      updatedAt: now,
    };

    const result = ShiftSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });
});

describe("CreateShiftSchema", () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  it("validates creation payload", () => {
    const validInput = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
    };

    const result = CreateShiftSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults requiredStaff to 1", () => {
    const input = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now + oneHour * 4,
    };

    const result = CreateShiftSchema.parse(input);
    expect(result.requiredStaff).toBe(1);
  });

  it("requires endTime after startTime", () => {
    const invalidInput = {
      orgId: "org456",
      scheduleId: "sch789",
      positionId: "pos101",
      startTime: now,
      endTime: now - 1000,
    };

    const result = CreateShiftSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("AssignShiftSchema", () => {
  it("validates assignment payload", () => {
    const validInput = {
      uid: "user123",
      notes: "Works evening shifts",
    };

    const result = AssignShiftSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("requires uid", () => {
    const invalidInput = {
      notes: "Some notes",
    };

    const result = AssignShiftSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

```


## Refactor: packages/types/src/__tests__/venue-network.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/venue-network.test.ts`

**File Content:**
```typescript
// [P1][TEST][TEST] Venue Network Test tests
// Tags: P1, TEST, TEST
// Tests for network-aware fields on venue schemas
import { describe, it, expect } from "vitest";

import { CreateVenueSchema, VenueSchema, ListVenuesQuerySchema } from "../venues";

describe("Venue networkId handling", () => {
  it("accepts an optional networkId when creating a venue", () => {
    const input = { orgId: "o1", name: "V1", networkId: "network-1" };
    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.networkId).toBe("network-1");
  });

  it("rejects an empty string for networkId when creating a venue", () => {
    const input = { orgId: "o1", name: "V1", networkId: "" };
    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("Venue document can include networkId", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Main",
      createdBy: "user1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      networkId: "network-1",
    } as const;

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });

  it("ListVenuesQuerySchema accepts networkId as optional filter", () => {
    const result = ListVenuesQuerySchema.safeParse({
      orgId: "o1",
      networkId: "network-2",
      limit: 10,
    });
    expect(result.success).toBe(true);
  });
});

```


## Refactor: packages/types/src/__tests__/venues.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/venues.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Venues schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, VENUES
import { describe, it, expect } from "vitest";

import {
  VenueSchema,
  CreateVenueSchema,
  UpdateVenueSchema,
  ListVenuesQuerySchema,
  VenueType,
} from "../venues";

describe("VenueSchema", () => {
  it("validates a complete venue", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Main Stage",
      description: "Primary performance venue",
      type: "indoor" as const,
      capacity: 500,
      isActive: true,
      timezone: "America/New_York",
      contactPhone: "555-0123",
      contactEmail: "venue@example.com",
      notes: "Main performance space",
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });

  it("requires id, orgId, name, createdBy, createdAt, updatedAt", () => {
    const result = VenueSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("id");
      expect(errors).toContain("orgId");
      expect(errors).toContain("name");
      expect(errors).toContain("createdBy");
      expect(errors).toContain("createdAt");
      expect(errors).toContain("updatedAt");
    }
  });

  it("validates venue types", () => {
    const validTypes = ["indoor", "outdoor", "hybrid", "virtual"];
    validTypes.forEach((type) => {
      const result = VenueType.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("validates isActive boolean field", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Venue",
      type: "indoor" as const,
      isActive: true,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);

    const inactiveVenue = { ...venue, isActive: false };
    const inactiveResult = VenueSchema.safeParse(inactiveVenue);
    expect(inactiveResult.success).toBe(true);
  });

  it("validates coordinates range", () => {
    const venue = {
      id: "v1",
      orgId: "o1",
      name: "Venue",
      type: "indoor" as const,
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = VenueSchema.safeParse(venue);
    expect(result.success).toBe(true);
  });
});

describe("CreateVenueSchema", () => {
  it("validates venue creation", () => {
    const input = {
      orgId: "o1",
      name: "New Venue",
      description: "A new venue",
      type: "indoor" as const,
      capacity: 200,
      contactEmail: "venue@example.com",
    };

    const result = CreateVenueSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId and name only", () => {
    const result = CreateVenueSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
      expect(errors).toContain("name");
    }
  });
});

describe("UpdateVenueSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateVenueSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("validates updated fields", () => {
    const result = UpdateVenueSchema.safeParse({
      capacity: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("ListVenuesQuerySchema", () => {
  it("validates query parameters", () => {
    const result = ListVenuesQuerySchema.safeParse({
      orgId: "o1",
      limit: 20,
      type: "indoor",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListVenuesQuerySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
    }
  });
});

```


## Refactor: packages/types/src/__tests__/zones.test.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/__tests__/zones.test.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][TEST] Zones schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, ZONES
import { describe, it, expect } from "vitest";

import { ZoneSchema, CreateZoneSchema, UpdateZoneSchema, ListZonesQuerySchema } from "../zones";

describe("ZoneSchema", () => {
  it("validates a complete zone", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone A",
      description: "Production zone",
      type: "production" as const,
      capacity: 50,
      floor: "1",
      isActive: true,
      color: "#FF5733",
      notes: "Main production area",
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = ZoneSchema.safeParse(zone);
    expect(result.success).toBe(true);
  });

  it("requires id, orgId, venueId, name, createdBy, createdAt, updatedAt", () => {
    const result = ZoneSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("id");
      expect(errors).toContain("orgId");
      expect(errors).toContain("venueId");
      expect(errors).toContain("name");
      expect(errors).toContain("createdBy");
      expect(errors).toContain("createdAt");
      expect(errors).toContain("updatedAt");
    }
  });

  it("validates isActive boolean field", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone",
      isActive: true,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const validValues = [true, false];
    validValues.forEach((isActive) => {
      const zoneWithStatus = { ...zone, isActive };
      const result = ZoneSchema.safeParse(zoneWithStatus);
      expect(result.success).toBe(true);
    });
  });

  it("validates capacity is positive", () => {
    const zone = {
      id: "z1",
      orgId: "o1",
      venueId: "v1",
      name: "Zone",
      capacity: -10,
      createdBy: "user123",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = ZoneSchema.safeParse(zone);
    expect(result.success).toBe(false);
  });
});

describe("CreateZoneSchema", () => {
  it("validates zone creation", () => {
    const input = {
      orgId: "o1",
      venueId: "v1",
      name: "New Zone",
      description: "A new zone",
      type: "storage" as const,
      capacity: 30,
    };

    const result = CreateZoneSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("requires orgId, venueId, and name", () => {
    const result = CreateZoneSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
      expect(errors).toContain("venueId");
      expect(errors).toContain("name");
    }
  });
});

describe("UpdateZoneSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateZoneSchema.safeParse({ name: "Updated Zone" });
    expect(result.success).toBe(true);
  });
});

describe("ListZonesQuerySchema", () => {
  it("validates query with venueId", () => {
    const result = ListZonesQuerySchema.safeParse({
      orgId: "o1",
      venueId: "v1",
      limit: 50,
    });
    expect(result.success).toBe(true);
  });

  it("requires orgId", () => {
    const result = ListZonesQuerySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.path[0] as string);
      expect(errors).toContain("orgId");
    }
  });
});

```


## Refactor: packages/types/src/attendance.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/attendance.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Attendance schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ATTENDANCE
import { z } from "zod";

/**
 * Attendance record status
 */
export const AttendanceStatus = z.enum([
  "scheduled",
  "checked_in",
  "checked_out",
  "no_show",
  "excused_absence",
  "late",
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

/**
 * Check-in/out method
 */
export const CheckMethod = z.enum(["manual", "qr_code", "nfc", "geofence", "admin_override"]);
export type CheckMethod = z.infer<typeof CheckMethod>;

/**
 * Geographic location for check-ins
 */
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

/**
 * Full Attendance record schema
 * Firestore path: /attendance_records/{orgId}/{recordId}
 */
export const AttendanceRecordSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  shiftId: z.string().min(1, "Shift ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
  staffUid: z.string().min(1, "Staff user ID is required"),

  status: AttendanceStatus.default("scheduled"),

  // Timestamps
  scheduledStart: z.number().int().positive(),
  scheduledEnd: z.number().int().positive(),
  actualCheckIn: z.number().int().positive().optional(),
  actualCheckOut: z.number().int().positive().optional(),

  // Check-in metadata
  checkInMethod: CheckMethod.optional(),
  checkInLocation: LocationSchema.optional(),
  checkOutMethod: CheckMethod.optional(),
  checkOutLocation: LocationSchema.optional(),

  // Duration calculations (minutes)
  scheduledDuration: z.number().int().nonnegative(),
  actualDuration: z.number().int().nonnegative().optional(),
  breakDuration: z.number().int().nonnegative().default(0),

  // Notes and overrides
  notes: z.string().max(1000).optional(),
  managerNotes: z.string().max(1000).optional(),
  overriddenBy: z.string().optional(),
  overriddenAt: z.number().int().positive().optional(),

  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

/**
 * Schema for creating a new attendance record
 * Used in POST /api/attendance
 */
export const CreateAttendanceRecordSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  shiftId: z.string().min(1, "Shift ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
  staffUid: z.string().min(1, "Staff user ID is required"),
  scheduledStart: z.number().int().positive(),
  scheduledEnd: z.number().int().positive(),
  breakDuration: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateAttendanceRecordInput = z.infer<typeof CreateAttendanceRecordSchema>;

/**
 * Schema for checking in
 * Used in POST /api/attendance/{id}/check-in
 */
export const CheckInSchema = z.object({
  method: CheckMethod.default("manual"),
  location: LocationSchema.optional(),
  notes: z.string().max(500).optional(),
});
export type CheckInInput = z.infer<typeof CheckInSchema>;

/**
 * Schema for checking out
 * Used in POST /api/attendance/{id}/check-out
 */
export const CheckOutSchema = z.object({
  method: CheckMethod.default("manual"),
  location: LocationSchema.optional(),
  notes: z.string().max(500).optional(),
});
export type CheckOutInput = z.infer<typeof CheckOutSchema>;

/**
 * Schema for updating an attendance record (admin override)
 * Used in PATCH /api/attendance/{id}
 */
export const UpdateAttendanceRecordSchema = z.object({
  status: AttendanceStatus.optional(),
  actualCheckIn: z.number().int().positive().optional(),
  actualCheckOut: z.number().int().positive().optional(),
  breakDuration: z.number().int().nonnegative().optional(),
  managerNotes: z.string().max(1000).optional(),
});
export type UpdateAttendanceRecordInput = z.infer<typeof UpdateAttendanceRecordSchema>;

/**
 * Query parameters for listing attendance records
 */
export const ListAttendanceRecordsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  scheduleId: z.string().optional(),
  shiftId: z.string().optional(),
  staffUid: z.string().optional(),
  status: AttendanceStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListAttendanceRecordsQuery = z.infer<typeof ListAttendanceRecordsQuerySchema>;

```


## Refactor: packages/types/src/compliance.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/compliance.ts`

**File Content:**
```typescript
// [P0][APP][CODE] Compliance
// Tags: P0, APP, CODE
import { z } from "zod";

/**
 * compliance — container docs for compliance artifacts (forms, attestations).
 * Collection: compliance
 * Keyed by server-generated id. Designed to store different doc types under one roof.
 */
export const ComplianceDocSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  // schema discriminator for subtypes; e.g. "adminResponsibilityForm"
  kind: z.string().min(1),
  // version of the document schema used to produce this record
  schemaVersion: z.string().min(1),
  createdBy: z.string().min(1), // uid
  createdAt: z.string(), // ISO
  updatedAt: z.string().optional(),
  // canonical payload, validated by the corresponding subtype schema at write-time
  payload: z.record(z.string(), z.any()),
  // (optional) signatures / attestations by uid
  attestations: z
    .array(
      z.object({
        uid: z.string().min(1),
        at: z.string(), // ISO
      }),
    )
    .default([]),
});

export type ComplianceDoc = z.infer<typeof ComplianceDocSchema>;

```


## Refactor: packages/types/src/compliance/adminResponsibilityForm.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/compliance/adminResponsibilityForm.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Admin Responsibility Form schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, COMPLIANCE
import { z } from "zod";

export const AdminResponsibilityRole = z.enum([
  "network_owner",
  "network_admin",
  "org_owner",
  "org_admin",
]);
export type AdminResponsibilityRole = z.infer<typeof AdminResponsibilityRole>;

export const AdminResponsibilityStatus = z.enum([
  "draft",
  "submitted",
  "attached",
  "approved",
  "rejected",
]);
export type AdminResponsibilityStatus = z.infer<typeof AdminResponsibilityStatus>;

export const CertificationSchema = z.object({
  acknowledgesDataProtection: z.literal(true),
  acknowledgesGDPRCompliance: z.literal(true),
  acknowledgesAccessControl: z.literal(true),
  acknowledgesMFARequirement: z.literal(true),
  acknowledgesAuditTrail: z.literal(true),
  acknowledgesIncidentReporting: z.literal(true),
  understandsRoleScope: z.literal(true),
  agreesToTerms: z.literal(true),
});

export const AdminResponsibilityFormSchema = z.object({
  formId: z.string().min(1),
  networkId: z.string().min(1),
  uid: z.string().min(1),
  role: AdminResponsibilityRole,
  status: AdminResponsibilityStatus.optional().default("submitted"),
  certification: CertificationSchema,
  // Allow firebase Timestamp objects or plain numbers/strings; tests pass a Timestamp.
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  // optional free-form data blob (could include taxId, legalName, addresses)
  data: z.record(z.string(), z.any()).optional(),
});
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

export const CreateAdminResponsibilityFormSchema = AdminResponsibilityFormSchema.pick({
  networkId: true,
  uid: true,
  role: true,
  certification: true,
  data: true,
} as const);
export type CreateAdminResponsibilityFormInput = z.infer<
  typeof CreateAdminResponsibilityFormSchema
>;

export default AdminResponsibilityFormSchema;

```


## Refactor: packages/types/src/compliance/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/compliance/index.ts`

**File Content:**
```typescript
//[P1][TYPES][BARREL] Compliance barrel export (v14.0.0)
// Tags: barrel, exports, types

/**
 * Compliance barrel export
 * Re-exports all compliance-related schemas
 */

export * from "./adminResponsibilityForm";

```


## Refactor: packages/types/src/corporates.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/corporates.ts`

**File Content:**
```typescript
// [P0][SECURITY][CODE] Corporates
// Tags: P0, SECURITY, CODE
/**
 * Corporate Schema - Brand/HQ Graph Node within Network
 *
 * Corporate entities represent brands, HQ nodes, or parent organizations
 * within a Network. They can own or work with multiple Organizations.
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 3.2
 * @see docs/schema-network.md
 */

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// ===== MAIN CORPORATE SCHEMA =====

export const CorporateSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1),
  name: z.string().min(1).max(100),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  // Business Model Flags
  ownsLocations: z.boolean().default(false),
  worksWithFranchisees: z.boolean().default(false),
  worksWithPartners: z.boolean().default(false),

  // Lifecycle
  createdAt: z.custom<Timestamp>(),
  createdBy: z.string(),
  updatedAt: z.custom<Timestamp>(),
  updatedBy: z.string(),
});

export type Corporate = z.infer<typeof CorporateSchema>;

// ===== CREATE CORPORATE SCHEMA =====

export const CreateCorporateSchema = z.object({
  networkId: z.string().min(1),
  name: z.string().min(3).max(100),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  ownsLocations: z.boolean().default(false),
  worksWithFranchisees: z.boolean().default(false),
  worksWithPartners: z.boolean().default(false),
});

export type CreateCorporate = z.infer<typeof CreateCorporateSchema>;

// ===== UPDATE CORPORATE SCHEMA =====

export const UpdateCorporateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  ownsLocations: z.boolean().optional(),
  worksWithFranchisees: z.boolean().optional(),
  worksWithPartners: z.boolean().optional(),
});

export type UpdateCorporate = z.infer<typeof UpdateCorporateSchema>;

// ===== QUERY SCHEMA =====

export const CorporateQuerySchema = z.object({
  networkId: z.string().min(1),
  name: z.string().optional(),
  ownsLocations: z.boolean().optional(),
  worksWithFranchisees: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type CorporateQuery = z.infer<typeof CorporateQuerySchema>;

```


## Refactor: packages/types/src/errors.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/errors.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Errors
// Tags: P2, APP, CODE
/**
 * [P1][TYPES][ERRORS] Shared error response types
 * Tags: types, api, errors
 *
 * Overview:
 * - Defines a canonical ErrorResponse shape for APIs
 * - Central place to register stable error codes used across endpoints
 */

import { z } from "zod";

// Central list of stable error codes used in onboarding + infra.
// Extend this union as you standardize more endpoints.
export const ErrorCode = z.enum([
  // Onboarding eligibility
  "ONB_ELIGIBILITY_EMAIL_UNVERIFIED",
  "ONB_ELIGIBILITY_ROLE_DENIED",
  "ONB_ELIGIBILITY_RATE_LIMITED",
  "ONB_ELIGIBILITY_INTERNAL_ERROR",

  // Network activation
  "ONB_ACTIVATE_FORBIDDEN",
  "ONB_ACTIVATE_ALREADY_ACTIVE",
  "ONB_ACTIVATE_INVALID_STATE",

  // Generic / infra
  "GEN_NOT_AUTHENTICATED",
  "GEN_FORBIDDEN",
  "GEN_INTERNAL_ERROR",
]);

export type ErrorCode = z.infer<typeof ErrorCode>;

export const ErrorResponseSchema = z.object({
  error: z.string(), // human-readable summary
  code: ErrorCode.optional(), // stable machine-friendly code
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

```


## Refactor: packages/types/src/events.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/events.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Events
// Tags: P2, APP, CODE
/**
 * [P1][PLATFORM][EVENTS] Core event types for Fresh Schedules v14
 * Tags: platform, events, audit, analytics
 *
 * Overview:
 * - Defines the canonical shape of events emitted by backend APIs
 * - Used for audit logs, analytics, and as a future AI data source
 * - Events are append-only; treat them as an immutable log
 */

import { z } from "zod";

// High-level event categories (useful for filtering)
export const EventCategory = z.enum([
  "onboarding",
  "network",
  "org",
  "venue",
  "membership",
  "compliance",
  "system",
]);

export type EventCategory = z.infer<typeof EventCategory>;

// Concrete event types for v14 (start small; grow over time)
export const EventType = z.enum([
  "network.created",
  "network.activated",
  "org.created",
  "venue.created",
  "membership.created",
  "membership.updated",
  "onboarding.completed",
]);

export type EventType = z.infer<typeof EventType>;

// Minimal event payload schema. Keep this flexible.
export const EventPayloadSchema = z.record(z.string(), z.unknown());

export type EventPayload = z.infer<typeof EventPayloadSchema>;

// Canonical event document schema
export const EventSchema = z.object({
  id: z.string(), // Firestore doc id
  at: z.number().int().positive(), // timestamp (ms since epoch)
  category: EventCategory,
  type: EventType,

  // Optional actor and scope
  actorUserId: z.string().optional(),
  networkId: z.string().optional(),
  orgId: z.string().optional(),
  venueId: z.string().optional(),

  // Arbitrary payload, validated at the edge
  payload: EventPayloadSchema,
});

export type Event = z.infer<typeof EventSchema>;

// Input for creating a new event before assigning id
export const NewEventSchema = EventSchema.omit({ id: true });

export type NewEvent = z.infer<typeof NewEventSchema>;

```


## Refactor: packages/types/src/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/index.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

export * from "./rbac";
export * from "./corporates";
export * from "./orgs";
export * from "./schedules";
export * from "./memberships"; // This provides the canonical Membership export
export * from "./positions";
export * from "./shifts";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./join-tokens";
export * from "./compliance/adminResponsibilityForm";
export * from "./networks";
export * from "./onboarding";
export * from "./events";
export * from "./errors";

// Additional collections and convenience exports added by v14.5
export * as corporates from "./corporates";
export * as widgets from "./widgets";
export * as messages from "./messages";
export * as receipts from "./receipts";
export * as compliance from "./compliance";

```


## Refactor: packages/types/src/join-tokens.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/join-tokens.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Join tokens schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, JOIN_TOKENS
import { z } from "zod";

import { MembershipRole } from "./memberships";

/**
 * Join token status
 */
export const JoinTokenStatus = z.enum(["active", "used", "expired", "revoked"]);
export type JoinTokenStatus = z.infer<typeof JoinTokenStatus>;

/**
 * Full Join Token document schema
 * Firestore path: /join_tokens/{orgId}/{tokenId}
 * or /orgs/{orgId}/join_tokens/{tokenId}
 */
export const JoinTokenSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  token: z.string().min(16, "Token must be at least 16 characters"),

  // Role assignment
  defaultRoles: z.array(MembershipRole).min(1, "At least one role is required"),

  // Usage tracking
  status: JoinTokenStatus.default("active"),
  maxUses: z.number().int().positive().optional(),
  currentUses: z.number().int().nonnegative().default(0),
  usedBy: z.array(z.string()).default([]),

  // Expiration
  expiresAt: z.number().int().positive().optional(),

  // Metadata
  description: z.string().max(200).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type JoinToken = z.infer<typeof JoinTokenSchema>;

/**
 * Schema for creating a new join token
 * Used in POST /api/join-tokens
 */
export const CreateJoinTokenSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  defaultRoles: z.array(MembershipRole).min(1, "At least one role is required"),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
  description: z.string().max(200).optional(),
});
export type CreateJoinTokenInput = z.infer<typeof CreateJoinTokenSchema>;

/**
 * Schema for updating an existing join token
 * Used in PATCH /api/join-tokens/{id}
 */
export const UpdateJoinTokenSchema = z.object({
  status: JoinTokenStatus.optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
  description: z.string().max(200).optional(),
});
export type UpdateJoinTokenInput = z.infer<typeof UpdateJoinTokenSchema>;

/**
 * Schema for redeeming a join token
 * Used in POST /api/join-tokens/redeem
 */
export const RedeemJoinTokenSchema = z.object({
  token: z.string().min(16, "Invalid token"),
});
export type RedeemJoinTokenInput = z.infer<typeof RedeemJoinTokenSchema>;

/**
 * Query parameters for listing join tokens
 */
export const ListJoinTokensQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  status: JoinTokenStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListJoinTokensQuery = z.infer<typeof ListJoinTokensQuerySchema>;

```


## Refactor: packages/types/src/links/corpOrgLinks.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/links/corpOrgLinks.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Corporate -> Organization link schemas (v14)
// Tags: P1, INTEGRITY, SCHEMA, ZOD, LINKS
import { z } from "zod";

const DateLike = z.union([z.number().int().positive(), z.string().datetime()]);

export const CorpOrgRelationType = z.enum(["owner", "sponsor", "partner", "affiliate"]);
export type CorpOrgRelationType = z.infer<typeof CorpOrgRelationType>;

export const CorpOrgStatus = z.enum(["active", "suspended", "pending"]);
export type CorpOrgStatus = z.infer<typeof CorpOrgStatus>;

export const CorpOrgLinkSchema = z.object({
  linkId: z.string().min(1),
  networkId: z.string().min(1).optional(),
  corporateId: z.string().min(1),
  orgId: z.string().min(1),
  relationType: CorpOrgRelationType,
  status: CorpOrgStatus,
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;

export const CreateCorpOrgLinkSchema = CorpOrgLinkSchema.omit({
  linkId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // allow more permissive relationType/status on create inputs
  relationType: z.string().min(1),
  status: z.string().min(1),
});

export const UpdateCorpOrgLinkSchema = CorpOrgLinkSchema.partial().omit({ linkId: true });

export default CorpOrgLinkSchema;

```


## Refactor: packages/types/src/links/corpOrgLinks.v14.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/links/corpOrgLinks.v14.ts`

**File Content:**
```typescript
// [P2][APP][CODE] CorpOrgLinks V14
// Tags: P2, APP, CODE

```


## Refactor: packages/types/src/links/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/links/index.ts`

**File Content:**
```typescript
//[P1][TYPES][BARREL] Links barrel export (v14.0.0)
// Tags: barrel, exports, types

/**
 * Links barrel export
 * Re-exports all link schemas for network graph relationships
 */

export * from "./corpOrgLinks";
export * from "./orgVenueAssignments";

```


## Refactor: packages/types/src/links/orgVenueAssignments.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/links/orgVenueAssignments.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Organization -> Venue assignment link schemas (v14)
// Tags: P1, INTEGRITY, SCHEMA, ZOD, LINKS
import { z } from "zod";

const DateLike = z.union([z.number().int().positive(), z.string().datetime()]);

export const OrgVenueAssignmentSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1).optional(),
  orgId: z.string().min(1),
  venueId: z.string().min(1),
  role: z.string().min(1),
  status: z.string().min(1).optional(),
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type OrgVenueAssignment = z.infer<typeof OrgVenueAssignmentSchema>;

export const CreateOrgVenueAssignmentSchema = OrgVenueAssignmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  role: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
});

export const UpdateOrgVenueAssignmentSchema = OrgVenueAssignmentSchema.partial().omit({ id: true });

export default OrgVenueAssignmentSchema;

```


## Refactor: packages/types/src/memberships.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/memberships.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Memberships schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, MEMBERSHIPS
import { z } from "zod";

/**
 * Membership roles within an organization
 * Maps to Firestore custom claims and RBAC checks
 */
export const MembershipRole = z.enum(["org_owner", "admin", "manager", "scheduler", "staff"]);
export type MembershipRole = z.infer<typeof MembershipRole>;

/**
 * Membership status lifecycle
 */
export const MembershipStatus = z.enum(["active", "suspended", "invited", "removed"]);
export type MembershipStatus = z.infer<typeof MembershipStatus>;

/**
 * Full Membership document schema
 * Firestore path: /memberships/{uid}_{orgId}
 */
export const MembershipSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  roles: z.array(MembershipRole).min(1, "At least one role is required"),
  status: MembershipStatus.default("active"),
  invitedBy: z.string().optional(),
  invitedAt: z.number().int().positive().optional(),
  joinedAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});
export type Membership = z.infer<typeof MembershipSchema>;

/**
 * Schema for creating a new membership
 * Used in POST /api/memberships
 */
export const CreateMembershipSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  roles: z.array(MembershipRole).min(1, "At least one role is required"),
  status: MembershipStatus.optional().default("invited"),
  invitedBy: z.string().optional(),
});
export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

/**
 * Schema for updating an existing membership
 * Used in PATCH /api/memberships/{id}
 */
export const UpdateMembershipSchema = z.object({
  roles: z.array(MembershipRole).min(1).optional(),
  status: MembershipStatus.optional(),
});
export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

/**
 * Query parameters for listing memberships
 */
export const ListMembershipsQuerySchema = z.object({
  orgId: z.string().optional(),
  uid: z.string().optional(),
  status: MembershipStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListMembershipsQuery = z.infer<typeof ListMembershipsQuerySchema>;

```


## Refactor: packages/types/src/messages.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/messages.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Messages
// Tags: P2, APP, CODE
import { z } from "zod";

/**
 * messages — lightweight internal/user-facing message docs inside org scope.
 * Collection: messages
 * Keyed by server-generated id.
 */
export const MessageSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  // author uid; system emitters use "system"
  authorId: z.string().min(1),
  // channel semantic: "system" | "inbox" | "alerts" | "schedule"
  channel: z.enum(["system", "inbox", "alerts", "schedule"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  // ISO string
  createdAt: z.string(),
  // message visibility: org-wide or targeted
  audience: z.union([
    z.literal("org"),
    z.object({
      type: z.literal("members"),
      memberIds: z.array(z.string().min(1)).min(1),
    }),
  ]),
  // optional linkage (e.g., scheduleId, shiftId)
  links: z
    .array(
      z.object({
        type: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .optional(),
  readBy: z.array(z.string()).default([]),
});

export type Message = z.infer<typeof MessageSchema>;

```


## Refactor: packages/types/src/networks.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/networks.ts`

**File Content:**
```typescript
// [P1][TENANCY][SCHEMA] Network schema (single canonical export)
import { z } from "zod";

export const NetworkKind = z.enum([
  "independent_org",
  "corporate_network",
  "franchise_network",
  "nonprofit_network",
  "test_sandbox",
]);
export type NetworkKind = z.infer<typeof NetworkKind>;

export const NetworkSegment = z.enum([
  "restaurant",
  "qsr",
  "bar",
  "hotel",
  "nonprofit",
  "shelter",
  "church",
  "retail",
  "other",
]);
export type NetworkSegment = z.infer<typeof NetworkSegment>;

export const NetworkStatus = z.enum(["pending_verification", "active", "suspended", "closed"]);
export type NetworkStatus = z.infer<typeof NetworkStatus>;

export const NetworkPlan = z.enum(["free", "starter", "growth", "enterprise", "internal"]);
export type NetworkPlan = z.infer<typeof NetworkPlan>;

export const BillingMode = z.enum(["none", "card", "invoice", "partner_billed"]);
export type BillingMode = z.infer<typeof BillingMode>;

export const NetworkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  legalName: z.string().optional(),
  kind: NetworkKind,
  segment: NetworkSegment,
  status: NetworkStatus,
  environment: z.enum(["production", "staging", "sandbox", "demo"]).optional(),
  primaryRegion: z.string().optional(),
  timeZone: z.string().optional(),
  currency: z.string().optional(),
  plan: NetworkPlan.optional(),
  billingMode: BillingMode.optional(),
  maxVenues: z.number().int().nullable().optional(),
  maxActiveOrgs: z.number().int().nullable().optional(),
  maxActiveUsers: z.number().int().nullable().optional(),
  maxShiftsPerDay: z.number().int().nullable().optional(),
  requireMfaForAdmins: z.boolean().optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  features: z
    .object({
      analytics: z.boolean().optional(),
      apiAccess: z.boolean().optional(),
    })
    .optional(),
  ownerUserId: z.string().optional(),
  createdAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.any().optional(),
  updatedBy: z.string().optional(),
});

export const CreateNetworkSchema = NetworkSchema.pick({
  slug: true,
  displayName: true,
  kind: true,
  segment: true,
});

export const UpdateNetworkSchema = NetworkSchema.partial();

export type Network = z.infer<typeof NetworkSchema>;
export type CreateNetworkInput = z.infer<typeof CreateNetworkSchema>;
export type UpdateNetworkInput = z.infer<typeof UpdateNetworkSchema>;

export default NetworkSchema;

```


## Refactor: packages/types/src/onboarding.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/onboarding.ts`

**File Content:**
```typescript
// [P2][SCHEMA][ONBOARDING] Onboarding validation schemas
// Tags: P2, SCHEMA, ONBOARDING, ZOD
/**
 * @fileoverview
 * Zod schemas for user onboarding flows (v14).
 * Defines request/response contracts for creating orgs, corporate networks, and joining with tokens.
 * Also defines the canonical OnboardingState shape stored in users/{uid}.onboarding.
 */
import { z } from "zod";

export const CreateCorporateOnboardingSchema = z.object({
  corporateName: z.string().min(1),
  brandName: z.string().optional(),
  formToken: z.string().optional(),
});

export const JoinWithTokenSchema = z.object({
  joinToken: z.string().min(1),
});

export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;
export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;

// Schema for creating an organization during onboarding (v14)
export const CreateOrgOnboardingSchema = z.object({
  orgName: z.string().min(1),
  venueName: z.string().min(1),
  formToken: z.string().min(1),
  location: z
    .object({
      street1: z.string().optional(),
      street2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      countryCode: z.string().min(2).max(2),
      timeZone: z.string().min(1),
    })
    .optional(),
});
export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

export const OnboardingIntent = z.enum(["create_org", "create_corporate", "join_existing"]);
export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

export const OnboardingStatus = z.enum(["not_started", "in_progress", "complete"]);
export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

export const OnboardingStateSchema = z.object({
  status: OnboardingStatus,
  intent: OnboardingIntent.optional(),
  stage: z.enum(["profile", "admin_form", "network_created", "joined_workspace"]).optional(),
  primaryNetworkId: z.string().optional(),
  primaryOrgId: z.string().optional(),
  primaryVenueId: z.string().optional(),
  completedAt: z.number().int().positive().optional(),
  lastUpdatedAt: z.number().int().positive().optional(),
});
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

```


## Refactor: packages/types/src/orgs.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/orgs.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Organization schemas
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ORGANIZATIONS
import { z } from "zod";

/**
 * Organization size categorization
 */
export const OrganizationSize = z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]);
export type OrganizationSize = z.infer<typeof OrganizationSize>;

/**
 * Organization status
 */
export const OrganizationStatus = z.enum(["active", "suspended", "trial", "cancelled"]);
export type OrganizationStatus = z.infer<typeof OrganizationStatus>;

/**
 * Subscription tier
 */
export const SubscriptionTier = z.enum(["free", "starter", "professional", "enterprise"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTier>;

/**
 * Organization settings
 */
export const OrganizationSettingsSchema = z.object({
  timezone: z.string().default("America/New_York"),
  dateFormat: z.string().default("MM/DD/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
  weekStartsOn: z.number().int().min(0).max(6).default(0), // 0 = Sunday
  allowSelfScheduling: z.boolean().default(false),
  requireShiftConfirmation: z.boolean().default(true),
  enableGeofencing: z.boolean().default(false),
  geofenceRadius: z.number().int().positive().default(100), // meters
});
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;

/**
 * Full Organization document schema
 * Firestore path: /organizations/{orgId} or /orgs/{orgId}
 */
export const OrganizationSchema = z.object({
  id: z.string().min(1),
  // Optional network scoping for v14 tenancy model
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.optional(),
  subscriptionTier: SubscriptionTier.optional(),

  // Ownership and membership
  ownerId: z.string().min(1, "Owner ID is required"),
  memberCount: z.number().int().nonnegative(),

  // Settings
  settings: OrganizationSettingsSchema.optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),

  // Contact
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),

  // Timestamps (accept ISO datetime string or Unix ms number)
  createdAt: z.union([z.number().int().positive(), z.string().datetime()]),
  updatedAt: z.union([z.number().int().positive(), z.string().datetime()]),

  // Trial/subscription (accept ISO datetime string or Unix ms number)
  trialEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
  subscriptionEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});
export type OrganizationType = z.infer<typeof OrganizationSchema>;

/**
 * Schema for creating a new organization
 * Used in POST /api/organizations
 */
export const CreateOrganizationSchema = z.object({
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  settings: OrganizationSettingsSchema.optional(),
});
export type CreateOrganizationInputType = z.infer<typeof CreateOrganizationSchema>;
export const CreateOrganizationInput = CreateOrganizationSchema;
export const OrganizationCreateSchema = CreateOrganizationInput;

/**
 * Schema for updating an existing organization
 * Used in PATCH /api/organizations/{id}
 */
export const UpdateOrganizationSchema = z.object({
  networkId: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  settings: OrganizationSettingsSchema.optional(),
});
export type UpdateOrganizationInputType = z.infer<typeof UpdateOrganizationSchema>;
export const UpdateOrganizationInput = UpdateOrganizationSchema;
export const OrganizationUpdateSchema = UpdateOrganizationInput;

// Aliases for backward/test compatibility (value exports expected by tests)
// Historically some callers expect `Organization` to allow missing `updatedAt` in
// minimal records while `OrganizationSchema` (the canonical schema) requires it.
// Keep both shapes to satisfy existing tests and consumers.
export const Organization = OrganizationSchema.extend({
  updatedAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});

/**
 * Query parameters for listing organizations
 */
export const ListOrganizationsQuerySchema = z.object({
  status: OrganizationStatus.optional(),
  size: OrganizationSize.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListOrganizationsQuery = z.infer<typeof ListOrganizationsQuerySchema>;

```


## Refactor: packages/types/src/positions.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/positions.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Positions schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, POSITIONS
import { z } from "zod";

/**
 * Position type categorization
 */
export const PositionType = z.enum(["full_time", "part_time", "contractor", "volunteer"]);
export type PositionType = z.infer<typeof PositionType>;

/**
 * Skill level for positions
 */
export const SkillLevel = z.enum(["entry", "intermediate", "advanced", "expert"]);
export type SkillLevel = z.infer<typeof SkillLevel>;

/**
 * Full Position document schema
 * Firestore path: /positions/{orgId}/{positionId}
 */
export const PositionSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Position name is required").max(100),
  description: z.string().max(500).optional(),
  type: PositionType.default("part_time"),
  skillLevel: SkillLevel.default("entry"),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  isActive: z.boolean().default(true),
  requiredCertifications: z.array(z.string()).default([]),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Position = z.infer<typeof PositionSchema>;

/**
 * Schema for creating a new position
 * Used in POST /api/positions
 */
export const CreatePositionSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Position name is required").max(100),
  description: z.string().max(500).optional(),
  type: PositionType.optional().default("part_time"),
  skillLevel: SkillLevel.optional().default("entry"),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  requiredCertifications: z.array(z.string()).optional(),
});
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

/**
 * Schema for updating an existing position
 * Used in PATCH /api/positions/{id}
 */
export const UpdatePositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: PositionType.optional(),
  skillLevel: SkillLevel.optional(),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isActive: z.boolean().optional(),
  requiredCertifications: z.array(z.string()).optional(),
});
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;

/**
 * Query parameters for listing positions
 */
export const ListPositionsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  isActive: z.coerce.boolean().optional(),
  type: PositionType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListPositionsQuery = z.infer<typeof ListPositionsQuerySchema>;

```


## Refactor: packages/types/src/rbac.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/rbac.ts`

**File Content:**
```typescript
// [P0][RBAC][CODE] Rbac
// Tags: P0, RBAC, CODE
import { z } from "zod";

export const OrgRole = z.enum(["org_owner", "admin", "manager", "scheduler", "corporate", "staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

export const UserClaims = z.object({
  uid: z.string(),
  orgId: z.string(),
  roles: z.array(OrgRole).nonempty(),
});
export type UserClaims = z.infer<typeof UserClaims>;

// Legacy membership-like shape used in some RBAC checks. Not the canonical
// membership stored in `/memberships/*` (see `memberships.ts`). Export under a
// different name to avoid duplicate symbol collisions when re-exporting.
export const MembershipClaimsSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type MembershipClaims = z.infer<typeof MembershipClaimsSchema>;

```


## Refactor: packages/types/src/receipts.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/receipts.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Receipts
// Tags: P2, APP, CODE
import { z } from "zod";

/**
 * receipts — audit-ish acknowledgements for actions (publish, approvals, etc.)
 * Collection: receipts
 * Keyed by server-generated id.
 */
export const ReceiptSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  actorId: z.string().min(1), // uid that performed the action
  action: z.enum([
    "schedule.publish",
    "shift.assign",
    "member.approve",
    "token.issue",
    "mfa.enroll",
    "mfa.verify",
  ]),
  // optional resource linkage (schedule/shift/member/etc.)
  resource: z
    .object({
      type: z.string().min(1),
      id: z.string().min(1),
    })
    .optional(),
  createdAt: z.string(), // ISO
  // optional metadata snap for forensics/troubleshooting
  meta: z.record(z.string(), z.any()).default({}),
});

export type Receipt = z.infer<typeof ReceiptSchema>;

```


## Refactor: packages/types/src/schedules.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/schedules.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Schedule schemas
// Tags: P1, INTEGRITY, SCHEMA, ZOD, SCHEDULES
import { z } from "zod";

/**
 * Schedule status lifecycle
 */
export const ScheduleStatus = z.enum(["draft", "published", "active", "completed", "archived"]);
export type ScheduleStatus = z.infer<typeof ScheduleStatus>;

/**
 * Schedule visibility settings
 */
export const ScheduleVisibility = z.enum([
  "private", // Only managers can see
  "team", // All team members can see
  "public", // Public viewing (with link)
]);
export type ScheduleVisibility = z.infer<typeof ScheduleVisibility>;

/**
 * Schedule statistics
 */
export const ScheduleStatsSchema = z.object({
  totalShifts: z.number().int().nonnegative().default(0),
  assignedShifts: z.number().int().nonnegative().default(0),
  unassignedShifts: z.number().int().nonnegative().default(0),
  totalHours: z.number().nonnegative().default(0),
  totalCost: z.number().nonnegative().default(0),
  conflictCount: z.number().int().nonnegative().default(0),
});
export type ScheduleStats = z.infer<typeof ScheduleStatsSchema>;

/**
 * Full Schedule document schema
 * Firestore path: /schedules/{orgId}/{scheduleId}
 * or /orgs/{orgId}/schedules/{scheduleId}
 */
export const ScheduleSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Schedule name is required").max(100),
    description: z.string().max(500).optional(),

    // Time boundaries (Unix timestamps in milliseconds)
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),

    status: ScheduleStatus.default("draft"),
    visibility: ScheduleVisibility.default("team"),

    // Metadata
    templateId: z.string().optional(), // If created from a template
    parentScheduleId: z.string().optional(), // If cloned from another schedule

    // Statistics (denormalized for performance)
    stats: ScheduleStatsSchema.optional(),

    // AI generation metadata
    aiGenerated: z.boolean().default(false),
    aiModel: z.string().optional(),
    aiGeneratedAt: z.number().int().positive().optional(),

    // Publishing
    publishedAt: z.number().int().positive().optional(),
    publishedBy: z.string().optional(),

    createdBy: z.string().min(1),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type Schedule = z.infer<typeof ScheduleSchema>;

/**
 * Schema for creating a new schedule
 * Used in POST /api/schedules
 */
export const CreateScheduleSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Schedule name is required").max(100),
    description: z.string().max(500).optional(),
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),
    visibility: ScheduleVisibility.optional().default("team"),
    templateId: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

/**
 * Schema for updating an existing schedule
 * Used in PATCH /api/schedules/{id}
 */
export const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z.number().int().positive().optional(),
  endDate: z.number().int().positive().optional(),
  status: ScheduleStatus.optional(),
  visibility: ScheduleVisibility.optional(),
});
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;

/**
 * Schema for publishing a schedule
 * Used in POST /api/schedules/{id}/publish
 */
export const PublishScheduleSchema = z.object({
  notifyStaff: z.boolean().default(true),
  message: z.string().max(500).optional(),
});
export type PublishScheduleInput = z.infer<typeof PublishScheduleSchema>;

/**
 * Schema for cloning a schedule
 * Used in POST /api/schedules/{id}/clone
 */
export const CloneScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.number().int().positive(),
  endDate: z.number().int().positive(),
  includeAssignments: z.boolean().default(false),
});
export type CloneScheduleInput = z.infer<typeof CloneScheduleSchema>;

/**
 * Query parameters for listing schedules
 */
export const ListSchedulesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  status: ScheduleStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListSchedulesQuery = z.infer<typeof ListSchedulesQuerySchema>;

```


## Refactor: packages/types/src/shifts.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/shifts.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Shifts schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, SHIFTS
import { z } from "zod";

/**
 * Shift status lifecycle
 */
export const ShiftStatus = z.enum(["draft", "published", "in_progress", "completed", "cancelled"]);
export type ShiftStatus = z.infer<typeof ShiftStatus>;

/**
 * Shift assignment status
 */
export const AssignmentStatus = z.enum([
  "unassigned",
  "assigned",
  "confirmed",
  "declined",
  "no_show",
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatus>;

/**
 * Individual shift assignment
 */
export const ShiftAssignmentSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  status: AssignmentStatus.default("assigned"),
  assignedAt: z.number().int().positive(),
  assignedBy: z.string().min(1),
  confirmedAt: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});
export type ShiftAssignment = z.infer<typeof ShiftAssignmentSchema>;

/**
 * Full Shift document schema
 * Firestore path: /shifts/{orgId}/{scheduleId}/{shiftId}
 * or /orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}
 */
export const ShiftSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),

    // Time boundaries (Unix timestamps in milliseconds)
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),

    status: ShiftStatus.default("draft"),

    // Staffing
    assignments: z.array(ShiftAssignmentSchema).default([]),
    requiredStaff: z.number().int().positive().default(1),

    // Metadata
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().default(0),

    // AI metadata
    aiGenerated: z.boolean().default(false),
    aiConfidence: z.number().min(0).max(1).optional(),

    createdBy: z.string().min(1),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type Shift = z.infer<typeof ShiftSchema>;

/**
 * Schema for creating a new shift
 * Used in POST /api/shifts
 */
export const CreateShiftSchema = z
  .object({
    orgId: z.string().min(1, "Organization ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
    venueId: z.string().optional(),
    zoneId: z.string().optional(),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    requiredStaff: z.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    breakMinutes: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;

/**
 * Schema for updating an existing shift
 * Used in PATCH /api/shifts/{id}
 */
export const UpdateShiftSchema = z.object({
  positionId: z.string().min(1).optional(),
  venueId: z.string().optional(),
  zoneId: z.string().optional(),
  startTime: z.number().int().positive().optional(),
  endTime: z.number().int().positive().optional(),
  status: ShiftStatus.optional(),
  requiredStaff: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  breakMinutes: z.number().int().nonnegative().optional(),
});
export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

/**
 * Schema for assigning staff to a shift
 * Used in POST /api/shifts/{id}/assign
 */
export const AssignShiftSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  notes: z.string().max(500).optional(),
});
export type AssignShiftInput = z.infer<typeof AssignShiftSchema>;

/**
 * Query parameters for listing shifts
 */
export const ListShiftsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  scheduleId: z.string().optional(),
  positionId: z.string().optional(),
  venueId: z.string().optional(),
  status: ShiftStatus.optional(),
  startAfter: z.coerce.number().int().positive().optional(),
  startBefore: z.coerce.number().int().positive().optional(),
  assignedTo: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListShiftsQuery = z.infer<typeof ListShiftsQuerySchema>;

```


## Refactor: packages/types/src/venues.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/venues.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Venues schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, VENUES
import { z } from "zod";

/**
 * Venue type categorization
 */
export const VenueType = z.enum(["indoor", "outdoor", "hybrid", "virtual"]);
export type VenueType = z.infer<typeof VenueType>;

/**
 * Address schema for venues
 */
export const AddressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(5).max(10),
  country: z.string().min(2).max(2).default("US"), // ISO 3166-1 alpha-2
});
export type Address = z.infer<typeof AddressSchema>;

/**
 * Geographic coordinates
 */
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

/**
 * Full Venue document schema
 * Firestore path: /venues/{orgId}/{venueId}
 */
export const VenueSchema = z.object({
  id: z.string().min(1),
  // Optional network scoping for v14 tenancy model
  networkId: z.string().min(1).optional(),
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.default("indoor"),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  timezone: z.string().default("America/New_York"),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Venue = z.infer<typeof VenueSchema>;

/**
 * Schema for creating a new venue
 * Used in POST /api/venues
 */
export const CreateVenueSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.optional().default("indoor"),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

/**
 * Schema for updating an existing venue
 * Used in PATCH /api/venues/{id}
 */
export const UpdateVenueSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: VenueType.optional(),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  timezone: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

/**
 * Query parameters for listing venues
 */
export const ListVenuesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  networkId: z.string().min(1).optional(),
  isActive: z.coerce.boolean().optional(),
  type: VenueType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListVenuesQuery = z.infer<typeof ListVenuesQuerySchema>;

```


## Refactor: packages/types/src/widgets.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/widgets.ts`

**File Content:**
```typescript
// [P2][APP][CODE] Widgets
// Tags: P2, APP, CODE
// Template: CODE_ZOD_SCHEMA

import { z } from "zod";

/**
 * Widget domain schema
 * Owner: platform
 * Description: Domain entity
 */
export const WidgetId = z.string().min(1);

export const WidgetSchema = z.object({
  id: WidgetId,
  createdAt: z.string(),
  updatedAt: z.string(),
  // add domain fields here
});

export type Widget = z.infer<typeof WidgetSchema>;

// Index export pattern (place in src/index.ts)
// export * from "./widgets";

```


## Refactor: packages/types/src/zones.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/src/zones.ts`

**File Content:**
```typescript
// [P1][INTEGRITY][SCHEMA] Zones schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ZONES
import { z } from "zod";

/**
 * Zone type categorization
 */
export const ZoneType = z.enum([
  "production",
  "backstage",
  "front_of_house",
  "service",
  "storage",
  "other",
]);
export type ZoneType = z.infer<typeof ZoneType>;

/**
 * Full Zone document schema
 * Firestore path: /zones/{orgId}/{zoneId}
 */
export const ZoneSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Zone name is required").max(100),
  description: z.string().max(500).optional(),
  type: ZoneType.default("other"),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Zone = z.infer<typeof ZoneSchema>;

/**
 * Schema for creating a new zone
 * Used in POST /api/zones
 */
export const CreateZoneSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Zone name is required").max(100),
  description: z.string().max(500).optional(),
  type: ZoneType.optional().default("other"),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

/**
 * Schema for updating an existing zone
 * Used in PATCH /api/zones/{id}
 */
export const UpdateZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: ZoneType.optional(),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

/**
 * Query parameters for listing zones
 */
export const ListZonesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  type: ZoneType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListZonesQuery = z.infer<typeof ListZonesQuerySchema>;

```


## Refactor: packages/types/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/types/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "composite": true
  },
  "include": ["src"]
}

```


## Refactor: packages/ui/src/Button.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/src/Button.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Button
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-black text-white hover:bg-gray-800 focus-visible:ring-black": variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500":
            variant === "secondary",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500":
            variant === "outline",
          "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500": variant === "ghost",
        },
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 py-2": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

```


## Refactor: packages/ui/src/Card.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/src/Card.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-lg border bg-white p-6 shadow-sm", className)}>{children}</div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx("flex flex-col space-y-1.5 pb-4", className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={clsx("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx("pt-0", className)}>{children}</div>;
}

```


## Refactor: packages/ui/src/Input.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/src/Input.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          type={type}
          className={clsx(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

```


## Refactor: packages/ui/src/Modal.tsx
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/src/Modal.tsx`

**File Content:**
```typescript
// [P2][UI][CODE] Modal
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={clsx("relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl", {
          "max-w-sm": size === "sm",
          "max-w-md": size === "md",
          "max-w-lg": size === "lg",
          "max-w-2xl": size === "xl",
        })}
      >
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        <div className="mb-4">{children}</div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

```


## Refactor: packages/ui/src/index.ts
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/src/index.ts`

**File Content:**
```typescript
// [P2][UI][CODE] Index
// Tags: P2, UI, CODE
export { Button } from "./Button";
export { Card } from "./Card";
export { Input } from "./Input";
export { Modal } from "./Modal";

```


## Refactor: packages/ui/tsconfig.json
**Copy the following prompt and run it with the `Refactor Compliance Agent`:**
markdown
Refactor this file to be 100% compliant with all project standards.

**File Path:** `packages/ui/tsconfig.json`

**File Content:**
```typescript
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

