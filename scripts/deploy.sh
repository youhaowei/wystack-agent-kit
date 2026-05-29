#!/usr/bin/env bash
# Deploy local plugin changes to every installed agent tool.
#
# Detects which tools are present (by their home dir) and deploys only to those
# — a missing tool is skipped with a note, never an error. Targets:
#   - Claude Cowork    (~/.claude/plugins/marketplaces/local-desktop-app-uploads)
#   - Claude Code CLI  (~/.claude/plugins/cache/local-desktop-app-uploads)
#   - Codex            (~/.codex)
#   - Cursor           (~/.cursor)
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
  plugins=(wystack-agent-kit)
fi

echo "Deploying plugins: ${plugins[*]}"

# Detect which tools are installed. A tool is "present" if its home dir exists.
# Cowork and Claude Code CLI both live under ~/.claude but are distinct targets:
# Cowork reads the marketplace dir, the CLI reads its own version-pinned cache.
have_cowork=0; [ -d "$HOME/.claude/plugins/marketplaces/local-desktop-app-uploads" ] && have_cowork=1
have_cc=0;     [ -d "$HOME/.claude/plugins/cache/local-desktop-app-uploads" ] && have_cc=1
have_codex=0;  [ -d "$HOME/.codex" ] && have_codex=1
have_cursor=0; [ -d "$HOME/.cursor" ] && have_cursor=1

echo "Detected: cowork=$have_cowork cc=$have_cc codex=$have_codex cursor=$have_cursor"
echo

if [ "$dry_run" -eq 1 ]; then
  if [ "$have_cowork" -eq 1 ]; then
    echo "Claude Cowork deploy preview:"
    echo "  ./scripts/build-dist.sh --deploy --no-zip ${plugins[*]}"
  else
    echo "Claude Cowork: not detected — skip"
  fi
  echo
  if [ "$have_codex" -eq 1 ]; then
    echo "Codex cache sync preview:"
    for plugin in "${plugins[@]}"; do
      bun scripts/sync_codex_plugin_cache.js --mode "$codex_mode" --plugin "$plugin" --force
    done
  else
    echo "Codex: not detected — skip"
  fi
  echo
  if [ "$have_cc" -eq 1 ]; then
    echo "Claude Code CLI cache symlink preview:"
    for plugin in "${plugins[@]}"; do
      bun scripts/sync_cc_plugin_cache.js --plugin "$plugin" --dry-run
    done
  else
    echo "Claude Code CLI: not detected — skip"
  fi
  echo
  if [ "$have_cursor" -eq 1 ]; then
    echo "Cursor plugin symlink preview:"
    for plugin in "${plugins[@]}"; do
      bun scripts/sync_cursor_plugin_cache.js --plugin "$plugin" --dry-run
    done
  else
    echo "Cursor: not detected — skip"
  fi
  exit 0
fi

if [ "$have_cowork" -eq 1 ]; then
  echo "Deploying to Claude Cowork..."
  ./scripts/build-dist.sh --deploy --no-zip "${plugins[@]}"
else
  echo "Claude Cowork not detected — skipping."
fi

echo
if [ "$have_codex" -eq 1 ]; then
  echo "Syncing Codex plugin cache..."
  for plugin in "${plugins[@]}"; do
    bun scripts/sync_codex_plugin_cache.js --mode "$codex_mode" --plugin "$plugin" --force --apply
  done
else
  echo "Codex not detected — skipping."
fi

echo
if [ "$have_cc" -eq 1 ]; then
  echo "Symlinking Claude Code CLI cache to live source..."
  for plugin in "${plugins[@]}"; do
    bun scripts/sync_cc_plugin_cache.js --plugin "$plugin" --apply
  done
else
  echo "Claude Code CLI not detected — skipping."
fi

echo
if [ "$have_cursor" -eq 1 ]; then
  echo "Symlinking Cursor local plugin to live source..."
  for plugin in "${plugins[@]}"; do
    bun scripts/sync_cursor_plugin_cache.js --plugin "$plugin" --apply
  done
else
  echo "Cursor not detected — skipping."
fi

echo
echo "Done. Reload Claude / Codex / Cursor to pick up changes."
