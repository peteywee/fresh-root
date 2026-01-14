# Performance Optimization Guides Index

This folder contains performance optimization and benchmarking guides.

## Available Guides

### [PERFORMANCE_BENCHMARKS.md](./PERFORMANCE_BENCHMARKS.md)
**Purpose**: Performance monitoring, profiling, and optimization strategies
**Topics**:
- Performance budgets (API, page loads, queries)
- Redis caching implementation
- Query optimization patterns
- Memory-efficient pagination
- Performance monitoring with OpenTelemetry
- Slow query logging
- Real-time metrics collection (p50, p95, p99)

**Key Features**:
- `measurePerformance()` - OpenTelemetry trace integration
- `cachedOperation()` - Redis-backed caching with TTL
- `QueryOptimization.batchFetch()` - Batch document fetching
- `MemoryOptimization.paginateQuery()` - Generator-based pagination

**Use when**: 
- Diagnosing performance bottlenecks
- Implementing caching strategies
- Optimizing database queries
- Setting up performance monitoring

---

## Quick Links
- [Back to Main Documentation Index](../../INDEX.md)
- [Infrastructure Guides](../infrastructure/)
- [API Framework Performance Utils](../../../packages/api-framework/src/performance.ts)
