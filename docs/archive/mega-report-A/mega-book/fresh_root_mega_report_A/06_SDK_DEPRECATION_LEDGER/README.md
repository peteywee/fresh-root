# SDK & Deprecation Ledger

This directory tracks **what used to exist**, **why it was removed or refactored**, and **what
stable SDK surfaces replace it**.

This is how we protect knowledge when ripping out old code.

## Entry Format

Each legacy component should be captured like this:

```text
LEGACY_COMPONENT: [Name]
TYPE: [Function / Module / Route / React Component / etc.]
LOCATION_OLD: [Old path in repo]
REASON_REMOVED: [Why it was deleted or replaced]
RISK_IF_LOST: [What knowledge disappears if we forget it]

NEW_SDK_INTERFACE:
  NAME: [Package/Function/Class name]
  LOCATION_NEW: [New path or package]
  SURFACE:
    - [Method signatures]
    - [Events]
    - [Data contracts]

EXAMPLES:
  BEFORE_CODE: [Representative snippet of the old pattern]
  AFTER_CODE: [Representative snippet of the new pattern]

MIGRATION_NOTES:
  - [Steps taken to move from old to new]
  - [Tests added]
  - [Gotchas]
```

Documenting removed code in this way lets you safely refactor while **building reusable SDKs**
instead of losing hard-won structure.
