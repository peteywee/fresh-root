// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Input = React.forwardRef(({ className, type = "text", error, ...props }, ref) => {
    return (_jsxs("div", { className: "space-y-1", children: [_jsx("input", { type: type, className: clsx("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", error && "border-red-500 focus-visible:ring-red-500", className), ref: ref, ...props }), error && _jsx("p", { className: "text-sm text-red-600", children: error })] }));
});
Input.displayName = "Input";
