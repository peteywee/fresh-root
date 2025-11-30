#!/usr/bin/env bash
# [P0][OOM][PREFLIGHT] Check memory before starting dev server
# Tags: monitoring, memory, preflight

set -euo pipefail

# Minimums
MIN_FREE_MB=1000
MIN_SWAP_MB=2000
RECOMMENDED_TOTAL_MB=8192

check_memory() {
  local free_mb total_mb swap_mb
  
  free_mb=$(free -m | awk 'NR==2{print $7}')
  total_mb=$(free -m | awk 'NR==2{print $2}')
  swap_mb=$(free -m | awk 'NR==3{print $2}')
  
  echo "System Memory Check"
  echo "==================="
  echo "Total RAM:        ${total_mb}MB"
  echo "Free RAM:         ${free_mb}MB"
  echo "Swap:             ${swap_mb}MB"
  echo ""
  
  # Check totals
  if [[ ${total_mb} -lt ${RECOMMENDED_TOTAL_MB} ]]; then
    echo "⚠️  WARNING: System has only ${total_mb}MB RAM (recommended: ${RECOMMENDED_TOTAL_MB}MB)"
    echo "   This system is undersized for development builds."
  fi
  
  # Check free memory
  if [[ ${free_mb} -lt ${MIN_FREE_MB} ]]; then
    echo "🔴 ERROR: Only ${free_mb}MB free (minimum: ${MIN_FREE_MB}MB)"
    echo "   Close unused applications and try again."
    return 1
  fi
  
  # Check swap
  if [[ ${swap_mb} -lt ${MIN_SWAP_MB} ]]; then
    echo "⚠️  WARNING: Swap only ${swap_mb}MB (recommended: ${MIN_SWAP_MB}MB)"
    echo "   Build may be slow or fail if memory pressure increases."
  fi
  
  if [[ ${free_mb} -ge ${MIN_FREE_MB} ]]; then
    echo "✅ Memory check PASSED"
    return 0
  fi
  
  return 1
}

check_processes() {
  echo ""
  echo "Active Processes (memory users)"
  echo "==============================="
  
  local large_procs
  large_procs=$(ps aux --sort=-%mem | head -8 | awk '{if (NR>1) printf "  %s (%s) - %sMB\n", $11, $2, int($6/1024)}')
  
  echo "${large_procs}"
}

check_swap() {
  echo ""
  echo "Swap Configuration"
  echo "=================="
  
  local swap_mb
  swap_mb=$(free -m | awk 'NR==3{print $2}')
  
  if [[ ${swap_mb} -eq 0 ]]; then
    echo "⚠️  No swap configured"
    echo "   Add at least 2GB swap to prevent OOM crashes:"
    echo "   sudo fallocate -l 2G /swapfile"
    echo "   sudo chmod 600 /swapfile"
    echo "   sudo mkswap /swapfile"
    echo "   sudo swapon /swapfile"
    return 1
  fi
  
  echo "✅ Swap available: ${swap_mb}MB"
  return 0
}

main() {
  echo ""
  
  if ! check_memory; then
    echo ""
    echo "❌ Memory check FAILED. Cannot proceed."
    return 1
  fi
  
  check_processes
  check_swap
  
  echo ""
  echo "✅ System ready for development"
  return 0
}

main "$@"
