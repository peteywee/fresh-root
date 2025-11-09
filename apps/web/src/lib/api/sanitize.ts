//[P1][API][SECURITY] Input sanitization utilities
// Tags: sanitization, xss-prevention, security

/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} text - The input string.
 * @returns {string} The escaped string.
 */
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

/**
 * Removes HTML tags from a string.
 *
 * @param {string} text - The input string.
 * @returns {string} The string with HTML tags removed.
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitizes a string by stripping HTML tags and escaping special characters.
 *
 * @param {string} text - The input string.
 * @returns {string} The sanitized string.
 */
export function sanitizeText(text: string): string {
  return escapeHtml(stripHtmlTags(text));
}

/**
 * Sanitizes a URL to prevent XSS attacks.
 *
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL, or "about:blank" if the URL is unsafe.
 */
export function sanitizeUrl(url: string): string {
  const normalized = url.trim().toLowerCase();
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  for (const protocol of dangerousProtocols) {
    if (normalized.startsWith(protocol)) return "about:blank";
  }
  const allowedProtocols = ["http:", "https:", "mailto:", "tel:", "//", "/"];
  const isAllowed = allowedProtocols.some((protocol) => normalized.startsWith(protocol));
  if (!isAllowed && normalized.includes(":")) return "about:blank";
  return url;
}

/**
 * Recursively sanitizes an object's properties.
 *
 * @template T
 * @param {T} obj - The object to sanitize.
 * @param {object} [options={}] - The sanitization options.
 * @param {string[]} [options.skipFields=[]] - A list of fields to skip during sanitization.
 * @param {string[]} [options.urlFields=[]] - A list of fields to treat as URLs.
 * @returns {T} The sanitized object.
 */
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
