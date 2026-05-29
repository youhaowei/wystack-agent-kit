---
name: next-task
description: "Review a project's configured work items and recommend what to work on next. Use when the user asks what to do next, which task to pick, what is ready to implement, or how to prioritize current engineering work."
---
# Next Task

Find the best task to work on next for a project — discover, rank, recommend.

`$ARGUMENTS` — project hint, or empty (resolve the project from the workspace).

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the workspace, the task provider, and the status vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Workflow

### 1. Resolve the project

`$ARGUMENTS` names the project; otherwise take the project identity from the workspace. The workspace also yields the task provider and the status vocabulary — the mapping from this project's status names to the roles below.

### 2. Discover actionable tasks

Spawn `wystack-agent-kit:task-manager` (lightweight model tier when available) for provider-specific discovery — keeps verbose API output out of the main context. Ask it to:

- search the task source for the project's work items;
- fetch only plausibly-actionable ones — skip completed spikes, prefer recently-edited, cap at ~5 fetches;
- return each as: ID, title, status, priority, estimate, type, blocked-by / blocking relations;
- group by **role**, mapping provider statuses via the configured vocabulary:
  **ready** (groomed, implementation-ready) · **open** (not yet groomed) · **in-flight** · **blocked** (actionable but has an incomplete blocker) · **deferred**.

### 3. Session-context boost

Scan the conversation for work that makes a task cheaper to tackle now — the same module just discussed, a task spawned by this session's research. Such a task ranks one tier higher. Soft tiebreaker, never an override: a boosted Medium beats other Mediums, not an unrelated High.

### 4. Rank

Among actionable tasks (ready + open, not blocked), order by:

1. **Role** — ready before open (ready is groomed; open may still need scope/ACs).
2. **Priority** — the provider's configured priority order, highest first.
3. **Session-context boost** — step 3.
4. **Estimate** — smaller first; quick wins win ties.
5. **Type** — bug before feature before tech-debt before research.
6. **Unblocking power** — prefer tasks that unblock others.

### 5. Present

Deliver a structured pick of the top ~4 tasks — preceded by a one-line context header (in-flight count, deferred count). Each option: `<id>: <title>`, then `priority | estimate | type | status` and why it ranks here. Mark the top option recommended.

### 6. Act on the choice

- **Fresh context** → invoke `wystack-agent-kit:start-task <work-item>`.
- **Heavy context** → invoke `wystack-agent-kit:handoff` — it consolidates the session into the durable stores and emits a kickstart prompt for a fresh session.
- **None of these** → ask: groom tasks (`wystack-agent-kit:groom`), create one (`wystack-agent-kit:new-task`), or something else.

## Edge cases

- **No actionable tasks** — suggest reviewing deferred tasks or `wystack-agent-kit:new-task`.
- **All actionable tasks blocked** — show the dependency chain, suggest the blocker first.
- **New project, no tasks** — say so, offer `wystack-agent-kit:new-task`.
- **Discovery returns too little** — fetch 1-2 more directly rather than re-running the agent.

## Principles

- **Roles, not literal statuses** — the configured vocabulary maps project statuses to ready/open/in-flight/blocked/deferred; never hardcode status names.
- **Delegate** — `task-manager` owns discovery; this skill owns only the ranking.
- **Bounded provider calls** — one search plus a few targeted fetches, never one search plus N full fetches.
