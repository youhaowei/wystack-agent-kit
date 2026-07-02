---
name: groom
description: "Groom engineering tasks — codebase-aware scope, acceptance criteria, estimates, and an implementation plan. Use when the user asks to plan a task, refine a ticket, or prepare implementation-ready next steps."
---
# Groom

Refine tasks and write implementation plans — one task or a batch.

`$ARGUMENTS` — work-item URL/path (single-task), project name (batch), or empty (batch, project from CWD).

**Prerequisites.** Load `wystack-agent-kit:workspace` (resolves the workspace) and `wystack-agent-kit:estimation` (applies `tuning.json` calibration). If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Single-task

1. **Fetch** task details via the configured provider — title, status, estimate, description, ACs, relations, linked specs.
2. **Groom** — skip if estimate + ACs + scope are already present. Else fetch dependencies, spawn `Explore` with the analysis prompt ([EXPLORATION-PROMPTS.md](EXPLORATION-PROMPTS.md#groom-analysis)), present for triage with a recommended call — **accept** when the Explore analysis is clean, otherwise the specific change it points to (re-rank priority / re-estimate / redefine / split / skip).
3. **Plan** — spawn `Explore` with the implementation-plan prompt; present; ask save / revise / skip. Skip the run if a `## Plan` section already exists and the user doesn't ask to redo it.
4. **Apply** via the provider adapter — update estimate/priority, append `## Acceptance Criteria` / `## Scope` / `## Plan`. Promote to the configured Ready status once the task has an estimate, ACs, a scope definition, and no incomplete blocker.
5. **Report** — old → new estimate, sections written, next step (`wystack-agent-kit:start-task <task-url>`). If the grooming session ran long and work continues elsewhere, consider `wystack-agent-kit:handoff` to consolidate it.

## Batch

1. **Overview** — search the work-item store; return counts by status + a compact list (ID, title, status, priority, estimate). No full fetches.
2. **Ask scope** before fetching — full sweep / quick triage (missing fields) / stale tasks / specific epic.
3. **Loop** — run single-task on each; between tasks ask continue / stop. At the end, deliver the [batch summary](EXPLORATION-PROMPTS.md#batch-summary-format).

## Principles

- **Scope first, fetch later** — ask what to review before pulling details.
- **Parallel subagents** — provider fetch + `Explore` run concurrently; only summaries return to the main context.
- **Estimation covers the whole job** — tests, docs, migration included.
- **Adaptive depth** — match `Explore` thoroughness to task size and complexity.

## Reference

- [EXPLORATION-PROMPTS.md](EXPLORATION-PROMPTS.md) — Explore subagent prompts and presentation formats.
