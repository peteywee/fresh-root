// [P2][UI][CODE] ErrorBoundary
// Tags: P2, UI, CODE
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
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
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error;
  reset: () => void;
}

/**
 * The default UI to be displayed when an error is caught by the ErrorBoundary.
 *
 * @param {FallbackProps} props - The props for the component.
 * @param {Error} props.error - The error that was caught.
 * @param {() => void} props.reset - A function to reset the error boundary and re-render the children.
 * @returns {JSX.Element} The rendered default error fallback.
 */
function DefaultErrorFallback({ error, reset }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
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
        <h2 className="mt-4 text-center text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-center text-gray-900 transition-colors hover:bg-gray-300"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
