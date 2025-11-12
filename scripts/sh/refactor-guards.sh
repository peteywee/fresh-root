#!/usr/bin/env bash
set -euo pipefail

ROOT="apps/web/app/api"
DRY="${DRY:-1}" # set DRY=0 to write changes

add_line_if_missing() {
  local file="$1" line="$2"
  grep -qF "$line" "$file" || {
    if [[ "$DRY" == "0" ]]; then
      # insert after first import (fallback: top)
      awk -v ins="$line" '
        BEGIN{done=0}
        NR==1{print}
        NR>1 && done==0 && $0 !~ /^import / { print ins; done=1 }
        {print}
        END{ if(done==0) print ins }
      ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    else
      echo "[DRY] would add: $line -> $file"
    fi
  }
}

for f in $(find "$ROOT" -type f -name "route.ts" | sort); do
  add_line_if_missing "$f" 'import { jsonOk, jsonError } from "@/app/api/_shared/response";'
  add_line_if_missing "$f" 'import { withGuards } from "@/app/api/_shared/security";'
  add_line_if_missing "$f" 'import { traceFn } from "@/app/api/_shared/otel";'
done

echo "Done. Re-run with DRY=0 to apply changes."
