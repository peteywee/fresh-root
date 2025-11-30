#!/usr/bin/env bash
# [P0][OOM][SAFEGUARD] Monitor and prevent Out of Memory crashes
# Tags: monitoring, memory, safeguard

set -euo pipefail

# Configuration
MEMORY_THRESHOLD_MB=1500          # Kill processes using >1.5GB individually
SYSTEM_THRESHOLD_MB=500            # Keep at least 500MB free
CHECK_INTERVAL_SECONDS=5
LOG_FILE="${HOME}/.oom-safeguard.log"

# Color output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

log() {
  local level="$1"
  shift
  local msg="$*"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[${timestamp}] [${level}] ${msg}" | tee -a "${LOG_FILE}"
}

get_memory_free_mb() {
  free -m | awk 'NR==2{print $7}'
}

get_process_memory_mb() {
  local pid="$1"
  ps -p "${pid}" -o rss= 2>/dev/null | awk '{print int($1/1024)}' || echo "0"
}

check_memory_pressure() {
  local free_mb
  free_mb=$(get_memory_free_mb)
  
  if [[ ${free_mb} -lt ${SYSTEM_THRESHOLD_MB} ]]; then
    log "CRITICAL" "System memory free: ${free_mb}MB (threshold: ${SYSTEM_THRESHOLD_MB}MB)"
    return 1
  fi
  
  return 0
}

kill_memory_hogs() {
  # Find processes using >MEMORY_THRESHOLD_MB
  local processes
  processes=$(ps aux --sort=-%mem | awk -v threshold="${MEMORY_THRESHOLD_MB}" '
    NR>1 {
      rss_mb = int($6 / 1024)
      if (rss_mb > threshold) {
        print $2, rss_mb, $11
      }
    }
  ')
  
  if [[ -z "${processes}" ]]; then
    return 0
  fi
  
  log "WARNING" "Found memory hogs:"
  while IFS= read -r pid mem cmd; do
    log "WARNING" "  PID ${pid}: ${cmd} using ${mem}MB"
    
    # Skip critical processes
    if [[ "${cmd}" == *"postgres"* ]] || [[ "${cmd}" == *"mysql"* ]]; then
      log "INFO" "Skipping critical process: ${cmd}"
      continue
    fi
    
    # Kill VSCode editors first (safest to restart)
    if [[ "${cmd}" == *"code"* ]] || [[ "${cmd}" == *"electron"* ]]; then
      log "WARNING" "Killing VSCode process ${pid} (${mem}MB)"
      kill -9 "${pid}" 2>/dev/null || true
      log "INFO" "Killed PID ${pid}"
    fi
  done <<< "${processes}"
}

monitor_pnpm_build() {
  # Watch for pnpm/node processes and cap their memory
  local pnpm_pids
  pnpm_pids=$(pgrep -f "pnpm|node" | head -20 || true)
  
  if [[ -z "${pnpm_pids}" ]]; then
    return 0
  fi
  
  while IFS= read -r pid; do
    local mem_mb
    mem_mb=$(get_process_memory_mb "${pid}")
    
    if [[ ${mem_mb} -gt ${MEMORY_THRESHOLD_MB} ]]; then
      log "WARNING" "pnpm/node process ${pid} using ${mem_mb}MB, limiting"
      
      # Try to send SIGTERM first
      kill -15 "${pid}" 2>/dev/null || true
      sleep 1
      
      # Force kill if still alive
      if ps -p "${pid}" > /dev/null 2>&1; then
        kill -9 "${pid}" 2>/dev/null || true
        log "INFO" "Force killed process ${pid}"
      fi
    fi
  done <<< "${pnpm_pids}"
}

main() {
  log "INFO" "OOM Safeguard started (threshold: ${MEMORY_THRESHOLD_MB}MB, check interval: ${CHECK_INTERVAL_SECONDS}s)"
  
  while true; do
    if ! check_memory_pressure; then
      log "CRITICAL" "Memory pressure detected, killing memory hogs"
      kill_memory_hogs
    fi
    
    monitor_pnpm_build
    
    sleep "${CHECK_INTERVAL_SECONDS}"
  done
}

main "$@"
