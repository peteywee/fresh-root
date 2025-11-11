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
