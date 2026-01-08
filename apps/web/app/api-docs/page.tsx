"use client";

import { useEffect, useState } from "react";

/**
 * API Documentation Page
 *
 * Displays interactive Swagger UI for API exploration
 */
export default function APIDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">Error Loading Documentation</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Fresh Schedules API</h1>
          <p className="text-lg text-gray-600">Version {spec?.info?.version}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="prose max-w-none">
            <h2>API Documentation</h2>
            <p>{spec?.info?.description}</p>

            <h3>Available Endpoints</h3>
            <div className="space-y-4">
              {spec &&
                Object.entries(spec.paths || {}).map(([path, methods]: [string, any]) => (
                  <div key={path} className="rounded border border-gray-200 p-4">
                    <h4 className="mb-2 font-mono text-sm font-bold">{path}</h4>
                    <div className="space-y-2">
                      {Object.entries(methods).map(([method, details]: [string, any]) => (
                        <div key={method} className="flex items-start gap-4">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-bold uppercase ${
                              method === "get"
                                ? "bg-blue-100 text-blue-800"
                                : method === "post"
                                  ? "bg-green-100 text-green-800"
                                  : method === "patch"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : method === "delete"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {method}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{details.summary}</p>
                            <p className="text-sm text-gray-600">{details.description}</p>
                            {details.tags && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {details.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <h3>Download OpenAPI Specification</h3>
            <a
              href="/api/docs"
              download="openapi.json"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Download JSON
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-blue-900">Authentication</h3>
          <div className="prose prose-sm max-w-none text-blue-800">
            <p>
              This API uses session-based authentication. To authenticate:
            </p>
            <ol>
              <li>Obtain a Firebase ID token through Firebase Authentication</li>
              <li>Call POST /api/session with the ID token</li>
              <li>Session cookie is set automatically</li>
              <li>Include the cookie in subsequent requests</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-yellow-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-yellow-900">Rate Limiting</h3>
          <div className="prose prose-sm max-w-none text-yellow-800">
            <p>API endpoints are rate limited to ensure fair usage:</p>
            <ul>
              <li>Read operations: 100 requests/minute</li>
              <li>Write operations: 50 requests/minute</li>
              <li>Authentication: 10 requests/minute</li>
            </ul>
            <p>
              Rate limit headers are included in all responses to help you track your usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
