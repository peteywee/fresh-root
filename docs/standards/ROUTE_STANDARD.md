# Route Standard (v14.5)

**Intent**: Every API route must be defensible by default—authZ, tenant-guard, validated params/body, consistent error contracts, and basic traceability.

## Required Imports

- Response helpers: `_shared/response` → `jsonOk`, `jsonError`
- Guards: `_shared/security` or `_shared/middleware` (auth + same-org)
- Telemetry helper: `_shared/otel` → `traceFn` (optional no-op in dev)
- Rate limit helper for sensitive routes: `_shared/rateLimit`

## Required Shape

- Only export HTTP methods (GET/POST/PATCH/DELETE).
- Wrap each handler in `withGuards({ ... })`.
- Validate `[id]` params with zod: `z.string().min(1)`.
- Return `jsonOk(data)` on success; `jsonError(code, message, details?)` on failure.
- Ensure cross-org writes are blocked by default.

## Example

```ts
import { z } from "zod";
import { jsonOk, jsonError } from "@/app/api/_shared/response";
import { withGuards, sameOrgGuard, requireManager } from "@/app/api/_shared/security";
import { traceFn } from "@/app/api/_shared/otel";

const Params = z.object({ id: z.string().min(1) });

export const GET = withGuards(
  [sameOrgGuard, requireManager],
  traceFn("route:example:get")(async (req, { params }) => {
    const { id } = Params.parse(params);
    try {
      // ...domain logic...
      return jsonOk({ id });
    } catch (err: any) {
      return jsonError(500, "internal_error", { message: err?.message });
    }
  }),
);
```

Rate Limit Guidance

Apply on: /session, /auth/mfa/\*, /publish, /metrics, /onboarding/join-with-token.

Default window: 60s; burst per endpoint.

Telemetry

Set OTEL resource attrs via env: service.name=apps-web, service.version=<git SHA>.

Wrap top-level handler with traceFn("route:<name>:<verb>").
