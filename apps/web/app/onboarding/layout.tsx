// [P2][APP][CODE] Layout
// Tags: P2, APP, CODE
import type { ReactNode } from "react";

import { OnboardingWizardProvider } from "./_wizard/OnboardingWizardContext";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingWizardProvider>
      <div className="flex min-h-screen flex-col items-center justify-start bg-slate-50">
        <div className="w-full max-w-3xl px-4 py-8">{children}</div>
      </div>
    </OnboardingWizardProvider>
  );
}
