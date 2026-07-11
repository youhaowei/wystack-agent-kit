#!/usr/bin/env bash
# Watch plugin sources and auto-deploy to Cowork marketplace dir on changes.
# Requires fswatch (macOS: brew install fswatch).
#
# Usage: scripts/watch-deploy.sh [plugin ...]   (default: all)

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v fswatch >/dev/null 2>&1; then
  echo "fswatch not found. Install with: brew install fswatch" >&2
  exit 1
fi

plugins=("$@")
if [ ${#plugins[@]} -eq 0 ]; then
  plugins=(wystack-agent-kit)
fi

echo "initial deploy..."
./scripts/build-dist.sh --deploy --no-zip "${plugins[@]}"

echo
echo "watching: ${plugins[*]} (Ctrl-C to stop)"
watch_paths=(); for p in "${plugins[@]}"; do watch_paths+=("plugins/$p"); done
fswatch -o --event Updated --event Created --event Removed --event Renamed "${watch_paths[@]}" \
  | while read -r _; do
      ts=$(date +%T)
      echo "[$ts] change — redeploying..."
      ./scripts/build-dist.sh --deploy --no-zip "${plugins[@]}" \
        || echo "[$ts] deploy failed (continuing)"
    done
