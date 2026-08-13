#!/usr/bin/env bash
# Build Cowork-uploadable plugin zips into dist/.
# Stages the plugin exactly as named in source. The source plugin is already
# namespaced as `wystack-agent-kit`, so Cowork does not need an extra prefix.
#
# Usage: scripts/build-dist.sh [--deploy] [--no-zip] [plugin ...]   (default: all plugins, zip only)
#   --deploy  Also rsync the rewritten plugin into the Cowork marketplace dir:
#             ~/.claude/plugins/marketplaces/local-desktop-app-uploads/<plugin>/
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
  plugins=(wystack-agent-kit)
fi

deploy_root="$HOME/.claude/plugins/marketplaces/local-desktop-app-uploads"
marketplace_json="$deploy_root/.claude-plugin/marketplace.json"

mkdir -p dist
staging=dist/.staging
rm -rf "$staging"
mkdir -p "$staging"

for p in "${plugins[@]}"; do
  src="plugins/$p"
  if [ ! -f "$src/.claude-plugin/plugin.json" ]; then
    echo "skip: $src has no .claude-plugin/plugin.json" >&2
    continue
  fi

  prefixed="$p"
  dst="$staging/$prefixed"

  rsync -a --prune-empty-dirs \
    --exclude='.DS_Store' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.codex-plugin' \
    --exclude='.agents' \
    "$src/" "$dst/"

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
    bun --eval '
const [marketplacePath, pluginName, sourcePath, pluginManifestPath] = Bun.argv.slice(1);
const manifest = await Bun.file(pluginManifestPath).json();
let marketplace;
try {
  marketplace = await Bun.file(marketplacePath).json();
} catch {
  marketplace = {
    name: "local-desktop-app-uploads",
    version: "1.0.0",
    description: "Locally uploaded plugins via Claude Desktop app",
    owner: { name: "Local User" },
    plugins: [],
  };
}
const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
const nextEntry = {
  name: pluginName,
  version: manifest.version ?? "unknown",
  source: sourcePath,
};
const index = plugins.findIndex((plugin) => plugin.name === pluginName);
if (index >= 0) {
  plugins[index] = nextEntry;
} else {
  plugins.push(nextEntry);
}
marketplace.plugins = plugins;
await Bun.write(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`);
' "$marketplace_json" "$prefixed" "./$prefixed" "$target/.claude-plugin/plugin.json"
    printf "%-25s -> %s\n" "$prefixed" "$target"
  fi
done

rm -rf "$staging"
rm -f dist/engineering.zip dist/design.zip dist/wystack-wystack-agent-kit.zip 2>/dev/null || true
