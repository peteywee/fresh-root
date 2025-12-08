---
title: Agent System Architecture - Visual Documentation
version: 1.0.0
date_created: 2025-12-08
status: Active
owner: TopShelfService LLC
tags: [visuals, architecture, agents, mermaid]
---

# Agent System Architecture

Visual documentation of the AI agent instruction system, workflow handoffs, and quality gates.

---

## 1. Instruction Hierarchy Mind Map

```mermaid
mindmap
  root((Agent Instruction System))
    Core Directive
      01_MASTER_AGENT_DIRECTIVE
        Hierarchy & Sequence
        Tool Usage Protocol
        TODO List Discipline
        Worker Spawning
        Error Pattern Detection
        Production Standards
      Binding Priority
        1. System Safety
        2. Constitution
        3. User Directive
        4. Prior Context
    Code Standards
      02_CODE_QUALITY_STANDARDS
        TypeScript 5.x Strict
        Object Calisthenics
        Self-Explanatory Code
        Performance Optimization
        No Magic Numbers
        DRY Principle
    Security Layer
      03_SECURITY_AND_SAFETY
        OWASP Top 10
        AI Prompt Safety
        Bias Mitigation
        Secret Management
        Input Validation
        Auth/AuthZ
    Framework Patterns
      04_FRAMEWORK_PATTERNS
        Next.js 16 App Router
        Firebase Admin SDK
        Tailwind CSS
        Monorepo Structure
        SDK Factory Pattern
        Zod-First Validation
    Testing & Review
      05_TESTING_AND_REVIEW
        Code Review Generic
        Playwright E2E
        Vitest Unit Tests
        Coverage Strategy
        Review Priorities
```

---

## 2. Red Team Handoff Workflow

```mermaid
flowchart TB
    subgraph Input["📥 User Request"]
        A[Non-Trivial Prompt]
    end

    subgraph Phase1["🤖 Primary Agent Response"]
        B[Context Saturation]
        C[Hierarchical Planning]
        D[Implementation]
        E[Initial Validation]
        B --> C --> D --> E
    end

    subgraph Phase2["🔴 Red Team Attack"]
        F[Security Analysis]
        G[Logic Verification]
        H[Pattern Compliance]
        I[Edge Case Detection]
        J[Vulnerability Scan]
        F & G & H & I & J --> K[Attack Report]
    end

    subgraph Phase3["👨‍💼 Sr Dev Review"]
        L[Correct Errors]
        M[Validate Fixes]
        N[Approve/Reject]
        K --> L --> M --> N
    end

    subgraph Output["📤 Final Delivery"]
        O[Vetted Response]
        P[Audit Trail]
        Q[Confidence Score]
    end

    A --> B
    E --> F
    N -->|Approved| O
    N -->|Rejected| D
    O --> P --> Q

    style Phase2 fill:#ffcccc,stroke:#cc0000
    style Phase3 fill:#ccffcc,stroke:#00cc00
```

---

## 3. Quality Gate Flow

```mermaid
flowchart LR
    subgraph Gates["Quality Gates (Ordered)"]
        direction TB
        G1[/"🔴 TIER 0: Security<br/>-25 pts each<br/>BLOCKS PR"/]
        G2[/"🟠 TIER 1: Integrity<br/>-10 pts each<br/>BLOCKS PR"/]
        G3[/"🟡 TIER 2: Architecture<br/>-2 pts each<br/>WARNING"/]
        G4[/"🟢 TIER 3: Style<br/>-0.5 pts each<br/>INFO"/]
    end

    subgraph Checks["Validation Checks"]
        C1[TypeScript Strict]
        C2[ESLint + Prettier]
        C3[Pattern Validator ≥90]
        C4[Unit Tests Pass]
        C5[Security Wrapper Present]
        C6[Zod Validation]
    end

    subgraph CI["CI Pipeline"]
        CI1[pnpm install]
        CI2[pnpm typecheck]
        CI3[pnpm lint]
        CI4[pnpm test]
        CI5[pnpm build]
        CI1 --> CI2 --> CI3 --> CI4 --> CI5
    end

    G1 --> C5 & C6
    G2 --> C1 & C4
    G3 --> C2 & C3
    G4 --> C3

    C1 & C2 & C3 & C4 --> CI

    style G1 fill:#ff6666,stroke:#cc0000,color:#fff
    style G2 fill:#ffaa66,stroke:#cc6600,color:#000
    style G3 fill:#ffff66,stroke:#cccc00,color:#000
    style G4 fill:#66ff66,stroke:#00cc00,color:#000
```

---

## 4. Instruction Loading Strategy

```mermaid
flowchart TD
    subgraph Trigger["File Context Detection"]
        T1{File Extension?}
        T2{Path Contains?}
        T3{Slash Command?}
    end

    subgraph Load["Dynamic Instruction Loading"]
        L1[01_MASTER<br/>Always Loaded]
        L2[02_CODE_QUALITY<br/>.ts .tsx .js .jsx]
        L3[03_SECURITY<br/>api/ auth/ security]
        L4[04_FRAMEWORK<br/>apps/ packages/]
        L5[05_TESTING<br/>test spec __tests__]
    end

    subgraph Context["Loaded Context"]
        C1[Minimal Token Usage]
        C2[Relevant Rules Only]
        C3[Fast Response Time]
    end

    T1 -->|*.ts| L2
    T1 -->|*.test.ts| L5
    T2 -->|api/| L3
    T2 -->|apps/| L4
    T3 -->|/audit| L3
    T3 -->|/red-team| L3 & L5

    L1 --> C1
    L2 & L3 & L4 & L5 --> C2
    C1 & C2 --> C3

    style L1 fill:#4a90d9,stroke:#2a70b9,color:#fff
```

---

## 5. CrewOps Swarm Protocol

```mermaid
flowchart TB
    subgraph Orchestrator["🎯 Orchestrator (Primary)"]
        O1[Route Tasks]
        O2[Arbitrate Conflicts]
        O3[Synthesize Results]
    end

    subgraph Workers["👥 Specialized Workers"]
        W1[📊 Research Analyst<br/>read_file, grep_search<br/>semantic_search, MCP]
        W2[🏗️ Systems Architect<br/>Design, Interfaces<br/>Pattern Compliance]
        W3[🔴 Security Red Team<br/>Threat Model<br/>VETO POWER]
        W4[✅ QA Engineer<br/>get_errors, tests<br/>GREEN GATES]
        W5[📝 Scribe<br/>Documentation<br/>Audit Trail]
    end

    subgraph Phases["📋 Execution Phases"]
        P1[Phase A: Context]
        P2[Phase B: Plan]
        P3[Phase C: Team]
        P4[Phase D: Execute]
        P5[Phase E: Validate]
    end

    O1 --> W1 & W2 & W3 & W4 & W5
    W1 --> P1
    W2 --> P2
    O1 --> P3
    W1 & W2 & W4 --> P4
    W3 & W4 --> P5
    P5 --> O2 --> O3

    style W3 fill:#ffcccc,stroke:#cc0000
    style W4 fill:#ccffcc,stroke:#00cc00
```

---

## 6. Slash Command Ecosystem

```mermaid
flowchart LR
    subgraph Commands["Slash Commands"]
        C1[/plan]
        C2[/implement]
        C3[/review]
        C4[/audit]
        C5[/red-team]
        C6[/document]
        C7[/test]
        C8[/deploy]
    end

    subgraph Workflows["Triggered Workflows"]
        W1[Create TODO List<br/>Design Architecture<br/>Map Dependencies]
        W2[Execute Plan<br/>Write Code<br/>Validate Changes]
        W3[Code Review<br/>Pattern Check<br/>Best Practices]
        W4[Security Audit<br/>OWASP Check<br/>Vulnerability Scan]
        W5[Red Team Attack<br/>Sr Dev Vetting<br/>Final Approval]
        W6[Diátaxis Framework<br/>API Docs<br/>README Updates]
        W7[Unit Tests<br/>E2E Tests<br/>Coverage Report]
        W8[Build<br/>Validate<br/>Push to Prod]
    end

    subgraph Instructions["Loaded Instructions"]
        I1[01_MASTER]
        I2[02_CODE_QUALITY]
        I3[03_SECURITY]
        I4[04_FRAMEWORK]
        I5[05_TESTING]
    end

    C1 --> W1 --> I1
    C2 --> W2 --> I1 & I2 & I4
    C3 --> W3 --> I1 & I2 & I5
    C4 --> W4 --> I1 & I3
    C5 --> W5 --> I1 & I3 & I5
    C6 --> W6 --> I1
    C7 --> W7 --> I1 & I5
    C8 --> W8 --> I1 & I4
```

---

## 7. Error Pattern Detection & Safeguard Creation

```mermaid
flowchart TD
    subgraph Detection["Error Detection"]
        E1[Error Occurrence 1]
        E2[Error Occurrence 2]
        E3[Error Occurrence 3+]
    end

    subgraph Analysis["Pattern Analysis"]
        A1[Document Error]
        A2[Compare to Previous]
        A3[Identify Root Cause]
    end

    subgraph Safeguards["Safeguard Creation"]
        S1[Code Rule<br/>CODING_RULES_AND_PATTERNS.md]
        S2[Automated Check<br/>CI Script / Lint Rule]
        S3[Type/Schema Rule<br/>tsconfig / Zod]
        S4[Test Case<br/>Regression Prevention]
    end

    subgraph Enforcement["Enforcement"]
        F1[Pre-Commit Hook]
        F2[CI/CD Pipeline]
        F3[Pattern Validator]
    end

    E1 --> A1 --> E2
    E2 --> A2 --> E3
    E3 --> A3 --> S1 & S2 & S3 & S4
    S1 & S2 & S3 & S4 --> F1 & F2 & F3

    style E3 fill:#ff6666,stroke:#cc0000,color:#fff
    style A3 fill:#ffaa66,stroke:#cc6600
```

---

## 8. Complete Agent System Architecture

```mermaid
graph TB
    subgraph User["👤 User Layer"]
        U1[User Prompt]
        U2[Slash Commands]
        U3[File Context]
    end

    subgraph Agent["🤖 Agent Layer"]
        subgraph Instructions["Instruction Files"]
            I1[01_MASTER_AGENT_DIRECTIVE]
            I2[02_CODE_QUALITY_STANDARDS]
            I3[03_SECURITY_AND_SAFETY]
            I4[04_FRAMEWORK_PATTERNS]
            I5[05_TESTING_AND_REVIEW]
        end

        subgraph Protocol["CrewOps Protocol"]
            P1[Constitution]
            P2[Swarm Protocol]
            P3[Phases A-E]
        end

        subgraph Workers["Worker Cabinet"]
            W1[Orchestrator]
            W2[Research]
            W3[Architect]
            W4[Red Team]
            W5[QA]
            W6[Scribe]
        end
    end

    subgraph Validation["✅ Validation Layer"]
        V1[Pattern Validator]
        V2[TypeScript Check]
        V3[ESLint/Prettier]
        V4[Unit Tests]
        V5[E2E Tests]
    end

    subgraph CI["🔧 CI/CD Layer"]
        CI1[GitHub Actions]
        CI2[Pre-Commit Hooks]
        CI3[Merge Gates]
    end

    subgraph Output["📤 Output Layer"]
        O1[Validated Code]
        O2[Documentation]
        O3[Audit Trail]
    end

    U1 & U2 & U3 --> Instructions
    Instructions --> Protocol
    Protocol --> Workers
    Workers --> Validation
    Validation --> CI
    CI --> Output

    I1 -.-> P1
    P2 -.-> W1
    W4 -.-> V1

    style W4 fill:#ffcccc,stroke:#cc0000
    style V1 fill:#ccffcc,stroke:#00cc00
```

---

## Diagram Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 Red Fill | Security/Critical (Blocking) |
| 🟠 Orange Fill | Integrity (Blocking) |
| 🟡 Yellow Fill | Warning (Non-Blocking) |
| 🟢 Green Fill | Success/Validation |
| 🔵 Blue Fill | Core/Always Loaded |
| Dashed Line | Dependency/Reference |
| Solid Line | Direct Flow |

---

**Last Updated**: December 8, 2025  
**Rendering**: GitHub, VS Code (Markdown Preview Mermaid Support), mermaid.live
