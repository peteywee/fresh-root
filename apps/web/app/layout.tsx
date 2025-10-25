import './globals.css'
import React from 'react'
import Providers from './providers'
import { ErrorProvider } from '../src/lib/error/ErrorContext'
import RegisterServiceWorker from './RegisterServiceWorker'

export const metadata = { title: 'Fresh Schedules' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
