---
name: start-task
description: "Run the full engineering task lifecycle from configured work-item selection through planning, workspace setup, implementation, and finish. Use when the user wants to start a task end-to-end from a work-item URL/path, task ID, backlog selection, or pasted ticket data."
---
# Start Task

State-machine orchestrator for the work-item lifecycle — routes by the task's current status role.

`$ARGUMENTS` — work-item URL/path, task ID (e.g. `TASK-42` or `42`), pasted structured ticket data (any format), or empty (falls back to `wystack-agent-kit:next-task`). May also include:
- `--interactive` — pause at each decision point for confirmation instead of taking the recommended path.
- `branch <name>` — use this exact branch name instead of deriving one from the task ID and title.

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the task provider and the status vocabulary (the mapping from project statuses to the roles below). If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Workflow

### 1. Resolve the task

- **URL/path** — fetch via the configured provider adapter.
- **Task ID** — search the work-item store by ID, then fetch.
- **Pasted ticket data** — extract title, ID, status, description, scope, acceptance criteria, and relations directly from the provided content; skip the provider fetch. Treat the extracted data as authoritative for this session.
- **Empty** — invoke `wystack-agent-kit:next-task`; continue from step 2 with the selected task.

Extract: title, status, priority, estimate, type, task ID, URL/path, blocked-by relations, and body sections (`## Plan`, `## Acceptance Criteria`, `## Scope`).

**Blocker check.** If the task has `blocked-by` relations, verify each blocker's status via the provider adapter. Any blocker that is not in a done/cancelled role is a hard stop: report the blocking task(s) and stop. This applies in both default and `--interactive` mode — a blocked task is never safe to start.

### 2. Review the ticket

Default: skip — proceed directly to step 3.

`--interactive`: skip if the task was just planned this session — the user already knows it. Present a concise summary — title, ID, status/priority/estimate/type, a 5–8 line description, files in scope, dependencies, whether a plan exists — and ask, recommending **proceed**: proceed / update the ticket first / pick another. On "update", discuss and apply changes via the provider adapter, then re-confirm. On "pick another", invoke `wystack-agent-kit:next-task`.

### 3. Route by status role

The workspace's status vocabulary maps each project status to a role:

| Role | Action |
|---|---|
| **not-started / planning** | Step 4 — plan |
| **ready** | Step 5 — set up workspace |
| **in-flight** | Step 6 — resume |
| **in-review** | Step 8 — finish |
| **done / cancelled** | report status and stop |
| **deferred** | Default: revive and plan → step 4. `--interactive`: ask — revive and plan, or pick another |

### 4. Plan

Default: if the task has no `## Plan` section, invoke `wystack-agent-kit:groom <task>` (full planning); on completion → step 5. If a plan already exists, proceed directly to step 5.

`--interactive`: if the task has no `## Plan` section, ask how to proceed — recommend **Full planning** unless the task is trivial:

- **Full planning** *(recommended)* — invoke `wystack-agent-kit:groom <task>`; on completion the task is groomed and ready → step 5.
- **Quick start** — skip to step 5.
- **Pick another** — invoke `wystack-agent-kit:next-task`.

If a plan already exists (planning role), show its summary; if the user confirms it's ready, set the task to the configured ready status via the provider adapter → step 5.

### 5. Set up workspace

1. **Pick isolation** — consult the workspace's worktree preference: **worktree** → invoke `wystack-agent-kit:worktree` for an isolated checkout; **cwd** → work in the current directory; **ask / unset** → default to worktree; `--interactive`: ask the user and offer to record the choice in the workspace.
2. **Branch** — if a `branch <name>` hint was supplied, use it exactly. Otherwise: `git worktree list` and `git branch --list "*{id}*"`; reuse a match if one exists, else create `{id}-{slug}` (slug = first 3–4 title words, kebab-cased).
3. Set the work item to the configured in-progress status via the provider adapter.

### 6. Resume (in-flight)

`git worktree list` — if a matching worktree exists, report its location and offer to switch. Otherwise `git branch --list "*{id}*"`; check out a match, or follow step 5.2 to create a branch. Then → step 7.

### 7. Execute

Default: if the task has a `## Plan`, use **Batch** execution (the installed `executing-plans` skill or equivalent). If no plan, implement directly from the description and acceptance criteria.

`--interactive`: if the task has a `## Plan` (work-item body or local plan doc), ask how to execute — recommend **Batch** for most planned work:

- **Batch** *(recommended)* — the installed `executing-plans` skill or equivalent (step-by-step with review checkpoints).
- **Subagent-driven** — the installed `subagent-driven-development` skill or equivalent (parallel execution).
- **Manual** — implement directly, task context kept loaded.

### 8. Finish

When implementation is complete, invoke `wystack-agent-kit:finish-task <task> pr` — it owns the git lifecycle, quality gate, PR creation, and calibration record.

**Shepherd loop.** After `finish-task` exits, inspect its Shepherd State:
- `ready-to-merge` — report and stop. Notify the user that the PR is ready; humans merge.
- `needs-human` — report the blocker(s) and stop. The user must unblock before re-invoking.
- `shepherding` — schedule a wakeup via `ScheduleWakeup` (delay: 900s, reason: "PR shepherd pass — waiting on CI/review") passing this same `start-task <task>` prompt so the next firing re-enters at step 8 and runs another finish-task pass. Then stop — do not busy-wait.

`--interactive`: finish-task's report stands on its own; the user drives re-invocation.

## Edge cases

- **Task is blocked** — hard stop regardless of mode (default or `--interactive`); report the blocking task(s) and stop.
- **Worktree exists for a different task** — don't overwrite; use a unique branch name.
- **User wants to pause** — keep the branch, leave the task in-flight, report how to resume.
- **Shepherd loop exceeds 5 wakeup passes without reaching `ready-to-merge`** — exit `needs-human`; do not schedule further wakeups.

## Notes

- Main entry point — composes `wystack-agent-kit:next-task`, `wystack-agent-kit:groom`, an execution skill, and `wystack-agent-kit:finish-task`.
- The `{id}` branch matching pattern is intentionally broad — it matches provider-native names like `YW-56` as well as the derived `task-56-*` convention. Resume detection works either way.
- Default behavior eliminates all confirmation prompts except hard stops (blocked task, `needs-human` shepherd exit). Every other decision takes the recommended path. Pass `--interactive` to restore confirmation prompts at each step.
