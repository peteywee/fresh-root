// [P2][APP][CODE] Home page with navigation
// Tags: P2, APP, CODE
import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Fresh Schedules</h1>
        <p className="mt-2 text-gray-400">Staff scheduling built for speed and control.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard
          href="/protected/schedules"
          title="📅 Schedules"
          description="View and manage staff schedules"
        />
        <NavCard
          href="/protected/dashboard"
          title="📊 Dashboard"
          description="Analytics and insights"
        />
        <NavCard
          href="/ops"
          title="⚙️ Ops Dashboard"
          description="System health and codebase analysis"
          highlight
        />
        <NavCard
          href="/planning"
          title="🗓️ Planning"
          description="Schedule planning tools"
        />
        <NavCard
          href="/onboarding"
          title="🚀 Onboarding"
          description="Setup and configuration"
        />
        <NavCard
          href="/protected"
          title="🔒 Protected Demo"
          description="Protected route example"
        />
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h2 className="text-lg font-semibold">Quick Links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <QuickLink href="https://console.firebase.google.com" text="Firebase Console" />
          <QuickLink href="https://vercel.com/dashboard" text="Vercel" />
          <QuickLink href="https://github.com/peteywee/fresh-root" text="GitHub" />
        </div>
      </div>
    </main>
  );
}

function NavCard({
  href,
  title,
  description,
  highlight,
}: {
  href: string;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${
        highlight
          ? "border-blue-500/50 bg-blue-950/20 hover:border-blue-400"
          : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
      }`}
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-gray-400">{description}</div>
    </Link>
  );
}

function QuickLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-sm hover:border-neutral-700 hover:bg-neutral-900"
    >
      {text} ↗
    </a>
  );
}
