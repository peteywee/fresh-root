import React from "react";
import { OpsHubNav } from "./_components/OpsHubNav";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card hidden md:block">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-heading font-bold">
              OP
            </div>
            <span className="font-heading font-bold tracking-tight text-lg text-foreground">
              Ops Center
            </span>
          </div>
        </div>
        <OpsHubNav />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-noise">
        <div className="md:hidden p-4 border-b border-border bg-card flex items-center justify-between">
          <span className="font-heading font-bold text-primary">Ops Center</span>
        </div>

        <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
