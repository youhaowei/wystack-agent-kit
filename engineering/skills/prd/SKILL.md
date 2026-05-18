---
name: prd
description: "Write a Product Requirements Document — a behavior spec of what the system should do, in user language. Use when a feature needs formal documentation before breakdown into tickets, or after engineering:brainstorm produces a design to capture. Skip implementation and architecture detail — that belongs in engineering:spec."
---
# PRD

A behavior spec: what the system should do, in user language. The source of truth tickets reference — it outlives individual tasks.

`$ARGUMENTS` — feature description, brainstorm output, or empty (interactive).

**Prerequisite.** Load `engineering:workspace` for the configured doc store and provider mappings. If the workspace isn't set up, run `engineering:setup-agent-kit`.

## What a PRD captures

- **Purpose** — why this exists, what pain it solves.
- **Users** — who uses it, what they care about.
- **Goals / non-goals** — what we optimize for, what we explicitly won't do.
- **User stories** — one sentence each: "As a [role], I want [goal], so that [value]." Grouped by concern, each with a stable ID (`F-1.2`) that tests and code trace to — the ID never changes. Detailed acceptance criteria live on tickets.
- **Scenarios + edge cases** — concrete examples, and a what-if / expected-behavior table.
- **Dependencies** — what must exist first.

## What vs how

A PRD describes **what** and **why**, never **how**. Implementation — tech choices, schemas, API contracts, architecture, phasing, domain modeling (bounded contexts, aggregates) — belongs in `engineering:spec`.

Test: if removing a detail changes the *user experience*, it's a PRD. If it only changes the *implementation*, it's a spec.

> PRD — "Memories are stored as human-readable markdown files."
> Spec — "Files use YAML frontmatter: id, name, namespace, tags, indexedAt."

## Workflow

1. **Research** — explore the codebase and the configured doc store for related specs, and any competitor profiles from `engineering:competitor-analysis` — they sharpen goals and non-goals.
2. **Interview** — if a `brainstorm` design is already in context, build the PRD from it. Otherwise invoke `Skill("engineering:brainstorm", "--grill")` and let it run in full — no ad-hoc inline questions.
3. **Glossary** — load the project glossary via `wiki-librarian`. Use canonical term names; if the PRD introduces a new term, seed it via `engineering:glossary` before finalizing.
4. **Write** — one-line stories with stable IDs, complete coverage (every use case has a story), behaviors not implementation.
5. **Save** — delegate to `wiki-librarian`: title prefixed "PRD — ", full content, project, tags, related links. Ensure bidirectional links to related specs/tickets. Never call doc-store APIs directly.

See `docs/doc-model.md` for how the PRD relates to spec, glossary, and requirement IDs.
