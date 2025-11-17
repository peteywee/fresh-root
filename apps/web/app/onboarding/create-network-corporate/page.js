// [P0][CODE] Create corporate network page component
// Tags: P0, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function CreateNetworkCorporatePage() {
    const router = useRouter();
    const nav = { push: router.push };
    const [form, setForm] = useState({
        corporateName: "",
        brandName: "",
        hqCity: "",
        hqState: "",
        locationCount: "",
    });
    const [error, setError] = useState(null);
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.corporateName.trim() || !form.brandName.trim()) {
            setError("Corporate entity name and brand are required.");
            return;
        }
        setError(null);
        // Real implementation would POST to /api/onboarding/create-network-corporate.
        nav.push("/onboarding/block-4");
    }
    return (_jsxs("main", { className: "mx-auto flex max-w-xl flex-col gap-6 px-4 py-10", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Step 4: Create your corporate network" }), _jsx("p", { className: "text-sm text-gray-600", children: "Define your corporate entity and brand so we can link your locations together under one network." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "corporateName", className: "block text-sm font-medium text-gray-800", children: "Corporate entity name" }), _jsx("input", { id: "corporateName", name: "corporateName", type: "text", value: form.corporateName, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "e.g., Top Shelf Service Holdings, LLC" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "brandName", className: "block text-sm font-medium text-gray-800", children: "Brand name" }), _jsx("input", { id: "brandName", name: "brandName", type: "text", value: form.brandName, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "e.g., Fresh Schedules Cafes" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("label", { htmlFor: "hqCity", className: "block text-sm font-medium text-gray-800", children: "HQ City" }), _jsx("input", { id: "hqCity", name: "hqCity", type: "text", value: form.hqCity, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsxs("div", { className: "w-24 space-y-1", children: [_jsx("label", { htmlFor: "hqState", className: "block text-sm font-medium text-gray-800", children: "State" }), _jsx("input", { id: "hqState", name: "hqState", type: "text", value: form.hqState, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "TX" })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { htmlFor: "locationCount", className: "block text-sm font-medium text-gray-800", children: "Approximate location count" }), _jsx("input", { id: "locationCount", name: "locationCount", type: "number", min: 1, value: form.locationCount, onChange: handleChange, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm", placeholder: "e.g., 5" })] }), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("button", { type: "button", onClick: () => nav.push("/onboarding/admin-responsibility"), className: "text-sm text-gray-600 underline", children: "Back to Admin responsibilities" }), _jsx("button", { type: "submit", className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white", children: "Continue to Finalization" })] })] })] }));
}
