# REPOMIX System — Mermaid Diagrams

Visual representations of the REPOMIX 95/100 system using Mermaid.

---

## 1. System Architecture: 3-Trigger Cascade

```mermaid
graph TD
   TRIGGER 1: Pre-Push Hook<br/>(Local, 2-3 sec)"]
    B -->|TypeCheck| B1["✅ Validate TypeScript"]
    B -->|Lint| B2["✅ Check Code Style"]
    B -->|Repomix Check| B3["✅ Analyze Dependencies<br/>(non-blocking)"]
    B1 --> B4["Result: .repomix-cache.json"]
    B2 --> B4
    B3 --> B4
    
    B4 -->|push succeeds| C["TRIGGER 2: CI Pipeline<br/>(GitHub Actions, 0-10 sec)"]
    C -->|Generate| C1["📄 repomix-ci.json"]
    C -->|Generate| C2["📄 repomix-ci.md"]
    C -->|Generate| C3["📄 _index.md<br/>(NEW in 95%)"]
    C -->|Upload| C4["📦 Artifacts"]
    C -->|Post| C5["💬 PR Comment"]
    C1 --> C6["Result: Reports Available"]
    C2 --> C6
    C3 --> C6
    C4 --> C6
    C5 --> C6
    
    C6 -->|next day 2 AM UTC| D["TRIGGER 3: Nightly Dashboard<br/>(Scheduled, 10-15 sec)"]
    D -->|Generate| D1["📄 repomix-dashboard.md"]
    D -->|Generate| D2["📄 repomix-dashboard.json"]
    D -->|Sync| D3["🧭 _index.md FRESH"]
    D -->|Collect| D4["📊 Metrics"]
    D -->|Auto-commit| D5["✅ Push to Main"]
    D1 --> D6["✅ SELF-HEALED"]
    D2 --> D6
    D3 --> D6
    D4 --> D6
    D5 --> D6
    
    style B fill:#e1f5ff
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style D6 fill:#c8e6c9
