#!/usr/bin/env bash
# Counts payment requests and errors in the kk-payments logs and writes a summary file.
# Usage: monitoring/error-rate.sh [namespace] [threshold-percent]
set -euo pipefail

NAMESPACE="${1:-kijani-staging}"
THRESHOLD="${2:-20}"
OUT="$(dirname "$0")/summary.txt"

# last 1000 lines from every kk-payments Pod in that namespace
LOGS="$(kubectl logs -n "$NAMESPACE" -l app=kk-payments --tail=1000)"

# one "payment_" event is logged per payment request
TOTAL=$(printf '%s\n' "$LOGS" | grep -c '"event":"payment_' || true)
# every log line at level "error" counts as an error
ERRORS=$(printf '%s\n' "$LOGS" | grep -c '"level":"error"' || true)

if [ "$TOTAL" -eq 0 ]; then
  RATE="0.0"
  STATUS="NO_DATA"
else
  RATE=$(awk -v e="$ERRORS" -v t="$TOTAL" 'BEGIN { printf "%.1f", (e / t) * 100 }')
  STATUS=$(awk -v r="$RATE" -v th="$THRESHOLD" 'BEGIN { print (r > th) ? "HIGH" : "OK" }')
fi

{
  echo "checked_at:  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "namespace:   $NAMESPACE"
  echo "payments:    $TOTAL"
  echo "errors:      $ERRORS"
  echo "error_rate:  ${RATE}%"
  echo "threshold:   ${THRESHOLD}%"
  echo "status:      $STATUS"
} | tee "$OUT"