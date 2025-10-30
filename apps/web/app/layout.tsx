import './globals.css'
import React from 'react'
import Providers from './providers'
import { ErrorProvider } from '../src/lib/error/ErrorContext'
import RegisterServiceWorker from './RegisterServiceWorker'
import { randomUUID } from 'crypto'

export const metadata = { title: 'Fresh Schedules' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate a per-request nonce to allow safe inline scripts when needed.
  // This will be embedded into the CSP meta tag so inline scripts can use
  // the same nonce attribute.
  const nonce = Buffer.from(randomUUID()).toString('base64')

  const connectHosts = [
    "'self'",
    'https://*.firebaseapp.com',
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://accounts.google.com',
    'https://www.googleapis.com',
    'https://identitytoolkit.googleapis.com',
  ]

  const frameHosts = ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com', 'https://apis.google.com']

  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true'
  if (useEmulators) {
    connectHosts.push('http://localhost:9099', 'http://127.0.0.1:9099')
    frameHosts.push('http://localhost:9099', 'http://127.0.0.1:9099')
  }

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://apis.google.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectHosts.join(' ')}`,
    `frame-src ${frameHosts.join(' ')}`,
    "frame-ancestors 'self'",
  ].join('; ')

  return (
    <html lang="en" className="dark">
      <head>
        {/* Per-request CSP with nonce for inline scripts */}
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="animate-fade-in">
        <ErrorProvider>
          <Providers>
            {/* Register service worker safely in browsers (no-op in webviews) */}
            <RegisterServiceWorker />
            {children}
          </Providers>
        </ErrorProvider>
      </body>
    </html>
  )
}
