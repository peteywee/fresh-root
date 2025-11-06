// [P0][OBS][LOGGER] Shared JSON logger with structured fields
// Tags: P0, OBS, LOGGER
import { NextRequest } from "next/server";

/**
 * Log levels following standard severity hierarchy
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * Structured log entry with common fields
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  reqId?: string;
  uid?: string;
  orgId?: string;
  latencyMs?: number;
  method?: string;
  path?: string;
  statusCode?: number;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  [key: string]: unknown; // Allow additional custom fields
}

/**
 * Logger class for structured JSON logging
 */
export class Logger {
  private context: Partial<LogEntry>;

  constructor(context: Partial<LogEntry> = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<LogEntry>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Create logger from NextRequest with automatic reqId
   */
  static fromRequest(req: NextRequest, additionalContext?: Partial<LogEntry>): Logger {
    const reqId = req.headers.get("x-request-id") || crypto.randomUUID();
    return new Logger({
      reqId,
      method: req.method,
      path: req.nextUrl.pathname,
      ...additionalContext,
    });
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Log at INFO level
   */
  info(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log at ERROR level
   */
  error(message: string, error?: Error | unknown, meta?: Partial<LogEntry>): void {
    const errorMeta: Partial<LogEntry> = {};

    if (error instanceof Error) {
      errorMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorMeta.error = {
        message: String(error),
      };
    }

    this.log(LogLevel.ERROR, message, { ...errorMeta, ...meta });
  }

  /**
   * Log at FATAL level (critical errors)
   */
  fatal(message: string, error?: Error | unknown, meta?: Partial<LogEntry>): void {
    const errorMeta: Partial<LogEntry> = {};

    if (error instanceof Error) {
      errorMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorMeta.error = {
        message: String(error),
      };
    }

    this.log(LogLevel.FATAL, message, { ...errorMeta, ...meta });
  }

  /**
   * Core logging method that outputs structured JSON
   */
  private log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta,
    };

    // Human-readable format
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelLabel = entry.level.toUpperCase().padEnd(5);
    // Use console.error to comply with ESLint rules (only warn/error allowed)
    console.error(
      `[${timestamp}] ${levelLabel} ${entry.message}`,
      entry.metadata ? entry.metadata : "",
    );
  }

  /**
   * Helper to measure and log request latency
   */
  async withLatency<T>(
    fn: () => Promise<T>,
    message: string,
    meta?: Partial<LogEntry>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const latencyMs = Date.now() - start;
      this.info(message, { latencyMs, ...meta });
      return result;
    } catch (error) {
      const latencyMs = Date.now() - start;
      this.error(message, error, { latencyMs, ...meta });
      throw error;
    }
  }
}

/**
 * Default global logger instance
 */
export const logger = new Logger();

/**
 * Express/Next.js middleware to add request logging
 */
export function requestLogger(req: NextRequest, startTime: number = Date.now()) {
  const reqLogger = Logger.fromRequest(req);

  return {
    logger: reqLogger,
    finish: (statusCode: number, additionalMeta?: Partial<LogEntry>) => {
      const latencyMs = Date.now() - startTime;
      reqLogger.info("Request completed", {
        statusCode,
        latencyMs,
        ...additionalMeta,
      });
    },
  };
}
