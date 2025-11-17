// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function ProfilePage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [preferredName, setPreferredName] = useState("");
    const [phone, setPhone] = useState("");
    const [timeZone, setTimeZone] = useState("America/Chicago");
    const [selfDeclaredRole, setSelfDeclaredRole] = useState("owner_founder_director");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/api/onboarding/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    preferredName,
                    phone,
                    timeZone,
                    selfDeclaredRole,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const err = data.error;
                setError(err || "Failed to save profile");
                setSubmitting(false);
                return;
            }
            router.push("/onboarding/intent");
        }
        catch (err) {
            console.error(err);
            setError("Unexpected error");
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Tell us who you are" }), _jsx("p", { className: "text-sm text-slate-600", children: "Before we set up any organizations or venues, we need a basic profile for you." }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Full name" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: fullName, onChange: (e) => setFullName(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Preferred name" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: preferredName, onChange: (e) => setPreferredName(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Phone" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: phone, onChange: (e) => setPhone(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Time zone" }), _jsx("input", { className: "w-full rounded-md border px-3 py-2 text-sm", value: timeZone, onChange: (e) => setTimeZone(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium", children: "Which best describes you?" }), _jsxs("select", { className: "w-full rounded-md border px-3 py-2 text-sm", value: selfDeclaredRole, onChange: (e) => setSelfDeclaredRole(e.target.value), children: [_jsx("option", { value: "owner_founder_director", children: "Owner / Founder / Director" }), _jsx("option", { value: "manager_supervisor", children: "Manager / Supervisor" }), _jsx("option", { value: "corporate_hq", children: "Corporate / HQ" }), _jsx("option", { value: "manager", children: "Manager (generic)" }), _jsx("option", { value: "org_owner", children: "Org owner (legacy)" })] })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsx("button", { type: "submit", disabled: submitting, className: "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60", children: submitting ? "Saving..." : "Continue" })] })] }));
}
