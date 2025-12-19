// [P1][UX][CODE] Organization context - Wired to cookie
// Tags: P1, UX, CODE, ORG
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type OrgContextState = {
  orgId: string | null;
  setOrgId: (orgId: string | null) => void;
};

const OrgContext = createContext<OrgContextState | undefined>(undefined);

export function OrgProvider({ 
  children,
  initialOrgId = null,
}: { 
  children: React.ReactNode;
  initialOrgId?: string | null;
}) {
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);

  // Sync orgId to cookie when it changes
  useEffect(() => {
    if (orgId) {
      document.cookie = `orgId=${orgId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } else {
      document.cookie = "orgId=; path=/; max-age=0; SameSite=Lax";
    }
  }, [orgId]);

  return (
    <OrgContext.Provider value={{ orgId, setOrgId }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    // If provider is missing, return a safe default
    return { orgId: null, setOrgId: () => {} };
  }
  return ctx;
}
