import './globals.css'
import React from 'react'
import Providers from './providers'
import RegisterServiceWorker from './RegisterServiceWorker'

export const metadata = { title: 'Fresh Schedules' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Register service worker safely in browsers (no-op in webviews) */}
          <RegisterServiceWorker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
