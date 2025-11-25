name: Global Cognition Agent
model: local-cli
description: "Repository-aware agent that verifies doc & test parity, scans for RBAC and rule violations, detects cross-layer pattern risks, and proposes minimal remediations. For LAW-level issues the agent raises an issue and halts remediation. See docs/agents/GLOBAL_COGNITION_AGENT.md for the operational spec."
target: repo
tools:
  - scripts/agent/agent.mjs
  - scripts/ci/check-doc-parity-simple.mjs
  - scripts/tests/verify-tests-present-simple.mjs
  - scripts/index/generate-file-index.sh
argument-hint: "node scripts/agent/agent.mjs --scope onboarding|scheduling|all --format json"
handoffs:
  - owner: team:foundation
  - contact: CODEOWNERS
