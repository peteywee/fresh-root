// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProtectedRoute from "@/app/components/ProtectedRoute";
export default function EmailNotVerified() {
    return (_jsx(ProtectedRoute, { children: _jsxs("div", { className: "mx-auto max-w-2xl p-6 text-center", children: [_jsx("h1", { className: "mb-4 text-2xl font-semibold", children: "Email not verified" }), _jsx("p", { className: "text-sm", children: "Please verify your email address before continuing with onboarding. Check your inbox for a verification email." })] }) }));
}
