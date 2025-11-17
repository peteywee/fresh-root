// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from "clsx";
import { forwardRef } from "react";
/**
 * Input component with label, error, and helper text support
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 * ```
 */
export const Input = forwardRef(({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (_jsxs("div", { className: clsx("flex flex-col", fullWidth && "w-full"), children: [label && _jsx("label", { className: "mb-1 text-sm font-medium text-gray-700", children: label }), _jsx("input", { ref: ref, className: clsx("rounded-md border px-3 py-2 text-sm shadow-sm", "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500", "disabled:cursor-not-allowed disabled:bg-gray-100", error ? "border-red-500 focus:ring-red-500" : "border-gray-300", className), "aria-invalid": !!error, "aria-describedby": error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined, ...props }), error && (_jsx("p", { id: `${props.id}-error`, className: "mt-1 text-sm text-red-600", children: error })), !error && helperText && (_jsx("p", { id: `${props.id}-helper`, className: "mt-1 text-sm text-gray-500", children: helperText }))] }));
});
Input.displayName = "Input";
/**
 * Textarea component for multi-line text input
 */
export const Textarea = forwardRef(({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (_jsxs("div", { className: clsx("flex flex-col", fullWidth && "w-full"), children: [label && _jsx("label", { className: "mb-1 text-sm font-medium text-gray-700", children: label }), _jsx("textarea", { ref: ref, className: clsx("rounded-md border px-3 py-2 text-sm shadow-sm", "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500", "disabled:cursor-not-allowed disabled:bg-gray-100", error ? "border-red-500 focus:ring-red-500" : "border-gray-300", className), "aria-invalid": !!error, "aria-describedby": error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined, ...props }), error && (_jsx("p", { id: `${props.id}-error`, className: "mt-1 text-sm text-red-600", children: error })), !error && helperText && (_jsx("p", { id: `${props.id}-helper`, className: "mt-1 text-sm text-gray-500", children: helperText }))] }));
});
Textarea.displayName = "Textarea";
