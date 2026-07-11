#!/usr/bin/env bun
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = homedir();
const DEFAULT_BACKUP_ROOT = join(HOME, ".codex", "backups");
const PLUGIN_DIRS = ["wystack-agent-kit"];

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function parseArgs(argv) {
  const args = {
    apply: false,
    backupRoot: join(DEFAULT_BACKUP_ROOT, `wystack-agent-kit-source-of-truth-${timestamp()}`),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") {
      args.apply = true;
    } else if (arg === "--backup-root") {
      args.backupRoot = argv[++i];
    } else if (arg.startsWith("--backup-root=")) {
      args.backupRoot = arg.slice("--backup-root=".length);
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  args.backupRoot = resolve(args.backupRoot.replace(/^~(?=\/|$)/, HOME));
  return args;
}

function printHelp() {
  console.log(`Usage: scripts/promote_codex_source_of_truth.js [options]

Promote this repo to the source of truth for overlapping Codex/agent skills.

Options:
  --apply                   Apply changes. Defaults to dry-run.
  --backup-root <path>      Backup root for replaced files/directories.`);
}

function skillNameForFile(skillFile) {
  const text = readFileSync(skillFile, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/m);
  if (match) {
    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/^name:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^\n#]+))\s*$/m);
    if (nameMatch) {
      return (nameMatch[1] ?? nameMatch[2] ?? nameMatch[3]).trim();
    }
  }
  return dirname(skillFile).split("/").pop();
}

function listSkillDirs(root) {
  if (!existsSync(root)) {
    return [];
  }
  return Array.from(new Bun.Glob("*/SKILL.md").scanSync({ cwd: root }))
    .sort()
    .map((skillFile) => {
      const fullPath = join(root, skillFile);
      return [skillNameForFile(fullPath), dirname(fullPath)];
    });
}

function listPluginManifests(repoRoot) {
  return readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => join(repoRoot, entry.name, ".codex-plugin", "plugin.json"))
    .filter((manifest) => existsSync(manifest))
    .sort();
}

function buildRepoSkillIndex() {
  const index = new Map();
  for (const manifest of listPluginManifests(join(REPO_ROOT, "plugins"))) {
    const pluginRoot = dirname(dirname(manifest));
    const pluginDir = pluginRoot.split("/").pop();
    if (!PLUGIN_DIRS.includes(pluginDir)) {
      continue;
    }
    const skillsRoot = join(pluginRoot, "skills");
    for (const [skillName, source] of listSkillDirs(skillsRoot)) {
      index.set(`${pluginDir}\0${skillName}`, source);
    }
  }
  return index;
}

function realpathOrNull(path) {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
}

function needsReplacement(destination, source) {
  if (existsSync(destination)) {
    const stat = lstatSync(destination);
    if (stat.isSymbolicLink()) {
      return realpathOrNull(destination) !== realpathOrNull(source);
    }
    return true;
  }
  return false;
}

function standaloneSkillPlans(repoIndex, backupRoot) {
  const plans = [];
  const repoBySkill = new Map();
  for (const [key, source] of repoIndex.entries()) {
    const [pluginName, skillName] = key.split("\0");
    repoBySkill.set(skillName, { pluginName, source });
  }

  for (const root of [join(HOME, ".codex", "skills"), join(HOME, ".agents", "skills")]) {
    for (const [skillName, destination] of listSkillDirs(root)) {
      const match = repoBySkill.get(skillName);
      if (!match || !needsReplacement(destination, match.source)) {
        continue;
      }
      plans.push({
        kind: "standalone-skill",
        destination,
        source: match.source,
        backupTarget: join(backupRoot, "standalone", relative(HOME, destination)),
        reason: `${skillName} should follow ${match.pluginName} in this repo`,
      });
    }
  }
  return plans;
}

function legacyWorkPluginPlans(repoIndex, backupRoot) {
  const plans = [];
  const legacyRoot = join(HOME, "plugins", "work", "skills");
  if (!existsSync(legacyRoot)) {
    return plans;
  }

  for (const [skillName, destination] of listSkillDirs(legacyRoot)) {
    const source = repoIndex.get(`wystack-agent-kit\0${skillName}`);
    if (!source || !needsReplacement(destination, source)) {
      continue;
    }
    plans.push({
      kind: "legacy-plugin-skill",
      destination,
      source,
      backupTarget: join(backupRoot, "plugins", "work", "skills", destination.split("/").pop()),
      reason: `legacy work/${skillName} should track wystack-agent-kit/${skillName}`,
    });
  }
  return plans;
}

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function moveToBackup(path, backupTarget) {
  ensureParent(backupTarget);
  renameSync(path, backupTarget);
}

function replaceWithSymlink(destination, source, backupTarget) {
  if (existsSync(destination)) {
    const stat = lstatSync(destination);
    if (stat.isSymbolicLink()) {
      if (realpathOrNull(destination) === realpathOrNull(source)) {
        return;
      }
      rmSync(destination, { force: true });
    } else {
      moveToBackup(destination, backupTarget);
    }
  }

  ensureParent(destination);
  symlinkSync(source, destination, "dir");
}

function describe(plans) {
  if (plans.length === 0) {
    return "No changes needed.";
  }
  return plans.flatMap((plan) => [
    `- ${plan.kind}: ${plan.destination} -> ${plan.source}`,
    `  backup: ${plan.backupTarget}`,
  ]).join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoIndex = buildRepoSkillIndex();
  const plans = [
    ...standaloneSkillPlans(repoIndex, args.backupRoot),
    ...legacyWorkPluginPlans(repoIndex, args.backupRoot),
  ];

  console.log("Repo source-of-truth promotion");
  console.log("------------------------------");
  console.log(`Mode: ${args.apply ? "apply" : "dry-run"}`);
  console.log(`Backup root: ${args.backupRoot}`);
  console.log(describe(plans));

  if (args.apply) {
    for (const plan of plans) {
      replaceWithSymlink(plan.destination, plan.source, plan.backupTarget);
    }
    console.log("\nDone.");
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
