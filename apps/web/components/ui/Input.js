// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
export default function Input({ label, hint, id, className = "", ...props }) {
    const inputId = id ?? React.useId();
    return (_jsxs("div", { className: "grid gap-1", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-sm text-gray-300", children: label })), _jsx("input", { id: inputId, className: `rounded-2xl border border-neutral-800 bg-[#0e1117] px-3 py-2 text-sm outline-none ring-0 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 ${className}`, ...props }), hint && _jsx("p", { className: "text-xs text-neutral-500", children: hint })] }));
}
