---
name: prd
description: "Write a Product Requirements Document — a behavior spec of what the system should do, in user language. Use when a feature needs formal documentation before breakdown into tickets, or after wystack-agent-kit:brainstorm produces a design to capture. Skip implementation and architecture detail — that belongs in wystack-agent-kit:spec."
---
# PRD

A behavior spec: what the system should do, in user language — the source of truth tickets reference; it outlives individual tasks.

`$ARGUMENTS` — feature description, brainstorm output, or empty (interactive).

**Prerequisites.** Load `wystack-agent-kit:workspace` — doc store and provider mappings. Not set up → `wystack-agent-kit:setup-agent-kit`. Doc discipline is inherited from `docs/doc-model.md` § Write the artifact, not the document — and before writing, ask whether the feature earns its own PRD or folds into a parent one.

## What a PRD captures

- **Purpose** — why this exists, what pain it solves.
- **Users** — who uses it, what they care about.
- **Goals / non-goals** — what we optimize for, what we explicitly won't do. A product-level decision with real alternatives — a chosen scope, a deliberate non-goal, a platform bet — is recorded next to the goal it shapes as _what we chose / the alternatives / why_, kept tight and edited in place as intent evolves.
- **Story index** — one entry per story: requirement ID · one-sentence goal · link. The doc store provides the story's stable reference — the PRD never mints IDs and never mirrors story bodies; requirement sentence, scenarios, edge cases, and product acceptance live on the Story (`docs/doc-model.md` § Story). Surface story status inline only when the link would mislead (a Superseded story).
- **Cross-story interactions** — a table for behaviors that span multiple stories and are owned by no single one. Per-story scenarios and edge cases belong on the Story.
- **Dependencies** — what must exist first.

**What, never how.** Test: removing the detail changes the *user experience* → PRD; only the *implementation* → `wystack-agent-kit:spec`.

> PRD — "Memories are stored as human-readable markdown files."
> Spec — "Files use YAML frontmatter: id, name, namespace, tags, indexedAt."

## Workflow

1. **Research** — the codebase, the doc store's related specs, and any competitor positioning already researched — it sharpens goals and non-goals.
2. **Interview** — a `brainstorm` design already in context → build from it. Otherwise invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full — no ad-hoc inline questions.
3. **Terms** — cite every domain term in context using the doc store's link form, never re-define; a term with no glossary note yet gets one first via `wystack-agent-kit:glossary`, then is cited (`docs/doc-model.md` § Terms and ubiquitous language).
4. **Write** — intent, goals/non-goals, users, dependencies, story index. Author story bodies via `wystack-agent-kit:story` — the story skill owns the canonical artifact; the PRD holds the index of links. Complete coverage: every use case has a story and an index entry.
5. **Save + cross-link** — delegate to `wiki-librarian` (title prefixed "PRD — ", full content, project, tags). Link the specs that design it (bidirectional), the story index, and the tickets that carry it, per `docs/doc-model.md` § Cross-linking — verify backlinks resolve; report an unwritable link as a setup gap with a fix.
