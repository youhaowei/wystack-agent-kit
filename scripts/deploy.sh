#!/usr/bin/env bash
# Deploy local plugin changes to both Claude Cowork and Codex.
#
# Usage:
#   bun deploy [plugin ...]
#   bun deploy --dry-run [plugin ...]
#   bun deploy --codex-mode copy [plugin ...]

set -euo pipefail

cd "$(dirname "$0")/.."

dry_run=0
codex_mode=symlink
plugins=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --codex-mode)
      if [ "$#" -lt 2 ]; then
        echo "--codex-mode requires copy or symlink" >&2
        exit 2
      fi
      codex_mode="$2"
      shift 2
      ;;
    --codex-mode=*)
      codex_mode="${1#*=}"
      shift
      ;;
    --*)
      echo "unknown flag: $1" >&2
      exit 2
      ;;
    *)
      plugins+=("$1")
      shift
      ;;
  esac
done

case "$codex_mode" in
  copy|symlink) ;;
  *)
    echo "--codex-mode must be copy or symlink" >&2
    exit 2
    ;;
esac

if [ ${#plugins[@]} -eq 0 ]; then
  plugins=(engineering marketing design)
fi

echo "Deploying plugins: ${plugins[*]}"
echo

if [ "$dry_run" -eq 1 ]; then
  echo "Claude Cowork deploy preview:"
  echo "  ./scripts/build-dist.sh --deploy --no-zip ${plugins[*]}"
  echo
  echo "Codex cache sync preview:"
  for plugin in "${plugins[@]}"; do
    bun scripts/sync_codex_plugin_cache.js \
      --mode "$codex_mode" \
      --plugin "$plugin" \
      --force
  done
  exit 0
fi

echo "Deploying to Claude Cowork..."
./scripts/build-dist.sh --deploy --no-zip "${plugins[@]}"

echo
echo "Syncing Codex plugin cache..."
for plugin in "${plugins[@]}"; do
  bun scripts/sync_codex_plugin_cache.js \
    --mode "$codex_mode" \
    --plugin "$plugin" \
    --force \
    --apply
done

echo
echo "Done. Reload Claude/Codex to pick up changed plugin metadata."
