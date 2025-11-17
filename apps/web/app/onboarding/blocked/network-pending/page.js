// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProtectedRoute from "../../../components/ProtectedRoute";
export default function NetworkPending() {
    return (_jsx(ProtectedRoute, { children: _jsxs("div", { className: "mx-auto max-w-2xl p-6 text-center", children: [_jsx("h1", { className: "mb-4 text-2xl font-semibold", children: "Network pending verification" }), _jsx("p", { className: "text-sm", children: "Your network is pending verification. You may have to wait for manual review. We'll notify you when it's active." })] }) }));
}
