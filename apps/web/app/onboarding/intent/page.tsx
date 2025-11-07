// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
// [P2][APP][CODE] Page component
// Tags: P2, APP, CODE
"use client";
import React from "react";

export default function IntentStep() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">Choose how you'd like to get started.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="/onboarding/join"
          className="rounded border border-neutral-800 p-4 text-center hover:bg-neutral-900"
        >
          <h3 className="font-semibold">Join existing team</h3>
          <p className="text-sm text-neutral-400">Use an invite or join code from a manager.</p>
        </a>

        <a
          href="/onboarding/create-network-org"
          className="rounded border border-neutral-800 p-4 text-center hover:bg-neutral-900"
        >
          <h3 className="font-semibold">Set up my team</h3>
          <p className="text-sm text-neutral-400">Create a new org and venue (recommended).</p>
        </a>

        <a
          href="/onboarding/create-network-corporate"
          className="rounded border border-neutral-800 p-4 text-center hover:bg-neutral-900"
        >
          <h3 className="font-semibold">Corporate / HQ</h3>
          <p className="text-sm text-neutral-400">Create an HQ network with corporate options.</p>
        </a>
      </div>
    </div>
  );
}
