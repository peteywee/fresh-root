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
0676386 test(batch): sync local test updates for batch route
6370fa7 chore(visuals): update index and metadata
79b50ff chore(visuals): auto-update architecture and repo state diagrams
da21c49 Merge pull request #129 from peteywee:fix/triad-remediation-quickpush
bef059a test(batch): update tests for timeout behavior
c37c8a4 chore(remediation): apply pending route and schema updates, header fixes
47d0abc chore(types): add standard header tags to schema files
dc32496 fix(onboarding): add Zod input 
```
