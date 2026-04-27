#!/usr/bin/env bash
# Build Cowork-uploadable plugin zips into dist/.
# Applies a `wystack-` prefix to the plugin name inside the zip (plugin.json
# + every `<plugin>:` skill cross-reference in *.md), so Cowork doesn't see a
# name collision with Anthropic's built-in marketplace plugins.
# Source files are untouched; Claude Code CLI keeps using the bare names.
#
# Usage: scripts/build-dist.sh [--deploy] [--no-zip] [plugin ...]   (default: all plugins, zip only)
#   --deploy  Also rsync the rewritten plugin into the Cowork marketplace dir:
#             ~/.claude/plugins/marketplaces/local-desktop-app-uploads/wystack-<plugin>/
#             (Cowork picks it up on reload.)
#   --no-zip  Skip producing the dist/*.zip. Only meaningful with --deploy.

set -euo pipefail

cd "$(dirname "$0")/.."

deploy=0
no_zip=0
plugins=()
for arg in "$@"; do
  case "$arg" in
    --deploy) deploy=1 ;;
    --no-zip) no_zip=1 ;;
    --*)       echo "unknown flag: $arg" >&2; exit 2 ;;
    *)         plugins+=("$arg") ;;
  esac
done

if [ ${#plugins[@]} -eq 0 ]; then
  plugins=(engineering marketing design)
fi

deploy_root="$HOME/.claude/plugins/marketplaces/local-desktop-app-uploads"

mkdir -p dist
staging=dist/.staging
rm -rf "$staging"
mkdir -p "$staging"

for p in "${plugins[@]}"; do
  if [ ! -f "$p/.claude-plugin/plugin.json" ]; then
    echo "skip: $p has no .claude-plugin/plugin.json" >&2
    continue
  fi

  prefixed="wystack-$p"
  dst="$staging/$prefixed"

  rsync -a \
    --exclude='.DS_Store' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.codex-plugin' \
    --exclude='.agents' \
    "$p/" "$dst/"

  bun --eval '
const [path, newName] = Bun.argv.slice(1);
const manifest = await Bun.file(path).json();
manifest.name = newName;
await Bun.write(path, `${JSON.stringify(manifest, null, 2)}\n`);
' "$dst/.claude-plugin/plugin.json" "$prefixed"

  find "$dst" -type f -name '*.md' -print0 \
    | xargs -0 sed -i '' "s/\\([^a-zA-Z0-9_-]\\)$p:/\\1$prefixed:/g; s/^$p:/$prefixed:/g"

  if [ "$no_zip" -eq 0 ]; then
    rm -f "dist/$prefixed.zip"
    (cd "$staging" && zip -rq "../$prefixed.zip" "$prefixed")
    printf "%-25s %s\n" "$prefixed.zip" "$(du -h "dist/$prefixed.zip" | cut -f1)"
  fi

  if [ "$deploy" -eq 1 ]; then
    target="$deploy_root/$prefixed"
    mkdir -p "$target"
    rsync -a --delete \
      --exclude='.DS_Store' \
      "$dst/" "$target/"
    printf "%-25s -> %s\n" "$prefixed" "$target"
  fi
done

rm -rf "$staging"
rm -f dist/engineering.zip dist/marketing.zip dist/design.zip 2>/dev/null || true
