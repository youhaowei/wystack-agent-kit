---
name: prd
description: "Write a Product Requirements Document — a behavior spec of what the system should do, in user language. Use when a feature needs formal documentation before breakdown into tickets, or after wystack-agent-kit:brainstorm produces a design to capture. Skip implementation and architecture detail — that belongs in wystack-agent-kit:spec."
---
# PRD

A behavior spec: what the system should do, in user language. The source of truth tickets reference — it outlives individual tasks.

`$ARGUMENTS` — feature description, brainstorm output, or empty (interactive).

**Prerequisite.** Load `wystack-agent-kit:workspace` for the configured doc store and provider mappings. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## What a PRD captures

- **Purpose** — why this exists, what pain it solves.
- **Users** — who uses it, what they care about.
- **Goals / non-goals** — what we optimize for, what we explicitly won't do.
- **User stories** — one sentence each: "As a [role], I want [goal], so that [value]." Grouped by concern, each with a stable requirement ID that tests and code trace to — the ID never changes. The format follows the workspace's `conventions.requirementIdFormat` (default `<PRD-KEY>-US-<group>.<item>`, e.g. `MEM-US-1.2`; short form `US-1.2` within its own PRD). Detailed acceptance criteria live on tickets.
- **Scenarios + edge cases** — concrete examples, and a what-if / expected-behavior table.
- **Dependencies** — what must exist first.

## What vs how

A PRD describes **what** and **why**, never **how**. Implementation — tech choices, schemas, API contracts, architecture, phasing, domain modeling (bounded contexts, aggregates) — belongs in `wystack-agent-kit:spec`.

Test: if removing a detail changes the *user experience*, it's a PRD. If it only changes the *implementation*, it's a spec.

> PRD — "Memories are stored as human-readable markdown files."
> Spec — "Files use YAML frontmatter: id, name, namespace, tags, indexedAt."

## Workflow

1. **Research** — explore the codebase and the configured doc store for related specs, and any competitor profiles from `wystack-agent-kit:competitor-analysis` — they sharpen goals and non-goals.
2. **Interview** — if a `brainstorm` design is already in context, build the PRD from it. Otherwise invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full — no ad-hoc inline questions.
3. **Terms** — use canonical term names. A term the spec defines (technical or shared domain term) is cited in context — a one-clause use + link to its Key concepts entry, not a re-definition. A pure product term the spec doesn't own is defined inline, next to its first use. See `docs/doc-model.md` § Terms.
4. **Write** — one-line stories with stable IDs, complete coverage (every use case has a story), behaviors not implementation.
5. **Save + cross-link** — delegate to `wiki-librarian`: title prefixed "PRD — ", full content, project, tags. Link neighbors per `docs/doc-model.md` Cross-linking — the specs that design it (bidirectional) and the tickets that carry it. Verify backlinks resolve before reporting done. Never call doc-store APIs directly.

A product-level decision with real alternatives — a chosen scope, a deliberate non-goal, a platform bet — is recorded in the PRD itself, next to the goal or non-goal it shapes, as _what we chose / the alternatives / why_. Keep it tight and edit it in place as intent evolves; don't bury the reasoning in prose. For spec-owned terms, cite in context (a one-clause use + link to the definition). See `docs/doc-model.md` § Cite in context.

See `docs/doc-model.md` for how the PRD relates to spec, terms, and requirement IDs.
