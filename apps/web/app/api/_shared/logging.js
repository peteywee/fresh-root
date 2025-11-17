// [P1][OBSERVABILITY][LOGGING] Logging
// Tags: P1, OBSERVABILITY, LOGGING
/**
 * [P1][API][INFRA] Request logging + requestId middleware
 * Tags: api, infra, logging, observability
 *
 * Overview:
 * - Wraps API route handlers to:
 *   - Attach a unique requestId to the request
 *   - Log structured start/end records with duration and status
 * - Plays nicely with existing withSecurity middleware
 */
function generateRequestId() {
    try {
        // Node 18+ / modern runtimes
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return globalThis.crypto.randomUUID();
        }
    }
    catch {
        // fallthrough
    }
    const rand = Math.random().toString(16).slice(2);
    return `${Date.now().toString(16)}-${rand}`;
}
/**
 * Wrap a route handler with request logging.
 *
 * Usage:
 *   import { withRequestLogging } from "../_shared/logging";
 *   export const POST = withRequestLogging(
 *     withSecurity(myHandler, { requireAuth: true }),
 *   );
 */
export function withRequestLogging(handler) {
    return async (req, ctx) => {
        const requestId = generateRequestId();
        const start = Date.now();
        // Attach requestId to the request object for downstream handlers
        req.requestId = requestId;
        const { method = "UNKNOWN", url = "UNKNOWN" } = req;
        // Structured "start" log
        console.log(JSON.stringify({
            level: "info",
            msg: "request_start",
            requestId,
            method,
            url,
            ts: new Date().toISOString(),
        }));
        try {
            // Handle both single-arg and two-arg handlers
            const res = await (handler.length > 1
                ? handler(req, ctx || {})
                : handler(req));
            const durationMs = Date.now() - start;
            // Structured "end" log
            console.log(JSON.stringify({
                level: "info",
                msg: "request_end",
                requestId,
                method,
                url,
                durationMs,
                status: res?.status ?? 0,
                ts: new Date().toISOString(),
            }));
            return res;
        }
        catch (err) {
            const durationMs = Date.now() - start;
            // Structured error log
            console.error(JSON.stringify({
                level: "error",
                msg: "request_error",
                requestId,
                method,
                url,
                durationMs,
                error: err instanceof Error ? err.message : String(err),
                ts: new Date().toISOString(),
            }));
            throw err;
        }
    };
}
