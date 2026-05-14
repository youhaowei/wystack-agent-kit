---
name: git-cleanup
description: "Analyze local branches against the base branch and clean up what is safely merged. Use after finishing work, after merge, or when the branch list has gotten noisy."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Git Branch Cleanup

Categorize local branches against the base branch and clean up what is safe.

`/git-cleanup [--dry-run]`

## Goal

Keep the local repository tidy without deleting active or ambiguous work.

## Categories

Priority order matters. First match wins:

- **WORKTREE** — branch has an active worktree; do not touch it
- **MERGED** — empty diff against the base branch, including squash-merge cases
- **CONFLICTED** — would conflict if rebased on base
- **STALE** — unmerged with no commits in 14+ days
- **ACTIVE** — unmerged and recently touched

Use `git diff <base>...<branch> --stat` for merge detection rather than `git branch --merged`, which misses squash merges.

## Actions

- **MERGED** — safe-delete locally with `git branch -d`
- **STALE** — present as cleanup candidates and ask before deleting
- **WORKTREE** — skip entirely
- **CONFLICTED** / **ACTIVE** — report only
- **`--dry-run`** — report only, perform no deletions

## Rules

- Never delete `main`, `master`, or `develop`
- Never use force delete (`git branch -D`) unless the user explicitly asks
- If the category is unclear, keep the branch
