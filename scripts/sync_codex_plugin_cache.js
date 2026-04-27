#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, cpSync, lstatSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = homedir();
const DEFAULT_CACHE_ROOT = join(HOME, ".codex", "plugins", "cache", "youhaowei-local");
const PLUGIN_DIRS = ["engineering", "marketing", "design"];

function parseArgs(argv) {
  const args = {
    mode: "symlink",
    plugins: [],
    cacheRoot: DEFAULT_CACHE_ROOT,
    apply: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode") {
      args.mode = argv[++i];
    } else if (arg.startsWith("--mode=")) {
      args.mode = arg.slice("--mode=".length);
    } else if (arg === "--plugin") {
      args.plugins.push(argv[++i]);
    } else if (arg.startsWith("--plugin=")) {
      args.plugins.push(arg.slice("--plugin=".length));
    } else if (arg === "--cache-root") {
      args.cacheRoot = argv[++i];
    } else if (arg.startsWith("--cache-root=")) {
      args.cacheRoot = arg.slice("--cache-root=".length);
    } else if (arg === "--apply") {
      args.apply = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!["copy", "symlink"].includes(args.mode)) {
    throw new Error("--mode must be copy or symlink");
  }
  for (const plugin of args.plugins) {
    if (!PLUGIN_DIRS.includes(plugin)) {
      throw new Error(`--plugin must be one of: ${PLUGIN_DIRS.join(", ")}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: scripts/sync_codex_plugin_cache.js [options]

Refresh the local Codex plugin cache from this repo.

Options:
  --mode copy|symlink       Defaults to symlink.
  --plugin <name>           Limit sync to one plugin. Can be repeated.
  --cache-root <path>       Defaults to ~/.codex/plugins/cache/youhaowei-local.
  --apply                   Apply changes. Defaults to dry-run.
  --force                   Replace unmarked cache directories.`);
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function realpathIfExists(path) {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
}

function discoverPlugins(cacheRoot, names) {
  const selected = names.length > 0 ? names : PLUGIN_DIRS;
  return selected.map((pluginName) => {
    const source = resolve(REPO_ROOT, pluginName);
    const manifest = join(source, ".codex-plugin", "plugin.json");
    if (!existsSync(manifest)) {
      throw new Error(`Missing plugin manifest: ${manifest}`);
    }

    const payload = loadJson(manifest);
    if (payload.name !== pluginName) {
      throw new Error(`${manifest} name must be ${JSON.stringify(pluginName)}, found ${JSON.stringify(payload.name)}.`);
    }
    if (typeof payload.version !== "string" || payload.version.length === 0) {
      throw new Error(`${manifest} must include a non-empty string version.`);
    }

    return {
      name: pluginName,
      version: payload.version,
      source,
      destination: join(cacheRoot, pluginName, payload.version),
    };
  });
}

function isRepoBacked(destination, source) {
  if (!existsSync(destination)) {
    return true;
  }

  const stat = lstatSync(destination);
  if (stat.isSymbolicLink() && realpathIfExists(destination) === realpathIfExists(source)) {
    return true;
  }

  const marker = join(destination, ".codex-cache-source");
  if (!existsSync(marker)) {
    return false;
  }

  return resolve(readFileSync(marker, "utf8").trim()) === realpathIfExists(source);
}

function removeDestination(destination) {
  if (existsSync(destination)) {
    rmSync(destination, { recursive: true, force: true });
  }
}

function syncPlugin(plugin, mode, dryRun, force) {
  const repoBacked = isRepoBacked(plugin.destination, plugin.source);
  const action = mode === "symlink" ? "link" : "copy";

  if (dryRun) {
    if (!repoBacked && !force) {
      return `would skip: ${plugin.destination} is not marked as repo-backed; use --force to replace`;
    }
    return `would ${action}: ${plugin.destination} -> ${plugin.source}`;
  }

  if (!repoBacked && !force) {
    throw new Error(`${plugin.destination} is not marked as repo-backed. Use --force to replace it.`);
  }

  removeDestination(plugin.destination);
  mkdirSync(dirname(plugin.destination), { recursive: true });

  if (mode === "symlink") {
    symlinkSync(plugin.source, plugin.destination, "dir");
    return `linked: ${plugin.destination} -> ${plugin.source}`;
  }

  cpSync(plugin.source, plugin.destination, { recursive: true, verbatimSymlinks: true });
  writeFileSync(join(plugin.destination, ".codex-cache-source"), `${plugin.source}\n`);
  return `copied: ${plugin.source} -> ${plugin.destination}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cacheRoot = resolve(args.cacheRoot.replace(/^~(?=\/|$)/, HOME));
  const plugins = discoverPlugins(cacheRoot, args.plugins);

  console.log("Codex plugin cache sync");
  console.log("-----------------------");
  console.log(`Mode: ${args.mode}`);
  console.log(`Action: ${args.apply ? "apply" : "dry-run"}`);
  console.log(`Cache root: ${cacheRoot}`);

  for (const plugin of plugins) {
    console.log(syncPlugin(plugin, args.mode, !args.apply, args.force));
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
