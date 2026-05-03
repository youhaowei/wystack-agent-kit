#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = homedir();
const DEFAULT_BACKUP_ROOT = join(HOME, ".codex", "backups");

const CODEX_ROOT = join(HOME, ".codex", "skills");
const AGENTS_ROOT = join(HOME, ".agents", "skills");
const CLAUDE_ROOT = join(HOME, ".claude", "skills");
const STANDALONE_ROOTS = [CODEX_ROOT, AGENTS_ROOT, CLAUDE_ROOT];
const LOCAL_PLUGIN_ROOT = join(HOME, "plugins");
const CLAUDE_INSTALLED_PLUGINS = join(HOME, ".claude", "plugins", "installed_plugins.json");
const CODEX_CONFIG = join(HOME, ".codex", "config.toml");
const SURFACES = { codex: CODEX_ROOT, agents: AGENTS_ROOT, claude: CLAUDE_ROOT };

const SHARED_GLOBAL_SKILLS = ["brainstorm", "fix", "qa", "refactor", "retro", "tdd", "verify"];
const ENGINEERING_PLUGIN_SKILLS = ["estimation", "push-pr", "git-cleanup", "git-worktrees", "finishing-branch"];

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function expandHome(path) {
  return resolve(path.replace(/^~(?=\/|$)/, HOME));
}

function parseOptions(argv, defaults = {}) {
  const args = { ...defaults, positional: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") {
      args.apply = true;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg.startsWith("--") && arg.includes("=")) {
      const [key, value] = arg.slice(2).split(/=(.*)/s);
      args[key.replaceAll("-", "_")] = value;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replaceAll("-", "_");
      args[key] = argv[++i];
    } else {
      args.positional.push(arg);
    }
  }
  return args;
}

function skillNameForFile(skillFile) {
  const text = readFileSync(skillFile, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/m);
  if (match) {
    const nameMatch = match[1].match(/^name:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^\n#]+))\s*$/m);
    if (nameMatch) {
      return (nameMatch[1] ?? nameMatch[2] ?? nameMatch[3]).trim();
    }
  }
  return dirname(skillFile).split("/").pop();
}

function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 12);
}

function digestForSkillDir(path) {
  const skill = join(path, "SKILL.md");
  return existsSync(skill) ? digestFile(skill) : null;
}

function listSkillFiles(root) {
  if (!existsSync(root)) {
    return [];
  }
  return Array.from(new Bun.Glob("*/SKILL.md").scanSync({ cwd: root })).sort().map((path) => join(root, path));
}

function listPluginManifests(root) {
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => join(root, entry.name, ".codex-plugin", "plugin.json"))
    .filter((manifest) => existsSync(manifest))
    .sort();
}

function discoverSkillDirs(root) {
  return listSkillFiles(root).map((skillFile) => [skillNameForFile(skillFile), dirname(skillFile)]);
}

function realpathOrNull(path) {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
}

function discoverSurface(root, surface) {
  const refs = new Map();
  for (const [name, path] of discoverSkillDirs(root)) {
    const digest = digestForSkillDir(path);
    if (!digest) {
      continue;
    }
    refs.set(dirname(path).split("/").pop(), {
      surface,
      path,
      digest,
      isSymlink: existsSync(path) && lstatSync(path).isSymbolicLink(),
      resolved: realpathOrNull(path),
      skillName: name,
    });
  }
  return refs;
}

function buildRepoSkillIndex(repoRoot) {
  const index = new Map();
  for (const manifest of listPluginManifests(repoRoot)) {
    const pluginRoot = dirname(dirname(manifest));
    const skillsRoot = join(pluginRoot, "skills");
    for (const [skillName, source] of discoverSkillDirs(skillsRoot)) {
      index.set(skillName, realpathOrNull(source) ?? source);
    }
  }
  return index;
}

function buildRepoPluginOverlapIndex(repoRoot) {
  const plugins = new Map();
  for (const manifest of listPluginManifests(repoRoot)) {
    const pluginRoot = dirname(dirname(manifest));
    const pluginName = pluginRoot.split("/").pop();
    const skills = [];
    for (const skillFile of listSkillFiles(join(pluginRoot, "skills"))) {
      skills.push({
        sourceType: "repo-plugin",
        sourceName: pluginName,
        skillName: skillNameForFile(skillFile),
        path: skillFile,
        digest: digestFile(skillFile),
      });
    }
    plugins.set(pluginName, skills);
  }
  return plugins;
}

function discoverHomeSkillRefs(root) {
  return listSkillFiles(root).map((skillFile) => ({
    sourceType: "standalone-skill",
    sourceName: root,
    skillName: skillNameForFile(skillFile),
    path: skillFile,
    digest: digestFile(skillFile),
  }));
}

function discoverInstalledPluginRefs(pluginsRoot, repoRoot) {
  const plugins = new Map();
  if (!existsSync(pluginsRoot)) {
    return plugins;
  }
  const repoReal = realpathOrNull(repoRoot);
  for (const pluginRoot of listPluginManifests(pluginsRoot).map((manifest) => dirname(dirname(manifest)))) {
    const resolved = realpathOrNull(pluginRoot);
    const pluginName = pluginRoot.split("/").pop();
    if (resolved === join(repoReal, pluginName)) {
      continue;
    }
    const skills = listSkillFiles(join(pluginRoot, "skills")).map((skillFile) => ({
      sourceType: "installed-plugin",
      sourceName: pluginName,
      skillName: skillNameForFile(skillFile),
      path: skillFile,
      digest: digestFile(skillFile),
    }));
    plugins.set(pluginName, skills);
  }
  return plugins;
}

function flattenPlugins(plugins) {
  return Array.from(plugins.values()).flat();
}

function compareOverlaps(repoPlugins, otherRefs) {
  const bySkill = new Map();
  for (const ref of otherRefs) {
    bySkill.set(ref.skillName, [...(bySkill.get(ref.skillName) ?? []), ref]);
  }
  const overlaps = new Map();
  for (const [pluginName, refs] of repoPlugins.entries()) {
    for (const ref of refs) {
      for (const other of bySkill.get(ref.skillName) ?? []) {
        overlaps.set(pluginName, [...(overlaps.get(pluginName) ?? []), [ref, other]]);
      }
    }
  }
  return overlaps;
}

function printOverlapSection(title, overlaps) {
  const total = Array.from(overlaps.values()).reduce((sum, refs) => sum + refs.length, 0);
  const lines = [`\n${title}`, "-".repeat(title.length)];
  if (total === 0) {
    lines.push("No overlaps found.");
    return lines.join("\n");
  }
  for (const pluginName of Array.from(overlaps.keys()).sort()) {
    lines.push(`${pluginName}:`);
    for (const [repoRef, otherRef] of overlaps.get(pluginName).sort((a, b) => a[0].skillName.localeCompare(b[0].skillName))) {
      const status = repoRef.digest === otherRef.digest ? "same" : "different";
      lines.push(`  - ${repoRef.skillName}: ${status} (${otherRef.sourceType} ${otherRef.sourceName})`);
      lines.push(`    repo:    ${repoRef.path}`);
      lines.push(`    current: ${otherRef.path}`);
    }
  }
  return lines.join("\n");
}

function codexLocalPluginsStatus(repoRoot) {
  return listPluginManifests(repoRoot).map((manifest) => {
    const pluginName = dirname(dirname(manifest)).split("/").pop();
    const localPlugin = join(LOCAL_PLUGIN_ROOT, pluginName);
    if (!existsSync(localPlugin)) {
      return `${pluginName}: missing from ${LOCAL_PLUGIN_ROOT}`;
    }
    const suffix = lstatSync(localPlugin).isSymbolicLink() ? ` -> ${realpathOrNull(localPlugin) ?? "<broken>"}` : "";
    return `${pluginName}: present at ${localPlugin}${suffix}`;
  });
}

function codexConfigStatus() {
  if (!existsSync(CODEX_CONFIG)) {
    return [`missing: ${CODEX_CONFIG}`];
  }
  const text = readFileSync(CODEX_CONFIG, "utf8");
  return ["engineering", "design"].map((pluginName) => {
    const pattern = new RegExp(`^\\[plugins\\."${pluginName}@youhaowei-local"\\]\\s*\\nenabled = true\\s*$`, "m");
    return `${pluginName}: ${pattern.test(text) ? "enabled" : "not enabled"} in ${CODEX_CONFIG}`;
  });
}

function claudePluginStatus() {
  if (!existsSync(CLAUDE_INSTALLED_PLUGINS)) {
    return [`missing: ${CLAUDE_INSTALLED_PLUGINS}`];
  }
  const data = JSON.parse(readFileSync(CLAUDE_INSTALLED_PLUGINS, "utf8"));
  const plugins = data.plugins ?? {};
  return ["engineering@wystack-plugins", "design@wystack-plugins"].map((key) => {
    const installs = plugins[key] ?? [];
    if (installs.length === 0) {
      return `${key}: not installed`;
    }
    return `${key}: installed at ${installs[0].installPath ?? "<unknown>"}`;
  });
}

function isRepoBackedSkill(destination, source) {
  return realpathOrNull(destination) === realpathOrNull(source);
}

function buildCleanupRepoBackedPlans(repoIndex, backupRoot) {
  const plans = [];
  for (const root of STANDALONE_ROOTS) {
    for (const [skillName, destination] of discoverSkillDirs(root)) {
      const source = repoIndex.get(skillName);
      if (!source || !isRepoBackedSkill(destination, source)) {
        continue;
      }
      plans.push({
        action: "remove-repo-backed-standalone",
        destination,
        source,
        backupTarget: join(backupRoot, "cleanup", relative(HOME, destination)),
        reason: "redundant repo-backed standalone skill",
      });
    }
  }
  return plans;
}

function canonicalForExactGroup(rows) {
  const bySurface = new Map(rows.map((row) => [row.surface, row]));
  const agents = bySurface.get("agents");
  if (agents) {
    return [agents.path, []];
  }

  const chosen = bySurface.get("codex") ?? rows[0];
  const destination = join(AGENTS_ROOT, chosen.path.split("/").pop());
  if (existsSync(destination)) {
    return [destination, []];
  }
  return [destination, [{
    action: "seed-agents-copy",
    destination,
    source: chosen.path,
    backupTarget: null,
    reason: "create shared canonical copy in ~/.agents/skills",
  }]];
}

function buildConsolidateExactPlans(backupRoot) {
  const surfaces = {
    codex: discoverSurface(CODEX_ROOT, "codex"),
    agents: discoverSurface(AGENTS_ROOT, "agents"),
    claude: discoverSurface(CLAUDE_ROOT, "claude"),
  };
  const allNames = Array.from(new Set(Object.values(surfaces).flatMap((refs) => Array.from(refs.keys())))).sort();
  const exact = [];
  const diverged = [];
  const plans = [];

  for (const name of allNames) {
    const rows = Object.values(surfaces).flatMap((refs) => refs.has(name) ? [refs.get(name)] : []);
    if (rows.length < 2) {
      continue;
    }
    const digests = new Set(rows.map((row) => row.digest));
    if (digests.size !== 1) {
      diverged.push([name, rows]);
      continue;
    }

    exact.push([name, rows]);
    const [canonical, seedPlans] = canonicalForExactGroup(rows);
    plans.push(...seedPlans);

    for (const row of rows) {
      if (row.surface === "agents" && canonical === row.path) {
        continue;
      }
      if (row.isSymlink && row.resolved === realpathOrNull(canonical)) {
        continue;
      }
      if (realpathOrNull(row.path) === realpathOrNull(canonical) && row.path === canonical) {
        continue;
      }
      plans.push({
        action: "relink-to-agents",
        destination: row.path,
        source: canonical,
        backupTarget: join(backupRoot, "shared", relative(HOME, row.path)),
        reason: "exact duplicate should use shared canonical source",
      });
    }
  }
  return [plans, exact, diverged];
}

function buildResolveAmbiguityPlans(backupRoot) {
  const plans = [];
  for (const name of SHARED_GLOBAL_SKILLS) {
    const codexSource = join(CODEX_ROOT, name);
    if (!existsSync(join(codexSource, "SKILL.md"))) {
      throw new Error(`missing canonical codex skill: ${codexSource}`);
    }

    const canonical = join(AGENTS_ROOT, name);
    if (!existsSync(join(canonical, "SKILL.md")) || realpathOrNull(canonical) !== realpathOrNull(codexSource)) {
      plans.push({
        action: "seed-shared-canonical",
        destination: canonical,
        source: codexSource,
        backupTarget: existsSync(canonical) ? join(backupRoot, "shared-canonical", relative(HOME, canonical)) : null,
        reason: "promote codex canonical into shared ~/.agents/skills",
      });
    }

    for (const surfaceName of ["codex", "claude"]) {
      const destination = join(SURFACES[surfaceName], name);
      if (existsSync(destination) && lstatSync(destination).isSymbolicLink() && realpathOrNull(destination) === realpathOrNull(canonical)) {
        continue;
      }
      plans.push({
        action: "relink-to-shared",
        destination,
        source: canonical,
        backupTarget: existsSync(destination) ? join(backupRoot, "shared-relinks", relative(HOME, destination)) : null,
        reason: "same skill name should resolve to one shared implementation",
      });
    }
  }

  for (const name of ENGINEERING_PLUGIN_SKILLS) {
    for (const [surfaceName, root] of Object.entries(SURFACES)) {
      const destination = join(root, name);
      if (!existsSync(destination)) {
        continue;
      }
      plans.push({
        action: "remove-standalone",
        destination,
        source: null,
        backupTarget: join(backupRoot, "engineering-moved", surfaceName, relative(HOME, destination)),
        reason: "engineering plugin now owns this workflow; remove standalone copy",
      });
    }
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
    if (lstatSync(destination).isSymbolicLink()) {
      rmSync(destination, { force: true });
    } else {
      if (!backupTarget) {
        throw new Error(`backup target required for ${destination}`);
      }
      moveToBackup(destination, backupTarget);
    }
  }
  ensureParent(destination);
  symlinkSync(source, destination, "dir");
}

function copySkillDir(source, destination) {
  ensureParent(destination);
  cpSync(source, destination, { recursive: true, verbatimSymlinks: true });
}

function applyPlans(plans) {
  for (const plan of plans) {
    if (["remove-repo-backed-standalone", "remove-standalone"].includes(plan.action)) {
      if (existsSync(plan.destination)) {
        if (lstatSync(plan.destination).isSymbolicLink()) {
          rmSync(plan.destination, { force: true });
        } else {
          if (!plan.backupTarget) {
            throw new Error(`backup target required for ${plan.destination}`);
          }
          moveToBackup(plan.destination, plan.backupTarget);
        }
      }
      continue;
    }

    if (["seed-agents-copy", "seed-shared-canonical"].includes(plan.action)) {
      if (existsSync(plan.destination)) {
        if (lstatSync(plan.destination).isSymbolicLink()) {
          rmSync(plan.destination, { force: true });
        } else if (plan.backupTarget) {
          moveToBackup(plan.destination, plan.backupTarget);
        } else {
          rmSync(plan.destination, { recursive: true, force: true });
        }
      }
      if (!plan.source) {
        throw new Error(`source required for ${plan.action}`);
      }
      copySkillDir(plan.source, plan.destination);
      continue;
    }

    if (["relink-to-agents", "relink-to-shared"].includes(plan.action)) {
      if (!plan.source) {
        throw new Error(`source required for ${plan.action}`);
      }
      replaceWithSymlink(plan.destination, plan.source, plan.backupTarget);
      continue;
    }

    throw new Error(`unknown action: ${plan.action}`);
  }
}

function describePlanList(plans) {
  if (plans.length === 0) {
    return "No changes needed.";
  }
  return plans.flatMap((plan) => {
    const lines = [`- ${plan.action}: ${plan.destination}${plan.source ? ` <- ${plan.source}` : ""}`];
    if (plan.backupTarget) {
      lines.push(`  backup: ${plan.backupTarget}`);
    }
    lines.push(`  reason: ${plan.reason}`);
    return lines;
  }).join("\n");
}

function commandAuditOverlaps(argv) {
  const args = parseOptions(argv, {
    repo_root: REPO_ROOT,
    plugins_root: LOCAL_PLUGIN_ROOT,
    codex_skills_root: CODEX_ROOT,
    agents_skills_root: AGENTS_ROOT,
    json: false,
  });
  const repoRoot = resolve(args.repo_root);
  const repoPlugins = buildRepoPluginOverlapIndex(repoRoot);
  const overlapCodex = compareOverlaps(repoPlugins, discoverHomeSkillRefs(expandHome(args.codex_skills_root)));
  const overlapAgents = compareOverlaps(repoPlugins, discoverHomeSkillRefs(expandHome(args.agents_skills_root)));
  const overlapPlugins = compareOverlaps(repoPlugins, flattenPlugins(discoverInstalledPluginRefs(expandHome(args.plugins_root), repoRoot)));

  if (args.json) {
    const serialize = (overlaps) => Object.fromEntries(Array.from(overlaps.entries()).map(([name, refs]) => [name, refs.map(([repoRef, otherRef]) => ({
      skill: repoRef.skillName,
      status: repoRef.digest === otherRef.digest ? "same" : "different",
      repo_path: repoRef.path,
      other_path: otherRef.path,
      other_source: otherRef.sourceName,
    }))]));
    console.log(JSON.stringify({
      repo_root: repoRoot,
      repo_plugins: Array.from(repoPlugins.keys()).sort(),
      overlaps: {
        codex_skills: serialize(overlapCodex),
        agents_skills: serialize(overlapAgents),
        installed_plugins: serialize(overlapPlugins),
      },
    }, null, 2));
    return;
  }

  console.log("Local skill overlap audit");
  console.log("-------------------------");
  console.log(printOverlapSection("Standalone Codex skills", overlapCodex));
  console.log(printOverlapSection("Standalone agent skills", overlapAgents));
  console.log(printOverlapSection("Installed home plugins", overlapPlugins));
}

function commandCleanupRepoBacked(argv) {
  const args = parseOptions(argv, {
    apply: false,
    backup_root: join(DEFAULT_BACKUP_ROOT, `wystack-plugins-cleanup-${timestamp()}`),
  });
  const backupRoot = expandHome(args.backup_root);
  const plans = buildCleanupRepoBackedPlans(buildRepoSkillIndex(REPO_ROOT), backupRoot);

  console.log("Local skill surface cleanup");
  console.log("---------------------------");
  console.log(`Mode: ${args.apply ? "apply" : "dry-run"}`);
  console.log(`Backup root: ${backupRoot}`);
  console.log("\nCodex local plugins");
  console.log("-------------------");
  console.log(codexLocalPluginsStatus(REPO_ROOT).join("\n"));
  console.log("\nCodex config");
  console.log("------------");
  console.log(codexConfigStatus().join("\n"));
  console.log("\nClaude plugins");
  console.log("--------------");
  console.log(claudePluginStatus().join("\n"));
  console.log("\nCleanup plan");
  console.log("------------");
  console.log(describePlanList(plans));
  if (args.apply) {
    applyPlans(plans);
    console.log("\nDone.");
  }
}

function commandConsolidateExact(argv) {
  const args = parseOptions(argv, {
    apply: false,
    backup_root: join(DEFAULT_BACKUP_ROOT, `shared-skills-cleanup-${timestamp()}`),
  });
  const backupRoot = expandHome(args.backup_root);
  const [plans, exact, diverged] = buildConsolidateExactPlans(backupRoot);

  console.log("Shared local skills consolidation");
  console.log("--------------------------------");
  console.log(`Mode: ${args.apply ? "apply" : "dry-run"}`);
  console.log(`Backup root: ${backupRoot}`);
  console.log(`Exact duplicate groups: ${exact.length}`);
  console.log(`Diverged groups left untouched: ${diverged.length}`);
  console.log(describePlanList(plans));
  if (args.apply) {
    applyPlans(plans);
    console.log("\nDone.");
  }
}

function commandResolveAmbiguity(argv) {
  const args = parseOptions(argv, {
    apply: false,
    backup_root: join(DEFAULT_BACKUP_ROOT, `remaining-skill-ambiguity-${timestamp()}`),
  });
  const backupRoot = expandHome(args.backup_root);
  const plans = buildResolveAmbiguityPlans(backupRoot);

  console.log("Remaining ambiguous skill cleanup");
  console.log("---------------------------------");
  console.log(`Mode: ${args.apply ? "apply" : "dry-run"}`);
  console.log(`Backup root: ${backupRoot}`);
  console.log(describePlanList(plans));
  if (args.apply) {
    applyPlans(plans);
    console.log("\nDone.");
  }
}

function printHelp() {
  console.log(`Usage: scripts/manage_local_skills.js <command> [options]

Commands:
  audit-overlaps
  cleanup-repo-backed
  consolidate-exact
  resolve-ambiguity`);
}

function main() {
  const [command, ...argv] = process.argv.slice(2);
  if (!command || command === "-h" || command === "--help") {
    printHelp();
    process.exit(command ? 0 : 2);
  }
  const commands = {
    "audit-overlaps": commandAuditOverlaps,
    "cleanup-repo-backed": commandCleanupRepoBacked,
    "consolidate-exact": commandConsolidateExact,
    "resolve-ambiguity": commandResolveAmbiguity,
  };
  const handler = commands[command];
  if (!handler) {
    throw new Error(`unknown command: ${command}`);
  }
  handler(argv);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
