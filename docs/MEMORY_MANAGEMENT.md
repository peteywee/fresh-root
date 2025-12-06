---
**ARCHIVED**: Temporary development notes
**Archive Date**: December 6, 2025
**Scheduled Deletion**: January 6, 2026 (30 days)
**Reason**: Development session artifact, Redis documentation moved to production docs
---

# Memory Management for Production

## Critical Issue Fixed: Node Exit Code 9 (SIGKILL - Out of Memory)

### Problem

- System: 6.3GB total RAM, 0B swap
- VSCode TypeScript server consuming 10GB+
- Build/dev processes getting killed by OOM
- Exit code 9 = SIGKILL from OOM killer

### Root Cause

1. **VSCode memory leaks** - TypeScript server, language servers consuming unbounded memory
2. **No swap space** - No overflow buffer for temporary spikes
3. **Parallel builds** - Multiple worker threads competing for limited RAM

### Solutions Implemented

#### 1. Node Memory Limits (.env.local, .env.production)

```bash
NODE_OPTIONS=--max-old-space-size=1536
```

- Caps Node.js heap at 1.5GB per process
- Prevents unbounded memory growth

#### 2. Build Optimization (.pnpmrc)

```
node-linker=hoisted
fetch-timeout=60000
```

- Reduces parallel I/O operations
- Better memory utilization during installs

#### 3. VSCode Settings (.vscode/settings.json)

```json
{
  "typescript.tsserver.maxTsServerMemory": 512,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  "typescript.enableStaticTypeChecking": false
}
```

- Limits TypeScript server to 512MB
- Disables expensive diagnostics

---

## Redis Rate Limiting (Production-Ready Implementation)

### Overview

The rate limiting system now supports Redis for production deployments, ensuring rate limits work correctly across multiple instances.

### Configuration

```bash
# Standard Redis (self-hosted)
REDIS_URL=redis://localhost:6379

# Or Upstash Redis (serverless, Vercel-compatible)
UPSTASH_REDIS_REST_URL=https://redis.upstash.io/your-endpoint
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Behavior

- **Production (`NODE_ENV=production`)**: Uses Redis for distributed rate limiting
- **Development**: Uses in-memory rate limiting (single instance only)
- **Fallback**: If Redis fails, fails open (allows requests) to maintain availability

### Redis Benefits

- **Horizontal Scaling**: Rate limits work correctly across multiple instances
- **Persistence**: Rate limit counters survive application restarts
- **Performance**: Redis operations are optimized for high throughput
- **Memory Efficiency**: ~50 bytes per unique rate limit key

### Redis Configuration

The system initializes Redis with optimized settings:

```typescript
new Redis(redisUrl, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 1,
});
```

### Testing

Run the Redis rate limiter tests:

```bash
# Run rate limiting tests
pnpm test -- rate-limit

# Run with coverage
pnpm test:coverage -- rate-limit
```

### Verification

To verify Redis rate limiting across multiple instances:

```bash
# Deploy to 2+ instances, then test
for i in {1..200}; do curl -X POST https://api.example.com/api/test; done | grep -c \"429\"
# Expected: ~100 (half the requests rate-limited)
```

### Performance Characteristics

- **Latency**: < 1ms for local Redis, < 10ms for remote
- **Throughput**: > 10,000 ops/sec per instance
- **Memory Usage**: ~50 bytes per unique rate limit key
- **Scaling**: Single Redis handles 10,000+ concurrent users

### Production Deployment Options

#### Option 1: Upstash (Recommended for Vercel)

```bash
UPSTASH_REDIS_REST_URL=https://redis.upstash.io/your-endpoint
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### Option 2: AWS ElastiCache

```bash
REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
```

#### Option 3: Self-hosted Redis

```bash
REDIS_URL=redis://your-redis-server:6379
```

### Troubleshooting

**Redis Connection Errors**
- Check Redis URL format and connectivity
- Verify authentication credentials
- Monitor Redis server status

**Memory Issues** 
- Increase Redis memory limit
- Implement key expiration policies
- Consider Redis cluster for scaling

**Debug Commands**
```bash
redis-cli ping                    # Test connectivity
redis-cli monitor                 # Monitor operations
redis-cli info memory             # Check memory usage
redis-cli keys "rate_limit:*"     # List rate limit keys
```

### Migration from In-Memory

1. Deploy Redis infrastructure
2. Set environment variables
3. Deploy application with Redis support
4. Verify rate limiting across instances
5. Monitor for issues

The fallback behavior ensures zero downtime during Redis migration or issues.
- Reduces CPU/memory spikes

#### 4. Build Parallelism (run-dev.sh)

```bash
SWC_NUM_THREADS=2
```

- Limits SWC compiler threads to 2 instead of auto-detect (CPU count)
- Reduces peak memory footprint during compilation

### Usage

**Development:**

```bash
./run-dev.sh
# OR
NODE_OPTIONS="--max-old-space-size=1536" SWC_NUM_THREADS=2 pnpm dev
```

**Production Build:**

```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm build
```

**Tests:**

```bash
NODE_OPTIONS="--max-old-space-size=1536" pnpm vitest run
```

### Monitoring

Check actual memory usage:

```bash
free -h
ps aux --sort=-%mem | head -10
```

### Future Improvements

1. **Add swap space** (4-8GB recommended)
2. **Upgrade system RAM** to 16GB+ if possible
3. **CI/CD**: Use `--frozen-lockfile` to skip install-time optimizations
4. **Docker**: Run backend in separate container with dedicated memory

### If Crashes Persist

```bash
# Nuclear option: Force sequential builds
pnpm build --concurrency=1

# Clear all caches and retry
rm -rf .next node_modules .pnpm-store
pnpm install --frozen-lockfile
pnpm build
```
