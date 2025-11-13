// [P2][APP][OTEL] Telemetry
// Tags: P2, APP, OTEL
import type { NextRequest } from "next/server";

/**
 * Minimal stdout logger for API calls. Controlled by:
 * - NODE_ENV === "production"  OR
 * - TELEMETRY_STDOUT === "1"   (force in dev)
 */
export function logApiCall(
  method: string,
  path: string,
  userId?: string,
  status?: number,
  durationMs?: number,
  extras?: Record<string, unknown>
) {
  const enable =
    process.env.NODE_ENV === "production" ||
    process.env.TELEMETRY_STDOUT === "1";

  if (!enable) return;

  const payload = {
    timestamp: Date.now(),
    type: "api_call",
    method,
    path,
    userId,
    status,
    durationMs,
    ...extras,
  };

  // Intentionally one-line JSON for easy ingestion
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

/**
 * Try to read a request ID if provided by proxies/CDN.
 */
function readRequestId(req: NextRequest | any): string | undefined {
  try {
    const id =
      (typeof req?.headers?.get === "function" &&
        req.headers.get("x-request-id")) ||
      (req?.headers?.["x-request-id"] as string | undefined) ||
      undefined;
    return id || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extract a reasonable HTTP status from a Next.js route result.
 */
function getStatus(result: unknown): number {
  try {
    // Prefer a numeric `status` property when present (covers NextResponse and plain objects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybe = result as any;
    if (typeof maybe?.status === "number") return maybe.status;
    return 200;
  } catch {
    return 500;
  }
}

/**
 * Generic safe wrapper for Next.js Route Handlers.
 * Works with signatures like:
 *   export const GET  = withTelemetry(async (req: NextRequest) => NextResponse.json(...), "/api/foo");
 *   export const POST = withTelemetry(async (req: NextRequest) => ..., "/api/foo");
 */
export function withTelemetry<T extends (req: any, ...args: any[]) => Promise<any>>(
  handler: T,
  route: string
): T {
  return (async (req: NextRequest | any, ...args: any[]) => {
    const start = Date.now();
    try {
      const result = await handler(req, ...args);
      const status = getStatus(result);
      logApiCall(
        (req as any)?.method ?? "UNKNOWN",
        route,
        (req as any)?.userToken?.uid,
        status,
        Date.now() - start,
        { requestId: readRequestId(req) }
      );
      return result;
    } catch (error) {
      logApiCall(
        (req as any)?.method ?? "UNKNOWN",
        route,
        (req as any)?.userToken?.uid,
        500,
        Date.now() - start,
        { requestId: readRequestId(req), error: (error as Error)?.name }
      );
      throw error;
    }
  }) as unknown as T;
}
