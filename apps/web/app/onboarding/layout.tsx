// [P2][APP][CODE] Layout
// Tags: P2, APP, CODE
"use client";
import React from "react";

/**
 * The layout component for the onboarding section of the application.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered onboarding layout.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-neutral-800 bg-[#071025]/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Get started — Onboarding</h1>
          <p className="text-sm text-neutral-400">Quick steps to set up your workspace.</p>
        </div>
        <nav className="flex gap-3 text-sm">
          <a href="/" className="text-neutral-300 hover:text-white">
            Home
          </a>
          <a href="/onboarding" className="text-neutral-300 hover:text-white">
            Wizard
          </a>
        </nav>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
