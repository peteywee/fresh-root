// [P2][APP][CODE] Fonts
// Tags: P2, APP, CODE
import { Inter } from "next/font/google";

/**
 * Configures the "Inter" font for the application.
 * This self-hosted variable font is configured to use the `swap` display strategy
 * to avoid Flash of Invisible Text (FOIT) and Flash of Unstyled Text (FOUT).
 * It also defines a CSS variable (`--font-inter`) for easy use with Tailwind CSS.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});
