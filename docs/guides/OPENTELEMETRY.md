---
title: "OpenTelemetry Setup Guide"
description: "Setup and configuration guide for OpenTelemetry observability"
keywords:
  - opentelemetry
  - observability
  - monitoring
  - setup
category: "guide"
status: "active"
audience:
  - developers
  - operators
related-docs:
  - ../guides/MONITORING.md
  - ../standards/LOGGING.md
---

# OpenTelemetry Setup & Configuration Guide

**Last Updated**: 2025-12-26 **Status**: Production Ready **Related Issues**: #197 (OpenTelemetry
Tracing Implementation)

## Overview

Fresh Schedules uses OpenTelemetry for distributed tracing, providing visibility into:

- API request flows
- Service-to-service communication
- Performance bottlenecks
- Error propagation
- Dependency tracking

## Architecture

### Core Components

1. **OTLP HTTP Exporter** - Sends traces to observability backends
2. **NodeSDK** - OpenTelemetry instrumentation for Node.js
3. **Semantic Conventions** - Standardized attribute naming
4. **Trace Context Propagation** - Cross-service trace continuity

### Initialization Flow

```
instrumentation.ts (Next.js 16 hook)
  ↓
ensureOtelStarted() (idempotent, global singleton)
  ↓
NodeSDK.start()
  ↓
Traces exported to OTEL_EXPORTER_OTLP_ENDPOINT
```

## Configuration

### Environment Variables

#### Required for Tracing

```bash
# Enable distributed tracing
OBSERVABILITY_TRACES_ENABLED=true

# OTLP endpoint (HTTP)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

#### Optional

```bash
# Authentication headers (comma-separated key=value pairs)
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-key,x-tenant=your-tenant

# Service name (defaults to fresh-root-web-api)
OTEL_SERVICE_NAME=fresh-schedules-web

# Deployment environment (auto-detected from NODE_ENV)
DEPLOYMENT_ENVIRONMENT=production
```

### Backend Options

#### Option 1: Jaeger (Open Source)

**Best for**: Local development, self-hosted observability

**Setup**:

```bash
# Run Jaeger with Docker
docker run -d \
  --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 4318:4318 \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest

# Configure Fresh Schedules
OBSERVABILITY_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Access**: UI at <http://localhost:16686>

**Advantages**:

- ✅ Free and open source
- ✅ No external dependencies
- ✅ Great for development
- ✅ Simple setup

**Disadvantages**:

- ⚠️ Self-hosted infrastructure
- ⚠️ Limited advanced features
- ⚠️ Requires maintenance

#### Option 2: New Relic

**Best for**: Enterprise production, full-stack observability

**Setup**:

```bash
OBSERVABILITY_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net
OTEL_EXPORTER_OTLP_HEADERS=api-key=YOUR_LICENSE_KEY
```

**Advantages**:

- ✅ Fully managed
- ✅ Advanced analytics
- ✅ APM integration
- ✅ Alerting and dashboards

**Disadvantages**:

- ⚠️ Paid service
- ⚠️ Higher latency (external SaaS)

#### Option 3: Honeycomb

**Best for**: High-cardinality data, modern observability

**Setup**:

```bash
OBSERVABILITY_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY
```

**Advantages**:

- ✅ Excellent UX
- ✅ High-cardinality queries
- ✅ BubbleUp for anomaly detection
- ✅ Great for debugging

**Disadvantages**:

- ⚠️ Paid service
- ⚠️ Learning curve

#### Option 4: Grafana Tempo

**Best for**: Cost-effective, self-hosted, scales well

**Setup**:

```bash
# Run Tempo with Docker
docker run -d \
  --name tempo \
  -p 4318:4318 \
  grafana/tempo:latest

OBSERVABILITY_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Advantages**:

- ✅ Cost-effective (object storage)
- ✅ Scales horizontally
- ✅ Integrates with Grafana
- ✅ No sampling required

**Disadvantages**:

- ⚠️ Self-hosted
- ⚠️ Requires Grafana for visualization

## Usage

### Automatic Instrumentation

Most HTTP requests, database calls, and external API calls are automatically instrumented by the
OpenTelemetry SDK. No code changes needed.

**Instrumented automatically**:

- ✅ Next.js API routes
- ✅ HTTP client requests (fetch, axios)
- ✅ Database queries (if instrumented)
- ✅ External service calls

### Manual Instrumentation

For custom business logic or specific operations:

```typescript
import { withSpan } from "@/src/lib/otel";

export async function processSchedule(scheduleId: string) {
  return withSpan(
    "schedule.process",
    async () => {
      // Your business logic
      const schedule = await fetchSchedule(scheduleId);
      await validateSchedule(schedule);
      await publishSchedule(schedule);
      return schedule;
    },
    {
      // Custom attributes
      "schedule.id": scheduleId,
      "schedule.type": "weekly",
    },
  );
}
```

### Span Attributes

Standard attributes (automatically added):

- `service.name` - Service identifier
- `deployment.environment` - prod/staging/dev
- `http.method` - HTTP verb
- `http.route` - API route path
- `http.status_code` - Response status

Custom attributes (add as needed):

- `user.id` - Authenticated user
- `org.id` - Organization context
- `request.id` - Request identifier
- Business-specific attributes

## Monitoring & Alerts

### Key Metrics to Track

1. **Trace Completeness**
   - Metric: `traces_exported_total`
   - Alert: If <95% success rate

1. **Span Duration (p95, p99)**
   - Metric: `span_duration_milliseconds`
   - Alert: If p95 >500ms or p99 >1000ms

1. **Error Rate**
   - Metric: `spans_with_error_total / spans_total`
   - Alert: If >1% error rate

1. **Export Failures**
   - Metric: `trace_export_errors_total`
   - Alert: If >0 in 5 minutes

### Example Queries

**Jaeger UI**:

- Service: `fresh-root-web-api`
- Operation: `POST /api/schedules`
- Tags: `error=true`

**Grafana/Tempo**:

```promql
# 95th percentile latency
histogram_quantile(0.95, rate(traces_spanmetrics_latency_bucket[5m]))

# Error rate
sum(rate(traces_spanmetrics_calls_total{status_code="STATUS_CODE_ERROR"}[5m]))
/
sum(rate(traces_spanmetrics_calls_total[5m]))
```

## Troubleshooting

### Issue: "OpenTelemetry SDK not starting"

**Symptoms**: Logs show "OpenTelemetry SDK started" but no traces appear

**Causes**:

- `OBSERVABILITY_TRACES_ENABLED` not set to `true`
- `OTEL_EXPORTER_OTLP_ENDPOINT` not configured
- Backend endpoint unreachable

**Fixes**:

1. Check environment variables:

   ```bash
   echo $OBSERVABILITY_TRACES_ENABLED  # Must be "true"
   echo $OTEL_EXPORTER_OTLP_ENDPOINT   # Must be valid URL
   ```

1. Test endpoint connectivity:

   ```bash
   curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT \
     -H "Content-Type: application/json" \
     -d '{"test":"connection"}'
   ```

1. Check application logs for errors:

   ```bash
   grep -i "otel\|telemetry" logs/app.log
   ```

### Issue: "Traces not showing up in backend"

**Symptoms**: SDK starts successfully but traces don't appear in Jaeger/New Relic/etc.

**Causes**:

- Wrong endpoint URL
- Missing authentication headers
- Backend sampling configuration
- Network firewall blocking

**Fixes**:

1. Verify endpoint format:
   - Jaeger: `http://HOST:4318/v1/traces`
   - New Relic: `https://otlp.nr-data.net`
   - Honeycomb: `https://api.honeycomb.io`

1. Check authentication:

   ```bash
   # New Relic
   OTEL_EXPORTER_OTLP_HEADERS=api-key=YOUR_KEY

   # Honeycomb
   OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_KEY
   ```

1. Test with curl:

   ```bash
   curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT \
     -H "Content-Type: application/protobuf" \
     -H "$OTEL_EXPORTER_OTLP_HEADERS" \
     --data-binary @test-trace.pb
   ```

### Issue: "High latency from tracing"

**Symptoms**: API requests slower after enabling tracing

**Causes**:

- Synchronous export blocking requests
- Too many spans per trace
- Network latency to backend

**Fixes**:

1. Use async export (default in our setup)

1. Sample traces (reduce volume):

   ```typescript
   // In otel-init.ts
   import { ParentBasedSampler, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";

   sdk = new NodeSDK({
     sampler: new ParentBasedSampler({
       root: new TraceIdRatioBasedSampler(0.1), // 10% sampling
     }),
   });
   ```

1. Use local collector (reduces network hops):
   - Deploy OTEL Collector as sidecar
   - Point app to `http://localhost:4318`
   - Collector forwards to backend

### Issue: "Missing spans in trace"

**Symptoms**: Incomplete traces with gaps

**Causes**:

- Missing context propagation
- Async operations not awaited
- Errors not propagated

**Fixes**:

1. Ensure all async operations use `await`:

   ```typescript
   // ❌ Bad
   fetchData().then(process);

   // ✅ Good
   await fetchData().then(process);
   ```

1. Propagate context in callbacks:

   ```typescript
   import { context } from "@opentelemetry/api";

   setTimeout(() => {
     context.with(context.active(), () => {
       // Work here will be part of parent trace
     });
   }, 1000);
   ```

## Best Practices

### Development

1. **Use Jaeger locally**
   - Run with Docker Compose
   - Enable tracing in `.env.local`
   - Browse traces at <http://localhost:16686>

1. **Test trace propagation**
   - Make multi-service calls
   - Verify complete trace in UI
   - Check span relationships

1. **Add custom attributes**
   - Include business context
   - Make debugging easier
   - Enable better filtering

### Staging

1. **Use production backend**
   - New Relic, Honeycomb, or Tempo
   - Same config as production
   - Test alerting rules

1. **Enable sampling**
   - 100% in staging (lower volume)
   - Test sampling logic

1. **Load test with tracing**
   - Verify performance impact
   - Monitor export throughput
   - Check backend ingestion

### Production

1. **Always enable tracing**
   - `OBSERVABILITY_TRACES_ENABLED=true`
   - Configure backend endpoint
   - Set up alerts

1. **Use appropriate sampling**
   - 10-20% for high-volume APIs
   - 100% for critical paths
   - Error-based sampling

1. **Monitor export health**
   - Track `trace_export_errors_total`
   - Alert on failures
   - Have fallback plan

1. **Secure credentials**
   - Never hardcode API keys
   - Use secrets manager
   - Rotate regularly

## Performance Impact

**Expected overhead**:

- CPU: <5% increase
- Memory: ~50MB additional
- Latency: <10ms per request
- Network: ~1KB per trace

**Tuning for scale**:

- Sample traces (10-20% for high volume)
- Use batch exporting (default)
- Deploy local OTEL Collector
- Use gzip compression (default)

## Related Documentation

- [Environment Validation](../apps/web/src/lib/env.server.ts)
- [Memory Management](../reference/MEMORY_MANAGEMENT.md)
- [Issue #197](../archived/issues/ISSUE_196_STATUS_UPDATE.md)
- [Strategic Audit TODOs](../reports/STRATEGIC_AUDIT_TODOS.md)

## Support

**Issues**: Create GitHub issue with label `observability` **Questions**: Contact DevOps team
**Escalation**: On-call rotation

---

**Last Updated**: 2025-12-26 **Maintained By**: DevOps & Observability Team **Review Frequency**:
Quarterly or after infrastructure changes
