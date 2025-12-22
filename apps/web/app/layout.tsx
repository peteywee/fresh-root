// [P2][APP][CODE] Layout
// Tags: P2, APP, CODE
import type { Metadata, Viewport } from "next";

import "./globals.css"; // ensure this exists; keep Tailwind base/utilities here
import { inter } from "./fonts";
import Providers from "./providers"; // <--- Import the Providers component
import Header from "../src/components/Header";

export const metadata: Metadata = {
  title: "Fresh Schedules",
  description: "Staff scheduling built for speed and control.",
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server layout; zero client JS here.
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-[#0b0f14] text-gray-100 antialiased">
        {/* Wrap the entire content in Providers */}
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-neutral-900 bg-[#0b0f14] px-4 py-10 text-xs text-neutral-500">
            <p className="mx-auto max-w-6xl">© {new Date().getFullYear()} Top Shelf Service LLC. All rights reserved.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
