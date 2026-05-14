---
name: breakdown
description: "Turn a PRD or feature spec into actionable vertical-slice tickets. Use when a feature is defined but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, or design into tasks."
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

Turn a PRD into actionable tickets.

`$ARGUMENTS` — Notion PRD URL, spec URL, doc path, or empty (search for recent PRDs/specs).

**Prerequisites.** Load the `engineering:workspace` skill first for Notion schemas.

1. **Load PRD + Spec.** Fetch the PRD (what to build) and spec (key decisions, architecture). Understand: user goals, system boundaries, and the architectural decisions that inform how to slice.
2. **Explore codebase.** Understand what exists — affected modules, integration points, existing patterns, test infrastructure. This informs where to draw slice boundaries.
3. **Slice vertically.** Break the PRD into vertical slices — each cuts through all layers (UI, service, data) as a thin complete feature. Each slice should be:
   - Independently implementable via `tdd`.
   - Testable end-to-end on its own.
   - Proves integration across the layers it touches.

   Order slices so the first is the thinnest possible end-to-end path. Later slices add depth. Dependencies between slices must be explicit.
4. **Phase into shippable increments.** Group slices into phases. Phase 1 is the thinnest end-to-end slice — proves integration across all layers. Later phases add depth, edge cases, polish. Each phase ships.
5. **Create tickets.** Each slice becomes a ticket referencing both the PRD (which stories it satisfies) and the spec (which architectural decisions apply). Include: what this slice does, ACs, suggested test approach, dependencies on other slices. Delegate creation to `engineering:task-manager` and require the actual ticket URLs/IDs back. Tickets must include a `Source documents` / `Related docs` section linking the PRD and spec, plus the relevant requirement IDs / decision anchors.
6. **Back-link tickets into source docs (mandatory).** After tickets are created, delegate to `engineering:wiki-librarian` to update the source PRD and spec:
   - Add or update an `Implementation tickets` section in the PRD with each ticket URL grouped by user story / requirement ID.
   - Add or update an `Implementation tickets` section in the spec with each ticket URL grouped by phase / architectural area / decision anchor.
   - If only one source doc exists, update that doc and note the missing counterpart.
   - **Verify** the updated PRD/spec pages by fetching them; do not report success from write receipts alone.
   - If wiki pages can't be updated automatically, report an explicit manual follow-up with the exact ticket links and target section text.

</what-to-do>

<supporting-info>

## Reference

- `engineering:workspace` — Notion schemas + project URLs (load before starting).
- `engineering:task-manager` / `engineering:wiki-librarian` — never call Notion MCP tools directly.

## Splitting techniques (SPIDR)

When a slice is still too big, split by:

- **Spike** — extract unknowns into research tickets first.
- **Paths** — split by alternative flows (happy path first, error handling later).
- **Interfaces** — split by input/output method.
- **Data** — split by data variations (simple case first, complex later).
- **Rules** — split by business rules (basic first, edge cases later).

## Ticket quality (INVEST)

Each ticket should be:

- **Independent** — can be worked on in any order (minimize dependencies).
- **Negotiable** — not over-specified, room for implementation judgment.
- **Valuable** — delivers visible user value, not just technical infrastructure.
- **Estimatable** — clear enough to size.
- **Small** — completable in one sprint.
- **Testable** — acceptance criteria can be written immediately.

## Principles

- **Vertical, not horizontal** — _"login form → API → DB → response"_, not _"all UI first, then all backend"_.
- **Thin first** — the first slice should be embarrassingly simple but fully integrated.
- **Each slice is verification-ready** — clear enough to name the right proof: strategic test, runtime check, screenshot, typecheck, or lint.
- **Reference the PRD** — tickets link back to the behavior spec; don't duplicate it.
- **Bidirectional traceability** — every created ticket links to its PRD/spec, and the PRD/spec link back to the actual ticket URLs before breakdown is considered complete.
- **Stories, not tasks** — _"user can see workflow progress"_, not _"build the progress tracking service"_.

</supporting-info>
