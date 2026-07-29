---
name: start-task
description: "Run the full engineering task lifecycle from configured work-item selection through planning, workspace setup, implementation, and finish. Use when the user wants to start a task end-to-end from a work-item URL/path, task ID, backlog selection, or pasted ticket data."
---
# Start Task

State-machine orchestrator for the work-item lifecycle — routes by status role.

`$ARGUMENTS` — work-item URL/path, task ID (`TASK-42` / `42`), pasted ticket data, or empty (→ `wystack-agent-kit:next-task`). Modifiers: `--interactive` (ask at each decision), `branch <name>` (exact branch name).

**Modes.** Default takes the recommended path at every decision; only hard stops (blocked task, `needs-human`) pause it. `--interactive` asks instead.

**Prerequisites.** Load `wystack-agent-kit:workspace` — task provider + status vocabulary. Not set up → `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Resolve** — fetch via the provider adapter (pasted data: extract directly, authoritative for this session; empty: `wystack-agent-kit:next-task`). Extract title, status, priority, estimate, type, ID, blocked-by relations, `## Plan` / `## Acceptance Criteria` / `## Scope`. Any blocker not in a done/cancelled role → hard stop in every mode: report it and stop.

2. **Review** (`--interactive` only; skip if planned this session) — summarize the ticket; recommend **proceed** / update the ticket first / pick another.

3. **Route by status role** (per the configured vocabulary):

   | Role | Action |
   |---|---|
   | not-started / planning | 4 — plan |
   | ready | 5 — set up |
   | in-flight | 6 — resume |
   | in-review | 8 — finish |
   | done / cancelled | report and stop |
   | deferred | revive → 4 |

4. **Plan** — no `## Plan` → `wystack-agent-kit:groom <task>` (`--interactive` may quick-start to 5 or pick another). A plan already in a planning role → confirm it's ready, set the ready status. → 5.

5. **Set up** — isolation per the workspace worktree preference: worktree → `wystack-agent-kit:worktree` · cwd → current directory · unset → worktree (`--interactive`: ask, offer to record the choice). Branch: a `branch` hint verbatim; else reuse a `*{id}*` match from `git worktree list` / `git branch --list`; else create `{id}-{slug}` (first 3–4 title words, kebab-cased). The broad `{id}` match catches `YW-56` and `task-56-*` alike. Set the in-progress status.

6. **Resume** — matching worktree → offer to switch; matching branch → check out; neither → create per 5. → 7.

7. **Execute** — with a plan: the installed `executing-plans` skill or equivalent (`--interactive` may pick subagent-driven or manual instead). Without: implement from description + ACs.

8. **Finish** — `wystack-agent-kit:finish-task <task> pr` (owns git lifecycle, quality gate, PR, calibration record), then route its Shepherd State: `ready-to-merge` → merged under gate policy, else report for the human merge; stop · `needs-human` → report blockers, stop · `shepherding` → schedule a delayed re-entry with this same prompt (host wakeup/scheduler when available — e.g. Claude `ScheduleWakeup`, Grok background/monitor; otherwise report and stop for the user to re-invoke). Never busy-wait; repeated passes without progress → exit `needs-human`. `--interactive`: no wakeups, the user re-invokes.

## Edge cases

- Worktree exists for another task → unique branch name, never overwrite.
- User pauses → keep the branch, task stays in-flight, report how to resume.
