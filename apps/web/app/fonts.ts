// [P2][APP][CODE] Fonts
// Tags: P2, APP, CODE

/**
 * Fallback font configuration for builds without internet access.
 * In production with internet access, this can be reverted to use next/font/google.
 * For now, we use system fonts as a fallback.
 */
export const inter = {
  variable: "--font-inter",
  style: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};
