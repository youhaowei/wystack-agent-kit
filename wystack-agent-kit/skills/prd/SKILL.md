---
name: prd
description: "Write a Product Requirements Document — a behavior spec of what the system should do, in user language. Use when a feature needs formal documentation before breakdown into tickets, or after wystack-agent-kit:brainstorm produces a design to capture. Skip implementation and architecture detail — that belongs in wystack-agent-kit:spec."
---
# PRD

A behavior spec: what the system should do, in user language. The source of truth tickets reference — it outlives individual tasks.

**Write the product, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, one-line decisions, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. A PRD inherits all of it: open with what the feature *does* for the user, never "this PRD describes…"; product-level decisions default to one-liners; and before writing, ask whether this feature earns its own PRD or folds into a parent one.

`$ARGUMENTS` — feature description, brainstorm output, or empty (interactive).

**Prerequisite.** Load `wystack-agent-kit:workspace` for the configured doc store and provider mappings. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## What a PRD captures

- **Purpose** — why this exists, what pain it solves.
- **Users** — who uses it, what they care about.
- **Goals / non-goals** — what we optimize for, what we explicitly won't do.
- **Story index** — a link per story: requirement ID · one-sentence goal · link to the canonical story. The story's home (configured via `requirements.storyHome`) provides the stable ID; the PRD never mints IDs and never mirrors story bodies. Requirement body, scenarios, edge cases, and acceptance criteria live on the Story — see `wystack-agent-kit:story` and `docs/doc-model.md` § Story. Surface story status inline only when the link alone wouldn't make it obvious (e.g. a Superseded story the reader shouldn't follow).
- **Cross-story interactions** — an interaction table for behaviors that span multiple stories and are owned by no single one. Per-story scenarios and edge cases belong on the Story, not here.
- **Dependencies** — what must exist first.

## What vs how

A PRD describes **what** and **why**, never **how**. Implementation — tech choices, schemas, API contracts, architecture, phasing, domain modeling (bounded contexts, aggregates) — belongs in `wystack-agent-kit:spec`.

Test: if removing a detail changes the *user experience*, it's a PRD. If it only changes the *implementation*, it's a spec.

> PRD — "Memories are stored as human-readable markdown files."
> Spec — "Files use YAML frontmatter: id, name, namespace, tags, indexedAt."

## Workflow

1. **Research** — explore the codebase and the configured doc store for related specs, and any competitor positioning already researched — it sharpens goals and non-goals.
2. **Interview** — if a `brainstorm` design is already in context, build the PRD from it. Otherwise invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full — no ad-hoc inline questions.
3. **Terms** — use canonical term names, cited from the glossary. Every domain term — product or technical — is defined once in its glossary note; the PRD cites it `[[term-slug]]` in context (a one-clause use + link), never re-defines it. A term the PRD introduces that has no note yet gets one via `wystack-agent-kit:glossary` first, then is cited. See `docs/doc-model.md` § Terms.
4. **Write** — PRD intent, goals/non-goals, users, dependencies, and the story index. For each story: one-sentence goal and a link placeholder. Author story bodies (requirement sentence, details, scenarios, edge cases, ACs) by invoking `wystack-agent-kit:story` — the story skill owns the canonical artifact; the PRD holds the index of links. Complete coverage means every use case has a story and a corresponding index entry.
5. **Save + cross-link** — delegate to `wiki-librarian`: title prefixed "PRD — ", full content, project, tags. Link neighbors per `docs/doc-model.md` § Cross-linking — the specs that design it (bidirectional), the story links that form the index, and the tickets that carry it. Verify backlinks resolve before reporting done. Never call doc-store APIs directly.

A product-level decision with real alternatives — a chosen scope, a deliberate non-goal, a platform bet — is recorded in the PRD itself, next to the goal or non-goal it shapes, as _what we chose / the alternatives / why_. Keep it tight and edit it in place as intent evolves; don't bury the reasoning in prose. For domain terms, cite the glossary note in context (a one-clause use + `[[term-slug]]` link). See `docs/doc-model.md` § Cite in context.

See `docs/doc-model.md` § Story and § Requirements in the repo for how the PRD story index, canonical story home, and requirement IDs relate. Stories are authored via `wystack-agent-kit:story`; requirement IDs are allocated by the story's canonical home, not the PRD.
