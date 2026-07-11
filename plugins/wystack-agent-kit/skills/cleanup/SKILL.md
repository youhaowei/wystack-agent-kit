---
name: cleanup
description: "Tidy stale workspace state — prune safely-merged and stale local branches, remove dead worktrees, and prune transient run artifacts from the workspace. Use after finishing work, after a merge, or when the branch list or artifact directory has gotten noisy. Never touches calibration data (the oracle) or decision docs."
---
# Cleanup

Prune stale workspace state across git and the filesystem. One verb: tidy up. Default scope is everything; `--scope` narrows it.

`cleanup [--dry-run] [--scope branches|worktrees|artifacts]`

Always report what will be removed before removing it. `--dry-run` reports and deletes nothing.

**Prerequisites.** For the artifacts scope, load `wystack-agent-kit:workspace` to resolve the workspace location. Branches and worktrees are repo-level and need no workspace.

## Scope: branches

Categorize local branches against the base branch — first match wins:

| Category | Meaning | Action |
|---|---|---|
| **WORKTREE** | Branch has an active worktree | Skip entirely |
| **MERGED** | Empty diff against base, squash-merges included | Safe-delete with `git branch -d` |
| **CONFLICTED** | Would conflict if rebased on base | Report only |
| **STALE** | Unmerged, no commits in 14+ days | Present as candidates, ask before deleting |
| **ACTIVE** | Unmerged, recently touched | Report only |

Detect merges with `git diff <base>...<branch> --stat`, not `git branch --merged` — the latter misses squash merges.

Rules: never delete `main` / `master` / `develop`; never force-delete (`git branch -D`) unless explicitly asked; if a category is unclear, keep the branch.

## Scope: worktrees

Prune worktrees whose branch is gone or fully merged.

1. `git worktree list` — enumerate.
2. For each, check the branch: deleted, or MERGED per the table above.
3. Remove dead worktrees with `git worktree remove`. Skip any with uncommitted changes — report those instead.

Rules: never remove a worktree with uncommitted or unpushed work; report it for the user to decide.

## Scope: artifacts

Prune transient evidence under the workspace's `artifacts/<skill>/` — verify screenshots and GIFs, diverge spike scratch, and similar run-scoped output.

- **Retention: keep the last 5 runs** per skill directory; delete older run directories.
- Producing skills also prune lazily on their own runs — this scope is the manual sweep.

**Never touch:**

- the workspace's `calibration/` — the oracle data; it is meant to accumulate. Deleting it breaks the `wystack-agent-kit:retro` feedback loop.
- the workspace's `decisions/` — decision docs are durable deliverables.
- `present` output (decision docs, briefings, reports) — the user owns those.

If unsure whether something is transient, keep it.
