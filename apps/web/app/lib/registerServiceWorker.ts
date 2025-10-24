// Safe service worker registration helper
export async function safeRegisterServiceWorker(scriptUrl = '/sw.js') {
  try {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      // Not supported
      console.debug('Skipping SW registration: navigator.serviceWorker not available');
      return;
    }

    const ua = navigator.userAgent || '';
    const isEmbeddedWebView = /vscode|WebView|Electron|HeadlessChrome/i.test(ua);
    // Developer override: allow forcing registration in embedded contexts for debugging.
    // Override via any of:
    // - global flag: window.__ALLOW_SW_IN_EMBEDDED = true
    // - localStorage: localStorage.setItem('ALLOW_SW', '1')
    // - URL query param: ?allow_sw=1
    const urlAllows = typeof URL !== 'undefined' && new URL(location.href).searchParams.get('allow_sw') === '1';
    const storageAllows = typeof localStorage !== 'undefined' && localStorage.getItem('ALLOW_SW') === '1';
    const globalAllows = (window as any).__ALLOW_SW_IN_EMBEDDED === true;
    if (isEmbeddedWebView && !(urlAllows || storageAllows || globalAllows)) {
      console.debug('Skipping SW registration: running inside embedded webview/electron/vscode');
      return;
    }

    if (!window.isSecureContext && location.hostname !== 'localhost') {
      console.debug('Skipping SW registration: not a secure context and not localhost');
      return;
    }

    // Wait for load to avoid interfering with early page lifecycle in webviews
    if (document.readyState === 'complete') {
      try {
        const reg = await navigator.serviceWorker.register(scriptUrl);
        console.debug('Service worker registered', reg.scope);
      } catch (err) {
        console.debug('Service worker registration failed (safe guard):', err);
      }
      return;
    }

    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(scriptUrl);
        console.debug('Service worker registered', reg.scope);
      } catch (err) {
        console.debug('Service worker registration failed (safe guard):', err);
      }
    });
  } catch (err) {
    console.debug('Service worker safe registration encountered an error:', err);
  }
}

export async function unregisterAllServiceWorkers() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    console.debug('Unregistered service workers:', regs.length);
  } catch (err) {
    console.debug('Error while unregistering service workers:', err);
  }
}
