---
name: prd
description: "Write a Product Requirements Document — a formal behavior spec describing what the system should do from the user's perspective. Use when a feature needs documentation before breakdown into tickets. Triggers on: \"write a PRD\", \"document this feature\", \"behavior spec\", \"product requirements\", or after `brainstorm --grill` produces a design that needs formal documentation."
---

# PRD

Write a behavior spec that clearly documents what the system should do. The PRD is the source of truth that tickets reference — it outlives individual tasks.

`$ARGUMENTS` — feature description, brainstorm output, or empty (interactive).

## What a PRD Captures

- **Purpose and problem** — why this exists, what pain it solves (2-3 sentences each)
- **Target users** — who uses this and what they care about
- **Goals and non-goals** — what we're optimizing for and explicitly not doing
- **User stories** — one sentence each. "As a [role], I want [goal], so that [value]." Group by concern. Detailed acceptance criteria belong on tickets, not the PRD.
- **Example scenarios** — concrete examples that illustrate how the system works in practice
- **Edge cases and error states** — table of what-if scenarios and expected behavior
- **Dependencies** — what this builds on, what must exist first

## What Does NOT Belong in a PRD

A PRD describes **what** and **why** — never **how**. Those details belong in `engineering:spec`:

- **Technology choices** — package names, frameworks, specific tools (e.g., "use pi-ai" or "use ripgrep")
- **File formats and schemas** — YAML frontmatter fields, directory structures, data models with field-level detail
- **API contracts** — function signatures, endpoint shapes, query formats
- **Architecture diagrams** — component boundaries, data flow, system diagrams
- **Phasing and sequencing** — what ships when, phase ordering, priority decisions. These belong in `engineering:breakdown` or a roadmap, not the PRD.
- **Phase subtask breakdowns** — granular implementation steps within a phase

**Test:** If removing a detail would change the *user experience*, it belongs in the PRD. If removing it would only change the *implementation*, it belongs in the spec.

**Examples:**
- PRD: "Memories are stored as human-readable markdown files" — describes user experience
- Spec: "Files use YAML frontmatter with fields: id, name, namespace, tags, indexedAt" — describes implementation
- PRD: "Search combines file-based and semantic results" — describes behavior
- Spec: "Search runs ripgrep in parallel with LadybugDB vector+FTS and merges via RRF" — describes implementation
- PRD: "Extraction supports multiple LLM backends" — describes capability
- Spec: "Extraction uses @mariozechner/pi-ai with model selection: Haiku > Gemini > Ollama" — describes implementation

## How to Write It

1. **Research** — explore the codebase, read existing docs, check Notion for related specs. Understand what exists.
2. **Interview** — MUST invoke the brainstorm skill before proceeding: call `Skill("brainstorm", "--grill")`. Do NOT ask ad-hoc inline questions — brainstorm's structured flow (one-at-a-time interview, parallel research, codex pressure test) must run in full. Continue with step 3 only after brainstorm completes.
3. **Check the glossary** — before writing, load the project glossary (either `.claude/glossary.md` in the repo or the wiki draft via `wiki-librarian`). Use canonical term names throughout the PRD — no casual synonyms. If the PRD introduces a domain term that isn't yet in the glossary, note it; step 7 will seed it back into the glossary.
4. **Write stories as one-liners** — the PRD captures scope and intent. Each story is one sentence. Detailed acceptance criteria are written when tickets are created, not upfront.
5. **Tag requirements with IDs** — each story gets a stable ID (e.g., `F-1.2`). These IDs are the only trace that will appear in the repo (via E2E test JSDoc per `docs/doc-model.md`). Keep IDs stable across PRD edits.
6. **Completeness over detail** — make sure every use case has a story. Missing a story is worse than a story missing details.
7. **Write behaviors, not implementation** — "User can undo a fork" not "Add an undo button that calls revertFork()".
8. **Seed new terms to the glossary** — for each domain term the PRD introduced that wasn't already in the glossary, invoke the `glossary` skill (draft phase) to add an entry. Do this before saving the PRD so the final PRD uses only canonical names.
9. **Save to Wiki** — delegate to the `wiki-librarian` agent. Provide: the page title (prefixed with "PRD — "), the full PRD content, the project name, suggested Tags, and any related page URLs to cross-reference. The wiki-librarian handles schema, properties, title quirks, and dedup. Do NOT call Notion MCP tools directly.
10. **Update related docs** — ask the wiki-librarian to search for and update related specs, PRDs, epics, and tasks to reference the new or updated PRD. When related tasks already exist, ensure the PRD has an `Implementation tickets` section with their actual ticket URLs grouped by requirement/story. When related specs exist, ensure both pages link to each other.
11. **Verify backlinks** — fetch the PRD and the related pages after updates. Do not report completion until the PRD links to the related spec/task URLs and those pages link back to the PRD, or until you have reported an explicit manual follow-up with the exact links/section text to add.

## Rules

- **Stories are one-liners** — detailed AC lives on tickets. The PRD is a map, not a manual.
- **Complete coverage** — every user-facing use case has a story. Gaps are caught here, not during implementation.
- **User language, not code** — someone non-technical should understand the PRD
- **Term discipline** — use only canonical names from the glossary. When the PRD introduces a new domain term, seed the glossary draft before the PRD is finalized. No "user"/"account"/"customer" drift if the glossary says "Applicant".
- **Requirement IDs are stable** — once assigned, `F-1.2` doesn't change. Tests and code reference these IDs; renumbering breaks traceability.
- **No DDD modeling concepts in the PRD** — bounded contexts, aggregates, domain events belong in the spec. The PRD *uses* the ubiquitous language; it doesn't author the domain architecture.
- **No implementation details** — technology choices, file formats, schemas, API contracts, and architecture belong in `engineering:spec`. If it names a package, function, or data type, it's too detailed for a PRD.
- **Living document** — update when scope changes
- **Separate from tickets** — PRD is the spec, tickets are the work items. `engineering:breakdown` converts one to the other.
- **Bidirectional links** — when creating or updating a PRD, link it to related specs and actual task URLs, and update those related docs/tasks to link back. A PRD is incomplete if known related tickets/specs exist but are not linked.
- **Wiki, not project pages** — PRDs go in the Wiki database, not nested under project pages. This ensures discoverability and verification tracking.
- **Use wiki-librarian for all Notion operations** — never call Notion MCP tools directly from the PRD skill. The wiki-librarian agent handles schema compliance, title persistence, dedup, and cross-referencing.
- **See `docs/doc-model.md`** for how the PRD relates to spec, glossary, requirement IDs, and the broader plugin doc model.
