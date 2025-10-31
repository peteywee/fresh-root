import { Inter } from "next/font/google";

/**
 * Self-hosted variable font with swap to avoid FOIT/FOUT.
 * Using a CSS variable keeps Tailwind/theming clean.
 */
export const inter = Inter({
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});
