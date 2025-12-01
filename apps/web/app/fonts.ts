// [P2][APP][CODE] Fonts
// Tags: P2, APP, CODE

/**
 * Font configuration using system fonts as fallback.
 * In environments with network access, Google Fonts would be fetched.
 * In sandboxed/offline environments, system fonts are used.
 * 
 * NOTE: Renamed from 'inter' to 'systemFont' to reflect that we're
 * using system fonts rather than the Inter font family.
 */
export const systemFont = {
  variable: "--font-inter",
  className: "font-sans",
};

// Backward compatibility alias
export const inter = systemFont;
