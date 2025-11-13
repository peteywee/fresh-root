#!/usr/bin/env bash
# [P1][API][OTEL] Add Telemetry To Routes
# Tags: P1, API, OTEL
set -euo pipefail
# Auto-instrument Next.js route handlers with withTelemetry()
# - Adds import { withTelemetry } from "@/lib/telemetry";
# - Wraps exported GET/POST/PATCH/PUT/DELETE/OPTIONS handlers.
# - Creates .bak backups and supports DRYRUN=1 for preview.

ROOT="${1:-apps/web/app/api}"
DRYRUN="${DRYRUN:-0}"

# Compute an API route label from file path, e.g. apps/web/app/api/foo/[id]/route.ts -> /api/foo/:id
route_label() {
  local f="$1"
  local p="${f#apps/web/app}"            # strip prefix
  p="${p%/route.ts}"                     # drop suffix
  # convert [id] -> :id for readability
  p="$(echo "$p" | sed -E 's/\[([A-Za-z0-9_]+)\]/:\1/g')"
  echo "$p"
}

# Insert import if missing
ensure_import() {
  local file="$1"
  if ! grep -q 'from "@/lib/telemetry"' "$file"; then
    if [[ "$DRYRUN" == "1" ]]; then
      echo "[DRYRUN] add import to $file"
    else
      cp "$file" "$file.bak"
      # put after first import block or at top
      if grep -qE '^import ' "$file"; then
        awk 'BEGIN{added=0}
             {print}
             NR==1 && $0 ~ /^import / && added==0 { }
            ' "$file" > "$file.tmp" # placeholder to keep structure
      fi
      # Prepend cleanly (simpler and reliable)
      printf 'import { withTelemetry } from "@/lib/telemetry";\n' | cat - "$file" > "$file.tmp"
      mv "$file.tmp" "$file"
    fi
  fi
}

wrap_export_const() {
  local file="$1" route="$2" method="$3"
  # export const GET = async (...) => { ... }
  if grep -qE "export\s+const\s+${method}\s*=\s*async" "$file"; then
    if [[ "$DRYRUN" == "1" ]]; then
      echo "[DRYRUN] wrap export const $method in $file"
    else
      cp "$file" "$file.bak" 2>/dev/null || true
      # Rename to METHOD_impl and add wrapped export
      sed -i -E "s/export\s+const\s+${method}\s*=\s*async/const ${method}_impl = async/g" "$file"
      # Append wrapped export at end if not present
      if ! grep -q "export const ${method} = withTelemetry(${method}_impl" "$file"; then
        printf '\nexport const %s = withTelemetry(%s_impl, "%s");\n' "$method" "$method" "$route" >> "$file"
      fi
    fi
  fi
}

wrap_export_function() {
  local file="$1" route="$2" method="$3"
  # export async function GET(req: NextRequest) { ... }
  if grep -qE "export\s+async\s+function\s+${method}\s*\(" "$file"; then
    if [[ "$DRYRUN" == "1" ]]; then
      echo "[DRYRUN] wrap export function $method in $file"
    else
      cp "$file" "$file.bak" 2>/dev/null || true
      # Change declaration to const impl
      # Capture function signature line
      sig="$(grep -nE "export\s+async\s+function\s+${method}\s*\(" "$file" | head -n1 | cut -d: -f1)"
      if [[ -n "$sig" ]]; then
        # Replace the 'export async function METHOD' with 'const METHOD_impl = async'
        awk -v m="$method" -v line="$sig" 'NR==line { sub(/export[ ]+async[ ]+function[ ]+[^ (]+[ ]*\(/, "const " m "_impl = async ("); print; next } { print }' "$file" > "$file.tmp"
        mv "$file.tmp" "$file"
        # Add wrapped export at end if missing
        if ! grep -q "export const ${method} = withTelemetry(${method}_impl" "$file"; then
          printf '\nexport const %s = withTelemetry(%s_impl, "%s");\n' "$method" "$method" "$route" >> "$file"
        fi
      fi
    fi
  fi
}

process_file() {
  local f="$1"
  local route="$(route_label "$f")"
  ensure_import "$f"
  for m in GET POST PUT PATCH DELETE OPTIONS; do
    wrap_export_const "$f" "$route" "$m"
    wrap_export_function "$f" "$route" "$m"
  done
}

export -f route_label ensure_import wrap_export_const wrap_export_function process_file

# Iterate over all route.ts files
mapfile -t ROUTES < <(find "$ROOT" -type f -name "route.ts" | sort)
for f in "${ROUTES[@]}"; do
  process_file "$f"
done

echo "Done. Backups (*.bak) created where edits occurred. Use DRYRUN=1 to preview."
