// [P2][UI][CODE] Button
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
const base = "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold transition";
const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
    secondary: "bg-neutral-800 text-gray-100 hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
    ghost: "bg-transparent text-gray-200 hover:bg-neutral-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400",
};
export default function Button({ variant = "primary", loading, className = "", ...props }) {
    return (_jsx("button", { className: `${base} ${variants[variant]} ${loading ? "cursor-wait opacity-75" : ""} ${className}`, ...props, disabled: loading || props.disabled }));
}
