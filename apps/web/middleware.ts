import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Content Security Policy (adjust based on your needs)
  // Note: This is a basic CSP. You may need to adjust it for your specific requirements
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://firebaseapp.com https://*.firebaseio.com https://*.googleapis.com",
    "frame-ancestors 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  return response
}

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
