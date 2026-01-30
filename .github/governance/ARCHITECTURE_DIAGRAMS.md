# Fresh Schedules Architecture Diagrams

## 1. New Orchestration Architecture (Post-CrewOps)

```mermaid
flowchart TB
    subgraph Trigger["Trigger Layer"]
        PR[PR Opened]
        Push[Push to Branch]
        Manual[Manual Dispatch]
    end

    subgraph Classify["Classification Layer"]
        Detector{Change Detector}
        Detector -->|Security Files| SecPipe[Security.*]
        Detector -->|Schema Files| SchemaPipe[Schema.*]
        Detector -->|1 File| FastPipe[*.FAST]
        Detector -->|2-5 Files| StdPipe[*.STANDARD]
        Detector -->|>5 Files| HeavyPipe[*.HEAVY]
    end

    subgraph Gates["Gate Layer"]
        Static[STATIC Gate]
        Correct[CORRECTNESS Gate]
        Safety[SAFETY Gate]
        Perf[PERF Gate]
        AI[AI Gate]
    end

    subgraph Verdict["Verdict Layer"]
        Pass[✅ PASS]
        Block[❌ BLOCK]
        Needs[⚠️ NEEDS_CHANGES]
    end

    Trigger --> Detector
    SecPipe & SchemaPipe & FastPipe & StdPipe & HeavyPipe --> Static
    Static -->|Pass| Correct
    Static -->|Fail| Block
    Correct -->|Pass| Safety
    Correct -->|Fail| Block
    Safety -->|Pass| Perf
    Safety -->|Fail| Block
    Perf -->|Pass| AI
    Perf -->|Advisory| AI
    AI --> Pass
    AI -->|Issues| Needs
```

## 2. Agent Interaction Model

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Inv as Invocation Parser
    participant Reg as Agent Registry
    participant Agent as Selected Agent
    participant Tools as Tool Layer
    participant Out as Output

    Dev->>Inv: @architect design TimeOff
    Inv->>Reg: parseInvocation()
    Reg->>Agent: ARCHITECT_CONTRACT
    Agent->>Tools: Load schemas, routes
    Tools-->>Agent: Context
    Agent->>Agent: Apply constraints
    Agent->>Agent: Generate artifacts
    Agent->>Out: Schema + API + Rules + Diagram
    Out-->>Dev: Structured response
```

## 3. Gate Execution Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> STATIC: Start Pipeline

    state STATIC {
        [*] --> lint
        lint --> format: Pass
        format --> typecheck: Pass
        typecheck --> [*]: Pass
        lint --> FAILED: Fail
        format --> FAILED: Fail
        typecheck --> FAILED: Fail
    }

    STATIC --> CORRECTNESS: All Pass
    STATIC --> BLOCKED: Any Fail

    state CORRECTNESS {
        [*] --> unit
        unit --> e2e: Pass
        e2e --> rules: Pass
        rules --> [*]: Pass
    }

    CORRECTNESS --> SAFETY: All Pass
    CORRECTNESS --> BLOCKED: Any Fail

    state SAFETY {
        [*] --> patterns
        patterns --> secrets: Pass
        secrets --> audit: Pass
        audit --> [*]: Pass/Advisory
    }

    SAFETY --> PERF: All Pass
    SAFETY --> BLOCKED: Critical Fail

    PERF --> PASSED: Complete

    BLOCKED --> [*]
    PASSED --> [*]
```

## 4. Protocol Hierarchy

```mermaid
graph TD
    subgraph Meta["Meta Layer"]
        M00[00_META_PROTOCOL]
    end

    subgraph Protocols["Protocol Layer"]
        P01[01_CLASSIFICATION]
        P02[02_PIPELINE]
        P03[03_GATE]
        P04[04_BATCH]
        P05[05_EMERGENCY]
    end

    subgraph Directives["Directive Layer"]
        D1[SR_DEV_DIRECTIVE]
        D2[BRANCH_DIRECTIVE]
        D3[SECURITY_DIRECTIVE]
        D4[DEPLOYMENT_DIRECTIVE]
    end

    subgraph Contracts["Contract Layer"]
        C1[AGENT_CONTRACTS]
        C2[TOOL_CONTRACTS]
        C3[API_CONTRACTS]
    end

    subgraph Indexes["Index Layer"]
        I1[QUICK_REFERENCE]
        I2[TOOL_REGISTRY]
        I3[PATTERN_CATALOG]
    end

    M00 --> P01 & P02 & P03 & P04 & P05
    P01 --> D1
    P02 --> D2
    P03 --> D3
    P04 --> D4
    D1 & D2 & D3 & D4 --> C1 & C2 & C3
    C1 & C2 & C3 --> I1 & I2 & I3
```

## 5. Data Flow: API Route Security Pattern

```mermaid
flowchart LR
    subgraph Client
        Req[Request]
    end

    subgraph APIRoute["API Route Layer"]
        Endpoint[createOrgEndpoint]
        Zod[Zod Validation]
        RBAC[Role Check]
        Handler[Handler Function]
    end

    subgraph Services["Service Layer"]
        SDK[SDK Wrapper]
        Admin[Firebase Admin]
    end

    subgraph Data["Data Layer"]
        Firestore[(Firestore)]
        Rules[Security Rules]
    end

    Req --> Endpoint
    Endpoint --> Zod
    Zod -->|Valid| RBAC
    Zod -->|Invalid| Err1[400 Error]
    RBAC -->|Authorized| Handler
    RBAC -->|Unauthorized| Err2[403 Error]
    Handler --> SDK
    SDK --> Admin
    Admin --> Rules
    Rules -->|Allow| Firestore
    Rules -->|Deny| Err3[Security Error]
    Firestore --> Handler
    Handler --> Res[Response]
```

## 6. Agent Decision Tree

```mermaid
flowchart TD
    Start[Receive Invocation] --> Parse{Parse Invocation}

    Parse -->|@architect| ArchQ{Has feature spec?}
    Parse -->|@refactor| RefQ{Has file path?}
    Parse -->|@guard| GuardQ{Has PR/diff?}
    Parse -->|@auditor| AuditQ{Has scope?}
    Parse -->|Unknown| Clarify[Request clarification]

    ArchQ -->|Yes| ArchLoad[Load schemas + routes]
    ArchQ -->|No| AskSpec[Ask for requirements]

    RefQ -->|Yes| RefLoad[Load file + patterns]
    RefQ -->|No| AskFile[Ask for file path]

    GuardQ -->|Yes| GuardLoad[Load diff + rules]
    GuardQ -->|No| AskPR[Ask for PR reference]

    AuditQ -->|Yes| AuditLoad[Load scope files]
    AuditQ -->|No| AuditFull[Default: full repo]

    ArchLoad --> ArchGen[Generate artifacts]
    RefLoad --> RefGen[Generate diff]
    GuardLoad --> GuardEval[Evaluate compliance]
    AuditLoad & AuditFull --> AuditScan[Scan & score]

    ArchGen --> ArchOut[Schema + API + Rules + Diagram]
    RefGen --> RefOut[Diff + Explanation]
    GuardEval --> GuardOut[Verdict + Violations]
    AuditScan --> AuditOut[Report + Metrics]
```

## 7. Branch Strategy

```mermaid
gitGraph
    commit id: "initial"
    branch dev
    checkout dev
    commit id: "dev-init"
    branch feature/FS-123-new-feature
    checkout feature/FS-123-new-feature
    commit id: "feat-1"
    commit id: "feat-2"
    checkout dev
    merge feature/FS-123-new-feature id: "squash-merge" type: HIGHLIGHT
    branch feature/FS-124-another
    checkout feature/FS-124-another
    commit id: "feat-3"
    checkout dev
    merge feature/FS-124-another id: "squash-merge-2"
    checkout main
    merge dev id: "release-1" tag: "v1.0.0" type: HIGHLIGHT
    checkout dev
    commit id: "post-release"
    checkout main
    branch hotfix/URGENT-fix
    commit id: "hotfix"
    checkout main
    merge hotfix/URGENT-fix id: "hotfix-merge" type: REVERSE
    checkout dev
    cherry-pick id: "cherry-pick-hotfix"
```

## 8. Pattern Compliance Scoring

```mermaid
pie title Pattern Compliance by Category
    "API Patterns" : 85
    "UI Patterns" : 90
    "Security Patterns" : 95
    "Type Patterns" : 80
    "Test Coverage" : 75
```

---

## Diagram Placement Guide

| Diagram                    | Location                             | Purpose                         |
| -------------------------- | ------------------------------------ | ------------------------------- |
| Orchestration Architecture | `docs/architecture/orchestration.md` | Overview of new pipeline system |
| Agent Interaction          | `docs/architecture/agents.md`        | How agents process requests     |
| Gate Execution             | `docs/architecture/gates.md`         | Gate state machine              |
| Protocol Hierarchy         | `docs/protocols/README.md`           | Document organization           |
| Data Flow                  | `docs/architecture/security.md`      | API security pattern            |
| Agent Decision Tree        | `docs/agents/README.md`              | Agent routing logic             |
| Branch Strategy            | `docs/git/branching.md`              | Git workflow                    |
| Compliance Scoring         | `docs/reports/compliance/`           | Audit reports                   |
