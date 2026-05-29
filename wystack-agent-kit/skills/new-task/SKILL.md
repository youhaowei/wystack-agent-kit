---
name: new-task
description: "Create a new work item in the configured task system with codebase-aware scope, acceptance criteria, and estimate. Use when the user wants to capture new engineering work, turn an idea into a task, or write up follow-on implementation work."
---
# New Task

Create a codebase-informed work item — gather, dedup, explore, size, create.

`$ARGUMENTS` — task description, or empty (ask).

**Prerequisites.** Load `wystack-agent-kit:workspace` — resolves the workspace, the task provider, the project identity, and the status vocabulary. Load `wystack-agent-kit:estimation` — the sizing scale plus `tuning.json` calibration. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Architecture

| Concern | Where | Why |
|---|---|---|
| Orchestration, user interaction, sizing | **Main agent** | Needs conversation history and the loaded `estimation` scale |
| Codebase exploration | **`Explore` subagent** | File contents stay out of the main context |
| Task-store search + writes | **`wystack-agent-kit:task-manager`** | Provider quirks and confirmation noise stay out |

## Workflow

### 1. Gather the request

If `$ARGUMENTS` is empty, ask via the harness question UI — type (Bug / Feature / Tech Debt / Research), then a brief description of the work.

### 2. Resolve the project

`$ARGUMENTS` or conversation context may name the project; otherwise take the project identity from the workspace.

### 3. Check for duplicates

Before exploring, spawn `wystack-agent-kit:task-manager` to search the task store for similar-titled items. If a near-match exists, surface it and ask, recommending **extend the existing task** on a strong match: extend / create anyway / cancel. Creating a duplicate is a common, costly failure — this step is not optional.

### 4. Explore codebase impact

Spawn an `Explore` subagent. It returns observations, not judgments:

```
Task: "{description}"
Project: {project}

Report:
1. Affected files — paths + brief rationale.
2. Implementation complexity — files touched, new vs existing patterns, design decisions required, cross-cutting reach.
3. Potential blockers — dependencies, unknowns, prerequisites.
4. Suggested acceptance criteria — concrete, verifiable, referencing actual file paths.
   Apply `docs/testing-philosophy.md`: do not invent a test criterion unless a concrete risk earns one.

Exploration depth: "quick" for a likely small task, "medium" for likely large/cross-cutting.
```

### 5. Size and present the proposal

Apply the loaded `wystack-agent-kit:estimation` scale to the Explore signals — pick the size; estimation owns the rubric and the calibration.

Present the proposal: title, type, priority (Medium unless clearly urgent), estimate, a description refined by the codebase analysis, acceptance criteria (one code-referencing, one verification — strategic test / runtime check / screenshot / typecheck / lint), and affected files. Confirm via the question UI: create as-is / edit first / cancel. On "edit first", ask what to change, update, re-present.

### 6. Create

Delegate to `wystack-agent-kit:task-manager` — a provider-neutral create:

```
Fields: title, status (configured backlog/not-started role), priority, estimate, type, project.
Body:
  ## Description
  ## Acceptance Criteria   (numbered)
  ## Scope                 — Files / Tests / Docs (per the estimation tier)
```

Research-type tasks default to the configured deferred/backlog status. Require the created work-item URL/ID back.

### 7. Offer next steps

Report `{id} — {title}` and location, then ask: plan it (`wystack-agent-kit:groom`) / start working (`wystack-agent-kit:start-task`) / done.

## Edge cases

- **XXL estimate** — recommend splitting into sub-tasks before creating.
- **No project resolvable** — ask the user which project rather than guessing.

## Principles

- **Explore observes, the main agent judges** — the subagent reports complexity signals; sizing happens in the main context where the `estimation` scale is loaded.
- **Roles, not literal statuses** — map onto the configured status vocabulary; never hardcode status names.
