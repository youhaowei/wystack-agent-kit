---
name: swarm
description: "Spawn a team of background teammates in isolated worktrees to execute multiple Notion tickets in parallel, then coordinate reviews and merges. Use when the user explicitly wants parallel ticket execution across a project. For single-task work or specialist routing, use start or orchestrate instead."
---

<what-to-do>

You coordinate; teammates implement in worktrees; user approves every merge.

`swarm [project] [--max 2]`

- **project** — project name (e.g. `workforce`). Infer from CWD if omitted.
- **--max N** — max concurrent implementers (default 2). Reviews add ~3× transient load.

**Prerequisites.** Load `notion-workspace` skill (or equivalent) for project URLs and schema.

## Roles

- **You** — spawn teammates, relay findings, present gates. Don't implement.
- **User** — selects tickets, approves grooms, approves merges. Decides everything.
- **Teammates** — background, worktree-isolated, one per ticket. Implement → test → PR → report. Never merge, never mark Notion Done.

## Start

1. **Resolve project** from argument or CWD → project URLs in workspace skill.
2. **Pick tickets** — run `engineering:next`, let the user select. Honor `addBlockedBy` dependencies.
3. **Pre-fetch specs** — one `engineering:task-manager` teammate on a light tier (e.g. Haiku) batches the Notion pages for all selected tickets. Agents need full specs, not titles.
4. **Create team** — `TeamCreate { name: "{project}-sprint" }`, plus a `TaskCreate` per ticket with dependencies wired.

## Loop

Each turn, handle the first thing that applies. No state machine — the next step is whatever the bottleneck is.

1. **PRs waiting for review** — run `engineering:full-review` once, relay findings to the implementer, repeat until clean, then present the user a merge gate.
2. **Unblocked tickets under the `--max` cap** — approve the spec with the user, then spawn an implementer.
3. **Upcoming tickets** — groom or brainstorm specs with the user so the next wave is ready.
4. **Idle** — ask the user what's next (brainstorm, audit, wrap up).

## Spawning an implementer

Gate first using the [launch gate format](FORMATS.md#launch-gate). Then spawn:

```
Agent({
  name: "{task-slug}",
  team_name: "{project}-sprint",
  isolation: "worktree",
  mode: "bypassPermissions",
  run_in_background: true,
  prompt: <teammate brief — see FORMATS.md>
})
```

Update state: `TaskUpdate → in_progress`, Notion → **In Progress**.

The teammate brief lives in [FORMATS.md](FORMATS.md#teammate-brief).

## Review loop

For each PR a teammate reports:

1. Notion → **In Review**.
2. Spawn one reviewer teammate that runs `engineering:full-review` (it spawns its own code/QA/PM sub-agents internally — one team roster entry per PR).
3. Relay blocking findings to the implementer via `SendMessage`. They fix and push.
4. **Re-review full scope every round.** Rigor does not decay. Loop until zero blocking findings.
5. Present the [merge gate](FORMATS.md#merge-gate).
6. **Approve** — merge, Notion → Done, unblock dependents. **Request changes** — relay to implementer. **Defer** — PR stays open, move on.

## Agent lifecycle

- Reassign idle implementers to new tickets when possible; otherwise shut down.
- Reviewer teammates are one-per-PR; shut down after merge/defer.
- If an agent goes quiet, read its output file. If stuck or looping, `SendMessage` with guidance or escalate to the user.

## Edge cases

- **Agent fails** — don't auto-retry. Show the error; let the user decide retry/reassign/skip.
- **All tickets blocked** — show the dependency chain; replan with user.
- **Merge conflict** — flag to user. No force-push, no auto-resolve.
- **User takes over a ticket** — reassign from agent, keep the worktree.
- **Reprioritization** — user can add/remove/reorder anytime; the queue is flexible.

## Wrap up

When the user calls it, summarize using the [sprint summary format](FORMATS.md#sprint-summary). Then `TeamDelete` or continue with another `engineering:next` round.

</what-to-do>

<supporting-info>

## Reference

- [FORMATS.md](FORMATS.md) — teammate brief, launch gate, merge gate, sprint summary.

## Notion status

Only the orchestrator writes Notion status, only on user decisions:

```
Not Started → Ready → In Progress → In Review → Done
                                  ↘ (defer) → In Review
```

## Principles

- **User decides everything** — tickets, specs, merges, Done.
- **PRs only** — agents never merge, never mark Done.
- **Groom before launch** — no ticket reaches an agent without user approval.
- **Worktree isolation** — one worktree per teammate.
- **Review rigor doesn't decay** — full scope every round, every finding fixed.
- **Orchestrator stays free** — manage in background, plan in foreground.

</supporting-info>
