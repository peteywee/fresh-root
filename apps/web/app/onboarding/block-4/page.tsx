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
