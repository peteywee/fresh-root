// [P0][APP][CODE] Create network organization page component
// Tags: P0, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function CreateNetworkOrgPage() {
    const router = useRouter();
    const nav = { push: router.push };
    const [form, setForm] = useState({
        orgName: "",
        venueName: "",
        city: "",
        state: "",
    });
    const [error, setError] = useState(null);
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.orgName.trim() || !form.venueName.trim()) {
            setError("Organization name and primary venue are required.");
            return;
        }
        setError(null);
        // Real implementation would POST to /api/onboarding/create-network-org.
        nav.push("/onboarding/block-4");
    }
    return (_jsxs("main", { className: "mx-auto flex max-w-xl flex-col gap-6 px-4 py-10", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Step 4: Create your organization" }), _jsx("p", { className: "text-sm text-gray-600", children: "Define your primary organization and first venue. You can add more locations later." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "orgName", className: "block text-sm font-medium text-gray-800", children: "Organization name" }), _jsx("input", { id: "orgName", name: "orgName", type: "text", value: form.orgName, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "e.g., Top Shelf Service \u2013 Main Location" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "venueName", className: "block text-sm font-medium text-gray-800", children: "Primary venue name" }), _jsx("input", { id: "venueName", name: "venueName", type: "text", value: form.venueName, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "e.g., Arlington Cafe" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("label", { htmlFor: "city", className: "block text-sm font-medium text-gray-800", children: "City" }), _jsx("input", { id: "city", name: "city", type: "text", value: form.city, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsxs("div", { className: "w-24 space-y-1", children: [_jsx("label", { htmlFor: "state", className: "block text-sm font-medium text-gray-800", children: "State" }), _jsx("input", { id: "state", name: "state", type: "text", value: form.state, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "TX" })] })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("button", { type: "button", onClick: () => nav.push("/onboarding/admin-responsibility"), className: "text-sm text-gray-600 underline", children: "Back to Admin responsibilities" }), _jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white", children: "Continue to Finalization" })] })] })] }));
}
