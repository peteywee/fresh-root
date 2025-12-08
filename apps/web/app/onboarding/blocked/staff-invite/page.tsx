// [P0][APP][CODE] Staff invite blocked page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React from "react";

// Narrow router type to the minimal surface we actually use to avoid any.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

export default function StaffInviteBlockedPage() {
  const router = useRouter();
  const nav: NavRouter = { push: (url: string) => router.push(url) };

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
