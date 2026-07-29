---
name: cleanup
description: "Tidy stale workspace state — prune safely-merged and stale branches (local and remote), remove dead worktrees, and prune transient run artifacts from the workspace. Use after finishing work, after a merge, or when the branch list or artifact directory has gotten noisy. Never touches calibration data (the oracle) or decision docs."
---
# Cleanup

Prune stale workspace state across git and the filesystem. One verb: tidy up. Default scope is everything; `--scope` narrows it.

`cleanup [--dry-run] [--scope branches|remote|worktrees|artifacts]`

Always report what will be removed before removing it. `--dry-run` reports and deletes nothing.

**Prerequisites.** For the artifacts scope, load `wystack-agent-kit:workspace` to resolve the workspace location. Branches and worktrees are repo-level and need no workspace.

## Merge detection — ask the forge, not the diff

**The pull-request state is the only authoritative signal.** Everything below depends on it, so it comes first.

```
gh pr list --head <branch> --state all --json number,state,headRefName
```

A `MERGED` PR means the forge put that content into the base branch — squash, rebase, or merge commit, it does not matter. Nothing else needs checking. Batch the whole repo in one call (`gh pr list --state all --limit 200 --json number,state,headRefName`) rather than one call per branch.

Fallback when there is no forge (no `gh`, no PR): `git merge-base --is-ancestor <branch> <base>`. That catches fast-forward and rebase merges only. If it fails **and** no PR exists, treat the branch as unmerged — never as merged.

**Three local heuristics look right and are wrong. Do not re-derive them:**

| Heuristic | Why it fails |
|---|---|
| `git branch --merged` | Misses squash merges entirely — the branch tip never becomes an ancestor of base. |
| `git diff <base>...<branch> --stat` | Three-dot diffs run merge-base → branch, so they always show the branch's own contribution whether or not base absorbed it. A squash-merged branch reports hundreds of insertions. |
| `git merge-tree --write-tree <base> <branch>` | Reports "would change base" whenever the branch is merely *behind*, because merging it would revert newer base commits. Flags cleanly-merged branches as unmerged. |

Related trap: never redirect stderr on a `git diff` carrying a pathspec (`2>/dev/null`). Git errors when a pathspec matches neither tree, and the redirect turns that error into an empty diff that reads as "identical". Silent false negative.

## Scope: branches

Categorize local branches against the base branch — first match wins:

| Category | Meaning | Action |
|---|---|---|
| **WORKTREE** | Branch has an active worktree | Skip entirely |
| **MERGED** | Covered by a `MERGED` PR, or an ancestor of base | Safe-delete with `git branch -d` |
| **UNREVIEWED** | No PR ever opened, and commits ahead of base | Archive-tag before deleting (see below); ask first |
| **CLOSED** | PR exists but was closed unmerged | Ask before deleting; the forge keeps `refs/pull/<n>/head` |
| **STALE** | Unmerged, untouched for weeks | Present as candidates, ask before deleting |
| **ACTIVE** | Unmerged, recently touched | Report only |

Rules: never delete `main` / `master` / `develop`; never force-delete (`git branch -D`) unless explicitly asked; if a category is unclear, keep the branch.

**Log every deletion with its SHA** to a scratch file as you go — `git branch <name> <sha>` restores any of them, but only if the SHA was written down first.

## Scope: remote

Same categorization, one added constraint: **every remote deletion is a push.** Report the full disposition and get explicit confirmation before the first one.

Enumerate from the server, not from tracking refs — local `origin/*` refs go stale and can name branches that no longer exist:

```
git ls-remote --heads origin
```

**Archive-tag anything without a merged PR, before deleting.** A tag keeps the objects permanently reachable at essentially zero cost, and clears the branch list:

```
git tag archive/<branch> origin/<branch>
git push origin 'refs/tags/archive/*'
git ls-remote --tags origin 'refs/tags/archive/*'   # verify BEFORE any delete
```

The verification step is not optional. A local tag protects objects in your clone only — if the tag push silently failed and you delete anyway, the forge garbage-collects the commits and the work is gone. This is the one irreversible step in the whole skill.

Then delete, batching refspecs into a single push:

```
git push origin :refs/heads/<branch> :refs/heads/<other> ...
git remote prune origin
```

Recovery: `git switch -c <name> archive/<name>`, or `git push origin <sha>:refs/heads/<name>`.

**Do not archive-tag branches that don't need it** — 30 tags is just a differently-shaped mess. Skip the tag when the branch has a `MERGED` PR (content is in base), when `git rev-list --count <base>..<branch>` is 0 (nothing unique), or when a `CLOSED` PR exists (the forge keeps `refs/pull/<n>/head` indefinitely, recoverable from the PR page). Tag the rest — branches with no PR at all have no safety net anywhere.

**Before pushing any delete, prove coverage.** Walk the delete list and assert each entry has either an archive tag or a PR. Anything with neither is unaccounted-for work — stop and look at it.

## Scope: worktrees

Prune worktrees whose branch is gone or fully merged.

1. `git worktree list` — enumerate.
2. For each, check the branch: deleted, or MERGED per the table above.
3. Remove dead worktrees with `git worktree remove`. Skip any with uncommitted changes — report those instead.

Rules: never remove a worktree with uncommitted or unpushed work; report it for the user to decide.

**Check for untracked files, not just uncommitted ones.** `git worktree remove --force` permanently deletes untracked files — git's object store protects committed work only, so there is no recovery. Run `git status --porcelain` in each worktree and treat `??` entries as blocking; copy anything real out to a scratch directory before removing. Worktrees left by agent runs routinely hold the only copy of a spike file or a probe test.

## Scope: artifacts

Prune transient evidence under the workspace's `artifacts/<skill>/` — verify screenshots and GIFs, and similar run-scoped output.

- **Retention follows the workspace `retention` policy** (`storage.json`); unset → keep the few most recent runs per skill directory, delete older ones.
- Producing skills also prune lazily on their own runs — this scope is the manual sweep.

**Never touch:**

- the workspace's `calibration/` — the oracle data; it is meant to accumulate. Deleting it breaks the `wystack-agent-kit:retro` feedback loop.
- the workspace's `decisions/` — decision docs are durable deliverables.
- `present` output (decision docs, briefings, reports) — the user owns those.

If unsure whether something is transient, keep it.
