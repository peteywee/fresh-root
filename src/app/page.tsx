import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Mail, Briefcase } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-4 sm:p-6">
        <Logo />
      </header>
      <main className="flex-1">
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-16 text-center">
          <div className="max-w-3xl">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Effortless Scheduling for Modern Teams
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              ScheduleQuick simplifies team management with intuitive tools,
              role-based dashboards, and AI-powered insights. Spend less time
              organizing and more time growing your business.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Google</title>
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.88 1.62-4.57 0-8.3-3.82-8.3-8.5s3.73-8.5 8.3-8.5c2.33 0 4.3 1.08 5.5 2.23l2.43-2.38C18.43.86 15.83 0 12.48 0 5.88 0 0 5.9 0 12.5s5.88 12.5 12.48 12.5c3.23 0 5.9-1.15 7.84-3.08 2.05-2.05 2.63-5.02 2.63-8.32v-1.18h-10.5z" />
                  </svg>
                  Sign in with Google
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/dashboard">
                  <Mail className="mr-2" />
                  Continue with Email
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="underline">
                Or continue as a guest
              </Link>
            </p>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground sm:p-6">
        © {new Date().getFullYear()} ScheduleQuick. All rights reserved.
      </footer>
    </div>
  );
}
