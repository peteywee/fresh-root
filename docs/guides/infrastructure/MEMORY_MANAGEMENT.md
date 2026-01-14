# Memory Management & Redis Configuration

**Last Updated**: 2025-12-26
**Status**: Production Ready
**Related Issues**: #196 (Redis Rate Limiting)

## Overview

Fresh Schedules uses Redis for distributed state management, including:
- **Rate Limiting**: Prevent API abuse across multiple instances
- **Session Storage**: Distributed session management (future)
- **Caching**: Query result caching (future)
- **Idempotency**: Request deduplication (implemented)

## Redis Architecture

### Multi-Backend Support

The application supports three Redis backends with automatic fallback:

```
1. Upstash REST API (Recommended for Vercel/serverless)
   ↓ fallback if not configured
2. ioredis TCP (Traditional Redis)
   ↓ fallback if not configured  
3. In-Memory (Development only - NOT for production)
```

### Backend Selection Logic

```typescript
// Automatically selects backend based on environment variables
if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash REST API
} else if (REDIS_URL) {
  // Use ioredis TCP connection
} else {
  // WARNING: Use in-memory fallback (not suitable for multi-instance)
}
```

## Configuration

### Option 1: Upstash (Recommended)

**Best for**: Vercel, serverless, edge deployments

**Setup**:
1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and token

**Environment Variables**:
```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-secret-token
```

**Advantages**:
- ✅ No connection pooling needed
- ✅ Works in edge/serverless environments
- ✅ Built-in TLS
- ✅ Global low-latency via REST API
- ✅ Pay-per-request pricing

**Disadvantages**:
- ⚠️ Slightly higher latency than TCP (REST overhead)
- ⚠️ Costs can scale with high request volume

### Option 2: ioredis (Traditional)

**Best for**: Docker, Kubernetes, traditional server deployments

**Setup**:
1. Deploy Redis server (docker, managed service, etc.)
2. Get connection URL

**Environment Variables**:
```bash
REDIS_URL=redis://username:password@hostname:6379
# Or with TLS:
REDIS_URL=rediss://username:password@hostname:6380
```

**Advantages**:
- ✅ Lower latency (TCP vs REST)
- ✅ Battle-tested
- ✅ More Redis features available
- ✅ Self-hosted option

**Disadvantages**:
- ⚠️ Connection pooling needed
- ⚠️ Not serverless-friendly
- ⚠️ Requires infrastructure management

### Option 3: In-Memory Fallback

**Best for**: Local development, CI/CD tests

**Setup**:
- No configuration needed - automatic fallback

**Warnings**:
- ❌ **NOT suitable for production**
- ❌ **Does NOT work with multiple instances**
- ❌ Each instance has separate state
- ❌ Rate limits can be bypassed with load balancer

**Console Warning**:
```
Using in-memory Redis fallback. For production, configure 
UPSTASH_REDIS_REST_URL+TOKEN or REDIS_URL.
```

## Rate Limiting

### How It Works

```typescript
// API route with rate limiting
export const POST = createOrgEndpoint({
  rateLimit: { maxRequests: 50, windowMs: 60000 }, // 50 req/min
  handler: async ({ input, context }) => {
    // Handler code
  }
});
```

**Flow**:
1. Request arrives
2. Generate key: `rl:${IP}:${userId}:${path}`
3. Redis INCR key
4. If count=1, set expiry
5. Check if count > max
6. Return 429 if over limit, otherwise continue

### Rate Limit Headers

**Success Response** (200, 201, etc.):
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 2025-12-26T10:45:00.000Z
```

**Rate Limited Response** (429):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 45
  }
}
```

**Headers**:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-12-26T10:45:00.000Z
Retry-After: 45
```

### Recommended Limits

| Operation Type | Limit | Window | Rationale |
|----------------|-------|--------|-----------|
| Read (GET) | 100 req | 60s | Allow frequent data fetching |
| Write (POST/PUT) | 50 req | 60s | Prevent data spam |
| Auth (Login/MFA) | 5 req | 60s | Brute-force protection |
| Public endpoints | 10 req | 60s | Conservative for unauthenticated |
| Health checks | 1000 req | 60s | Allow frequent monitoring |

### Configuration Examples

```typescript
// Conservative (public endpoints)
rateLimit: { maxRequests: 10, windowMs: 60000 }

// Standard (authenticated reads)
rateLimit: { maxRequests: 100, windowMs: 60000 }

// Strict (authentication endpoints)
rateLimit: { maxRequests: 5, windowMs: 60000 }

// Lenient (health checks, metrics)
rateLimit: { maxRequests: 1000, windowMs: 60000 }
```

## Multi-Instance Deployment

### Requirements

For horizontal scaling (2+ instances), you **MUST** use Redis:

```bash
# Production deployment checklist
□ UPSTASH_REDIS_REST_URL configured
□ UPSTASH_REDIS_REST_TOKEN configured
OR
□ REDIS_URL configured

# Verify rate limiting works across instances
□ Deploy to 2+ instances behind load balancer
□ Send 200 requests to rate-limited endpoint
□ Confirm 100 success + 100 rate-limited (429)
```

### Verification Test

```bash
# Deploy 2 instances with rate limit: 100 req/min

# Send 200 requests
for i in {1..200}; do 
  curl -X POST https://api.example.com/api/test
done | grep -c "429"

# Expected output: ~100
# (Half the requests should be rate-limited)
```

### Load Balancer Configuration

**Ensure these settings**:
- ✅ Round-robin or least-connections distribution
- ✅ Health checks enabled
- ✅ Session affinity **NOT required** (stateless with Redis)
- ✅ Connection draining on deploy

**Example (Nginx)**:
```nginx
upstream fresh_api {
  least_conn;
  server instance1:3000;
  server instance2:3000;
}

server {
  location /api {
    proxy_pass http://fresh_api;
  }
}
```

## Monitoring & Observability

### Key Metrics to Track

1. **Rate Limit Hit Rate**
   - Metric: `rate_limit_exceeded_total`
   - Alert: If >5% of requests are rate-limited

2. **Redis Availability**
   - Metric: `redis_connection_errors_total`
   - Alert: If >0 errors in 5 minutes

3. **Redis Latency**
   - Metric: `redis_operation_duration_seconds`
   - Alert: If p95 >50ms

4. **Fallback Usage**
   - Metric: `redis_fallback_active`
   - Alert: If fallback is used in production

### Dashboard Queries

**Grafana/Prometheus**:
```promql
# Rate limit rejection rate
rate(rate_limit_exceeded_total[5m]) / rate(http_requests_total[5m])

# Redis operation latency p95
histogram_quantile(0.95, rate(redis_operation_duration_seconds_bucket[5m]))

# Redis connection errors
increase(redis_connection_errors_total[1h])
```

## Troubleshooting

### Issue: "Using in-memory Redis fallback" in Production

**Cause**: Redis environment variables not configured

**Fix**:
```bash
# Set one of these combinations:
export UPSTASH_REDIS_REST_URL=https://...
export UPSTASH_REDIS_REST_TOKEN=***

# OR
export REDIS_URL=redis://hostname:6379
```

### Issue: Rate Limiting Not Working Across Instances

**Symptoms**:
- Rate limits can be bypassed by distributing requests
- Each instance allows full quota

**Cause**: Using in-memory fallback instead of Redis

**Fix**:
1. Verify Redis environment variables are set
2. Check application logs for "Using in-memory Redis fallback"
3. Configure Upstash or ioredis connection
4. Restart instances
5. Verify with multi-instance test

### Issue: High Redis Latency

**Symptoms**:
- API responses slow
- Redis operations >100ms

**Causes**:
- Geographical distance to Redis server
- Network congestion
- Redis server overloaded

**Fixes**:
1. Use Upstash with geographically closer region
2. Use managed Redis with auto-scaling
3. Implement connection pooling (ioredis)
4. Consider caching frequently accessed data

### Issue: Redis Connection Errors

**Symptoms**:
- "Rate limit check failed" in logs
- Requests allowed despite being over limit

**Behavior**: Fail-open (allow requests on error)

**Fixes**:
1. Check Redis server availability
2. Verify connection credentials
3. Check network connectivity
4. Review Redis server logs
5. Consider redundancy (Redis Sentinel/Cluster)

## Best Practices

### Development

1. **Use In-Memory Fallback**
   - No Redis setup needed locally
   - Faster development iteration
   - ⚠️ Note: Rate limiting won't work across multiple dev instances

2. **Test with Real Redis**
   - Use Docker Compose for local Redis
   - Test multi-instance scenarios before deploying

3. **Mock Redis in Tests**
   - Use in-memory implementation for unit tests
   - Use Docker Redis for integration tests

### Staging

1. **Use Same Redis Backend as Production**
   - Upstash or ioredis
   - Same configuration patterns

2. **Test Multi-Instance Deployment**
   - Deploy 2+ instances
   - Run load tests
   - Verify rate limiting works

3. **Monitor Redis Metrics**
   - Track latency, errors, hit rates
   - Set up alerts

### Production

1. **Always Use Redis**
   - ❌ Never use in-memory fallback
   - ✅ Configure Upstash or ioredis

2. **Monitor Redis Health**
   - Set up alerts for errors
   - Track latency and hit rates
   - Monitor connection pool

3. **Have Backup Plan**
   - Document Redis restore procedures
   - Test failover scenarios
   - Consider Redis Sentinel or Cluster for HA

4. **Tune Rate Limits**
   - Start conservative
   - Monitor false positives
   - Adjust based on real traffic

## Performance Tuning

### Connection Pooling (ioredis)

```typescript
// For high-traffic applications
const redis = new IORedis({
  host: 'hostname',
  port: 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // Connection pool settings
  lazyConnect: true,
  autoResubscribe: true,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});
```

### Key Expiration

Rate limit keys automatically expire after the window:

```typescript
// Automatic cleanup - no manual intervention needed
// Keys: rl:${key} expire after windowSeconds
await redis.incr(key);  // Create key
await redis.expire(key, windowSeconds);  // Set expiry
```

### Memory Usage

**Estimated Redis Memory**:
- Per rate-limited key: ~100 bytes
- For 1M unique keys: ~100 MB
- Keys expire automatically, so memory is bounded

**Formula**:
```
memory_mb = (unique_users * routes_with_rate_limits * 100 bytes) / 1_000_000
```

## Security

### Redis Authentication

**Always use authentication**:
```bash
# ioredis
REDIS_URL=redis://username:password@hostname:6379

# Upstash (token is auth)
UPSTASH_REDIS_REST_TOKEN=your-secret-token
```

### TLS/SSL

**Always use TLS in production**:
```bash
# ioredis with TLS
REDIS_URL=rediss://hostname:6380

# Upstash (TLS by default)
UPSTASH_REDIS_REST_URL=https://...
```

### Key Isolation

Rate limit keys are prefixed:
```
rl:${path}:${ip}:${userId}
```

This prevents collisions with other Redis usage (caching, sessions, etc.)

## Migration Guide

### From In-Memory to Redis

**Steps**:
1. Set Redis environment variables
2. Restart application
3. Verify logs show Redis connection
4. Test rate limiting works
5. Monitor for errors

**No code changes needed** - automatic detection

### From Upstash to ioredis (or vice versa)

**Steps**:
1. Update environment variables
2. Restart application
3. Verify connection in logs

**No code changes needed** - automatic detection

## Related Documentation

- [API Framework Guide](./standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md)
- [Issue #196: Redis Rate Limiting](./issues/ISSUE_196_STATUS_UPDATE.md)
- [Strategic Audit TODOs](./reports/STRATEGIC_AUDIT_TODOS.md)

## Support

**Issues**: Create GitHub issue with label `infrastructure`
**Questions**: Contact DevOps team

---

**Last Updated**: 2025-12-26
**Maintained By**: DevOps Team
**Review Frequency**: Quarterly or after infrastructure changes
