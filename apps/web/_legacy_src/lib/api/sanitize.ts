//[P1][API][SECURITY] Input sanitization utilities
// Tags: sanitization, xss-prevention, security

export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export function sanitizeText(text: string): string {
  return escapeHtml(stripHtmlTags(text));
}

export function sanitizeUrl(url: string): string {
  try {
    // For relative URLs, provide a dummy base. If url is absolute, it's used as-is.
    // This allows us to consistently parse both absolute and relative URLs.
    const parsedUrl = new URL(url, "https://example.com");
    const safeProtocols = ["https:", "http:", "mailto:"];

    // If the protocol is not in the safe list, reject the URL.
    // This handles protocols like javascript:, data:, vbscript:, file:, etc.
    if (!safeProtocols.includes(parsedUrl.protocol)) {
      return "about:blank";
    }
  } catch {
    // The URL is malformed, which could be an attack attempt.
    return "about:blank";
  }

  return url;
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { skipFields?: string[]; urlFields?: string[] } = {},
): T {
  const { skipFields = [], urlFields = [] } = options;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] = urlFields.includes(key) ? sanitizeUrl(value) : sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
