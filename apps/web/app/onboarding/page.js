import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
import Link from "next/link";
export default function OnboardingIndex() {
    return (_jsxs("main", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Onboarding Wizard" }), _jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: "Start the onboarding flow" }), _jsxs("ul", { className: "mt-4 space-y-2", children: [_jsx("li", { children: _jsx(Link, { href: "/onboarding/profile", className: "text-blue-600 underline", children: "Profile" }) }), _jsx("li", { children: _jsx(Link, { href: "/onboarding/intent", className: "text-blue-600 underline", children: "Intent" }) }), _jsx("li", { children: _jsx(Link, { href: "/onboarding/join", className: "text-blue-600 underline", children: "Join" }) }), _jsx("li", { children: _jsx(Link, { href: "/onboarding/create-network-org", className: "text-blue-600 underline", children: "Create Network (Org)" }) }), _jsx("li", { children: _jsx(Link, { href: "/onboarding/create-network-corporate", className: "text-blue-600 underline", children: "Create Network (Corporate)" }) }), _jsx("li", { children: _jsx(Link, { href: "/onboarding/admin-responsibility", className: "text-blue-600 underline", children: "Admin Responsibility Form" }) })] })] }));
}
