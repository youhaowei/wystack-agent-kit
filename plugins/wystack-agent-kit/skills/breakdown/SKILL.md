---
name: breakdown
description: "Turn a requirement (Story) into an implementation plan — vertical-slice tickets ready to build. Use when a feature is defined (PRD/spec/story) but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, story, or design into tasks."
---
# Breakdown

Prerequisite: `wystack-agent-kit:workspace` for the configured task/doc providers.

## Workflow

1. **Load the requirement + context.** requirement docs (PRD, Story), implementation plan (Spec or Memory), and codebase context.

2. **Audit the requirement — fit to break down?** One coherent requirement, testable product acceptance, specced enough to plan. Unclear or incoherent → kick back to `wystack-agent-kit:story` / `:prd`; don't plan off a bad requirement or self-heal it here (breakdown is only as good as its input). A fitness gate at the input, not authoring — `story` / `prd` own the requirement bar.

3. **Break down the requirement — vertical slices.** Smallest *complete* pieces that each ship value: every slice cuts all layers (form → API → DB → response), a user outcome not a component, independently testable, thinnest path first, deps explicit. INVEST is the brake, not a push to split — merge back any slice that isn't independently *Valuable* (a horizontal fragment).

4. **Plan the implementation.** Per slice, the approach from the spec's architecture — key interfaces, data changes, integration points, sequencing — enough to guide the implementer, not a binding contract. Estimate each (`wystack-agent-kit:estimate`; not a split gate).

5. **Emit tickets.** One per slice via `wystack-agent-kit:task-manager`; require the real URLs/IDs back. Each carries:
   - what the slice does + **concrete testable ACs** — the Story owns the requirement bar (by ID, never restated)
   - the slice's **implementation plan** and **estimate** from step 4
   - verification approach, dependencies, and `Source documents` linking the Story (by requirement ID), PRD, spec

6. **Back-link into sources (mandatory).** Via `wiki-librarian`, add/update an `Implementation tickets` section on the Story (coverage closes here), PRD, and spec. Shared doc+task tracker → the native parent/child link is the back-link; one source doc only → update it, flag the gap. **Verify by fetching**, not write receipts. Can't write → report a **setup gap** (blocker + the fix that automates it next time), don't hand over a chore.

## Reference

- `docs/doc-model.md` § Story — the story/ticket ownership model this skill applies.
- `wystack-agent-kit:estimate` — sizes each ticket's complexity.
- `wystack-agent-kit:task-manager` / `wystack-agent-kit:wiki-librarian` — provider adapters; never call provider APIs directly unless the adapter says so.
