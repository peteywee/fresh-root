import { clsx } from "clsx";
import { jsx as _jsx } from "react/jsx-runtime";
// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
export function Card({ children, className }) {
    return (_jsx("div", { className: clsx("rounded-lg border bg-white p-6 shadow-sm", className), children: children }));
}
export function CardHeader({ children, className }) {
    return _jsx("div", { className: clsx("flex flex-col space-y-1.5 pb-4", className), children: children });
}
export function CardTitle({ children, className }) {
    return (_jsx("h3", { className: clsx("text-2xl font-semibold leading-none tracking-tight", className), children: children }));
}
export function CardContent({ children, className }) {
    return _jsx("div", { className: clsx("pt-0", className), children: children });
}
