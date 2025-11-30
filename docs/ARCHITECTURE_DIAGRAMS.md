# Architecture Diagrams

Strategic visual representations of Fresh Schedules infrastructure, execution roadmap, and critical flows.

---

## 1. Strategic Execution Roadmap (Gantt)

**Timeline:** Phase -1 (Reality) → Phase 0 (Safety) → Phase 1 (Foundation) → Launch

```mermaid
gantt
    title Fresh Schedules: Survival and Scale Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %d

    section PHASE -1: REALITY
    Stop Coding - Code Freeze      :crit, done, 2025-11-30, 1d
    Customer Discovery - 5 Calls   :active, 2025-12-01, 7d
    Go or No-Go Decision           :milestone, 2025-12-08, 0d

    section PHASE 0: SAFETY - 1 Week
    Build Route Factory SDK        :2025-12-09, 3d
    Migrate Critical Routes        :2025-12-11, 3d
    Fix Onboarding Server-Side     :2025-12-12, 3d
    Delete Mock Data               :2025-12-14, 1d

    section PHASE 1: FOUNDATION - 2 Weeks
    Billing Logic Extraction       :2025-12-15, 4d
    Denormalization Triggers       :2025-12-18, 4d
    Integration Tests Jest         :2025-12-20, 5d

    section LAUNCH
    Deploy to Production           :milestone, 2025-12-30, 0d
```

---

## 2. Rate Limiting & Rate Limit Observability Architecture (Flowchart)

**System:** Dual-mode rate limiter with Redis (production) and in-memory fallback (dev)

```mermaid
flowchart TD
    A[API Request] --> B{Route Protected?}
    B -->|No| C[Pass Through]
    B -->|Yes| D[withRateLimit Wrapper]

    D --> E{Redis Available?}
    E -->|Yes - Production| F[Redis Rate Limiter]
    E -->|No - Dev/Local| G[In-Memory Rate Limiter]

    F --> H{Check Limit}
    G --> H

    H -->|Key Exists & Under Limit| I[Increment Counter]
    H -->|Key Exists & Over Limit| J[429 Too Many Requests]
    H -->|Key Missing| K[Create New Key<br/>with TTL]

    I --> L[Continue Handler]
    K --> L
    J --> M[Log Rate Limit Event<br/>with Span Attributes]

    L --> N[withSpan Wrapper<br/>Critical Logic]
    N --> O[Trace Attributes:<br/>orgId, userId, route]

    M --> P[Observable in Jaeger/Honeycomb]
    O --> P

    style F fill:#4CAF50
    style G fill:#2196F3
    style P fill:#FF9800
```

---

## 3. OpenTelemetry Tracing Hierarchy (Layered Spans)

**Observability:** Request span → Critical inner spans with attributes

```mermaid
graph TB
    A["HTTP Request<br/>Span Level: ROOT"] --> B["auth.requireSession<br/>Span"]
    A --> C["rbac.checkPermissions<br/>Span"]
    A --> D["Firestore Transaction<br/>Span"]
    A --> E["Denormalization Trigger<br/>Span"]

    B --> B1["Attributes:<br/>user.uid<br/>session.token"]
    C --> C1["Attributes:<br/>tenant.orgId<br/>user.role"]
    D --> D1["Attributes:<br/>collection.name<br/>operation.type"]
    E --> E1["Attributes:<br/>trigger.type<br/>doc.id"]

    B1 --> F["Trace to OTEL Backend<br/>Jaeger / Honeycomb"]
    C1 --> F
    D1 --> F
    E1 --> F

    F --> G["Search & Filter:<br/>by orgId, userId,<br/>route, latency"]

    style A fill:#FFE082
    style B fill:#81C784
    style C fill:#81C784
    style D fill:#81C784
    style E fill:#81C784
    style F fill:#FF9800
    style G fill:#FDD835
```

---

## 4. Production Validation & Environment Configuration (Sequence)

**Flow:** Build → Runtime → Validation → Operational Guarantee

```mermaid
sequenceDiagram
    participant Build as Build Phase
    participant Runtime as Runtime Init
    participant Env as Env Schema<br/>Zod Validation
    participant App as App Handler
    participant Prod as Production Check

    Build ->> Build: NEXT_PHASE=build<br/>(optional fields)
    Build -->> Runtime: Skip strict validation

    Runtime ->> Env: Load process.env
    Env ->> Env: Parse required fields:<br/>FIREBASE_PROJECT_ID

    Env ->> Runtime: Optional fields OK?<br/>REDIS_URL<br/>OTEL_EXPORTER_OTLP_ENDPOINT

    Runtime -->> App: ✅ Env validated<br/>Features gated

    App ->> Prod: Route handler fires
    Prod ->> Prod: assertProduction()?<br/>NODE_ENV=production

    alt Redis Available
        Prod ->> Prod: Use Redis rate limiter
    else Redis Missing
        Prod ->> Prod: Fallback to in-memory<br/>(single-instance only)
    end

    alt OTEL Endpoint Available
        Prod ->> Prod: Initialize OTEL SDK<br/>lazy-loaded
    else OTEL Missing
        Prod ->> Prod: Tracing no-ops<br/>but code continues
    end

    Prod -->> App: ✅ Production<br/>operational guarantee

    style Build fill:#90CAF9
    style Runtime fill:#81C784
    style Env fill:#FFB74D
    style Prod fill:#FF9800
```

---

## Key Takeaways

| Diagram                    | Purpose                                                | Usage                                               |
| -------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| **1. Gantt**               | Strategic timeline for phases and milestones           | Project planning, stakeholder alignment             |
| **2. Rate Limit Flow**     | How dual-mode rate limiting works with observability   | Engineering onboarding, debugging rate limit issues |
| **3. OTEL Spans**          | Hierarchical tracing and attribute collection          | Observability standard compliance, trace design     |
| **4. Validation Sequence** | Environment config lifecycle and production guarantees | Infrastructure validation, deployment checklist     |

---

## References

- **Rate Limiting:** `apps/web/src/lib/api/rate-limit.ts`
- **OTEL Initialization:** `apps/web/app/api/_shared/otel-init.ts`
- **Environment Validation:** `packages/env/src/index.ts`
- **Tracing Helpers:** `apps/web/app/api/_shared/otel.ts`
- **Observability Standard:** `docs/standards/OBSERVABILITY_AND_TRACING_STANDARD.md`
