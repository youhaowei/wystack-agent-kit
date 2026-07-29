---
name: worktree
description: "Create and prepare an isolated git worktree for a task branch — pick the directory, run project setup, verify a clean baseline before implementation starts. Use when the user wants parallel task work without disturbing the current checkout, or when a conductor needs parallel-agent isolation."
---

# Worktree

Create an isolated workspace for a task branch and verify it is ready before implementation starts.

`$ARGUMENTS` — target branch, or a task ID/slug to derive one (`task-{id}-{slug}`).

**Prerequisites.** Resolve the workspace before anything else — a worktree's gitignored files (including a per-project `.wystack/`) are not checked out. Run the resolver block in `docs/storage-contract.md` § Location and resolution; its `--git-common-dir` fallback is what recovers a per-project `.wystack/` the worktree never checked out. All project-specific config — worktree directory, setup commands — comes from the resolved workspace; the skill hardcodes nothing.

## Workflow

1. **Pick the directory** — first match wins: the worktree directory recorded in `.wystack/workspace.md` → one named in project instructions (`AGENTS.md` or equivalent) → the global default `~/worktrees/<project>/<branch>` (outside the working tree: no file-watcher recursion, no gitignore entry).
2. **Create** the worktree for the target branch.
3. **Link `.wystack/`** — drop a `.wystack` symlink in the new worktree pointing at the resolved main `.wystack/`, so project config and `./.wystack` paths work inside it.
4. **Set up** — run the commands recorded in `.wystack/workspace.md`; none recorded → run the setup appropriate to the detected stack and offer to record it.
5. **Verify** a clean baseline with the most relevant test or validation command.
6. **Report** the worktree path and readiness state.

## Rules

- Whether to use a worktree at all is the caller's call, per the workspace worktree preference — this skill runs once a worktree is wanted.
- Never reuse a path that already contains unrelated work.
- Never proceed silently past a failed setup or baseline validation.
- Setup commands are workspace config, not skill content — missing → capture (record in `.wystack/workspace.md` or run `wystack-agent-kit:setup-agent-kit`).
- Pair with `wystack-agent-kit:finish-task` for the landing path and `wystack-agent-kit:cleanup` to prune dead worktrees.
