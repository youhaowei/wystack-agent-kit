#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import os


REPO_ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home()
DEFAULT_BACKUP_ROOT = HOME / ".codex" / "backups"


@dataclass(frozen=True)
class LinkPlan:
    kind: str
    destination: Path
    source: Path
    backup_target: Path
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


def move_to_backup(path: Path, backup_target: Path) -> None:
    ensure_parent(backup_target)
    shutil.move(str(path), str(backup_target))


def replace_with_symlink(destination: Path, source: Path, backup_target: Path, dry_run: bool) -> None:
    if destination.is_symlink():
        if destination.resolve() == source.resolve():
            return
        if not dry_run:
            destination.unlink()
    elif destination.exists():
        if not dry_run:
            move_to_backup(destination, backup_target)

    if dry_run:
        return

    ensure_parent(destination)
    os.symlink(source, destination)


def needs_replacement(destination: Path, source: Path) -> bool:
    if destination.is_symlink():
        try:
            return destination.resolve() != source.resolve()
        except FileNotFoundError:
            return True
    return destination.exists()


def build_repo_skill_index(repo_root: Path) -> dict[tuple[str, str], Path]:
    index: dict[tuple[str, str], Path] = {}
    for plugin_dir in ("engineering", "marketing", "design"):
        skills_root = repo_root / plugin_dir / "skills"
        if not skills_root.exists():
            continue
        for skill_file in skills_root.glob("*/SKILL.md"):
            index[(plugin_dir, skill_name_for_file(skill_file))] = skill_file.parent
    return index


def discover_skill_dirs(root: Path) -> list[tuple[str, Path]]:
    refs: list[tuple[str, Path]] = []
    if not root.exists():
        return refs
    for skill_file in sorted(root.glob("*/SKILL.md")):
        refs.append((skill_name_for_file(skill_file), skill_file.parent))
    return refs


def standalone_skill_plans(repo_index: dict[tuple[str, str], Path], backup_root: Path) -> list[LinkPlan]:
    plans: list[LinkPlan] = []
    repo_by_skill: dict[str, tuple[str, Path]] = {}
    for (plugin_name, skill_name), source in repo_index.items():
        repo_by_skill[skill_name] = (plugin_name, source)

    for root in (HOME / ".codex" / "skills", HOME / ".agents" / "skills"):
        for skill_name, dest in discover_skill_dirs(root):
            match = repo_by_skill.get(skill_name)
            if match is None:
                continue
            plugin_name, source = match
            if not needs_replacement(dest, source):
                continue
            backup_target = backup_root / "standalone" / dest.relative_to(HOME)
            plans.append(
                LinkPlan(
                    kind="standalone-skill",
                    destination=dest,
                    source=source,
                    backup_target=backup_target,
                    reason=f"{skill_name} should follow {plugin_name} in this repo",
                )
            )

    return plans


def legacy_work_plugin_plans(repo_index: dict[tuple[str, str], Path], backup_root: Path) -> list[LinkPlan]:
    plans: list[LinkPlan] = []
    legacy_root = HOME / "plugins" / "work" / "skills"
    if not legacy_root.exists():
        return plans

    for skill_name, dest in discover_skill_dirs(legacy_root):
        source = repo_index.get(("engineering", skill_name))
        if source is None:
            continue
        if not needs_replacement(dest, source):
            continue
        backup_target = backup_root / "plugins" / "work" / "skills" / dest.name
        plans.append(
            LinkPlan(
                kind="legacy-plugin-skill",
                destination=dest,
                source=source,
                backup_target=backup_target,
                reason=f"legacy work/{skill_name} should track engineering/{skill_name}",
            )
        )

    return plans


def describe(plans: list[LinkPlan]) -> str:
    if not plans:
        return "No changes needed."
    lines = []
    for plan in plans:
        lines.append(f"- {plan.kind}: {plan.destination} -> {plan.source}")
        lines.append(f"  backup: {plan.backup_target}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Promote this repo to the source of truth for overlapping Codex/agent skills."
    )
    parser.add_argument("--apply", action="store_true", help="Apply changes. Defaults to dry-run.")
    parser.add_argument(
        "--backup-root",
        default=str(DEFAULT_BACKUP_ROOT / f"wystack-plugins-source-of-truth-{timestamp()}"),
        help="Backup root for replaced files/directories.",
    )
    args = parser.parse_args()

    repo_index = build_repo_skill_index(REPO_ROOT)
    backup_root = Path(args.backup_root).expanduser()
    plans = standalone_skill_plans(repo_index, backup_root) + legacy_work_plugin_plans(repo_index, backup_root)

    print("Repo source-of-truth promotion")
    print("------------------------------")
    print(f"Mode: {'apply' if args.apply else 'dry-run'}")
    print(f"Backup root: {backup_root}")
    print(describe(plans))

    if not args.apply:
        return 0

    for plan in plans:
        replace_with_symlink(plan.destination, plan.source, plan.backup_target, dry_run=False)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
