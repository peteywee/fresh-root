export class HttpError extends Error {
    status;
    code;
    details;
    constructor(status, message, code, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
/** Typed fetch wrapper expecting JSON. Throws HttpError on non-2xx with normalized shape. */
export async function apiFetch(input, init) {
    const res = await fetch(input, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const text = await res.text();
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? JSON.parse(text || "{}") : text || "";
    if (!res.ok) {
        const apiErr = body?.error;
        const code = apiErr?.code ?? String(res.status);
        const msg = apiErr?.message ?? "Request failed";
        const details = apiErr?.details;
        throw new HttpError(res.status, msg, code, details);
    }
    return body;
}
