import { jsx as _jsx } from "react/jsx-runtime";
import { OnboardingWizardProvider } from "./_wizard/OnboardingWizardContext";
export default function OnboardingLayout({ children }) {
    return (_jsx(OnboardingWizardProvider, { children: _jsx("div", { className: "flex min-h-screen flex-col items-center justify-start bg-slate-50", children: _jsx("div", { className: "w-full max-w-3xl px-4 py-8", children: children }) }) }));
}
