'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component to catch and handle React errors
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface FallbackProps {
  error: Error
  reset: () => void
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, reset }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
