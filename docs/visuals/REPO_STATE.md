# Repository State

```mermaid
stateDiagram-v2
    [*] --> main: merge from dev<br/>(requires 2+ reviews)
    
    main --> main: production deployments<br/>(stable releases)
    
    main --> dev: synchronize
    
    dev --> dev: feature integration<br/>(active development)
    
    dev --> feature: create branch<br/>(feat/fix/chore)
    
    feature --> dev: PR → auto-delete<br/>(on merge)
    
    dev --> docs: archive push<br/>(test reports, logs)
    
    docs --> [*]: archive<br/>(no merge back)
    
    note right of main
        Production
        Always deployable
        2+ reviews
    end note
    
    note right of dev
        Development
        Active work
        Feature branches
    end note
    
    note right of docs
        Archive
        Tests, Logs, Docs
        Never merged
    end note
```

## Current State
- **Branch**: `main`
- **Total Branches**: 2
- **Uncommitted Changes**: 0

## Recent Commits
```
fe60df2 feat: complete SDK factory migration and add memory preservation system
8f5b829 feat(sdk): achieve 100% adoption and create indexable context documentation
b5e1c84 docs(memory): add Pattern Protocol institutional knowledge
2f16f81 feat(sdk): add comprehensive usage guide and code quality integration
8ff5d2f chore(visuals): update index and metadata
ea158f0 chore(visuals): auto-update architecture and repo state diagrams
214df7a refactor: rename variables for consistency across schedule a
```
