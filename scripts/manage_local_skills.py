#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home()
DEFAULT_BACKUP_ROOT = HOME / ".codex" / "backups"

CODEX_ROOT = HOME / ".codex" / "skills"
AGENTS_ROOT = HOME / ".agents" / "skills"
CLAUDE_ROOT = HOME / ".claude" / "skills"
STANDALONE_ROOTS = (CODEX_ROOT, AGENTS_ROOT, CLAUDE_ROOT)
LOCAL_PLUGIN_ROOT = HOME / "plugins"
CLAUDE_INSTALLED_PLUGINS = HOME / ".claude" / "plugins" / "installed_plugins.json"
CODEX_CONFIG = HOME / ".codex" / "config.toml"

SHARED_GLOBAL_SKILLS = (
    "brainstorm",
    "fix",
    "qa",
    "refactor",
    "retro",
    "tdd",
    "verify",
)

ENGINEERING_PLUGIN_SKILLS = (
    "estimation",
    "push-pr",
    "git-cleanup",
    "git-worktrees",
    "finishing-branch",
)

SURFACES = {
    "codex": CODEX_ROOT,
    "agents": AGENTS_ROOT,
    "claude": CLAUDE_ROOT,
}


@dataclass(frozen=True)
class SkillRef:
    surface: str
    path: Path
    digest: str
    is_symlink: bool
    resolved: Path


@dataclass(frozen=True)
class OverlapRef:
    source_type: str
    source_name: str
    skill_name: str
    path: Path
    digest: str


@dataclass(frozen=True)
class Plan:
    action: str
    destination: Path
    source: Path | None
    backup_target: Path | None
    reason: str


def timestamp() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def skill_name_for_file(skill_file: Path) -> str:
    text = skill_file.read_text()
    match = re.search(r"(?ms)^---\n(.*?)\n---", text)
    if match:
        frontmatter = match.group(1)
        name_match = re.search(
            r'^name:\s*(?:"([^"\n]+)"|\'([^\'\n]+)\'|([^\n#]+))\s*$',
            frontmatter,
            re.MULTILINE,
        )
        if name_match:
            return next(group for group in name_match.groups() if group is not None).strip()
    return skill_file.parent.name


def digest_for_skill_dir(path: Path) -> str | None:
    skill = path / "SKILL.md"
    if not skill.exists():
        return None
    return hashlib.sha256(skill.read_bytes()).hexdigest()[:12]


def discover_surface(root: Path, surface: str) -> dict[str, SkillRef]:
    refs: dict[str, SkillRef] = {}
    if not root.exists():
        return refs
    for entry in sorted(root.iterdir()):
        if not (entry / "SKILL.md").exists():
            continue
        digest = digest_for_skill_dir(entry)
        if digest is None:
            continue
        refs[entry.name] = SkillRef(
            surface=surface,
            path=entry,
            digest=digest,
            is_symlink=entry.is_symlink(),
            resolved=entry.resolve(),
        )
    return refs


def discover_skill_dirs(root: Path) -> list[tuple[str, Path]]:
    refs: list[tuple[str, Path]] = []
    if not root.exists():
        return refs
    for skill_file in sorted(root.glob("*/SKILL.md")):
        refs.append((skill_name_for_file(skill_file), skill_file.parent))
    return refs


def move_to_backup(path: Path, backup_target: Path) -> None:
    ensure_parent(backup_target)
    shutil.move(str(path), str(backup_target))


def copy_skill_dir(source: Path, destination: Path) -> None:
    ensure_parent(destination)
    shutil.copytree(source, destination, symlinks=True)


def replace_with_symlink(destination: Path, source: Path, backup_target: Path | None) -> None:
    if destination.is_symlink():
        destination.unlink()
    elif destination.exists():
        if backup_target is None:
            raise ValueError(f"backup target required for {destination}")
        move_to_backup(destination, backup_target)
    ensure_parent(destination)
    os.symlink(source, destination)


def build_repo_skill_index(repo_root: Path) -> dict[str, Path]:
    index: dict[str, Path] = {}
    for manifest in sorted(repo_root.glob("*/.codex-plugin/plugin.json")):
        plugin_root = manifest.parent.parent
        for skill_file in sorted((plugin_root / "skills").glob("*/SKILL.md")):
            index[skill_name_for_file(skill_file)] = skill_file.parent.resolve()
    return index


def build_repo_plugin_overlap_index(repo_root: Path) -> dict[str, list[OverlapRef]]:
    plugins: dict[str, list[OverlapRef]] = {}
    for manifest in sorted(repo_root.glob("*/.codex-plugin/plugin.json")):
        plugin_root = manifest.parent.parent
        plugin_name = plugin_root.name
        skills: list[OverlapRef] = []
        for skill_file in sorted((plugin_root / "skills").glob("*/SKILL.md")):
            skills.append(
                OverlapRef(
                    source_type="repo-plugin",
                    source_name=plugin_name,
                    skill_name=skill_name_for_file(skill_file),
                    path=skill_file,
                    digest=hashlib.sha256(skill_file.read_bytes()).hexdigest()[:12],
                )
            )
        plugins[plugin_name] = skills
    return plugins


def discover_home_skill_refs(root: Path) -> list[OverlapRef]:
    refs: list[OverlapRef] = []
    if not root.exists():
        return refs
    source_name = str(root)
    for skill_file in sorted(root.glob("*/SKILL.md")):
        refs.append(
            OverlapRef(
                source_type="standalone-skill",
                source_name=source_name,
                skill_name=skill_name_for_file(skill_file),
                path=skill_file,
                digest=hashlib.sha256(skill_file.read_bytes()).hexdigest()[:12],
            )
        )
    return refs


def discover_installed_plugin_refs(plugins_root: Path, repo_root: Path) -> dict[str, list[OverlapRef]]:
    plugins: dict[str, list[OverlapRef]] = {}
    if not plugins_root.exists():
        return plugins

    repo_real = repo_root.resolve()
    for plugin_root in sorted(plugins_root.iterdir()):
        manifest = plugin_root / ".codex-plugin" / "plugin.json"
        if not manifest.exists():
            continue
        try:
            resolved = plugin_root.resolve()
        except FileNotFoundError:
            continue
        if resolved == repo_real / plugin_root.name:
            continue

        plugin_name = plugin_root.name
        skills: list[OverlapRef] = []
        for skill_file in sorted((plugin_root / "skills").glob("*/SKILL.md")):
            skills.append(
                OverlapRef(
                    source_type="installed-plugin",
                    source_name=plugin_name,
                    skill_name=skill_name_for_file(skill_file),
                    path=skill_file,
                    digest=hashlib.sha256(skill_file.read_bytes()).hexdigest()[:12],
                )
            )
        plugins[plugin_name] = skills
    return plugins


def compare_overlaps(repo_plugins: dict[str, list[OverlapRef]], other_refs: list[OverlapRef]) -> dict[str, list[tuple[OverlapRef, OverlapRef]]]:
    by_skill: dict[str, list[OverlapRef]] = {}
    for ref in other_refs:
        by_skill.setdefault(ref.skill_name, []).append(ref)

    overlaps: dict[str, list[tuple[OverlapRef, OverlapRef]]] = {}
    for plugin_name, refs in repo_plugins.items():
        for ref in refs:
            for other in by_skill.get(ref.skill_name, []):
                overlaps.setdefault(plugin_name, []).append((ref, other))
    return overlaps


def flatten_plugins(plugins: dict[str, list[OverlapRef]]) -> list[OverlapRef]:
    refs: list[OverlapRef] = []
    for group in plugins.values():
        refs.extend(group)
    return refs


def print_overlap_section(title: str, overlaps: dict[str, list[tuple[OverlapRef, OverlapRef]]]) -> str:
    total = sum(len(v) for v in overlaps.values())
    lines = [f"\n{title}", "-" * len(title)]
    if total == 0:
        lines.append("No overlaps found.")
        return "\n".join(lines)

    for plugin_name in sorted(overlaps):
        lines.append(f"{plugin_name}:")
        for repo_ref, other_ref in sorted(overlaps[plugin_name], key=lambda pair: pair[0].skill_name):
            status = "same" if repo_ref.digest == other_ref.digest else "different"
            lines.append(f"  - {repo_ref.skill_name}: {status} ({other_ref.source_type} {other_ref.source_name})")
            lines.append(f"    repo:    {repo_ref.path}")
            lines.append(f"    current: {other_ref.path}")
    return "\n".join(lines)


def codex_local_plugins_status(repo_root: Path) -> list[str]:
    statuses: list[str] = []
    for plugin_root in sorted(repo_root.glob("*/.codex-plugin/plugin.json")):
        plugin_name = plugin_root.parent.parent.name
        local_plugin = LOCAL_PLUGIN_ROOT / plugin_name
        if local_plugin.exists():
            try:
                resolved = local_plugin.resolve()
                suffix = f" -> {resolved}" if local_plugin.is_symlink() else ""
            except FileNotFoundError:
                suffix = " -> <broken>"
            statuses.append(f"{plugin_name}: present at {local_plugin}{suffix}")
        else:
            statuses.append(f"{plugin_name}: missing from {LOCAL_PLUGIN_ROOT}")
    return statuses


def codex_config_status() -> list[str]:
    statuses: list[str] = []
    if not CODEX_CONFIG.exists():
        return [f"missing: {CODEX_CONFIG}"]
    text = CODEX_CONFIG.read_text()
    for plugin_name in ("engineering", "marketing", "design"):
        pattern = rf'^\[plugins\."{plugin_name}@youhaowei-local"\]\s*\nenabled = true\s*$'
        enabled = re.search(pattern, text, re.MULTILINE) is not None
        statuses.append(f"{plugin_name}: {'enabled' if enabled else 'not enabled'} in {CODEX_CONFIG}")
    return statuses


def claude_plugin_status() -> list[str]:
    statuses: list[str] = []
    if not CLAUDE_INSTALLED_PLUGINS.exists():
        return [f"missing: {CLAUDE_INSTALLED_PLUGINS}"]
    data = json.loads(CLAUDE_INSTALLED_PLUGINS.read_text())
    plugins = data.get("plugins", {})
    for key in ("engineering@wystack-plugins", "marketing@wystack-plugins", "design@wystack-plugins"):
        installs = plugins.get(key, [])
        if not installs:
            statuses.append(f"{key}: not installed")
            continue
        install_path = installs[0].get("installPath", "<unknown>")
        statuses.append(f"{key}: installed at {install_path}")
    return statuses


def is_repo_backed_skill(dest: Path, source: Path) -> bool:
    try:
        return dest.resolve() == source.resolve()
    except FileNotFoundError:
        return False


def build_cleanup_repo_backed_plans(repo_index: dict[str, Path], backup_root: Path) -> list[Plan]:
    plans: list[Plan] = []
    for root in STANDALONE_ROOTS:
        for skill_name, dest in discover_skill_dirs(root):
            source = repo_index.get(skill_name)
            if source is None or not is_repo_backed_skill(dest, source):
                continue
            backup_target = backup_root / "cleanup" / dest.relative_to(HOME)
            plans.append(
                Plan(
                    action="remove-repo-backed-standalone",
                    destination=dest,
                    source=source,
                    backup_target=backup_target,
                    reason="redundant repo-backed standalone skill",
                )
            )
    return plans


def canonical_for_exact_group(rows: list[SkillRef]) -> tuple[Path, list[Plan]]:
    plans: list[Plan] = []
    by_surface = {row.surface: row for row in rows}
    agents = by_surface.get("agents")
    if agents is not None:
        return agents.path, plans

    chosen = by_surface.get("codex", rows[0])
    destination = AGENTS_ROOT / chosen.path.name
    if destination.exists():
        return destination, plans

    plans.append(
        Plan(
            action="seed-agents-copy",
            destination=destination,
            source=chosen.path,
            backup_target=None,
            reason="create shared canonical copy in ~/.agents/skills",
        )
    )
    return destination, plans


def build_consolidate_exact_plans(backup_root: Path) -> tuple[list[Plan], list[tuple[str, list[SkillRef]]], list[tuple[str, list[SkillRef]]]]:
    surfaces = {
        "codex": discover_surface(CODEX_ROOT, "codex"),
        "agents": discover_surface(AGENTS_ROOT, "agents"),
        "claude": discover_surface(CLAUDE_ROOT, "claude"),
    }
    all_names = sorted(set().union(*(set(refs.keys()) for refs in surfaces.values())))

    exact: list[tuple[str, list[SkillRef]]] = []
    diverged: list[tuple[str, list[SkillRef]]] = []
    plans: list[Plan] = []

    for name in all_names:
        rows = [refs[name] for refs in surfaces.values() if name in refs]
        if len(rows) < 2:
            continue
        digests = {row.digest for row in rows}
        if len(digests) != 1:
            diverged.append((name, rows))
            continue

        exact.append((name, rows))
        canonical, seed_plans = canonical_for_exact_group(rows)
        plans.extend(seed_plans)

        for row in rows:
            if row.surface == "agents" and canonical == row.path:
                continue
            if row.is_symlink and row.resolved == canonical.resolve():
                continue
            if row.path.resolve() == canonical.resolve() and row.path == canonical:
                continue
            backup_target = backup_root / "shared" / row.path.relative_to(HOME)
            plans.append(
                Plan(
                    action="relink-to-agents",
                    destination=row.path,
                    source=canonical,
                    backup_target=backup_target,
                    reason="exact duplicate should use shared canonical source",
                )
            )

    return plans, exact, diverged


def build_resolve_ambiguity_plans(backup_root: Path) -> list[Plan]:
    plans: list[Plan] = []

    for name in SHARED_GLOBAL_SKILLS:
        codex_source = CODEX_ROOT / name
        if not (codex_source / "SKILL.md").exists():
            raise FileNotFoundError(f"missing canonical codex skill: {codex_source}")

        canonical = AGENTS_ROOT / name
        if not (canonical / "SKILL.md").exists() or canonical.resolve() != codex_source.resolve():
            backup_target = None
            if canonical.exists() or canonical.is_symlink():
                backup_target = backup_root / "shared-canonical" / canonical.relative_to(HOME)
            plans.append(
                Plan(
                    action="seed-shared-canonical",
                    destination=canonical,
                    source=codex_source,
                    backup_target=backup_target,
                    reason="promote codex canonical into shared ~/.agents/skills",
                )
            )

        for surface_name in ("codex", "claude"):
            destination = SURFACES[surface_name] / name
            try:
                if destination.is_symlink() and destination.resolve() == canonical.resolve():
                    continue
            except FileNotFoundError:
                pass

            backup_target = None
            if destination.exists() or destination.is_symlink():
                backup_target = backup_root / "shared-relinks" / destination.relative_to(HOME)
            plans.append(
                Plan(
                    action="relink-to-shared",
                    destination=destination,
                    source=canonical,
                    backup_target=backup_target,
                    reason="same skill name should resolve to one shared implementation",
                )
            )

    for name in ENGINEERING_PLUGIN_SKILLS:
        for surface_name, root in SURFACES.items():
            destination = root / name
            if not destination.exists() and not destination.is_symlink():
                continue
            backup_target = backup_root / "engineering-moved" / surface_name / destination.relative_to(HOME)
            plans.append(
                Plan(
                    action="remove-standalone",
                    destination=destination,
                    source=None,
                    backup_target=backup_target,
                    reason="engineering plugin now owns this workflow; remove standalone copy",
                )
            )

    return plans


def apply_plans(plans: list[Plan]) -> None:
    for plan in plans:
        if plan.action in {"remove-repo-backed-standalone", "remove-standalone"}:
            if plan.destination.is_symlink():
                plan.destination.unlink()
            elif plan.destination.exists():
                if plan.backup_target is None:
                    raise ValueError(f"backup target required for {plan.destination}")
                move_to_backup(plan.destination, plan.backup_target)
            continue

        if plan.action in {"seed-agents-copy", "seed-shared-canonical"}:
            if plan.destination.is_symlink():
                plan.destination.unlink()
            elif plan.destination.exists() and plan.backup_target is not None:
                move_to_backup(plan.destination, plan.backup_target)
            if plan.destination.exists():
                shutil.rmtree(plan.destination)
            if plan.source is None:
                raise ValueError(f"source required for {plan.action}")
            copy_skill_dir(plan.source, plan.destination)
            continue

        if plan.action in {"relink-to-agents", "relink-to-shared"}:
            if plan.source is None:
                raise ValueError(f"source required for {plan.action}")
            replace_with_symlink(plan.destination, plan.source, plan.backup_target)
            continue

        raise ValueError(f"unknown action: {plan.action}")


def describe_plan_list(plans: list[Plan]) -> str:
    if not plans:
        return "No changes needed."
    lines: list[str] = []
    for plan in plans:
        target = f"{plan.destination}"
        if plan.source is not None:
            target = f"{target} <- {plan.source}"
        lines.append(f"- {plan.action}: {target}")
        if plan.backup_target is not None:
            lines.append(f"  backup: {plan.backup_target}")
        lines.append(f"  reason: {plan.reason}")
    return "\n".join(lines)


def command_audit_overlaps(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root).resolve()
    repo_plugins = build_repo_plugin_overlap_index(repo_root)
    codex_skills = discover_home_skill_refs(Path(args.codex_skills_root))
    agents_skills = discover_home_skill_refs(Path(args.agents_skills_root))
    installed_plugins = discover_installed_plugin_refs(Path(args.plugins_root), repo_root)

    overlap_codex = compare_overlaps(repo_plugins, codex_skills)
    overlap_agents = compare_overlaps(repo_plugins, agents_skills)
    overlap_plugins = compare_overlaps(repo_plugins, flatten_plugins(installed_plugins))

    if args.json:
        payload = {
            "repo_root": str(repo_root),
            "repo_plugins": sorted(repo_plugins),
            "overlaps": {
                "codex_skills": {
                    name: [
                        {
                            "skill": repo_ref.skill_name,
                            "status": "same" if repo_ref.digest == other_ref.digest else "different",
                            "repo_path": str(repo_ref.path),
                            "other_path": str(other_ref.path),
                            "other_source": other_ref.source_name,
                        }
                        for repo_ref, other_ref in refs
                    ]
                    for name, refs in overlap_codex.items()
                },
                "agents_skills": {
                    name: [
                        {
                            "skill": repo_ref.skill_name,
                            "status": "same" if repo_ref.digest == other_ref.digest else "different",
                            "repo_path": str(repo_ref.path),
                            "other_path": str(other_ref.path),
                            "other_source": other_ref.source_name,
                        }
                        for repo_ref, other_ref in refs
                    ]
                    for name, refs in overlap_agents.items()
                },
                "installed_plugins": {
                    name: [
                        {
                            "skill": repo_ref.skill_name,
                            "status": "same" if repo_ref.digest == other_ref.digest else "different",
                            "repo_path": str(repo_ref.path),
                            "other_path": str(other_ref.path),
                            "other_source": other_ref.source_name,
                        }
                        for repo_ref, other_ref in refs
                    ]
                    for name, refs in overlap_plugins.items()
                },
            },
        }
        print(json.dumps(payload, indent=2))
        return 0

    print("Local skill overlap audit")
    print("-------------------------")
    print(print_overlap_section("Standalone Codex skills", overlap_codex))
    print(print_overlap_section("Standalone agent skills", overlap_agents))
    print(print_overlap_section("Installed home plugins", overlap_plugins))
    return 0


def command_cleanup_repo_backed(args: argparse.Namespace) -> int:
    repo_index = build_repo_skill_index(REPO_ROOT)
    backup_root = Path(args.backup_root).expanduser()
    plans = build_cleanup_repo_backed_plans(repo_index, backup_root)

    print("Local skill surface cleanup")
    print("---------------------------")
    print(f"Mode: {'apply' if args.apply else 'dry-run'}")
    print(f"Backup root: {backup_root}")
    print("\nCodex local plugins")
    print("-------------------")
    print("\n".join(codex_local_plugins_status(REPO_ROOT)))
    print("\nCodex config")
    print("------------")
    print("\n".join(codex_config_status()))
    print("\nClaude plugins")
    print("--------------")
    print("\n".join(claude_plugin_status()))
    print("\nCleanup plan")
    print("------------")
    print(describe_plan_list(plans))

    if args.apply:
        apply_plans(plans)
        print("\nDone.")
    return 0


def command_consolidate_exact(args: argparse.Namespace) -> int:
    backup_root = Path(args.backup_root).expanduser()
    plans, exact, diverged = build_consolidate_exact_plans(backup_root)

    print("Shared local skills consolidation")
    print("--------------------------------")
    print(f"Mode: {'apply' if args.apply else 'dry-run'}")
    print(f"Backup root: {backup_root}")
    print(f"Exact duplicate groups: {len(exact)}")
    print(f"Diverged groups left untouched: {len(diverged)}")
    print(describe_plan_list(plans))

    if args.apply:
        apply_plans(plans)
        print("\nDone.")
    return 0


def command_resolve_ambiguity(args: argparse.Namespace) -> int:
    backup_root = Path(args.backup_root).expanduser()
    plans = build_resolve_ambiguity_plans(backup_root)

    print("Remaining ambiguous skill cleanup")
    print("---------------------------------")
    print(f"Mode: {'apply' if args.apply else 'dry-run'}")
    print(f"Backup root: {backup_root}")
    print(describe_plan_list(plans))

    if args.apply:
        apply_plans(plans)
        print("\nDone.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Manage local Codex, agents, and Claude skill surfaces for this repo."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    audit = subparsers.add_parser("audit-overlaps", help="Audit repo plugin skills against local skill surfaces and installed plugins.")
    audit.add_argument("--repo-root", default=str(REPO_ROOT))
    audit.add_argument("--plugins-root", default=str(LOCAL_PLUGIN_ROOT))
    audit.add_argument("--codex-skills-root", default=str(CODEX_ROOT))
    audit.add_argument("--agents-skills-root", default=str(AGENTS_ROOT))
    audit.add_argument("--json", action="store_true")
    audit.set_defaults(func=command_audit_overlaps)

    cleanup = subparsers.add_parser("cleanup-repo-backed", help="Remove redundant standalone skills already backed by this repo's plugins.")
    cleanup.add_argument("--apply", action="store_true", help="Apply changes. Defaults to dry-run.")
    cleanup.add_argument(
        "--backup-root",
        default=str(DEFAULT_BACKUP_ROOT / f"wystack-plugins-cleanup-{timestamp()}"),
    )
    cleanup.set_defaults(func=command_cleanup_repo_backed)

    consolidate = subparsers.add_parser("consolidate-exact", help="Consolidate exact duplicate local skills onto one shared canonical copy.")
    consolidate.add_argument("--apply", action="store_true", help="Apply changes. Defaults to dry-run.")
    consolidate.add_argument(
        "--backup-root",
        default=str(DEFAULT_BACKUP_ROOT / f"shared-skills-cleanup-{timestamp()}"),
    )
    consolidate.set_defaults(func=command_consolidate_exact)

    ambiguity = subparsers.add_parser("resolve-ambiguity", help="Resolve remaining same-name ambiguity using the chosen target state.")
    ambiguity.add_argument("--apply", action="store_true", help="Apply changes. Defaults to dry-run.")
    ambiguity.add_argument(
        "--backup-root",
        default=str(DEFAULT_BACKUP_ROOT / f"remaining-skill-ambiguity-{timestamp()}"),
    )
    ambiguity.set_defaults(func=command_resolve_ambiguity)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
