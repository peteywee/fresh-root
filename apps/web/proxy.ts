// NOTE: middleware convention deprecated; file retained as a no-op marker.

/**
 * Middleware to add security headers to all responses
 * 
 * Security headers included:
 * - X-DNS-Prefetch-Control: Controls DNS prefetching
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Controls browser features
 */
// The middleware file convention is deprecated in newer Next.js versions and
// the project uses a different approach for request-time headers now. Keep
// this file only as an explicit no-op marker to avoid the old behavior.

// If you need per-request dynamic CSP (nonce-based) preserve that logic in
// a server component (e.g. inject a <meta httpEquiv="Content-Security-Policy" />
// in `app/layout.tsx`) and set static security headers via `next.config.js`.

export const proxy = undefined

// Configure which routes should use the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
