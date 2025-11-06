// [P2][APP][CODE] RegisterServiceWorker
// Tags: P2, APP, CODE
// Safe service worker registration helper
export async function safeRegisterServiceWorker(scriptUrl = "/sw.js") {
  try {
    if (typeof window === "undefined") return;
    if (!navigator.serviceWorker) {
      // Service worker not available in this browser
      return;
    }

    const ua = navigator.userAgent || "";
    const isEmbeddedWebView = /vscode|WebView|Electron|HeadlessChrome/i.test(ua);
    // Developer override: allow forcing registration in embedded contexts for debugging.
    // Override via any of:
    // - global flag: window.__ALLOW_SW_IN_EMBEDDED = true
    // - localStorage: localStorage.setItem('ALLOW_SW', '1')
    // - URL query param: ?allow_sw=1
    const urlAllows =
      typeof URL !== "undefined" && new URL(location.href).searchParams.get("allow_sw") === "1";
    const storageAllows =
      typeof localStorage !== "undefined" && localStorage.getItem("ALLOW_SW") === "1";
    const globalAllows =
      (window as Window & { __ALLOW_SW_IN_EMBEDDED?: boolean }).__ALLOW_SW_IN_EMBEDDED === true;
    if (isEmbeddedWebView && !(urlAllows || storageAllows || globalAllows)) {
      return;
    }

    if (!window.isSecureContext && location.hostname !== "localhost") {
      return;
    }

    // Wait for load to avoid interfering with early page lifecycle in webviews
    if (document.readyState === "complete") {
      try {
        await navigator.serviceWorker.register(scriptUrl);
      } catch {
        // Service worker registration failed (safe guard)
      }
      return;
    }

    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register(scriptUrl);
      } catch {
        // Service worker registration failed (safe guard)
      }
    });
  } catch (err) {
    console.error("Service worker safe registration encountered an error:", err);
  }
}

export async function unregisterAllServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch (err) {
    console.error("Error while unregistering service workers:", err);
  }
}
