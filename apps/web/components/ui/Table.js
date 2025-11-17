import { jsx as _jsx } from "react/jsx-runtime";
export function Table({ className = "", ...props }) {
    return _jsx("table", { className: `min-w-full text-sm ${className}`, ...props });
}
export function THead(props) {
    return _jsx("thead", { className: "bg-neutral-900/40", ...props });
}
export function TRow(props) {
    return _jsx("tr", { className: "border-t border-neutral-800", ...props });
}
export function TH({ className = "", ...props }) {
    return _jsx("th", { className: `px-3 py-2 text-left ${className}`, ...props });
}
export function TD({ className = "", ...props }) {
    return _jsx("td", { className: `px-3 py-2 ${className}`, ...props });
}
