import FirebaseSignIn from "@/app/components/FirebaseSignIn";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 border-r border-border bg-noise">
        <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
          <div className="mb-10">
            <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center rounded-sm font-heading font-extrabold text-2xl tracking-tighter mb-4">
              TS
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access <span className="text-foreground font-semibold">Fresh Schedules™</span>.
            </p>
          </div>

          <div className="bg-card p-1 rounded-lg border border-border shadow-sm">
             <div className="p-4">
                <FirebaseSignIn />
             </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex relative flex-col justify-between p-16 bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-20 translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10">
          <h2 className="font-heading font-bold text-2xl tracking-tight text-primary">
            Top Shelf Service LLC™
          </h2>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <blockquote className="text-3xl font-heading font-bold leading-tight">
            "We move the boulder for you."
          </blockquote>
          <p className="text-muted-foreground text-lg">
            Direct, calm, and competent scheduling tools for those who do the real work.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground/50">
           © 2025 Top Shelf Service LLC™
        </div>
      </div>
    </div>
  );
}
