---
name: git-worktrees
description: "Create and prepare an isolated engineering worktree for a task branch. Use when the user wants parallel task work without disturbing the current checkout."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Git Worktrees

Create an isolated workspace for a task branch and verify it is ready before implementation starts.

## Directory Selection

Use this priority order:

1. **Project instructions** — if `AGENTS.md` or equivalent names a worktree directory, use it
2. **Existing project-local directory** — `.worktrees/` or `worktrees/`
3. **Global default** — `~/.agents/worktrees/<project>/<branch>`

For project-local directories, ensure the directory is ignored before use.

## Creation Flow

1. Detect project root and project name
2. Create the worktree for the target branch
3. Run project setup commands appropriate to the stack
4. Verify a clean baseline with the most relevant test or validation command
5. Report the worktree path and readiness state

## Rules

- Never reuse a path that already contains unrelated work
- Never proceed silently if baseline setup or validation fails
- Prefer keeping worktree naming aligned with task branches such as `task-{id}-{slug}`
- Pair this with `engineering:finish` for the landing and cleanup path
