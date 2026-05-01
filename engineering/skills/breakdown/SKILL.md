---
name: breakdown
description: "Turn a PRD or feature spec into actionable vertical-slice tickets. Use when a feature is defined but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, or design into tasks."
---

# Breakdown

Turn a PRD into actionable tickets. Load the `engineering:workspace` skill first for Notion schemas.

`$ARGUMENTS` — Notion PRD URL, spec URL, doc path, or empty (search for recent PRDs/specs).

## Flow

### 1. Load PRD + Spec
Fetch the PRD (what to build) and spec (key decisions, architecture). Understand: user goals, system boundaries, and the architectural decisions that inform how to slice.

### 2. Explore Codebase
Understand what exists: affected modules, integration points, existing patterns, test infrastructure. This informs where to draw slice boundaries.

### 3. Slice Vertically
Break the PRD into **vertical slices** — each cuts through all layers (UI, service, data) as a thin complete feature. Each slice should be:
- Independently implementable via `tdd`
- Testable end-to-end on its own
- Proves integration across the layers it touches

Order slices so the first one is the thinnest possible end-to-end path. Later slices add depth. Dependencies between slices should be explicit.

### 4. Phase Into Shippable Increments
Group slices into phases. Phase 1 is the thinnest end-to-end slice — proves integration across all layers. Later phases add depth, edge cases, polish. Each phase should be shippable.

### 5. Create Tickets
Each slice becomes a ticket referencing both the PRD (which stories it satisfies) and the spec (which architectural decisions apply). Include: what this slice does, acceptance criteria, suggested test approach, dependencies on other slices.

Delegate ticket creation to `engineering:task-manager` and require it to return the created ticket URLs/IDs. Tickets must include a `Source documents` / `Related docs` section in the body with links to the PRD and spec, plus the relevant requirement IDs / decision anchors.

### 6. Back-Link Tickets Into Source Docs
After tickets are created, delegate to `engineering:wiki-librarian` to update the source PRD and spec with links to the actual tickets. This is mandatory traceability work, not cleanup.

- Add or update an `Implementation tickets` section in the PRD with each ticket URL grouped by user story / requirement ID.
- Add or update an `Implementation tickets` section in the spec with each ticket URL grouped by phase / architectural area / decision anchor.
- If only one source doc exists, update that doc and note the missing counterpart.
- Verify the updated PRD/spec pages by fetching them; do not report success from write receipts alone.
- If wiki pages cannot be updated automatically, report an explicit manual follow-up with the exact ticket links and target section text.

## Splitting Techniques (SPIDR)

When a slice is still too big, split by:
- **Spike** — extract unknowns into research tickets first
- **Paths** — split by alternative flows (happy path first, error handling later)
- **Interfaces** — split by input/output method
- **Data** — split by data variations (simple case first, complex later)
- **Rules** — split by business rules (basic first, edge cases later)

## Ticket Quality (INVEST)

Each ticket should be:
- **Independent** — can be worked on in any order (minimize dependencies)
- **Negotiable** — not over-specified, room for implementation judgment
- **Valuable** — delivers visible user value, not just technical infrastructure
- **Estimatable** — clear enough to size
- **Small** — completable in one sprint
- **Testable** — acceptance criteria can be written immediately

## Principles

- **Vertical, not horizontal** — "login form → API → DB → response" not "all UI first, then all backend"
- **Thin first** — the first slice should be embarrassingly simple but fully integrated
- **Each slice is TDD-ready** — clear enough to write a failing test for
- **Reference the PRD** — tickets link back to the behavior spec, don't duplicate it
- **Bidirectional traceability** — every created ticket links to its PRD/spec, and the PRD/spec link back to the actual ticket URLs before breakdown is considered complete
- **Stories, not tasks** — "user can see workflow progress" not "build the progress tracking service"
