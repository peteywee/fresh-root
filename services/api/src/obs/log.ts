// [P1][RELIABILITY][OBS] Structured JSON logger for production observability
// Tags: P1, RELIABILITY, OBSERVABILITY, LOGGING, JSON
import type { Request, Response } from "express";

/**
 * @description Defines the possible log levels.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * @description Represents the structure of a log entry, including metadata for context and diagnostics.
 */
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
 * @description A structured JSON logger designed for production observability.
 * It outputs JSON logs for easy parsing by log aggregation services and provides a more readable format for development.
 */
export class Logger {
  private readonly env: string;

  /**
   * @description Initializes a new instance of the Logger.
   * @param {string} [env=process.env.NODE_ENV || "development"] - The application environment, which determines the log format.
   */
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

  /**
   * @description Logs a debug-level message.
   * @param {string} message - The log message.
   * @param {Partial<LogContext>} [ctx] - Additional context to include with the log entry.
   */
  debug(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "debug", message, ...ctx });
  }

  /**
   * @description Logs an info-level message.
   * @param {string} message - The log message.
   * @param {Partial<LogContext>} [ctx] - Additional context to include with the log entry.
   */
  info(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "info", message, ...ctx });
  }

  /**
   * @description Logs a warn-level message.
   * @param {string} message - The log message.
   * @param {Partial<LogContext>} [ctx] - Additional context to include with the log entry.
   */
  warn(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "warn", message, ...ctx });
  }

  /**
   * @description Logs an error-level message.
   * @param {string} message - The log message.
   * @param {Partial<LogContext>} [ctx] - Additional context to include with the log entry.
   */
  error(message: string, ctx?: Partial<LogContext>): void {
    this.write({ level: "error", message, ...ctx });
  }

  /**
   * @description A convenience method for logging HTTP requests, including latency, status, and user information.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {number} latencyMs - The request latency in milliseconds.
   * @param {Partial<LogContext>} [ctx] - Additional context to include with the log entry.
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
