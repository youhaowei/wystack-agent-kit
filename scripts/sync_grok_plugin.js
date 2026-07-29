#!/usr/bin/env bun
// Install / refresh the plugin into Grok Build.
//
// Grok loads plugins via `grok plugin install`. For a local path source, Grok
// records `source_path` and keeps skill/agent bodies live from that path
// (`grok plugin update` reports "local symlink, already live").
//
// Usage:
//   bun scripts/sync_grok_plugin.js [--plugin <name>] [--dry-run] [--apply]
//   (default plugin: wystack-agent-kit; default action: apply)

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

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
const manifest = join(src, ".grok-plugin", "plugin.json");
if (!existsSync(manifest)) {
  console.error(`no Grok plugin source at ${src} (missing .grok-plugin/plugin.json)`);
  process.exit(1);
}

const home = homedir();
const grokHome = join(home, ".grok");
if (!existsSync(grokHome)) {
  console.error(`Grok not detected (missing ${grokHome})`);
  process.exit(1);
}

const grokBin = process.env.GROK_BIN || "grok";
console.log(`plugin: ${plugin}`);
console.log(`source: ${src}`);
console.log(`grok:   ${grokBin}`);

function run(cmd, argv, { allowFail = false } = {}) {
  const result = spawnSync(cmd, argv, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) {
    console.error(`failed to spawn ${cmd}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0 && !allowFail) {
    const err = (result.stderr || result.stdout || "").trim();
    console.error(err || `${cmd} ${argv.join(" ")} exited ${result.status}`);
    process.exit(result.status ?? 1);
  }
  return result;
}

function combined(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

// Confirm the CLI is available before mutating anything.
const which = run(grokBin, ["--version"], { allowFail: true });
if (which.status !== 0) {
  console.error(`\`${grokBin}\` not on PATH — install Grok Build CLI first`);
  process.exit(1);
}
console.log((which.stdout || "").trim());

function isInstalledLocally() {
  const registryPath = join(home, ".grok", "installed-plugins", "registry.json");
  if (!existsSync(registryPath)) return false;
  try {
    const registry = JSON.parse(readFileSync(registryPath, "utf8"));
    for (const entry of Object.values(registry.repos || {})) {
      const sourcePath = entry?.kind?.source_path;
      const plugins = entry?.plugins || {};
      if (plugins[plugin] && sourcePath && resolve(sourcePath) === resolve(src)) {
        return true;
      }
      if (plugins[plugin]) return true; // installed under this name, any source
    }
  } catch {
    return false;
  }
  return false;
}

const already = isInstalledLocally();

if (dryRun) {
  console.log("dry-run: would run:");
  if (already) {
    console.log(`  ${grokBin} plugin update ${plugin}`);
  } else {
    console.log(`  ${grokBin} plugin install ${src} --trust`);
  }
  console.log(`  ${grokBin} plugin enable ${plugin}`);
  process.exit(0);
}

if (already) {
  console.log("plugin already installed — refreshing…");
  const update = run(grokBin, ["plugin", "update", plugin], { allowFail: true });
  if (combined(update).trim()) console.log(combined(update).trim());
  if (update.status !== 0) {
    // Fall through to install only if update truly failed and install is still needed.
    console.log(`note: update exited ${update.status}; trying install…`);
    const install = run(grokBin, ["plugin", "install", src, "--trust"], { allowFail: true });
    if (combined(install).trim()) console.log(combined(install).trim());
    const msg = combined(install);
    if (install.status !== 0 && !/already installed/i.test(msg)) {
      process.exit(install.status ?? 1);
    }
  }
} else {
  console.log("installing local plugin…");
  const install = run(grokBin, ["plugin", "install", src, "--trust"], { allowFail: true });
  if (combined(install).trim()) console.log(combined(install).trim());
  const msg = combined(install);
  if (install.status !== 0 && !/already installed/i.test(msg)) {
    process.exit(install.status ?? 1);
  }
}

console.log("ensuring plugin is enabled…");
const enable = run(grokBin, ["plugin", "enable", plugin], { allowFail: true });
if (combined(enable).trim()) console.log(combined(enable).trim());
if (enable.status !== 0) {
  console.log(`note: enable exited ${enable.status} (plugin may already be enabled)`);
}

const list = run(grokBin, ["plugin", "list"], { allowFail: true });
if ((list.stdout || "").trim()) console.log(list.stdout.trim());

console.log("done. Reload Grok (or start a new session) to pick up metadata changes.");
console.log("Skill/agent bodies are read live from source for local-path installs.");
