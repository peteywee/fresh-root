import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import { clsx } from "clsx";
/**
 * Card component for displaying content in a contained, styled box
 *
 * @example
 * ```tsx
 * <Card title="User Profile" description="View and edit your profile">
 *   <p>Content goes here</p>
 * </Card>
 * ```
 */
export function Card({ title, description, children, className, footer, variant = "default", }) {
    const variantStyles = {
        default: "bg-white border border-gray-200",
        bordered: "bg-white border-2 border-gray-300",
        elevated: "bg-white shadow-lg",
    };
    return (_jsxs("div", { className: clsx("overflow-hidden rounded-lg", variantStyles[variant], className), children: [(title || description) && (_jsxs("div", { className: "border-b border-gray-200 px-6 py-4", children: [title && _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-gray-600", children: description })] })), _jsx("div", { className: "px-6 py-4", children: children }), footer && _jsx("div", { className: "border-t border-gray-200 bg-gray-50 px-6 py-3", children: footer })] }));
}
