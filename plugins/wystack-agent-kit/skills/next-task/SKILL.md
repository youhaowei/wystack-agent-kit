---
name: next-task
description: "Review a project's configured work items and recommend what to work on next. Use when the user asks what to do next, which task to pick, or how to prioritize current engineering work."
---
# Next Task

Find the best task to work on next.

`$ARGUMENTS` — project hint, or empty (project from the workspace).

**Prerequisites.** Load `wystack-agent-kit:workspace` — resolves the workspace, the task provider, and the status vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Discover** — spawn `wystack-agent-kit:task-manager` to search the project's work items and fetch the plausibly-actionable ones. Return each as ID, title, status, priority, estimate, type, blocked-by/blocking relations — grouped by role via the configured vocabulary: **ready** (meets the Ready bar — `docs/doc-model.md` § Story) · **open** (not yet groomed) · **in-flight** · **blocked** (actionable but has an incomplete blocker) · **deferred**.

2. **Boost session context** — a task this session already made cheaper (the module just discussed, work spawned by this session's research) ranks one tier higher. Soft tiebreaker, never an override: a boosted Medium beats other Mediums, not an unrelated High.

3. **Rank** the actionable set (ready + open, not blocked): role (ready first) → priority (provider's configured order) → session boost → estimate (smaller first) → type (bug > feature > tech-debt > research) → unblocking power (prefer tasks that unblock others).

4. **Present** the top few — a one-line context header (in-flight count, deferred count), then per option `<id>: <title>`, `priority | estimate | type | status`, and why it ranks here. Mark the top option recommended.

5. **Act on the choice** — fresh context → `wystack-agent-kit:start-task <work-item>`; heavy context → `wystack-agent-kit:handoff` (consolidates the session, emits a kickstart prompt); none fit → offer `wystack-agent-kit:groom` / `wystack-agent-kit:new-task`.

## Edge cases

- **No actionable tasks** — suggest reviewing deferred tasks or `wystack-agent-kit:new-task`.
- **All actionable tasks blocked** — show the dependency chain; suggest the blocker first.
- **Discovery returns too little** — fetch a few more directly rather than re-running the agent.

## Rules

- **Roles, not literal statuses** — map via the configured vocabulary; never hardcode status names.
- **Bounded provider calls** — one search plus a few targeted fetches, never N full fetches.
