// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
// Onboarding completion / success step
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";
export default function Block4Page() {
    const router = useRouter();
    const { intent, networkId, orgId, venueId, corpId, joinedRole } = useOnboardingWizard();
    const description = intent === "join_existing"
        ? "You have joined an existing workspace."
        : "Your workspace has been created.";
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "You're in." }), _jsx("p", { className: "text-sm text-slate-600", children: description }), _jsxs("div", { className: "space-y-1 rounded-md border px-4 py-3 text-xs text-slate-700", children: [networkId && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Network ID:" }), " ", networkId] })), orgId && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Org ID:" }), " ", orgId] })), venueId && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Venue ID:" }), " ", venueId] })), corpId && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Corporate ID:" }), " ", corpId] })), joinedRole && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Role:" }), " ", joinedRole] }))] }), _jsx("button", { type: "button", className: "inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white", onClick: () => router.push("/app"), children: "Go to the app" })] }));
}
