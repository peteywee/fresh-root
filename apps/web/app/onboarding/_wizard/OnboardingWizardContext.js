// [P2][APP][CODE] OnboardingWizardContext
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const OnboardingWizardContext = createContext(undefined);
export function OnboardingWizardProvider({ children }) {
    const [intent, setIntent] = useState(null);
    const [formToken, setFormToken] = useState(null);
    const [networkId, setNetworkId] = useState(null);
    const [orgId, setOrgId] = useState(null);
    const [venueId, setVenueId] = useState(null);
    const [corpId, setCorpId] = useState(null);
    const [joinedRole, setJoinedRole] = useState(null);
    const value = {
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
    return (_jsx(OnboardingWizardContext.Provider, { value: value, children: children }));
}
export function useOnboardingWizard() {
    const ctx = useContext(OnboardingWizardContext);
    if (!ctx) {
        throw new Error("useOnboardingWizard must be used within an OnboardingWizardProvider");
    }
    return ctx;
}
