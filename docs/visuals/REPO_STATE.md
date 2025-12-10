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
- **Branch**: `dev`
- **Total Branches**: 2
- **Uncommitted Changes**: 0

## Recent Commits
```
11286fc Merge pull request #138 from peteywee/fix/triad-remediation
d08a70c test(batch): enhance tests with authenticated requests and timeout handling
6eabb04 chore(visuals): update index and metadata
05a6ab8 chore(visuals): auto-update architecture and repo state diagrams
f567860 chore(tests): resolve merge conflict in batch route tests during merge from fix/triad-remediation-quickpush
5156900 chore(visuals): update index and metadata
89e455b chore(visuals): auto-update architecture and repo s
```
