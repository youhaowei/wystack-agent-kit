#!/usr/bin/env bun
// Symlink the Cursor local-plugin dir to live repo source.
//
// Cursor loads local plugins from:
//   ~/.cursor/plugins/local/<plugin>/   (must contain .cursor-plugin/plugin.json)
// Cursor has no hot-reload — a restart is required to pick up changes, and the
// "Include third-party Plugins, Skills, and other configs" setting must be on.
// Symlinking to source means a restart always reads live files; no re-copy.
//
// Idempotent: safe to run on every deploy. If a real (non-symlink) dir is
// present (e.g. a prior copy-based install), it's backed up, not deleted.
//
// Usage:
//   bun scripts/sync_cursor_plugin_cache.js [--plugin <name>] [--dry-run] [--apply]
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
  mkdirSync,
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
const src = join(repoRoot, "plugins", plugin);
if (!existsSync(join(src, ".cursor-plugin", "plugin.json"))) {
  console.error(`no Cursor plugin source at ${src} (missing .cursor-plugin/plugin.json)`);
  process.exit(1);
}

const home = homedir();
const localDir = join(home, ".cursor", "plugins", "local");
const target = join(localDir, plugin);

console.log(`plugin: ${plugin}`);
console.log(`source: ${src}`);
console.log(`target: ${target}`);

// Already a correct symlink → nothing to do.
if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
  const current = readlinkSync(target);
  if (resolve(current) === resolve(src)) {
    console.log("up to date (symlink already points at source)");
    process.exit(0);
  }
  console.log(`replacing stale symlink (-> ${current})`);
  if (!dryRun) unlinkSync(target);
}

// A real dir is present (prior copy install) → back it up, don't delete.
if (existsSync(target) && !lstatSync(target).isSymbolicLink()) {
  const backup = `${target}.real-backup`;
  console.log(`backing up real install dir → ${backup}`);
  if (!dryRun) renameSync(target, backup);
}

if (dryRun) {
  console.log("dry-run: would symlink target -> source");
  process.exit(0);
}

mkdirSync(localDir, { recursive: true });
symlinkSync(src, target);
console.log("symlinked target -> source");
console.log("note: restart Cursor and ensure 'Include third-party Plugins' is enabled.");
