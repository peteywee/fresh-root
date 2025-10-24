import type { ApiError } from "../api/_shared/validation";

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

/** Typed fetch wrapper expecting JSON. Throws HttpError on non-2xx with normalized shape. */
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? JSON.parse(text || "{}") : (text || "");
  if (!res.ok) {
    const apiErr = (body as ApiError)?.error;
    const code = apiErr?.code ?? String(res.status);
    const msg = apiErr?.message ?? "Request failed";
    const details = apiErr?.details;
    throw new HttpError(res.status, msg, code, details);
  }
  return body as T;
}
