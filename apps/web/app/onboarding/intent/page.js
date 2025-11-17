// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";
export default function IntentPage() {
    const router = useRouter();
    const { intent, setIntent } = useOnboardingWizard();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
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
            const data = (await res.json());
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
            }
            else {
                router.push("/onboarding/admin-responsibility");
            }
        }
        catch (err) {
            console.error(err);
            setError("Unexpected error during eligibility check");
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "What are you trying to do?" }), _jsx("p", { className: "text-sm text-slate-600", children: "Choose the path that best matches your role and what you're setting up." }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { type: "button", onClick: () => setIntent("create_org"), className: `w-full rounded-md border px-4 py-3 text-left text-sm ${intent === "create_org" ? "border-slate-900 bg-slate-100" : "border-slate-300"}`, children: "I manage a single location or local team" }), _jsx("button", { type: "button", onClick: () => setIntent("create_corporate"), className: `w-full rounded-md border px-4 py-3 text-left text-sm ${intent === "create_corporate" ? "border-slate-900 bg-slate-100" : "border-slate-300"}`, children: "I'm corporate / HQ setting up a network" }), _jsx("button", { type: "button", onClick: () => setIntent("join_existing"), className: `w-full rounded-md border px-4 py-3 text-left text-sm ${intent === "join_existing" ? "border-slate-900 bg-slate-100" : "border-slate-300"}`, children: "I'm joining a company that already uses this" })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsx("button", { type: "button", disabled: !intent || submitting, onClick: continueFlow, className: "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60", children: submitting ? "Checking..." : "Continue" })] }));
}
