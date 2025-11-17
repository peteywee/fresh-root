import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ className = "", ...props }) {
    return (_jsx("div", { className: `rounded-2xl border border-neutral-900 bg-[#0f131a] shadow-lg ${className}`, ...props }));
}
export function CardHeader({ className = "", ...props }) {
    return _jsx("div", { className: `border-b border-neutral-900 px-4 py-3 ${className}`, ...props });
}
export function CardContent({ className = "", ...props }) {
    return _jsx("div", { className: `px-4 py-4 ${className}`, ...props });
}
export function CardFooter({ className = "", ...props }) {
    return _jsx("div", { className: `border-t border-neutral-900 px-4 py-3 ${className}`, ...props });
}
