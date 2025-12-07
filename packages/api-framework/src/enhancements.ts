// [P0][API][CODE] SDK Enhancements - Middleware Chain, Batch, Webhook, Idempotency
// Tags: P0, API, CODE, MIDDLEWARE, BATCH, WEBHOOK, IDEMPOTENCY

/**
 * @fresh-schedules/api-framework - Enhanced Capabilities
 *
 * This module extends the core SDK factory with advanced features:
 * - Request Middleware Chain
 * - Batch Operation Handler
 * - Response Transformation & Pagination
 * - Webhook Security Layer
 * - Idempotency Key Support
 *
 * @version 2.0.0
 * @since December 7, 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

import type { RequestContext, AuthContext, OrgContext, ApiError, ErrorCode } from "./index";

// =============================================================================
// ENHANCEMENT 1: REQUEST MIDDLEWARE CHAIN
// =============================================================================

/**
 * Middleware function signature for request processing chain
 *
 * Middleware can:
 * - Modify context (add custom data)
 * - Return early response (e.g., validation failure)
 * - Pass control to next middleware via next()
 *
 * @example
 * ```typescript
 * const validateQuota: Middleware = async ({ context, next }) => {
 *   const quota = await getQuota(context.org!.orgId);
 *   if (quota.exceeded) {
 *     return NextResponse.json({ error: 'Quota exceeded' }, { status: 402 });
 *   }
 *   return next();
 * };
 * ```
 */
export type Middleware<TInput = unknown> = (params: {
  request: NextRequest;
  input: TInput;
  context: RequestContext & { custom: Record<string, unknown> };
  params: Record<string, string>;
  next: () => Promise<NextResponse>;
}) => Promise<NextResponse>;

/**
 * Extended context with custom middleware data
 */
export interface ExtendedRequestContext extends RequestContext {
  custom: Record<string, unknown>;
}

/**
 * Middleware chain configuration for endpoints
 */
export interface MiddlewareConfig<TInput = unknown> {
  /** Array of middleware functions to execute in order */
  middleware: Middleware<TInput>[];
}

/**
 * Execute middleware chain in order, allowing early returns
 */
export async function executeMiddlewareChain<TInput>(
  middleware: Middleware<TInput>[],
  params: {
    request: NextRequest;
    input: TInput;
    context: ExtendedRequestContext;
    params: Record<string, string>;
  },
  finalHandler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  let index = 0;

  const executeNext = async (): Promise<NextResponse> => {
    if (index >= middleware.length) {
      return finalHandler();
    }

    const currentMiddleware = middleware[index];
    index++;

    return currentMiddleware({
      ...params,
      next: executeNext,
    });
  };

  return executeNext();
}

// =============================================================================
// ENHANCEMENT 2: BATCH OPERATION HANDLER
// =============================================================================

/**
 * Result of a single batch item operation
 */
export interface BatchItemResult<TOutput = unknown> {
  index: number;
  success: boolean;
  data?: TOutput;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Aggregated batch operation result
 */
export interface BatchResult<TOutput = unknown> {
  totalItems: number;
  successCount: number;
  failureCount: number;
  results: BatchItemResult<TOutput>[];
  partialSuccess: boolean;
}

/**
 * Configuration for batch endpoint operations
 */
export interface BatchEndpointConfig<TItem = unknown, TOutput = unknown> {
  /** Maximum number of items per batch request */
  maxBatchSize: number;

  /** Timeout per item in milliseconds (default: 5000) */
  timeoutPerItem?: number;

  /** Continue processing after item failure (default: true) */
  continueOnError?: boolean;

  /** Zod schema for each item in the batch */
  itemSchema?: ZodSchema<TItem>;

  /** Handler for processing a single item */
  itemHandler: (params: {
    item: TItem;
    index: number;
    context: RequestContext;
    request: NextRequest;
  }) => Promise<TOutput>;
}

/**
 * Process items with timeout protection
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Create a batch operation endpoint
 *
 * @example
 * ```typescript
 * export const POST = createBatchEndpoint({
 *   maxBatchSize: 100,
 *   timeoutPerItem: 1000,
 *   itemSchema: ShiftAssignmentSchema,
 *   itemHandler: async ({ item, context }) => {
 *     await assignShift(item.shiftId, item.staffId, context.org!.orgId);
 *     return { assigned: true };
 *   }
 * });
 * ```
 */
export function createBatchHandler<TItem, TOutput>(
  config: BatchEndpointConfig<TItem, TOutput>,
): (
  items: TItem[],
  context: RequestContext,
  request: NextRequest,
) => Promise<BatchResult<TOutput>> {
  const {
    maxBatchSize,
    timeoutPerItem = 5000,
    continueOnError = true,
    itemHandler,
  } = config;

  return async (items, context, request): Promise<BatchResult<TOutput>> => {
    // Validate batch size
    if (items.length > maxBatchSize) {
      throw new Error(`Batch size ${items.length} exceeds maximum ${maxBatchSize}`);
    }

    if (items.length === 0) {
      return {
        totalItems: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
        partialSuccess: false,
      };
    }

    const results: BatchItemResult<TOutput>[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        const data = await withTimeout(
          itemHandler({ item, index: i, context, request }),
          timeoutPerItem,
          `Item ${i} timed out after ${timeoutPerItem}ms`,
        );

        results.push({ index: i, success: true, data });
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          index: i,
          success: false,
          error: { code: "ITEM_FAILED", message: errorMessage },
        });
        failureCount++;

        if (!continueOnError) {
          // Mark remaining items as skipped
          for (let j = i + 1; j < items.length; j++) {
            results.push({
              index: j,
              success: false,
              error: { code: "SKIPPED", message: "Skipped due to previous failure" },
            });
            failureCount++;
          }
          break;
        }
      }
    }

    return {
      totalItems: items.length,
      successCount,
      failureCount,
      results,
      partialSuccess: successCount > 0 && failureCount > 0,
    };
  };
}

// =============================================================================
// ENHANCEMENT 3: RESPONSE TRANSFORMATION & PAGINATION
// =============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta: {
    requestId: string;
    durationMs: number;
  };
}

/**
 * Configuration for response transformation
 */
export interface ResponseConfig<TOutput = unknown> {
  /** Enable pagination (default: false) */
  paginate?: boolean;

  /** Default page size (default: 50) */
  pageSize?: number;

  /** Maximum page size (default: 100) */
  maxPageSize?: number;

  /** Output schema for validation/serialization */
  outputSchema?: ZodSchema<TOutput>;

  /** Transform function for output data */
  transform?: (data: TOutput) => unknown;
}

/**
 * Extract pagination params from request
 */
export function extractPaginationParams(
  request: NextRequest,
  config: ResponseConfig,
): { page: number; pageSize: number; offset: number } {
  const url = new URL(request.url);
  const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSizeParam = parseInt(
    url.searchParams.get("pageSize") || String(config.pageSize || 50),
    10,
  );

  const page = Math.max(1, pageParam);
  const pageSize = Math.min(Math.max(1, pageSizeParam), config.maxPageSize || 100);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  paginationParams: { page: number; pageSize: number },
  requestId: string,
  durationMs: number,
): PaginatedResponse<T> {
  const { page, pageSize } = paginationParams;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    meta: {
      requestId,
      durationMs,
    },
  };
}

// =============================================================================
// ENHANCEMENT 4: WEBHOOK SECURITY LAYER
// =============================================================================

/**
 * Webhook event structure
 */
export interface WebhookEvent<TPayload = unknown> {
  id: string;
  type: string;
  timestamp: number;
  payload: TPayload;
  signature?: string;
}

/**
 * Configuration for webhook endpoints
 */
export interface WebhookConfig<TPayload = unknown> {
  /** Secret key for signature verification */
  secret: string;

  /** Allowed event types */
  allowedEvents?: string[];

  /** Max age for replay protection in ms (default: 5 min) */
  maxAge?: number;

  /** Signature header name (default: x-webhook-signature) */
  signatureHeader?: string;

  /** Timestamp header name (default: x-webhook-timestamp) */
  timestampHeader?: string;

  /** Payload schema for validation */
  payloadSchema?: ZodSchema<TPayload>;
}

// In-memory store for processed webhook IDs (for replay protection)
const processedWebhooks = new Map<string, number>();

// Cleanup old entries periodically
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000; // 10 minutes
  for (const [id, timestamp] of processedWebhooks.entries()) {
    if (timestamp < cutoff) {
      processedWebhooks.delete(id);
    }
  }
}, 60 * 1000); // Every minute

/**
 * Compute HMAC-SHA256 signature
 */
async function computeSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify webhook signature and replay protection
 */
export async function verifyWebhook<TPayload>(
  request: NextRequest,
  config: WebhookConfig<TPayload>,
): Promise<{
  valid: boolean;
  event?: WebhookEvent<TPayload>;
  error?: string;
}> {
  const {
    secret,
    allowedEvents,
    maxAge = 5 * 60 * 1000, // 5 minutes
    signatureHeader = "x-webhook-signature",
    timestampHeader = "x-webhook-timestamp",
    payloadSchema,
  } = config;

  try {
    // 1. Extract headers
    const signature = request.headers.get(signatureHeader);
    const timestampStr = request.headers.get(timestampHeader);

    if (!signature) {
      return { valid: false, error: "Missing signature header" };
    }

    // 2. Parse body
    const body = await request.text();
    const event = JSON.parse(body) as WebhookEvent<TPayload>;

    // 3. Verify signature
    const expectedSignature = await computeSignature(body, secret);
    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature" };
    }

    // 4. Check timestamp for replay protection
    const timestamp = timestampStr ? parseInt(timestampStr, 10) : event.timestamp;
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      return { valid: false, error: `Webhook too old: ${age}ms > ${maxAge}ms` };
    }

    if (age < -60000) {
      // Allow 1 min clock skew
      return { valid: false, error: "Webhook timestamp in future" };
    }

    // 5. Check for replay
    if (processedWebhooks.has(event.id)) {
      return { valid: false, error: "Duplicate webhook (replay detected)" };
    }

    // 6. Check allowed events
    if (allowedEvents && !allowedEvents.includes(event.type)) {
      return { valid: false, error: `Event type not allowed: ${event.type}` };
    }

    // 7. Validate payload schema
    if (payloadSchema) {
      const result = payloadSchema.safeParse(event.payload);
      if (!result.success) {
        return { valid: false, error: `Invalid payload: ${result.error.message}` };
      }
      event.payload = result.data;
    }

    // 8. Mark as processed
    processedWebhooks.set(event.id, Date.now());

    return { valid: true, event };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Webhook verification failed",
    };
  }
}

/**
 * Create webhook endpoint factory
 *
 * @example
 * ```typescript
 * export const POST = createWebhookEndpoint({
 *   secret: process.env.WEBHOOK_SECRET!,
 *   allowedEvents: ['shift.created', 'shift.updated'],
 *   payloadSchema: ShiftEventSchema,
 *   handler: async ({ event }) => {
 *     await processShiftEvent(event);
 *     return NextResponse.json({ received: true });
 *   }
 * });
 * ```
 */
export function createWebhookEndpoint<TPayload = unknown>(
  config: WebhookConfig<TPayload> & {
    handler: (params: {
      event: WebhookEvent<TPayload>;
      request: NextRequest;
    }) => Promise<NextResponse>;
  },
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const requestId = crypto.randomUUID();

    // Verify webhook
    const verification = await verifyWebhook(request, config);

    if (!verification.valid) {
      return NextResponse.json(
        {
          error: {
            code: "WEBHOOK_INVALID",
            message: verification.error || "Webhook verification failed",
            requestId,
          },
        },
        { status: 401 },
      );
    }

    try {
      // Execute handler
      const response = await config.handler({
        event: verification.event!,
        request,
      });

      return response;
    } catch (error) {
      console.error(`[WEBHOOK ERROR] ${requestId}:`, error);

      return NextResponse.json(
        {
          error: {
            code: "WEBHOOK_PROCESSING_FAILED",
            message: error instanceof Error ? error.message : "Processing failed",
            requestId,
          },
        },
        { status: 500 },
      );
    }
  };
}

// =============================================================================
// ENHANCEMENT 5: IDEMPOTENCY KEY SUPPORT
// =============================================================================

/**
 * Cached idempotent response
 */
interface IdempotentRecord {
  response: {
    status: number;
    body: unknown;
    headers: Record<string, string>;
  };
  createdAt: number;
  expiresAt: number;
}

// In-memory idempotency store (use Redis in production)
const idempotencyStore = new Map<string, IdempotentRecord>();

// Cleanup expired records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (record.expiresAt < now) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 1000); // Every minute

/**
 * Configuration for idempotency
 */
export interface IdempotencyConfig {
  /** Header name for idempotency key (default: x-idempotency-key) */
  headerName?: string;

  /** TTL for cached responses in ms (default: 24 hours) */
  ttl?: number;

  /** Require idempotency key for all requests (default: false) */
  required?: boolean;

  /** Key generation function if header not provided */
  generateKey?: (request: NextRequest, context: RequestContext) => string;
}

/**
 * Extract or generate idempotency key
 */
export function getIdempotencyKey(
  request: NextRequest,
  context: RequestContext,
  config: IdempotencyConfig,
): string | null {
  const headerName = config.headerName || "x-idempotency-key";
  const fromHeader = request.headers.get(headerName);

  if (fromHeader) {
    return fromHeader;
  }

  if (config.generateKey) {
    return config.generateKey(request, context);
  }

  return null;
}

/**
 * Get cached idempotent response if exists
 */
export function getIdempotentResponse(key: string): NextResponse | null {
  const record = idempotencyStore.get(key);

  if (!record) {
    return null;
  }

  if (record.expiresAt < Date.now()) {
    idempotencyStore.delete(key);
    return null;
  }

  // Return cached response
  const response = NextResponse.json(record.response.body, {
    status: record.response.status,
    headers: {
      ...record.response.headers,
      "x-idempotent-replayed": "true",
    },
  });

  return response;
}

/**
 * Store idempotent response
 */
export function storeIdempotentResponse(
  key: string,
  response: NextResponse,
  ttl: number = 24 * 60 * 60 * 1000, // 24 hours
): void {
  // Clone and extract response data
  const cloneResponse = async () => {
    try {
      const body = await response.clone().json();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      idempotencyStore.set(key, {
        response: {
          status: response.status,
          body,
          headers,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl,
      });
    } catch {
      // Non-JSON response, don't cache
    }
  };

  // Store asynchronously
  cloneResponse();
}

/**
 * Idempotency wrapper for endpoint handlers
 *
 * @example
 * ```typescript
 * export const POST = createOrgEndpoint({
 *   idempotency: {
 *     required: true,
 *     ttl: 3600000 // 1 hour
 *   },
 *   handler: async ({ input, context }) => {
 *     // This will only execute once per idempotency key
 *     return await createPayment(input);
 *   }
 * });
 * ```
 */
export function withIdempotency<TOutput>(
  config: IdempotencyConfig,
  handler: (params: {
    request: NextRequest;
    context: RequestContext;
    idempotencyKey: string | null;
  }) => Promise<NextResponse<TOutput>>,
): (
  request: NextRequest,
  context: RequestContext,
) => Promise<NextResponse<TOutput | { error: ApiError }>> {
  return async (request, context) => {
    const key = getIdempotencyKey(request, context, config);

    // Check if required
    if (config.required && !key) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST" as ErrorCode,
            message: `Idempotency key required. Provide ${config.headerName || "x-idempotency-key"} header.`,
            requestId: context.requestId,
            retryable: false,
          },
        },
        { status: 400 },
      ) as NextResponse<{ error: ApiError }>;
    }

    // Check for cached response
    if (key) {
      const cached = getIdempotentResponse(key);
      if (cached) {
        return cached as NextResponse<TOutput>;
      }
    }

    // Execute handler
    const response = await handler({ request, context, idempotencyKey: key });

    // Store response for future requests
    if (key && response.status >= 200 && response.status < 300) {
      storeIdempotentResponse(key, response, config.ttl);
    }

    return response;
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  // Types re-exported for convenience
  type RequestContext,
  type AuthContext,
  type OrgContext,
  type ApiError,
  type ErrorCode,
};
