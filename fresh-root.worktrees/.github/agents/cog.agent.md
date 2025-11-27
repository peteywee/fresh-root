name: Global Cognition Agent
model: local-cli
description: "Repository-aware agent for Fresh Root. Runs doc-parity, test-presence, index checks and basic RBAC & pattern scans. See docs/agents/GLOBAL_COGNITION_AGENT.md for the operational spec."
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
