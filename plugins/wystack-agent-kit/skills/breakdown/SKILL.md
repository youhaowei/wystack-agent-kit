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
3. **Slice vertically.** Each slice cuts through all layers (UI, service, data) as a thin complete feature — _login form → API → DB → response_, framed as a user outcome (_"user can see workflow progress"_) not a component (_"build the progress-tracking service"_): independently implementable, testable end-to-end, proves cross-layer integration. Order the thinnest end-to-end path first; later slices add depth. Inter-slice dependencies must be explicit.
4. **Phase into shippable increments.** Group the ordered slices into phases that each ship on their own; the first phase is that thinnest integrating slice, later phases add depth, edge cases, and polish.
5. **Create tickets.** Each slice → one ticket sliced off its story. Include: what the slice does, a reference to the story's acceptance criteria (cited by requirement ID, never restated — the Story owns them, `docs/doc-model.md` § Story), slice-level delivery checks that this ticket must prove beyond the story's ACs, suggested verification approach, slice dependencies, and a `Source documents` / `Related docs` section linking the story (by its home ID), the PRD, and the spec. Delegate creation to `wystack-agent-kit:task-manager`; require the actual ticket URLs/IDs back.
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

When a slice is too big, split on a SPIDR axis: spike, paths, interfaces, data, rules.

Size tickets on INVEST's delivery half — a ticket must be **Estimable** and **Small**. *Valuable*, *Negotiable*, and *Testable* are inherited from the story it's sliced off (`docs/doc-model.md` § Story); don't re-litigate them at the ticket.

## Reference

- `wystack-agent-kit:task-manager` / `wystack-agent-kit:wiki-librarian` — use provider adapters; never call provider APIs directly unless the adapter says so.
