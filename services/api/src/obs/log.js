/**
 * Structured JSON logger.
 * In production, outputs one JSON object per line for log aggregators (Datadog, CloudWatch, etc.)
 * In development, can be pretty-printed or passed through pino-pretty.
 */
export class Logger {
    env;
    constructor(env = process.env.NODE_ENV || "development") {
        this.env = env;
    }
    write(ctx) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            env: this.env,
            ...ctx,
        };
        // In production, always JSON. In dev, can be pretty or JSON depending on preference.
        if (this.env === "production") {
            console.log(JSON.stringify(logEntry));
        }
        else {
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
    debug(message, ctx) {
        this.write({ level: "debug", message, ...ctx });
    }
    info(message, ctx) {
        this.write({ level: "info", message, ...ctx });
    }
    warn(message, ctx) {
        this.write({ level: "warn", message, ...ctx });
    }
    error(message, ctx) {
        this.write({ level: "error", message, ...ctx });
    }
    /**
     * Convenience method to log HTTP requests with latency and status.
     */
    request(req, res, latencyMs, ctx) {
        const userToken = req.userToken;
        this.info("request", {
            reqId: req.reqId,
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
