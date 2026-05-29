#!/usr/bin/env bun
// Symlink the Claude Code CLI plugin install-cache dir to live repo source.
//
// Claude Code installs wystack-agent-kit into a *version-pinned* cache dir:
//   ~/.claude/plugins/cache/local-desktop-app-uploads/wystack-agent-kit/<version>/
// `bun run deploy` updates the Cowork marketplace + Codex cache, but NOT this
// CC install cache — so the CLI keeps reading its old installed copy until a
// `/plugin` reinstall. This script points that dir at repo source so the CLI
// reads live files (same trick as Codex symlink mode).
//
// Idempotent: safe to run on every deploy. If a real (non-symlink) dir has
// reappeared (e.g. after a `/plugin` reinstall), it's backed up, not deleted.
//
// Usage:
//   bun scripts/sync_cc_plugin_cache.js [--plugin <name>] [--dry-run] [--apply]
//   (default plugin: wystack-agent-kit; default action: apply)

import { homedir } from "node:os";
import { join, resolve } from "node:path";
import {
  existsSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
  renameSync,
  readFileSync,
} from "node:fs";

const args = process.argv.slice(2);
let plugin = "wystack-agent-kit";
let dryRun = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--plugin") plugin = args[++i];
  else if (args[i] === "--dry-run") dryRun = true;
  else if (args[i] === "--apply") dryRun = false;
  else {
    console.error(`unknown arg: ${args[i]}`);
    process.exit(2);
  }
}

const repoRoot = resolve(import.meta.dir, "..");
const src = join(repoRoot, plugin);
if (!existsSync(join(src, ".claude-plugin", "plugin.json"))) {
  console.error(`no plugin source at ${src} (missing .claude-plugin/plugin.json)`);
  process.exit(1);
}

const home = homedir();
const installedPath = join(home, ".claude", "plugins", "installed_plugins.json");
const marketplace = "local-desktop-app-uploads";

// Resolve the version-pinned dir CC actually installed. Prefer the version
// recorded in installed_plugins.json; fall back to the source manifest version.
let version = null;
try {
  const installed = JSON.parse(readFileSync(installedPath, "utf8"));
  // Structure: { version, plugins: { "<plugin>@<marketplace>": [ { version, ... } ] } }
  const registry = installed.plugins ?? installed;
  const key = `${plugin}@${marketplace}`;
  const entries = registry[key];
  if (Array.isArray(entries) && entries.length > 0) {
    version = entries[0].version ?? null;
  }
} catch {
  // installed_plugins.json missing/unreadable — fall through to manifest
}
if (!version) {
  const manifest = JSON.parse(
    readFileSync(join(src, ".claude-plugin", "plugin.json"), "utf8"),
  );
  version = manifest.version;
}

const cacheDir = join(
  home,
  ".claude",
  "plugins",
  "cache",
  marketplace,
  plugin,
  version,
);

console.log(`plugin:  ${plugin}`);
console.log(`version: ${version}`);
console.log(`source:  ${src}`);
console.log(`target:  ${cacheDir}`);

// Already a correct symlink → nothing to do.
if (existsSync(cacheDir) && lstatSync(cacheDir).isSymbolicLink()) {
  const current = readlinkSync(cacheDir);
  if (resolve(current) === resolve(src)) {
    console.log("up to date (symlink already points at source)");
    process.exit(0);
  }
  console.log(`replacing stale symlink (-> ${current})`);
  if (!dryRun) unlinkSync(cacheDir);
}

// A real dir reappeared (fresh /plugin install) → back it up, don't delete.
if (existsSync(cacheDir) && !lstatSync(cacheDir).isSymbolicLink()) {
  const backup = `${cacheDir}.real-backup`;
  console.log(`backing up real install dir → ${backup}`);
  if (!dryRun) renameSync(cacheDir, backup);
}

if (dryRun) {
  console.log("dry-run: would symlink target -> source");
  process.exit(0);
}

symlinkSync(src, cacheDir);
console.log("symlinked target -> source");
