import "./globals.css";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; 
import Providers from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Fresh Schedules™ | Top Shelf Service",
  description: "The hardest part is done for you. Automated scheduling for high-performance teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark"> 
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
