// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
export default function AdminFormStep() {
    const [company, setCompany] = useState("");
    const [taxId, setTaxId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [formToken, setFormToken] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        // prefill from profile if present
        try {
            const p = localStorage.getItem("onb_profile");
            if (p) {
                const parsed = JSON.parse(p);
                if (parsed.fullName)
                    setCompany(parsed.fullName + "'s org");
                if (parsed.phone)
                    setEmail(parsed.phone);
            }
        }
        catch { }
    }, []);
    async function submitForm(e) {
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
            }
            else {
                setFormToken(json.formToken);
                try {
                    localStorage.setItem("onb_formToken", json.formToken);
                }
                catch { }
            }
        }
        catch (e) {
            setError(e.message || "Network error");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("form", { onSubmit: submitForm, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-neutral-300", children: "Legal entity name" }), _jsx("input", { required: true, value: company, onChange: (e) => setCompany(e.target.value), className: "mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-neutral-300", children: "Tax ID (optional)" }), _jsx("input", { value: taxId, onChange: (e) => setTaxId(e.target.value), className: "mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-neutral-300", children: "Business email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white", placeholder: "admin@example.com" })] }), _jsxs("div", { className: "flex items-center justify-end gap-3", children: [_jsx("a", { className: "text-sm text-neutral-400 hover:underline", href: "/onboarding/intent", children: "Back" }), _jsx("button", { className: "rounded bg-emerald-600 px-4 py-2 text-sm font-medium", disabled: loading, children: loading ? "Submitting…" : "Save and continue" })] })] }), formToken && (_jsxs("div", { className: "rounded border border-emerald-700 bg-emerald-900/10 p-3 text-sm", children: [_jsx("p", { className: "font-medium text-emerald-200", children: "Form saved" }), _jsx("p", { className: "text-neutral-300", children: "Use this token to continue network creation." }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("code", { className: "rounded bg-neutral-900 px-2 py-1 text-xs", children: formToken }), _jsx("a", { href: "/onboarding/create-network-org", className: "text-emerald-400 hover:underline", children: "Continue to create network" })] })] })), error && _jsx("div", { className: "text-sm text-rose-400", children: error })] }));
}
