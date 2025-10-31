import type { Metadata, Viewport } from "next";
import Link from "next/link";

import Logo from "../components/Logo";
import "./globals.css"; // ensure this exists; keep Tailwind base/utilities here
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "Fresh Schedules",
  description: "Staff scheduling built for speed and control."
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server layout; zero client JS here.
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-[#0b0f14] text-gray-100 antialiased">
        <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-[#0b0f14]/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link prefetch href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="font-semibold tracking-wide">Fresh&nbsp;Schedules</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <Link href="/protected/schedules" className="hover:text-white">
                Schedules
              </Link>
              <Link href="/protected/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Top Shelf Service LLC. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
