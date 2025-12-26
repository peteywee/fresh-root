import Link from "next/link";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, Clock, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden bg-noise">
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center rounded-sm font-heading font-extrabold text-xl tracking-tighter">
            TS
          </div>
          <span className="font-heading font-bold text-lg tracking-tight hidden sm:block">
            Fresh Schedules™
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-sm text-sm px-3 py-1.5">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border/50 text-xs font-semibold uppercase tracking-wider">
              Top Shelf Service LLC™
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-balance text-foreground">
              The hardest part is <span className="text-primary">done for you.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed font-light">
              We move the boulder. Automated scheduling that respects your time and your team. 
              Direct, calm, and accurate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-bold shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)]">
                  Start Scheduling
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Schedule Preview Section */}
        <section className="py-20 px-6 bg-secondary/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 space-y-6">
                <h2 className="text-3xl font-heading font-bold">Instantly parse your day.</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The brand is grayscale, but operation needs color. We assign distinct palettes to shifts so you can scan the floor plan in seconds.
                </p>
                <ul className="space-y-4 mt-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-schedule-blue/20 flex items-center justify-center border border-schedule-blue/50 text-schedule-blue mt-0.5">1</div>
                    <span className="text-sm text-foreground">Shifts get a dominant color.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-schedule-amber/20 flex items-center justify-center border border-schedule-amber/50 text-schedule-amber mt-0.5">2</div>
                    <span className="text-sm text-foreground">Staff are color-coded relative to their shift.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-schedule-purple/20 flex items-center justify-center border border-schedule-purple/50 text-schedule-purple mt-0.5">3</div>
                    <span className="text-sm text-foreground">Gaps and overlaps are immediately obvious.</span>
                  </li>
                </ul>
              </div>

              {/* Schedule Demo Card */}
              <div className="md:w-1/2 w-full">
                <div className="bg-card border border-border rounded-md shadow-2xl p-4 space-y-4">
                  <div className="flex justify-between text-xs text-muted-foreground uppercase font-mono tracking-wider border-b border-border pb-2 mb-2">
                    <span>8:00 AM</span>
                    <span>12:00 PM</span>
                    <span>4:00 PM</span>
                    <span>8:00 PM</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-schedule-blue">OPENING PREP</span>
                      <span className="text-[10px] bg-schedule-blue/10 text-schedule-blue px-2 py-0.5 rounded border border-schedule-blue/20">4/4 Staff</span>
                    </div>
                    <div className="relative h-16 bg-schedule-blue/10 border-l-4 border-schedule-blue rounded-r-md p-2 flex flex-col justify-center gap-2">
                      <div className="flex items-center gap-2 bg-schedule-blue/20 p-1.5 rounded border border-schedule-blue/10">
                        <div className="w-6 h-6 rounded bg-schedule-blue text-black text-[10px] flex items-center justify-center font-bold">JD</div>
                        <span className="text-xs text-foreground font-medium">John Doe</span>
                        <div className="ml-auto text-[10px] text-schedule-blue font-mono">08:00 - 14:00</div>
                      </div>
                      <div className="flex items-center gap-2 bg-schedule-blue/20 p-1.5 rounded border border-schedule-blue/10 w-3/4">
                        <div className="w-6 h-6 rounded bg-schedule-blue/80 text-black text-[10px] flex items-center justify-center font-bold">SA</div>
                        <span className="text-xs text-foreground font-medium">Sarah A.</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-schedule-amber">DINNER SERVICE</span>
                      <span className="text-[10px] bg-schedule-amber/10 text-schedule-amber px-2 py-0.5 rounded border border-schedule-amber/20">6/8 Staff</span>
                    </div>
                    <div className="relative h-20 bg-schedule-amber/10 border-l-4 border-schedule-amber rounded-r-md p-2 flex flex-col justify-center gap-2 ml-12">
                       <div className="flex items-center gap-2 bg-schedule-amber/20 p-1.5 rounded border border-schedule-amber/10">
                        <div className="w-6 h-6 rounded bg-schedule-amber text-black text-[10px] flex items-center justify-center font-bold">MK</div>
                        <span className="text-xs text-foreground font-medium">Mike K.</span>
                        <div className="ml-auto text-[10px] text-schedule-amber font-mono">16:00 - 22:00</div>
                      </div>
                      <div className="flex items-center gap-2 bg-schedule-amber/20 p-1.5 rounded border border-schedule-amber/10 w-5/6">
                        <div className="w-6 h-6 rounded bg-schedule-amber/80 text-black text-[10px] flex items-center justify-center font-bold">LJ</div>
                        <span className="text-xs text-foreground font-medium">Lisa J.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <Card variant="solid">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Proprietary algorithms fill slots in seconds, not hours.
              </CardContent>
            </Card>
            <Card variant="solid">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Error Proof</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Compliance rules are hard-coded. No more accidental overtime.
              </CardContent>
            </Card>
            <Card variant="solid">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Team Centric</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Fair rotation logic keeps your best people happy and rested.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-card py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-lg">Top Shelf Service LLC™</span>
            <span className="text-xs text-muted-foreground">© 2025 All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
