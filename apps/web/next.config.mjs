// [P2][APP][ENV] Next Config
// Tags: P2, APP, ENV
/** @type {import("next").NextConfig} */

import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const withPwa = withPWA({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
  runtimeCaching: [],
});

const nextConfig = withPwa({
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
    serverActions: { bodySizeLimit: "1mb" },
  },
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
});

export default nextConfig;
