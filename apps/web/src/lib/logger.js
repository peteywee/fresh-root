/**
 * Log levels following standard severity hierarchy
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
/**
 * Logger class for structured JSON logging
 */
export class Logger {
    context;
    constructor(context = {}) {
        this.context = context;
    }
    /**
     * Create a child logger with additional context
     */
    child(additionalContext) {
        return new Logger({ ...this.context, ...additionalContext });
    }
    /**
     * Create logger from NextRequest with automatic reqId
     */
    static fromRequest(req, additionalContext) {
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
    debug(message, meta) {
        this.log(LogLevel.DEBUG, message, meta);
    }
    /**
     * Log at INFO level
     */
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    /**
     * Log at WARN level
     */
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    /**
     * Log at ERROR level
     */
    error(message, error, meta) {
        const errorMeta = {};
        if (error instanceof Error) {
            errorMeta.error = {
                message: error.message,
                stack: error.stack,
                name: error.name,
            };
        }
        else if (error) {
            errorMeta.error = {
                message: String(error),
            };
        }
        this.log(LogLevel.ERROR, message, { ...errorMeta, ...meta });
    }
    /**
     * Log at FATAL level (critical errors)
     */
    fatal(message, error, meta) {
        const errorMeta = {};
        if (error instanceof Error) {
            errorMeta.error = {
                message: error.message,
                stack: error.stack,
                name: error.name,
            };
        }
        else if (error) {
            errorMeta.error = {
                message: String(error),
            };
        }
        this.log(LogLevel.FATAL, message, { ...errorMeta, ...meta });
    }
    /**
     * Core logging method that outputs structured JSON
     */
    log(level, message, meta) {
        const entry = {
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
        console.error(`[${timestamp}] ${levelLabel} ${entry.message}`, entry.metadata ? entry.metadata : "");
    }
    /**
     * Helper to measure and log request latency
     */
    async withLatency(fn, message, meta) {
        const start = Date.now();
        try {
            const result = await fn();
            const latencyMs = Date.now() - start;
            this.info(message, { latencyMs, ...meta });
            return result;
        }
        catch (error) {
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
export function requestLogger(req, startTime = Date.now()) {
    const reqLogger = Logger.fromRequest(req);
    return {
        logger: reqLogger,
        finish: (statusCode, additionalMeta) => {
            const latencyMs = Date.now() - startTime;
            reqLogger.info("Request completed", {
                statusCode,
                latencyMs,
                ...additionalMeta,
            });
        },
    };
}
