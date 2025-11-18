// [P2][UI][CODE] Modal
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import { useEffect } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape")
                onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50", onClick: onClose }), _jsxs("div", { className: clsx("relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl", {
                    "max-w-sm": size === "sm",
                    "max-w-md": size === "md",
                    "max-w-lg": size === "lg",
                    "max-w-2xl": size === "xl",
                }), children: [title && (_jsx("div", { className: "mb-4", children: _jsx("h2", { className: "text-lg font-semibold", children: title }) })), _jsx("div", { className: "mb-4", children: children }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: onClose, className: "rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2", children: "Close" }) })] })] }));
}
