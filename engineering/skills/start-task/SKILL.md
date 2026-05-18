---
name: start-task
description: "Run the full engineering task lifecycle from configured work-item selection through planning, workspace setup, implementation, and finish. Use when the user wants to start a task end-to-end from a work-item URL/path, task ID, or backlog selection."
---
# Start Task

State-machine orchestrator for the work-item lifecycle — routes by the task's current status role.

`$ARGUMENTS` — work-item URL/path, task ID (e.g. `TASK-42` or `42`), or empty (falls back to `engineering:next-task`).

**Prerequisites.** Load `engineering:workspace` — it resolves the task provider and the status vocabulary (the mapping from project statuses to the roles below). If the workspace isn't set up, run `engineering:setup-agent-kit`.

## Workflow

### 1. Resolve the task

- **URL/path** — fetch via the configured provider adapter.
- **Task ID** — search the work-item store by ID, then fetch.
- **Empty** — invoke `engineering:next-task`; continue from step 2 with the selected task.

Extract: title, status, priority, estimate, type, task ID, URL/path, and body sections (`## Plan`, `## Acceptance Criteria`, `## Scope`).

### 2. Review the ticket

Skip if the task was just planned this session — the user already knows it. Otherwise present a concise summary — title, ID, status/priority/estimate/type, a 5–8 line description, files in scope, dependencies, whether a plan exists — and ask, recommending **proceed**: proceed / update the ticket first / pick another. On "update", discuss and apply changes via the provider adapter, then re-confirm. On "pick another", invoke `engineering:next-task`.

### 3. Route by status role

The workspace's status vocabulary maps each project status to a role:

| Role | Action |
|---|---|
| **not-started / planning** | Step 4 — plan |
| **ready** | Step 5 — set up workspace |
| **in-flight** | Step 6 — resume |
| **in-review** | Step 8 — finish |
| **done / cancelled** | report status and stop |
| **deferred** | ask: revive and plan, or pick another |

### 4. Plan

If the task has no `## Plan` section, ask how to proceed — recommend **Full planning** unless the task is trivial:

- **Full planning** *(recommended)* — invoke `engineering:groom <task>`; on completion the task is groomed and ready → step 5.
- **Quick start** — skip to step 5.
- **Pick another** — invoke `engineering:next-task`.

If a plan already exists (planning role), show its summary; if the user confirms it's ready, set the task to the configured ready status via the provider adapter → step 5.

### 5. Set up workspace

1. **Pick isolation** — consult the workspace's worktree preference: **worktree** → invoke `engineering:worktree` for an isolated checkout; **cwd** → work in the current directory; **ask / unset** → ask the user, and offer to record the choice in the workspace.
2. **Branch** — `git worktree list` and `git branch --list "task-{id}-*"`; reuse a match if one exists, else create `task-{id}-{slug}` (slug = first 3–4 title words, kebab-cased).
3. Set the work item to the configured in-progress status via the provider adapter.

### 6. Resume (in-flight)

`git worktree list` — if a matching worktree exists, report its location and offer to switch. Otherwise `git branch --list "task-{id}-*"`; check out a match, or follow step 5.2 to create a branch. Then → step 7.

### 7. Execute

If the task has a `## Plan` (work-item body or local plan doc), ask how to execute — recommend **Batch** for most planned work:

- **Batch** *(recommended)* — the installed `executing-plans` skill or equivalent (step-by-step with review checkpoints).
- **Subagent-driven** — the installed `subagent-driven-development` skill or equivalent (parallel execution).
- **Manual** — implement directly, task context kept loaded.

If no plan (quick start), implement directly from the description and acceptance criteria.

### 8. Finish

When implementation is complete, invoke `engineering:finish-task <task>` — it owns the git lifecycle, status update, completion summary, and calibration record.

## Edge cases

- **Task is blocked** — show the blocker, offer to work on it instead.
- **Worktree exists for a different task** — don't overwrite; use a unique branch name.
- **User wants to pause** — keep the branch, leave the task in-flight, report how to resume.

## Notes

- Main entry point — composes `engineering:next-task`, `engineering:groom`, an execution skill, and `engineering:finish-task`.
- The `task-{id}-{slug}` branch convention is what makes resume detection work.
