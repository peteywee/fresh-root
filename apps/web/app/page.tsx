"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, Clock, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            Fresh Schedules
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Build a full schedule fast, stay inside labor targets,
            and keep teams aligned.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/login")}>
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push("/demo")}>
              View demo
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Speed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Create a workable schedule in minutes, not hours.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Control
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Guardrails that keep labor planning and compliance from drifting.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team-ready
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Clear assignments and visibility for managers and staff.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
