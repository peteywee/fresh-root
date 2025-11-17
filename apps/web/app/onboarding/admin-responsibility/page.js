// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    const [error, setError] = useState(null);
    async function onSubmit(e) {
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
            setFormToken(data.formToken);
            if (intent === "create_corporate") {
                router.push("/onboarding/create-network-corporate");
            }
            else {
                router.push("/onboarding/create-network-org");
            }
        }
        catch (err) {
            console.error(err);
            setError("Unexpected error");
            setSubmitting(false);
        }
    }
    if (!intent) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-slate-600", children: "We need to know what you're setting up first." }), _jsx("button", { className: "rounded-md bg-slate-900 px-4 py-2 text-sm text-white", onClick: () => router.push("/onboarding/intent"), children: "Back to intent selection" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Admin responsibility" }), _jsx("p", { className: "text-sm text-slate-600", children: "This step designates who is legally responsible for this workspace and the data in it." }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Legal entity name" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: legalEntityName, onChange: (e) => setLegalEntityName(e.target.value), required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Tax ID" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: taxId, onChange: (e) => setTaxId(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Country code" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: countryCode, onChange: (e) => setCountryCode(e.target.value.toUpperCase()), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Business email" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: businessEmail, onChange: (e) => setBusinessEmail(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Business phone" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: businessPhone, onChange: (e) => setBusinessPhone(e.target.value), required: true })] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: liabilityAcknowledged, onChange: (e) => setLiabilityAcknowledged(e.target.checked) }), _jsx("span", { children: "I understand I'm responsible for how this workspace is used." })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: termsAccepted, onChange: (e) => setTermsAccepted(e.target.checked) }), _jsx("span", { children: "I agree to the Terms of Service." })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: privacyAccepted, onChange: (e) => setPrivacyAccepted(e.target.checked) }), _jsx("span", { children: "I agree to the Privacy Policy." })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Type your full name as signature" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: signature, onChange: (e) => setSignature(e.target.value), required: true })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsx("button", { type: "submit", disabled: submitting, className: "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60", children: submitting ? "Submitting..." : "Continue" })] })] }));
}
