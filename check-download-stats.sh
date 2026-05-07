#!/usr/bin/env bash
set -euo pipefail

STATS_TOKEN="$(security find-generic-password \
  -s 'G-Nosis API: ai-may-2026-brief-stats-token' \
  -a arjunc@g-nosis.com \
  -w)"

curl -fsS "https://ai.g-nosis.com/stats?token=${STATS_TOKEN}"
