// [P2][APP][CODE] Onboarding join page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function JoinPage() {
    const router = useRouter();
    const nav = { push: router.push };
    const [form, setForm] = useState({
        token: "",
        email: "",
    });
    const [error, setError] = useState(null);
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.token.trim()) {
            setError("Invite token is required.");
            return;
        }
        setError(null);
        // Real implementation would POST to /api/onboarding/join-with-token.
        nav.push("/onboarding/block-4");
    }
    return (_jsxs("main", { className: "mx-auto flex max-w-xl flex-col gap-6 px-4 py-10", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Step 3: Join with token" }), _jsx("p", { className: "text-sm text-gray-600", children: "Enter the invite token sent by your organization to connect your account." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "token", className: "block text-sm font-medium text-gray-800", children: "Invite token" }), _jsx("input", { id: "token", name: "token", type: "text", value: form.token, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "Paste your invite token" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-800", children: "Email (optional)" }), _jsx("input", { id: "email", name: "email", type: "email", value: form.email, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "Used for verification if required" })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("button", { type: "button", onClick: () => nav.push("/onboarding/intent"), className: "text-sm text-gray-600 underline", children: "Back to Intent" }), _jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white", children: "Continue" })] })] })] }));
}
