# Rate limiter (runtime notes)

This file documents runtime considerations for the in-memory and Redis-backed rate limiters used by the app.

## Production recommendations

- Do NOT rely on the in-memory limiter for production in multi-instance deployments. Use Redis (or another central store) for rate counters.
- Prefer the server-only env var `RATE_LIMIT_ALLOW_IN_MEMORY=true` to intentionally enable in-memory limiter in production. `NEXT_PUBLIC_ALLOW_IN_MEMORY_RATE_LIMIT` is still accepted for compatibility but avoid exposing server-only controls as `NEXT_PUBLIC_*`.
- When enabling in-memory limiter in production, the runtime will log a warning. This is intentional so operators can avoid accidental misconfiguration.

## Headers and semantics

- Rate limit headers use lowercase names:
  - `x-ratelimit-limit`
  - `x-ratelimit-remaining`
  - `x-ratelimit-reset` (epoch seconds)
  - `retry-after` (seconds)

- Clients should treat HTTP headers case-insensitively.

## Privacy & key generation

- Authorization tokens and other PII are not included verbatim in rate-limit keys. The runtime hashes long header values (SHA-256, 8 hex chars) before incorporating them into keys to avoid token leakage.

## Test helpers

- `checkRateLimit(request, config)` is exported for programmatic checks.
- `shutdownRateLimiter()` and `resetRateLimiter()` are exported to allow test teardown. Call `shutdownRateLimiter()` in global teardown to avoid timer/interval leaks.

## Failover behavior (Redis)

- Redis-backed limiter defaults to `failOpen=true` (allow on Redis outage) to prioritize availability. Set `failOpen=false` if you prefer strict denial when the store is unavailable.

## Quick checklist for deployment

- Set `REDIS_URL` for clustered rate-limiting.
- Do not enable `RATE_LIMIT_ALLOW_IN_MEMORY` unless you understand multi-instance consequences.
- Monitor rate-limit-related logs for warnings about in-memory fallbacks.
