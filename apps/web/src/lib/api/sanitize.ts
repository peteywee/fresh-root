//[P1][API][SECURITY] Input sanitization utilities
// Tags: sanitization, xss-prevention, security, html-escaping

/**
 * Escape HTML special characters to prevent XSS
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
 * Unescape HTML entities (reverse of escapeHtml)
 */
export function unescapeHtml(text: string): string {
  const htmlUnescapeMap: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
  };

  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => {
    return htmlUnescapeMap[entity] || entity;
  });
}

/**
 * Strip HTML tags from text
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize text input (remove HTML tags and escape remaining)
 */
export function sanitizeText(text: string): string {
  return escapeHtml(stripHtmlTags(text));
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  const normalized = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  for (const protocol of dangerousProtocols) {
    if (normalized.startsWith(protocol)) {
      return "about:blank";
    }
  }

  // Allow only http, https, mailto, tel
  const allowedProtocols = ["http:", "https:", "mailto:", "tel:", "//", "/"];
  const isAllowed = allowedProtocols.some((protocol) => normalized.startsWith(protocol));

  if (!isAllowed && normalized.includes(":")) {
    return "about:blank";
  }

  return url;
}

/**
 * Sanitize object recursively
 * Applies sanitizeText to all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    /** Fields to skip sanitization (e.g., password fields) */
    skipFields?: string[];
    /** Fields that should be sanitized as URLs */
    urlFields?: string[];
  } = {},
): T {
  const { skipFields = [], urlFields = [] } = options;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "string") {
      if (urlFields.includes(key)) {
        sanitized[key] = sanitizeUrl(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
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

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }
  return trimmed;
}

/**
 * Sanitize phone number (remove non-digit characters)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Allowed HTML tags for rich text (if needed)
 * Reserved for future DOMPurify integration
 */
// const ALLOWED_TAGS = new Set([
//   "p",
//   "br",
//   "strong",
//   "em",
//   "u",
//   "ol",
//   "ul",
//   "li",
//   "a",
//   "h1",
//   "h2",
//   "h3",
//   "h4",
//   "h5",
//   "h6",
// ]);

// const ALLOWED_ATTRIBUTES = new Set(["href", "title", "target"]);

/**
 * Sanitize HTML for rich text editors
 * This is a basic implementation - for production use DOMPurify or similar
 */
export function sanitizeRichText(html: string): string {
  // This is a simplified implementation
  // For production, use a library like DOMPurify or sanitize-html

  // Remove script tags and their content
  let prevHtml;
  do {
    prevHtml = html;
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  } while (html !== prevHtml);

  // Remove event handlers (onclick, onload, etc.)
  html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  html = html.replace(/\son\w+\s*=\s*[^\s>]*/gi, "");

  // Remove dangerous tags
  html = html.replace(/<(iframe|object|embed|link|style)[^>]*>.*?<\/\1>/gi, "");

  // TODO: For production, use DOMPurify:
  // import DOMPurify from 'isomorphic-dompurify';
  // return DOMPurify.sanitize(html, {
  //   ALLOWED_TAGS: Array.from(ALLOWED_TAGS),
  //   ALLOWED_ATTR: Array.from(ALLOWED_ATTRIBUTES),
  // });

  return html;
}

/**
 * Sanitization middleware for request body
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(
  body: T,
  options?: {
    skipFields?: string[];
    urlFields?: string[];
  },
): T {
  return sanitizeObject(body, options);
}

/**
 * SQL injection prevention helpers
 */
export const SQL = {
  /**
   * Escape single quotes in strings for SQL
   * Note: Use parameterized queries instead when possible
   */
  escapeString(str: string): string {
    return str.replace(/'/g, "''");
  },

  /**
   * Validate identifier (table/column name)
   * Only allows alphanumeric and underscore
   */
  validateIdentifier(identifier: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  },
};

/**
 * NoSQL injection prevention helpers
 */
export const NoSQL = {
  /**
   * Sanitize MongoDB-style query object
   * Removes $ operators that could be used for injection
   */
  sanitizeQuery(query: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(query)) {
      // Block keys starting with $
      if (key.startsWith("$")) {
        continue;
      }

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeQuery(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },
};

/**
 * Path traversal prevention
 */
export function sanitizeFilePath(path: string): string {
  // Remove path traversal sequences
  path = path.replace(/\.\./g, "");

  // Remove leading slashes (prevent absolute paths)
  path = path.replace(/^\/+/, "");

  // Allow only safe characters
  path = path.replace(/[^a-zA-Z0-9._/-]/g, "");

  return path;
}

/**
 * Command injection prevention
 */
export function sanitizeCommand(input: string): string {
  // Remove shell metacharacters
  return input.replace(/[;&|`$(){}[\]<>'"\\]/g, "");
}
