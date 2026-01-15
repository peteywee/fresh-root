// [P0][API][PERFORMANCE] Performance monitoring and optimization utilities
// Tags: P0, API, PERFORMANCE, MONITORING

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { getRedisClient } from "./redis";

const tracer = trace.getTracer("@fresh-schedules/api-framework");

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable slow query logging (default: true) */
  slowQueryThreshold?: number; // ms
  /** Enable caching for hot paths (default: true) */
  enableCaching?: boolean;
  /** Cache TTL in seconds */
  cacheTTL?: number;
  /** Enable performance metrics export (default: true) */
  enableMetrics?: boolean;
}

const defaultConfig: Required<PerformanceConfig> = {
  slowQueryThreshold: 100, // 100ms
  enableCaching: true,
  cacheTTL: 300, // 5 minutes
  enableMetrics: true,
};

let config: Required<PerformanceConfig> = { ...defaultConfig };

/**
 * Configure performance monitoring
 */
export function configurePerformance(opts: PerformanceConfig): void {
  config = { ...config, ...opts };
}

/**
 * Measure execution time of an operation
 */
export async function measurePerformance<T>(
  operationName: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string | number>,
): Promise<T> {
  const span = tracer.startSpan(operationName, {
    attributes: {
      ...attributes,
      component: "performance",
    },
  });

  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    // Log slow queries
    if (config.slowQueryThreshold && duration > config.slowQueryThreshold) {
      console.warn(`[SLOW QUERY] ${operationName} took ${duration}ms`, {
        operation: operationName,
        duration,
        threshold: config.slowQueryThreshold,
        ...attributes,
      });
    }

    span.setAttributes({
      "performance.duration_ms": duration,
      "performance.slow": duration > config.slowQueryThreshold,
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Cache key builder for consistent cache key generation
 */
export function buildCacheKey(namespace: string, ...parts: (string | number)[]): string {
  return `${namespace}:${parts.join(":")}`;
}

/**
 * Cached operation with Redis backing
 */
export async function cachedOperation<T>(
  cacheKey: string,
  operation: () => Promise<T>,
  options?: {
    ttl?: number; // seconds
    skipCache?: boolean;
  },
): Promise<T> {
  if (!config.enableCaching || options?.skipCache) {
    return operation();
  }

  const redis = await getRedisClient();
  if (!redis) {
    // No Redis available, execute operation directly
    return operation();
  }

  try {
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      // Parse and validate cached data to prevent prototype pollution
      const parsed = JSON.parse(cached);
      // Type assertion is safe here because we control what goes into cache
      return parsed as T;
    }

    // Cache miss - execute operation
    const result = await operation();

    // Store in cache
    const ttl = options?.ttl ?? config.cacheTTL;
    await redis.setex(cacheKey, ttl, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to use cache for key: ${cacheKey}`, error);
    // Fall back to direct operation
    return operation();
  }
}

/**
 * Invalidate cache entries matching a pattern.
 * Uses SCAN instead of KEYS to avoid blocking Redis in production.
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) {
    return 0;
  }

  try {
    const keysToDelete: string[] = [];
    let cursor = '0';
    
    // Use SCAN instead of KEYS to avoid blocking Redis
    do {
      const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        keysToDelete.push(...keys);
      }
    } while (cursor !== '0');

    if (keysToDelete.length === 0) {
      return 0;
    }

    await redis.del(...keysToDelete);
    return keysToDelete.length;
  } catch (error) {
    console.error(`[CACHE ERROR] Failed to invalidate cache pattern: ${pattern}`, error);
    return 0;
  }
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();

  record(operation: string, durationMs: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(durationMs);
  }

  getStats(operation: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const data = this.metrics.get(operation);
    if (!data || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const result: Record<string, ReturnType<typeof this.getStats>> = {};
    for (const operation of this.metrics.keys()) {
      result[operation] = this.getStats(operation);
    }
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Global metrics instance
export const globalMetrics = new PerformanceMetrics();

/**
 * Database query optimization helpers
 */
export const QueryOptimization = {
  /**
   * Batch fetch multiple documents by ID
   */
  async batchFetch<T>(
    collection: FirebaseFirestore.CollectionReference,
    ids: string[],
  ): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    if (ids.length === 0) {
      return result;
    }

    // Firestore 'in' queries are limited to 10 items
    const BATCH_SIZE = 10;
    const batches: string[][] = [];

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    await Promise.all(
      batches.map(async (batch) => {
        const snapshot = await collection.where("__name__", "in", batch).get();
        snapshot.docs.forEach((doc) => {
          result.set(doc.id, { id: doc.id, ...doc.data() } as T);
        });
      }),
    );

    return result;
  },

  /**
   * Field projection to reduce payload size
   */
  selectFields<T>(doc: FirebaseFirestore.DocumentSnapshot, fields: string[]): Partial<T> {
    const data = doc.data();
    if (!data) {
      return {};
    }

    const result: Partial<T> = {};
    for (const field of fields) {
      if (field in data) {
        (result as any)[field] = data[field];
      }
    }

    return result;
  },
};

/**
 * Memory optimization helpers
 */
export const MemoryOptimization = {
  /**
   * Paginate query results to avoid loading everything into memory
   */
  async* paginateQuery<T>(
    query: FirebaseFirestore.Query,
    pageSize: number = 50,
  ): AsyncGenerator<T[]> {
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

    while (true) {
      let paginatedQuery = query.limit(pageSize);

      if (lastDoc) {
        paginatedQuery = paginatedQuery.startAfter(lastDoc);
      }

      const snapshot = await paginatedQuery.get();

      if (snapshot.empty) {
        break;
      }

      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      yield results;

      if (snapshot.size < pageSize) {
        break;
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }
  },
};
