#!/usr/bin/env bash
set -euo pipefail
labels=(
  'security:#b60205'
  'observability:#5319e7'
  'data:#0e8a16'
  'rules:#0052cc'
  'ui:#1d76db'
  'ux:#c5def5'
  'e2e:#5319e7'
  'release:#f7c6c7'
  'backend:#d4c5f9'
  'frontend:#f9d0c4'
  'platform:#c2e0c6'
  'P0:#d73a4a'
  'P1:#fbca04'
  'P2:#0e8a16'
)
for l in "${labels[@]}"; do
  name="${l%%:*}"; color="${l##*:}"
  gh label create "$name" --color "$color" --force >/dev/null 2>&1 || true
done
echo "Labels ensured."
