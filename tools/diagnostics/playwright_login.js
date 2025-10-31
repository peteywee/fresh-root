const playwright = require("playwright");

(async () => {
  const baseUrl = process.env.URL || "http://localhost:3000";
  // If caller passed a URL that already contains a path, use it directly.
  // Otherwise try app root first, then two likely routes: /login and /auth/login.
  const hasPath = /^https?:\/\/.+\/.+/.test(baseUrl);
  const candidates = hasPath
    ? [baseUrl]
    : [`${baseUrl}/`, `${baseUrl}/login`, `${baseUrl}/auth/login`];
  console.log(`Starting Playwright check. Will try: ${candidates.join(", ")}`);

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on("console", (msg) => {
    try {
      console.log(`[console:${msg.type()}] ${msg.text()}`);
    } catch (e) {
      console.log("[console] unknown message", e);
    }
  });

  // Capture network requests
  page.on("request", (req) => {
    console.log(`[request] ${req.method()} ${req.url()}`);
  });
  page.on("response", (res) => {
    console.log(`[response] ${res.status()} ${res.url()}`);
  });

  // Capture dialogs
  page.on("dialog", async (dialog) => {
    console.log("[dialog] type=%s message=%s", dialog.type(), dialog.message());
    try {
      await dialog.dismiss();
    } catch (e) {}
  });

  // Listen for new pages (popups)
  context.on("page", async (p) => {
    console.log("[popup] new page opened: " + p.url());
    p.on("console", (m) => console.log("[popup console] " + m.text()));
    p.on("request", (r) => console.log("[popup request] " + r.url()));
    p.on("response", (r) => console.log("[popup response] " + r.status() + " " + r.url()));
  });

  try {
    let resp = null;
    let triedUrl = null;
    for (const t of candidates) {
      triedUrl = t;
      resp = await page
        .goto(t, { waitUntil: "domcontentloaded", timeout: 10000 })
        .catch(() => null);
      if (resp && resp.status() >= 200 && resp.status() < 500) break;
    }
    console.log("[main] tried URL:", triedUrl, "status:", resp && resp.status());

    // Prefer waiting for the explicit button text that the app uses.
    const preferredSelector = 'button:has-text("Continue with Google")';
    const found = await page
      .waitForSelector(preferredSelector, { timeout: 10000 })
      .catch(() => null);

    if (!found) {
      // Fallback: list all buttons for debugging
      const buttons = await page.$$eval("button", (nodes) =>
        nodes.map((n) => ({ text: n.innerText, class: n.className })).slice(0, 50),
      );
      console.error(
        "[main] Google sign-in button not found; page buttons:",
        JSON.stringify(buttons, null, 2),
      );
    } else {
      console.error("[main] Found Google button, clicking to test popup/navigation");
      // Click and wait for popup OR navigation
      const popupPromise = context.waitForEvent("page", { timeout: 8000 }).catch(() => null);
      const navPromise = page.waitForNavigation({ timeout: 8000 }).catch(() => null);

      try {
        await found.click({ timeout: 5000 });
      } catch (e) {
        console.error("[main] Error clicking:", e && e.message);
      }

      const popup = await popupPromise;
      const nav = await navPromise;

      if (popup) {
        console.error("[main] Popup opened with URL:", popup.url());
        await popup.waitForLoadState("load", { timeout: 5000 }).catch(() => {});
        const popupContent = await popup.content();
        console.error("[popup] content length:", popupContent ? popupContent.length : 0);
      } else if (nav) {
        console.error("[main] Navigation happened to:", page.url());
      } else {
        console.error(
          "[main] No popup and no navigation detected after click — popup likely blocked or click did not invoke provider.",
        );
      }
    }

    // Optional: emulator E2E flow. If EMULATOR_E2E=1 is set, mint a custom token via admin
    // and sign in inside the page via the firebase compat SDK against the auth emulator,
    // then POST /api/session to validate the server session flow.
    if (process.env.EMULATOR_E2E === "1") {
      try {
        const { execSync } = require("child_process");
        const token = execSync("node tools/diagnostics/create_custom_token.js").toString().trim();
        if (token) {
          console.error("[main] Obtained custom token; performing emulator sign-in in page");
          const initScript = `(async function(){
            // Only proceed if we have a proper origin (avoid 'null' origin which triggers PNA/CORS issues)
            if (!window.location || !window.location.origin || window.location.origin === 'null') {
              return { signed: false, sessionOk: false, error: 'Invalid page origin for emulator sign-in' };
            }
            function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
            await loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js');
            const cfg = { apiKey: 'fake-api-key', authDomain: 'localhost', projectId: 'fresh-schedules-dev' };
            window.__TEST_FB = window.firebase.initializeApp(cfg);
            const auth = window.firebase.auth();
            auth.useEmulator('http://localhost:9099');
            const res = await auth.signInWithCustomToken('${token}');
            const user = res.user;
            const idToken = user ? await user.getIdToken(true) : null;
            let sessionOk = false;
            if (idToken) {
              const r = await fetch('/api/session', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ idToken }) });
              sessionOk = r.ok;
              if (!r.ok) {
                try { const txt = await r.text(); console.error('[main] /api/session error response:', txt); } catch {}
              }
            }
            return { signed: !!idToken, sessionOk };
          })()`;
          const result = await page.evaluate(initScript);
          console.error("[main] emulator E2E result:", result);
        } else {
          console.error("[main] No token returned from create_custom_token.js");
        }
      } catch (e) {
        console.error("[main] Emulator E2E failed:", e && e.message);
      }
    }
  } catch (err) {
    console.error("[main] Error during Playwright run:", err);
  } finally {
    await context.close();
    await browser.close();
    console.log("Playwright check finished.");
  }
})();
