---
name: worktree
description: "Create and prepare an isolated git worktree for a task branch — pick the directory, run project setup, verify a clean baseline before implementation starts. Use when the user wants parallel task work without disturbing the current checkout. Invoked by orchestrate for parallel-agent isolation."
---

# Worktree

Create an isolated workspace for a task branch and verify it is ready before implementation starts.

## Resolve the workspace first

A worktree's gitignored files (including a per-project `.wystack/`) are not checked out. Resolve the workspace before anything else — the canonical procedure is `docs/storage-contract.md` § Location and resolution:

1. Run `git rev-parse --show-toplevel` to get the repo root. Read `.wystack.json` there; resolve its `root` **relative to the repo root** (for relative paths) or expand `~` (for global `~/.wystack/<project>` paths). Never resolve relative to `cwd` — in a worktree that lands on an empty directory.
2. If absent, fall back to `git rev-parse --path-format=absolute --git-common-dir` → the main worktree, and look for `.wystack/` there.

All project-specific config — worktree directory, setup commands — is read from the resolved workspace. The skill hardcodes nothing project-specific.

## Directory selection

Priority order:

1. **`.wystack/` convention** — if `.wystack/workspace.md` records a worktree directory, use it. The project's explicit override.
2. **Project instructions** — `AGENTS.md` or equivalent naming a worktree directory.
3. **Global default** — `~/worktrees/<project>/<branch>`. Outside the working tree; no file-watcher recursion, no gitignore entry needed.

## Flow

1. **Resolve `.wystack/`** (above) and read the worktree directory + setup commands.
2. **Detect** project root and project name.
3. **Create** the worktree for the target branch — name it after the task branch (`task-{id}-{slug}`).
4. **Link `.wystack/`** — drop a `.wystack` symlink in the new worktree pointing at the resolved main `.wystack/`, so project config and `./.wystack` paths work inside it.
5. **Run project setup** — the commands recorded in `.wystack/workspace.md`; if none are recorded, run the setup appropriate to the detected stack and offer to record it.
6. **Verify** a clean baseline with the most relevant test or validation command.
7. **Report** the worktree path and readiness state.

## Rules

- Whether to use a worktree at all is the caller's call, per the workspace's worktree preference (worktree / cwd / ask) — this skill runs once a worktree is wanted.
- Never reuse a path that already contains unrelated work.
- Never proceed silently if baseline setup or validation fails.
- Project setup is `.wystack/` config, not skill content — if it is missing, capture it (offer to record in `.wystack/workspace.md` or run `wystack-agent-kit:setup-agent-kit`).
- Pair with `wystack-agent-kit:finish-task` for the landing path and `wystack-agent-kit:cleanup` to prune dead worktrees.
