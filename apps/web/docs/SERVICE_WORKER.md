# Service Worker registration (dev/testing notes)

This project registers a service worker from the app root (`/sw.js`) in browsers. To avoid noisy errors when the app runs inside embedded environments (VS Code webviews, Electron, etc.), the registration is guarded by default.

If you need to temporarily allow service worker registration while testing from an embedded/webview context (for example to create `/sw.js` or validate PWA behavior), there are three ways to enable a developer override:

- Query parameter (temporary):

  Open the app in a browser/webview with the query param `?allow_sw=1` added to the URL. Example:

  ```text
  http://localhost:3000/?allow_sw=1
  ```

- Local storage (persist across reloads):

  In the browser console run:

  ```js
  localStorage.setItem('ALLOW_SW', '1')
  // then reload
  ```

- Global flag (script-level):

  If you can inject a script before the app boots, set:

  ```js
  window.__ALLOW_SW_IN_EMBEDDED = true
  ```

Notes

- The guard still requires `navigator.serviceWorker` support and either `window.isSecureContext` or `location.hostname === 'localhost'` unless explicitly overridden above.
- Use the override only for local testing. Do not enable in production.

Unregistering stray service workers (if you see registration failures):

```js
navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
```

If you want me to run the dev server and exercise registration using the override, tell me which override method you prefer (query param, localStorage, or global flag) and I will start the dev server and follow the test steps. I cannot interact with your local browser UI, so I'll provide exact commands and steps to run on your machine and verify success.
