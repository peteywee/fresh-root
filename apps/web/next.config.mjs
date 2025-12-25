// [P0][APP][ENV] Next Config
// Tags: P0, APP, ENV
import path from "node:path";

/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  // Firebase Google popup auth requires opener access to communicate between
  // the app and the popup. `same-origin` can cause the popup flow to fail and
  // surface as `auth/popup-closed-by-user`.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // COEP is intentionally omitted. `require-corp` can break cross-origin auth
  // resources and is not needed for this app.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // CSP is applied via middleware (apps/web/src/middleware.ts) so it can
  // safely include the Firebase/Google directives needed for auth.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Explicitly disable Turbopack's default serverExternalPackages (which includes
// firebase-admin) to stop the noisy "can't be external" warnings. Keeping this
// empty means everything is bundled; we don't rely on externalization for these
// server-only deps in our runtime setup.
const serverExternalPackages = [];

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@fresh-schedules/types", "@fresh-schedules/ui"],
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  // typedRoutes disabled - causes type conflicts with dynamic routes
  // typedRoutes: true,
  // Keep serverExternalPackages empty to force bundling and silence Turbopack's
  // firebase-admin externalization warnings
  serverExternalPackages,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.firebaseapp.com" },
    ],
  },
  // Optionally allow cross-origin dev origins. Set NEXT_ALLOWED_DEV_ORIGINS as a
  // comma-separated list of origins (e.g. "http://127.0.0.1:3001,http://100.115.92.203").
  // This is required by future Next.js/Turbopack versions when dev clients access
  // the dev server from different hosts/IPs.
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(",").map((s) => s.trim())
    : undefined,
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/icons/{{member}}",
      skipDefaultConversion: true,
    },
    "date-fns": {
      transform: "date-fns/{{member}}",
    },
    "lodash-es": {
      transform: "lodash-es/{{member}}",
    },
  },
  experimental: {
    optimizePackageImports: ["react", "react-dom", "@fresh-schedules/types", "@fresh-schedules/ui"],
    serverActions: { bodySizeLimit: "1mb" },
  },
  // Turbopack sometimes infers the workspace root incorrectly when there are
  // multiple lockfiles on the machine (e.g., a stray pnpm-lock.yaml in $HOME).
  // Explicitly set the root directory for Turbopack so it resolves the monorepo
  // workspace correctly and silences the inferred-root warning.
  // Turbopack configuration is commented out to allow 'next build --webpack' to run
  // cleanly. Re-enable this if you switch back to Turbopack for development.
  /*
  turbopack: {
    root: path.resolve(import.meta.dirname, "../../"),
  },
  */
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
