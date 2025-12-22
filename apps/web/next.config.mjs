// [P0][APP][ENV] Next Config
// Tags: P0, APP, ENV
import path from "node:path";

/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self'", // 'unsafe-inline' and 'unsafe-eval' removed
      "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' is often needed for CSS-in-JS, but should be reviewed
      "img-src 'self' data: blob: https:", // Added https: for external images
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://* https://accounts.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
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
    ignoreBuildErrors: true,
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
    // Mirror the empty allowlist so both config locations disable the default
    // firebase-admin externalization.
    serverExternalPackages,
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
