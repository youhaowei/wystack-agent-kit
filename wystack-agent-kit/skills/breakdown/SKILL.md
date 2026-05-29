---
name: breakdown
description: "Turn a PRD or feature spec into actionable vertical-slice tickets. Use when a feature is defined but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, or design into tasks."
---
# Breakdown

Turn a PRD into actionable vertical-slice tickets.

`$ARGUMENTS` — PRD URL/path, spec URL/path, doc path, or empty (search configured docs for recent PRDs/specs).

Prerequisite: load `wystack-agent-kit:workspace` first for configured task/doc providers.

## Workflow

1. **Load PRD + spec.** PRD = what to build; spec = key decisions and architecture. Extract user goals, system boundaries, and the decisions that inform how to slice.
2. **Explore codebase.** Affected modules, integration points, existing patterns, test infrastructure — informs where slice boundaries fall.
3. **Slice vertically.** Each slice cuts through all layers (UI, service, data) as a thin complete feature: independently implementable, testable end-to-end on its own, proves cross-layer integration. Order the thinnest end-to-end path first; later slices add depth. Inter-slice dependencies must be explicit.
4. **Phase into shippable increments.** Group slices into phases. Phase 1 = thinnest end-to-end slice (proves integration across all layers); later phases add depth, edge cases, polish. Each phase ships.
5. **Create tickets.** Each slice → one ticket referencing the PRD (which stories it satisfies) and the spec (which design applies). Include: what the slice does, ACs, suggested verification approach, slice dependencies, and a `Source documents` / `Related docs` section linking PRD + spec with relevant requirement IDs. Delegate creation to `wystack-agent-kit:task-manager`; require the actual ticket URLs/IDs back.
6. **Back-link tickets into source docs (mandatory).** Delegate to `wystack-agent-kit:wiki-librarian`:
   - Add/update an `Implementation tickets` section in the PRD, grouped by user story / requirement ID.
   - Add/update an `Implementation tickets` section in the spec, grouped by phase / architectural area / decision anchor.
   - Only one source doc exists → update it, note the missing counterpart.
   - **Verify** by fetching the updated pages — don't report success from write receipts alone.
   - Can't update automatically → report a **setup gap**: name what blocked the write (missing adapter capability, permissions) and the fix that automates it next time. Surface the gap; don't hand the user the edits as a chore.

## Splitting techniques (SPIDR)

When a slice is still too big:

- **Spike** — extract unknowns into research tickets first.
- **Paths** — split by alternative flows (happy path first, error handling later).
- **Interfaces** — split by input/output method.
- **Data** — split by data variations (simple case first, complex later).
- **Rules** — split by business rules (basic first, edge cases later).

## Ticket quality (INVEST)

- **Independent** — workable in any order; minimize dependencies.
- **Negotiable** — not over-specified; room for implementation judgment.
- **Valuable** — visible user value, not just technical infrastructure.
- **Estimatable** — clear enough to size.
- **Small** — completable in one sprint.
- **Testable** — acceptance criteria writable immediately.

## Principles

- **Vertical, not horizontal** — _"login form → API → DB → response"_, not _"all UI first, then all backend"_.
- **Each slice is verification-ready** — clear enough to name the right proof: strategic test, runtime check, screenshot, typecheck, or lint.
- **Stories, not tasks** — _"user can see workflow progress"_, not _"build the progress tracking service"_.

## Reference

- `wystack-agent-kit:task-manager` / `wystack-agent-kit:wiki-librarian` — use provider adapters; never call provider APIs directly unless the adapter says so.
