---
name: reprioritize
description: "Re-sort a project's task backlog — propose a new priority ordering across the open work items, get approval, apply it. Use when the user asks to reprioritize the backlog, re-rank tasks, re-sort the queue, shuffle priorities, or rebalance what matters most across the board."
---
# Reprioritize

Re-rank the backlog as one deliberate operation — discover, propose, approve, apply.

`$ARGUMENTS` — project hint, or empty (resolve the project from the workspace).

**Prerequisites.** Load `wystack-agent-kit:workspace` — project identity, task provider, status vocabulary, and **priority vocabulary** (the provider's priority field and its ordered values; never assume a fixed set). Not set up → `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Discover** — spawn `wystack-agent-kit:task-manager` (lightweight model tier when available) to search the project's work items and return the re-rankable set — **ready** and **open** roles; exclude in-flight (already chosen), blocked, and closed. Each item: ID, title, status, current priority, estimate, type, blocked-by / blocking relations.

2. **Propose** — rank by what should come first now: urgency, unblocking power, type, estimate, direction from the conversation. Map the ranking onto the priority vocabulary and build the proposal table, marked recommended:

   | ID | Title | Current | Proposed | Rationale |
   |---|---|---|---|---|

   One row per item whose priority changes, one-line rationale each; unchanged items as a trailing count, not rows.

3. **Checkpoint** — stop and ask via the question UI: **accept** / **edit** (revise, re-present, ask again) / **reject** (report nothing changed, stop). A hard gate — no priority is written unapproved; the user owns the ordering.

4. **Apply** — delegate to `wystack-agent-kit:task-manager` as a single batched instruction: the `{id, new priority}` pairs for changed items only. One call, not a loop.

5. **Report** — old → new per changed task, the unchanged count, and the next step (`wystack-agent-kit:next-task` to see the new top of the queue).

## Rules

- **Ordering and approval live here; task CRUD lives in `task-manager`.** No codebase exploration — priority is a queue decision, not a code decision.
- **Roles and priority values, not literal names** — map onto the configured vocabularies; never hardcode either.

## Edge cases

- **No open items, or only one** — nothing to re-sort; say so and stop.
- **Discovery returns too little** — fetch the missing pieces directly rather than re-running the agent.
- **Flattening is not reprioritizing** — pushing every item to the same top priority destroys the signal; if the proposal trends that way, surface it and ask whether the goal is really re-ranking.
