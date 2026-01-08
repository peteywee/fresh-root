# Architecture Diagram
```mermaid
graph TB
    subgraph apps["📱 Applications"]
        web["web (Next.js PWA)"]
    end

    subgraph packages["📦 Packages"]
        api["api-framework<br/>(SDK Factory)"]
        types["types<br/>(Zod Schemas)"]
        ui["ui<br/>(Components)"]
        config["config<br/>(Shared)"]
        rules["rules-tests<br/>(Firebase Rules)"]
    end

    subgraph services["🔥 Services"]
        firebase["Firebase<br/>(Admin SDK)"]
        emulator["Emulator<br/>(Local Dev)"]
    end

    subgraph infra["⚙️ Infrastructure"]
        workflows["GitHub Actions<br/>(CI/CD)"]
        hooks["Git Hooks<br/>(Pre-commit)"]
        rules-db["Firestore Rules<br/>(Security)"]
    end

    web -->|uses| api
    web -->|uses| types
    web -->|uses| ui
    web -->|uses| config
    api -->|uses| types
    api -->|uses| firebase
    api -->|validated by| rules-db
    rules -->|tests| rules-db
    workflows -->|runs| api
    workflows -->|runs| web
    hooks -->|validates| types
    emulator -->|simulates| firebase

    style web fill:#4f46e5,stroke:#312e81,color:#fff
    style api fill:#059669,stroke:#065f46,color:#fff
    style types fill:#7c3aed,stroke:#4c1d95,color:#fff
    style firebase fill:#f97316,stroke:#7c2d12,color:#fff
    style workflows fill:#06b6d4,stroke:#164e63,color:#fff
```

## Architecture Principles
- **Monorepo**: pnpm workspaces + Turbo
- **Type Safety**: Zod-first validation, TypeScript strict
- **SDK Factory**: Declarative API route pattern (90%+ coverage)
- **Organization Isolation**: All queries scoped to orgId
- **Security**: Multi-layer (rules, auth, RBAC, validation)
- **Testing**: Unit + Integration + E2E
