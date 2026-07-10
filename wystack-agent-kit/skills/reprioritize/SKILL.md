---
name: reprioritize
description: "Re-sort a project's task backlog — propose a new priority ordering across the open work items, get approval, apply it. Use when the user asks to reprioritize the backlog, re-rank tasks, re-sort the queue, shuffle priorities, or rebalance what matters most across the board."
---
# Reprioritize

Re-rank the backlog as one deliberate operation — discover, propose, approve, apply.

`$ARGUMENTS` — project hint, or empty (resolve the project from the workspace).

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the workspace, the task provider, the status vocabulary, and the priority vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Architecture

| Concern | Where | Why |
|---|---|---|
| Orchestration, ranking judgment, user interaction | **Main agent** | Needs conversation context and the loaded vocabularies |
| Work-item discovery + priority writes | **`wystack-agent-kit:task-manager`** | Provider quirks and confirmation noise stay out of context |

This skill owns the ordering and the approval, never task CRUD; no codebase exploration — priority is a queue decision, not a code decision.

## Workflow

### 1. Resolve the project

`$ARGUMENTS` names the project; otherwise take the project identity from the workspace. The workspace also yields the task provider, the status vocabulary, and the **priority vocabulary** — this provider's priority field and its ordered values (e.g. Urgent/High/Medium/Low/None, or whatever the project configured). Never assume a fixed set.

### 2. Discover the open work items

Spawn `wystack-agent-kit:task-manager` (lightweight model tier when available) for provider-specific discovery — keeps verbose API output out of the main context. Ask it to:

- search the task store for the project's work items;
- return the **open** set — not-yet-done items eligible for re-ranking, mapped via the status vocabulary: groomed-ready and not-yet-groomed. Exclude in-flight (already chosen), blocked, and closed items;
- return each as: ID, title, status, current priority, estimate, type, blocked-by / blocking relations.

### 3. Propose the new ordering

Rank the open items by what should come first now — urgency, unblocking power, type, estimate, and any direction from the conversation. Map the ranking onto the provider's priority vocabulary. Then build the proposal table:

| ID | Title | Current | Proposed | Rationale |
|---|---|---|---|---|

One row per item whose priority changes; one-line rationale per changed row. Unchanged items: list as a trailing count, not rows. Deliver the table and mark it recommended.

### 4. Checkpoint — wait for approval

Stop. Ask via the harness question UI: **accept** / **edit** / **reject**. No priority is written until the user answers.

- **Edit** — ask what to change, revise the table, re-present, ask again.
- **Reject** — report nothing changed and stop.

This is a hard gate. There is no confidence threshold that lets the apply step run unapproved — the user owns the ordering.

### 5. Apply the approved ordering

Delegate to `wystack-agent-kit:task-manager` as a single batched instruction — the full list of `{id, new priority}` pairs for changed items only. One call, not a loop.

### 6. Report

Old → new priority per changed task, the count of items left unchanged, and the next step (`wystack-agent-kit:next-task` to see the new top of the queue).

## Edge cases

- **No open items, or only one** — nothing to re-sort; say so and stop.
- **Discovery returns too little** — fetch 1-2 more directly rather than re-running the agent.
- **Flattening is not reprioritizing** — pushing every item to the same top priority destroys the signal. If the proposal trends that way, surface it and ask whether the goal is really re-ranking.

## Principles

- **Propose, never silently re-sort** — the table is the artifact; the user approves it before any write.
- **Roles and priority values, not literal names** — map onto the configured status and priority vocabularies; never hardcode either.
