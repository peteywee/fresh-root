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
/**
 * Logger class for structured JSON logging.
 *
 * @param {Partial<LogEntry>} [context={}] - The initial context for the logger.
 */
export class Logger {
  private context: Partial<LogEntry>;

  constructor(context: Partial<LogEntry> = {}) {
    this.context = context;
  }

  /**
   * Creates a new child logger with additional context merged into the parent's context.
   *
   * @param {Partial<LogEntry>} additionalContext - The additional context for the child logger.
   * @returns {Logger} A new Logger instance.
   */
  child(additionalContext: Partial<LogEntry>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Creates a new logger instance from a NextRequest, automatically including request-specific context.
   *
   * @param {NextRequest} req - The Next.js request object.
   * @param {Partial<LogEntry>} [additionalContext] - Additional context to include in the logger.
   * @returns {Logger} A new Logger instance with request context.
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
   * Logs a message at the DEBUG level.
   *
   * @param {string} message - The message to log.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
   */
  debug(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Logs a message at the INFO level.
   *
   * @param {string} message - The message to log.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
   */
  info(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Logs a message at the WARN level.
   *
   * @param {string} message - The message to log.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
   */
  warn(message: string, meta?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Logs a message and an error at the ERROR level.
   *
   * @param {string} message - The message to log.
   * @param {Error | unknown} [error] - The error to log.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
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
   * Logs a message and an error at the FATAL level.
   *
   * @param {string} message - The message to log.
   * @param {Error | unknown} [error] - The error to log.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
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
   * The core logging method that outputs a structured JSON log entry.
   *
   * @param {LogLevel} level - The log level.
   * @param {string} message - The log message.
   * @param {Partial<LogEntry>} [meta] - Additional metadata.
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
   * A helper method to measure and log the latency of an asynchronous function.
   *
   * @template T
   * @param {() => Promise<T>} fn - The asynchronous function to execute and measure.
   * @param {string} message - The message to log upon completion or failure.
   * @param {Partial<LogEntry>} [meta] - Additional metadata to include in the log entry.
   * @returns {Promise<T>} The result of the asynchronous function.
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
 * The default global logger instance.
 */
export const logger = new Logger();

/**
 * A middleware function for Next.js to add request logging.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @param {number} [startTime=Date.now()] - The start time of the request.
 * @returns {{logger: Logger, finish: (statusCode: number, additionalMeta?: Partial<LogEntry>) => void}} An object containing the request-specific logger and a `finish` function to log the completion of the request.
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
