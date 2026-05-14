---
name: groom
description: "Groom engineering tasks with codebase-aware scope, acceptance criteria, estimates, and implementation planning. Use when the user asks to plan a task, refine a ticket, estimate work, or prepare implementation-ready next steps."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


<what-to-do>

Interactive, codebase-aware grooming and implementation planning. Merges backlog refinement with plan writing into one adaptive skill.

**Input:** `$ARGUMENTS` —

- **Work-item URL/path** → Single-task mode.
- **Project name** (e.g. `"knowledgebase"`) → Batch mode.
- **Empty** → Infer project from CWD, enter batch mode.

**Prerequisites.** Load `engineering:workspace` and `engineering:estimation` before sizing work. If `.wystack/storage.json` is missing, run `engineering:setup-agent-kit`.

## Single-task mode

1. **Fetch task details** — use the configured work-item provider. Return: title, status, priority, estimate, description, ACs, relations, linked specs.
2. **Groom (if needed)** — skip if the task already has estimate + ACs + scope. Otherwise fetch related-task dependencies (blocked-by, blocking, parent), and spawn `Explore` with the analysis prompt in [EXPLORATION-PROMPTS.md](EXPLORATION-PROMPTS.md#groom-analysis). Present results in the [groom-result format](EXPLORATION-PROMPTS.md#groom-result-format) and use the harness's native selection UI for triage (accept / reprioritize / re-estimate / redefine / split / skip-grooming).
3. **Plan (always)** — spawn `Explore` with the implementation-plan prompt in [EXPLORATION-PROMPTS.md](EXPLORATION-PROMPTS.md#implementation-plan). Present in the [plan format](EXPLORATION-PROMPTS.md#plan-format). Ask whether to save to the work item (save / revise / skip).
4. **Apply changes** — use the configured provider adapter. Update properties (estimate, priority). Append ACs under `## Acceptance Criteria`, scope under `## Scope`, plan under `## Plan`. Set status to **Ready** if [auto-ready criteria](#auto-promotion-to-ready) are met.
5. **Report** — short summary with old → new estimate, what sections were written, suggested next step (`engineering:start <task-url>`).

## Batch mode

1. **Lightweight overview** — search the configured work-item store for the project. Return only: task count by status + compact list (ID, title, status, priority, estimate). No descriptions or full fetches.
2. **Ask scope** — use the harness's native question UI *before* fetching details:
   - **Full sweep** — every non-Done task (warn if >15).
   - **Quick triage** — missing estimate, priority, or ACs.
   - **Stale tasks** — stuck in Not Started / Later.
   - **Specific epic** — drill into one area.
3. **Per-task loop** — for each task in scope, run single-task mode (steps 1-5). Between tasks, ask the user: continue / stop here.
4. **Session summary** — see the [batch summary format](EXPLORATION-PROMPTS.md#batch-summary-format).

## Auto-promotion to Ready

Set status to **Ready** when ALL hold:

- Has an estimate.
- Has acceptance criteria.
- Has a scope definition (files, tests, docs, migration).
- Is not blocked by an incomplete task.

</what-to-do>

<supporting-info>

## Reference

- [EXPLORATION-PROMPTS.md](EXPLORATION-PROMPTS.md) — Explore subagent prompts and presentation templates.
- `engineering:estimation` skill — relative-scale anchors, multipliers/reducers, model-tier mapping. Don't duplicate; load it.

## Architecture

| Concern | Where | Why |
|---|---|---|
| Refinement decisions, user interaction | **Main agent** | Needs conversation history |
| Work-item search & fetch | **provider adapter / work-item manager** | Verbose provider responses stay out |
| Codebase exploration | **`Explore` subagent** | File contents stay out |
| Work-item writes | **provider adapter / work-item manager** | Confirmation noise stays out |

## Interaction principles

- **Scope first, fetch later** — ask what to review before pulling details.
- **Parallel subagents** — provider fetch + Explore concurrent whenever possible.
- **One task at a time** — in batch mode, fully process each before moving on.
- **Estimation includes full scope** — tests, docs, migration are part of the estimate.
- **Adaptive depth** — if the user is moving fast, reduce Explore thoroughness (`quick` vs `very thorough`).
- **Main context stays clean** — only synthesized summaries return.
- **Auto-promote to Ready** — when all criteria met after grooming + planning.

</supporting-info>
