// [P2][API][MIDDLEWARE] Re-export for test compatibility
// Tags: P2, API, MIDDLEWARE

// Re-export from app/middleware.ts for test imports
// Note: config cannot be re-exported; it must be defined in app/middleware.ts directly
export { middleware } from "../app/middleware";
