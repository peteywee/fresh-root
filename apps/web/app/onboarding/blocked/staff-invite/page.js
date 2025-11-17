// [P0][APP][CODE] Staff invite blocked page component
// Tags: P0, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
export default function StaffInviteBlockedPage() {
    const router = useRouter();
    const nav = { push: router.push };
    return (_jsxs("main", { className: "mx-auto flex max-w-xl flex-col gap-6 px-4 py-10", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "You need an invite" }), _jsx("p", { className: "text-sm text-gray-600", children: "It looks like you're trying to onboard as a staff member without an invite token. Staff access must be initiated by an admin or manager from an existing organization." })] }), _jsxs("section", { className: "space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800", children: [_jsx("p", { className: "font-medium", children: "What you can do:" }), _jsxs("ul", { className: "list-disc pl-5", children: [_jsx("li", { children: "Ask your manager or admin to send you a Fresh Schedules invite." }), _jsxs("li", { children: ["Once you receive the invite token, return here and use the", " ", _jsx("span", { className: "font-semibold", children: "Join with token" }), " step."] })] })] }), _jsxs("div", { className: "flex items-center justify-start gap-4", children: [_jsx("button", { type: "button", onClick: () => nav.push("/onboarding/join"), className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white", children: "Go to Join with token" }), _jsx("button", { type: "button", onClick: () => nav.push("/onboarding"), className: "text-sm text-gray-600 underline", children: "Back to onboarding index" })] })] }));
}
