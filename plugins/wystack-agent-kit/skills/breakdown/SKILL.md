---
name: breakdown
description: "Turn a PRD or feature spec into actionable vertical-slice tickets. Use when a feature is defined but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, or design into tasks."
---
# Breakdown

`$ARGUMENTS` — PRD URL/path, spec URL/path, doc path, or empty (search configured docs for recent PRDs/specs).

Prerequisite: load `wystack-agent-kit:workspace` first for configured task/doc providers.

## Workflow

1. **Load PRD + spec + stories.** PRD = intent and story index (links to stories); spec = key decisions and architecture; stories = requirement bodies, acceptance criteria, scenarios, and edge cases per requirement (loaded from the canonical story home — doc store via `wiki-librarian` when `storyHome=docs`, work-item store when `storyHome=tasks`). Extract user goals, system boundaries, and the decisions that inform how to slice from all three. The PRD gives the index and intent; the story gives the per-requirement detail. When `adr` is enabled (`docs.types`) and the spec's Decisions link out to ADRs (`expands:`), read those ADRs for slice-shaping context — they carry the contested-decision rationale a one-liner compresses, the *why* behind a constraint, not new acceptance criteria.
2. **Explore codebase.** Affected modules, integration points, existing patterns, test infrastructure — informs where slice boundaries fall.
3. **Size first; split only over the threshold.** Sizing is `wystack-agent-kit:estimation`'s job, not a second judgment here. A story estimated **below** the split threshold (seed XXL/21, "split first"; project-tunable via `tuning.json`) is **one ticket** — it *is* its own ticket, don't decompose. Only a story **at or over** the threshold gets split. This is the common case's brake: most stories ship as a single ticket.
4. **Slice vertically (when splitting).** Each slice cuts through all layers (UI, service, data) as a thin complete feature — _login form → API → DB → response_, framed as a user outcome (_"user can see workflow progress"_) not a component (_"build the progress-tracking service"_): independently implementable, testable end-to-end, re-estimated below the threshold. Order the thinnest end-to-end path first; later slices add depth. Inter-slice dependencies must be explicit. Group the ordered slices into phases that each ship on their own.
5. **Create tickets.** Each slice → one task beneath its story (a story that fit under the threshold is already its own ticket — skip to back-linking). Include: what the slice does, its own **slice-level acceptance criteria** (this task's portion of done), a reference to the story's requirement-level acceptance criteria (cited by requirement ID, never restated — the Story owns the requirement bar, `docs/doc-model.md` § Story), suggested verification approach, slice dependencies, and a `Source documents` / `Related docs` section linking the story (by its home ID), the PRD, and the spec. Delegate creation to `wystack-agent-kit:task-manager`; require the actual ticket URLs/IDs back.
6. **Back-link tickets into source docs (mandatory).** Mechanism depends on `requirements.storyHome`:
   - **`storyHome=docs`** — delegate to `wystack-agent-kit:wiki-librarian`:
     - Add/update an `Implementation tickets` section in each **story page**, grouped by ticket (the coverage loop closes at the Story).
     - Add/update an `Implementation tickets` section in the **PRD**, grouped by requirement ID / story.
     - Add/update an `Implementation tickets` section in the **spec**, grouped by phase / architectural area / decision anchor.
   - **`storyHome=tasks`** — tickets are created as **sub-issues under the story-issue** (parent→child). The tracker's parent/child relationship is the back-link; no separate wiki update needed for story back-linking. Still update the spec's `Implementation tickets` section via `wiki-librarian`.
   - Only one source doc exists → update it, note the missing counterpart.
   - **Verify** by fetching the updated pages (or confirming sub-issue creation in `tasks` mode) — don't report success from write receipts alone.
   - Can't update automatically → report a **setup gap**: name what blocked the write (missing adapter capability, permissions) and the fix that automates it next time. Surface the gap; don't hand the user the edits as a chore.

## Splitting and sizing

Split only a story whose estimate reaches the threshold; a story under it ships as one ticket (step 3). When you do split, split on a SPIDR axis: spike, paths, interfaces, data, rules.

Every unit — story or task — holds INVEST, and here INVEST is a brake on splitting, not a push toward it. *Small* is the estimate against the threshold, a ceiling not a target; *Valuable* and *Independent* bound how far you slice. A task that isn't independently valuable is a horizontal fragment (a lone DB column, an API stub) — merge it back. Prefer the fewest vertical slices that each ship value. See `docs/doc-model.md` § Story.

## Reference

- `wystack-agent-kit:task-manager` / `wystack-agent-kit:wiki-librarian` — use provider adapters; never call provider APIs directly unless the adapter says so.
