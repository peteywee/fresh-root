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

/* eslint-disable @typescript-eslint/no-explicit-any */

type BasicReq = {
  method?: string;
  url?: string;
  // Allow existing middleware to attach extra fields
  [key: string]: any;
};

type Handler<TReq extends BasicReq = BasicReq, C = any> = (
  req: TReq & { requestId: string },
  ctx: C,
) => Promise<Response> | Response;

function generateRequestId(): string {
  try {
    // Node 18+ / modern runtimes
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
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
export function withRequestLogging<TReq extends BasicReq, C = any>(
  handler: Handler<TReq, C> | ((req: TReq, ctx: C) => Promise<Response>),
): (req: TReq, ctx: C) => Promise<Response> {
  return async (req: TReq, ctx: C): Promise<Response> => {
    const requestId = generateRequestId();
    const start = Date.now();

    // Attach requestId to the request object for downstream handlers
    (req as any).requestId = requestId;

    const { method = "UNKNOWN", url = "UNKNOWN" } = req;

    // Structured "start" log

    console.log(
      JSON.stringify({
        level: "info",
        msg: "request_start",
        requestId,
        method,
        url,
        ts: new Date().toISOString(),
      }),
    );

    try {
      // Handle both single-arg and two-arg handlers
      // We cast to any to avoid strict type checks on the handler call, as we know we are passing the right args
      const res = await (handler as any)(req as TReq & { requestId: string }, ctx);
      const durationMs = Date.now() - start;

      // Structured "end" log

      console.log(
        JSON.stringify({
          level: "info",
          msg: "request_end",
          requestId,
          method,
          url,
          durationMs,
          status: res?.status ?? 0,
          ts: new Date().toISOString(),
        }),
      );

      return res;
    } catch (err) {
      const durationMs = Date.now() - start;

      // Structured error log

      console.error(
        JSON.stringify({
          level: "error",
          msg: "request_error",
          requestId,
          method,
          url,
          durationMs,
          error: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        }),
      );

      throw err;
    }
  };
}
