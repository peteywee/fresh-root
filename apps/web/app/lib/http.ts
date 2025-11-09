// [P2][APP][CODE] Http
// Tags: P2, APP, CODE
import type { ApiError } from "../api/_shared/validation";

/**
 * A custom error class for HTTP errors.
 *
 * @param {number} status - The HTTP status code.
 * @param {string} message - The error message.
 * @param {string} [code] - An optional error code.
 * @param {unknown} [details] - Optional additional details about the error.
 */
export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * A typed fetch wrapper that expects a JSON response and throws an `HttpError` on non-2xx status codes.
 *
 * @template T
 * @param {RequestInfo} input - The URL to fetch.
 * @param {RequestInit} [init] - The options for the fetch request.
 * @returns {Promise<T>} A promise that resolves to the JSON response.
 * @throws {HttpError} If the request fails or returns a non-2xx status code.
 */
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? JSON.parse(text || "{}") : text || "";
  if (!res.ok) {
    const apiErr = (body as ApiError)?.error;
    const code = apiErr?.code ?? String(res.status);
    const msg = apiErr?.message ?? "Request failed";
    const details = apiErr?.details;
    throw new HttpError(res.status, msg, code, details);
  }
  return body as T;
}
