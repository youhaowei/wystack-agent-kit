---
name: new-task
description: "Create a new work item in the configured task system with codebase-aware scope, acceptance criteria, and estimate. Use when the user wants to capture new engineering work or turn an idea into a task."
---
# New Task

Create a codebase-informed work item — gather, dedup, explore, size, create.

`$ARGUMENTS` — task description, or empty (ask).

**Prerequisites.** Load `wystack-agent-kit:workspace` and `wystack-agent-kit:estimate`. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Workflow

1. **Gather** — type (Bug / Feature / Tech Debt / Research) and description from `$ARGUMENTS` or ask via the question UI. Project from the arguments or conversation, else the workspace identity; unresolvable → ask, never guess.

2. **Dedup** — spawn `wystack-agent-kit:task-manager` to search the task store for similar-titled items. Near-match → surface it and ask: extend the existing task (recommended on a strong match) / create anyway / cancel.

3. **Explore** — spawn `Explore`; it reports observations, not judgments: affected files, the correctness surface (cases and invariants the change must hold, cross-cutting reach, design decisions required), potential blockers, and suggested ACs referencing real paths (tests per `docs/testing-philosophy.md` — no test criterion unless a concrete risk earns one).

4. **Size and propose** — size per `wystack-agent-kit:estimate` from the observations. Present: title, type, priority (Medium unless clearly urgent), estimate, description refined by the analysis, ACs (one code-referencing, one verification), affected files. Confirm via the question UI: create as-is / edit first / cancel.

5. **Create** — delegate to `wystack-agent-kit:task-manager`: title, status (configured backlog role; Research defaults to the deferred role), priority, estimate, type, project; body `## Description` / `## Acceptance Criteria` (numbered) / `## Scope` (Files / Tests / Docs). Require the created work-item URL/ID back.

6. **Report** — `{id} — {title}` and location, then offer: plan it (`wystack-agent-kit:groom`) / start working (`wystack-agent-kit:start-task`) / done.

## Rules

- **Roles, not literal statuses** — map onto the configured status vocabulary; never hardcode status names.
- **XXL estimate** — likely bundles more than one independently valuable outcome; offer `wystack-agent-kit:breakdown` before creating. Size alone never forces a split.
