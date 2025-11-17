import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// [P2][UI][CODE] Loading
// Tags: P2, UI, CODE
import { clsx } from "clsx";
/**
 * Spinner component for loading states
 *
 * @example
 * ```tsx
 * <Spinner size="md" />
 * ```
 */
export function Spinner({ size = "md", className }) {
    const sizeStyles = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };
    return (_jsxs("svg", { className: clsx("animate-spin text-blue-600", sizeStyles[size], className), xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }));
}
/**
 * Loading component with spinner and optional text
 *
 * @example
 * ```tsx
 * <Loading text="Loading data..." />
 * ```
 */
export function Loading({ text = "Loading...", fullScreen = false }) {
    const containerClasses = fullScreen
        ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
        : "flex items-center justify-center p-8";
    return (_jsx("div", { className: containerClasses, children: _jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: "lg" }), text && _jsx("p", { className: "mt-4 text-sm text-gray-600", children: text })] }) }));
}
