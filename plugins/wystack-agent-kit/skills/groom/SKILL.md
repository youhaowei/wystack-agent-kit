---
name: groom
description: "Groom engineering tasks — codebase-aware scope, acceptance criteria, estimates, and an implementation plan. Use when the user asks to plan a task, refine a ticket, or prepare implementation-ready next steps."
---
# Groom

The fixed per-ticket loop that closes a ticket's distance to Ready — fetch, analyze, size, plan, write back, promote. Run it on one ticket, or over a batch.

`$ARGUMENTS` — work-item URL/path (single-task), project name (batch), or empty (batch, project from CWD).

**Prerequisites.** Load `wystack-agent-kit:workspace` and `wystack-agent-kit:estimate`. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Single-task

1. **Fetch** task details via the configured provider — title, status, estimate, description, ACs, relations, linked specs.

2. **Analyze** — skip if estimate + ACs + scope are already present. Else fetch dependencies and spawn `Explore` — provider fetch and `Explore` run concurrently; only summaries return to the main context. Explore reports observations, not judgments: affected files, the correctness surface (cases and invariants the change must hold, cross-cutting reach, design decisions required), scope (tests per `docs/testing-philosophy.md` — default none unless a concrete risk earns one; docs; migration), suggested ACs referencing real paths, and a split signal when the ticket bundles independently valuable outcomes (the split is `wystack-agent-kit:breakdown`'s call; size alone never forces one).

3. **Size** per `wystack-agent-kit:estimate` from the observations. Present for triage with a recommended call — **accept** when the analysis is clean, otherwise the specific change it points to (re-rank priority / re-estimate / redefine / split / skip).

4. **Plan** — spawn `Explore` for an implementation plan: ordered steps citing specific files and existing patterns to follow, test strategy per `docs/testing-philosophy.md`, dependencies, risk areas, decisions needing user input. Present; ask save / revise / skip. Skip the run if a `## Plan` section already exists and the user doesn't ask to redo it.

5. **Apply** via the provider adapter — update estimate/priority, append `## Acceptance Criteria` / `## Scope` / `## Plan`. Promote to the configured Ready status once the ticket meets the Ready bar (`docs/doc-model.md` § Story).

6. **Report** — old → new estimate, sections written, next step (`wystack-agent-kit:start-task <task-url>`).

## Batch

1. **Overview** — search the work-item store; return counts by status + a compact list (ID, title, status, priority, estimate). No full fetches.
2. **Ask scope** before fetching — full sweep / quick triage (missing fields) / stale tasks / specific epic.
3. **Loop** — run single-task on each; between tasks ask continue / stop. Close with a summary: per-ticket changes, promoted to Ready, still needs work, updated priority stack.
