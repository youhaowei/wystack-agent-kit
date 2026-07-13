---
name: breakdown
description: "Turn a requirement (Story) into an implementation plan — vertical-slice tickets ready to build. Use when a feature is defined (PRD/spec/story) but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, story, or design into tasks."
---

# Breakdown

Turn a groomed requirement into vertical-slice tickets ready to build.

Prerequisite: `wystack-agent-kit:workspace`.

## Workflow

1. **Load the requirement + context.** Requirement docs (PRD, Story), implementation plan (Spec or Memory), codebase context.

2. **Audit fitness.** One coherent requirement, testable product acceptance, specced enough to plan. Unclear or incoherent → kick back to `wystack-agent-kit:story` / `:prd`; never self-heal the requirement here.

3. **Slice vertically.** Smallest complete pieces that each ship a user outcome through every layer — independently testable, thinnest path first, deps explicit. INVEST is a brake on over-splitting: merge back any slice that isn't independently Valuable.

4. **Plan each slice.** The approach from the spec's architecture — key interfaces, data changes, integration points, sequencing — enough to guide the implementer, not a binding contract. Size with `wystack-agent-kit:estimate`; size never forces a split.

5. **Emit tickets.** One per slice via `wystack-agent-kit:task-manager`; require the real URLs/IDs back. Each carries: what the slice does + concrete testable ACs (the Story owns the requirement bar — link by ID, never restate), the slice's plan and estimate, verification approach, dependencies, and `Source documents` linking Story, PRD, spec.

6. **Back-link into sources.** Via `wystack-agent-kit:wiki-librarian`, add/update an `Implementation tickets` section on the Story, PRD, and spec — on a shared doc+task tracker the native parent/child link counts. Verify by fetching, never write receipts. Can't write → report a setup gap with the fix that automates it next time.

## Reference

- `docs/doc-model.md` § Story — the story/ticket ownership model.
- `wystack-agent-kit:task-manager` / `:wiki-librarian` — provider adapters; never call provider APIs directly unless the adapter says so.
