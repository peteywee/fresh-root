// [P1][RELIABILITY][OBS] Structured JSON logger for production observability
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, JSON
import type { Request, Response } from "express";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  level: LogLevel;
  message: string;
  reqId?: string;
  uid?: string;
  orgId?: string;
  latencyMs?: number;
  method?: string;
  path?: string;
  status?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  [key: string]: unknown;
}

/**
 * Structured JSON logger.
 * In production, outputs one JSON object per line for log aggregators (Datadog, CloudWatch, etc.)
 * In development, can be pretty-printed or passed through pino-pretty.
 */
export class Logger {
  private readonly env: string;

  constructor(env: string = process.env.NODE_ENV || "development") {
    this.env = env;
  }

  private write(ctx: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      env: this.env,
      ...ctx,
    };

    // In production, always JSON. In dev, can be pretty or JSON depending on preference.
    if (this.env === "production") {
      console.log(JSON.stringify(logEntry));
    } else {
      // Dev: pretty print for readability (can pipe to pino-pretty if desired)
      const { level, message, reqId, uid, latencyMs, method, path, status, error } = ctx;
      const parts = [
        `[${level.toUpperCase()}]`,
        reqId ? `[${reqId}]` : "",
        method && path ? `${method} ${path}` : "",
        status ? `→ ${status}` : "",
        latencyMs !== undefined ? `(${latencyMs}ms)` : "",
        uid ? `uid:${uid}` : "",
        message,
        error ? `ERROR: ${error.message}` : "",
      ].filter(Boolean);
      console.log(parts.join(" "));
    }
  }

  debug(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "debug", message, ...ctx });
  }

  info(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "info", message, ...ctx });
  }

  warn(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "warn", message, ...ctx });
  }

  error(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "error", message, ...ctx });
  }

  /**
   * Convenience method to log HTTP requests with latency and status.
   */
  request(req: Request, res: Response, latencyMs: number, ctx?: Partial<LogContext>): void {
    const userToken = (req as Request & { userToken?: { uid: string; orgId?: string } }).userToken;
    this.info("request", {
      reqId: (req as Request & { reqId?: string }).reqId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latencyMs,
      uid: userToken?.uid,
      orgId: userToken?.orgId,
      ...ctx,
    });
  }
}

// Singleton instance
export const logger = new Logger();
