import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import "./globals.css"; // ensure this exists; keep Tailwind base/utilities here
import { inter } from "./fonts";
import Logo from "../components/Logo";
export const metadata = {
    title: "Fresh Schedules",
    description: "Staff scheduling built for speed and control.",
};
export const viewport = {
    themeColor: "#0b0f14",
    colorScheme: "dark light",
    width: "device-width",
    initialScale: 1,
};
export default function RootLayout({ children }) {
    // Server layout; zero client JS here.
    return (_jsx("html", { lang: "en", className: `${inter.variable}`, children: _jsxs("body", { className: "min-h-screen bg-[#0b0f14] text-gray-100 antialiased", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-neutral-900/80 bg-[#0b0f14]/80 backdrop-blur", children: _jsxs("nav", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [_jsxs(Link, { prefetch: true, href: "/", className: "flex items-center gap-2", children: [_jsx(Logo, { className: "h-6 w-6" }), _jsx("span", { className: "font-semibold tracking-wide", children: "Fresh\u00A0Schedules" })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-300", children: [_jsx(Link, { href: "/protected/schedules", className: "hover:text-white", children: "Schedules" }), _jsx(Link, { href: "/protected/dashboard", className: "hover:text-white", children: "Dashboard" })] })] }) }), _jsx("main", { className: "mx-auto max-w-6xl px-4 py-6", children: children }), _jsx("footer", { className: "mx-auto max-w-6xl px-4 py-10 text-xs text-neutral-500", children: _jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " Top Shelf Service LLC. All rights reserved."] }) })] }) }));
}
