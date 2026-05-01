---
name: spec
description: "Write, promote, or update a technical specification — system design, component boundaries, data flow, key decisions (including ADRs). The engineering counterpart to `prd`. Use when architecture needs documenting before implementation, when a signed-off draft is ready to promote into the repo, or when editing an already-promoted spec. Triggers on: \"write a spec\", \"tech spec\", \"design doc\", \"architecture doc\", \"system design\", \"promote the spec\", or after `brainstorm --grill` produces architecture that needs formal documentation."
---

# Spec

Write, promote, and maintain a technical specification that documents how the system is designed. The spec is the engineering counterpart to the PRD — PRD defines what, spec defines how. This skill owns the full lifecycle of a spec; see `docs/doc-model.md` for the plugin's broader doc conventions.

`$ARGUMENTS` — feature/system description, PRD reference, spec title to promote, or empty (interactive).

## Lifecycle

Specs move through three phases. The skill picks the right phase based on the spec's current state and the invocation.

```
1. draft            — spec does not yet exist, or exists in the wiki as a draft
2. promote          — draft is approved; export to .claude/specs/NNNN-slug.md
3. repo-canonical   — spec lives in the repo; edits happen via PR
```

Default behavior: if the spec doesn't exist, `draft`. If the spec exists in the wiki with status `approved`/`implementing` and no `.claude/specs/` file, `promote`. If `.claude/specs/NNNN-slug.md` exists, `repo-canonical` (edit that file).

## What a Spec Captures

### Concepts and Framing
- **What this is / isn't** — one paragraph positioning
- **Key concepts** — the vocabulary of the system. Define once, use everywhere.
- **Design principles** — the rules that guide decisions

### Architecture (the core)
- **Component boundaries** — what modules/services exist, what each owns, how they communicate. Diagram preferred.
- **Data flow** — how data moves through the system end-to-end
- **Decisions (ADRs)** — trade-offs considered, what was chosen and why, reversibility. "We use X because Y, not Z because W" is the atomic unit. Each decision entry: *decision / alternatives / why / reversibility*. Decisions live inside the spec, not in a separate folder.
- **Integration points** — where this touches other systems, dependencies
- **Migration strategy** — if changing existing architecture, how to get from A to B

### Domain Model (optional — for DDD-committed projects)

Include when the system has meaningful domain complexity. Skip for CRUD-shaped or infrastructure-level work.

- **Bounded contexts** — when the system spans multiple contexts, name them and draw the boundary. Each context has its own language (reference the glossary).
- **Aggregates** — entity clusters with consistency boundaries. Name the aggregate root and what it protects. "An Application is an aggregate rooted at Applicant; Household and Document belong inside it."
- **Domain events** — named business events that other parts of the system react to. "ApplicationSubmitted", "HouseholdSizeChanged". When eventual consistency matters, make events explicit.
- **Anti-corruption layers** — when integrating with external systems whose model doesn't match ours, describe the translation layer.
- **Context map** — only for systems that span multiple bounded contexts; describe how contexts relate (upstream/downstream, shared kernel, anti-corruption).

These sections use the vocabulary of the glossary. If a term appears in the domain model but not in the glossary, add it to the glossary (via the `glossary/` skill) before finalizing the spec.

### Open Questions
- What needs spikes or further design
- What's explicitly deferred

## Level of Detail

**Too light (just vibes):**
> "The engine runs workflows with agents."

**Right level (architecture + decisions):**
> "The engine has two primitives: a concurrency pool (max N agents, auto-fills from ready work) and an ask queue (agents post human decisions, engine parks and resumes). We chose append-only JSONL for execution logs over SQLite because it matches the existing session persistence pattern and supports crash recovery via replay."

**Too heavy (implementation code):**
> ```typescript
> interface ExecutionRecord = { t: 'node_start', nodeId: string, ts: number } | ...
> ```

Describe shape and intent. TypeScript interfaces, schemas, and record formats belong in the codebase, not the spec.

## Phase 1 — Draft

Used when a new spec is being written.

1. **Research** — explore the codebase, understand existing architecture. The principal-engineer agent is a good collaborator.
2. **Challenge trade-offs** — MUST invoke the brainstorm skill before proceeding: call `Skill("brainstorm", "--grill")`. Do NOT ask ad-hoc inline questions — brainstorm's structured flow (one-at-a-time interview, parallel research, codex pressure test) must run in full. Continue with step 3 only after brainstorm completes. Document what was considered and why.
3. **Reference the PRD** — the spec implements the behaviors described in the PRD.
4. **Decisions over descriptions** — focus on the non-obvious. Document WHY, not just WHAT.
5. **Diagrams over prose** — component boundaries and data flow are almost always clearer as diagrams.
6. **Save draft to the wiki** — delegate to the `wiki-librarian` agent. Provide: the page title (prefixed with "Spec — "), the full spec content, the project name, suggested Tags, and any related page URLs to cross-reference (especially the PRD it implements). The wiki-librarian handles schema, properties, title quirks, and dedup. Do NOT call wiki MCP tools directly.
7. **Update related docs** — ask the wiki-librarian to search for and update related PRDs, specs, epics, and tasks to reference the new or updated spec. When related tasks already exist, ensure the spec has an `Implementation tickets` section with their actual ticket URLs grouped by phase / architectural area / decision anchor. When a related PRD exists, ensure both pages link to each other.
8. **Verify backlinks** — fetch the spec and related pages after updates. Do not report completion until the spec links to related PRD/task URLs and those pages link back to the spec, or until you have reported an explicit manual follow-up with the exact links/section text to add.

Draft specs stay in the wiki while stakeholders iterate. They do not enter the repo yet.

## Phase 2 — Promote

Used when a draft spec has been approved and is ready to become canonical in the repo. Invoked explicitly ("promote the spec") or automatically when a draft's status flips to `approved`/`implementing`.

1. **Fetch the draft** — delegate to `wiki-librarian` to retrieve the full content of the approved spec.
2. **Determine target filename** — choose the next sequential number in `.claude/specs/` (e.g., if `0003-foo.md` is the highest, use `0004-`). Slug the title for the suffix.
3. **Strip tool references** — the promoted file must contain no wiki URLs, page IDs, or tool names. If the draft references the PRD by name, keep the reference; if it references it by wiki URL, convert to a name-only reference. No provenance metadata in frontmatter.
4. **Write the file** — create `.claude/specs/NNNN-slug.md` with tool-neutral frontmatter:
   ```yaml
   ---
   id: SPEC-NNNN
   title: <title>
   status: active
   ---
   ```
   Followed by the spec body, including the Decisions (ADR) section.
5. **Mark wiki page promoted** — delegate to `wiki-librarian` to update the wiki page's status to `promoted` (or equivalent archived state) and add a note that the canonical version now lives in the repo. No bidirectional URL — the promotion is one-way.
6. **Commit** — the commit message is the record of provenance: `promote spec NNNN: <title>`. Do not add Notion/wiki URLs to the commit body.
7. **Announce completion** — report the new `.claude/specs/NNNN-slug.md` path. Subsequent edits happen via PR.

## Phase 3 — Repo-canonical

Used when a spec has already been promoted and needs to be updated.

1. **Locate the file** — find the matching `.claude/specs/NNNN-slug.md`.
2. **Edit directly** — modify the file in place using standard editing tools.
3. **Update the Decisions section** — if the change reverses or supersedes a prior decision, add a new ADR entry describing the change rather than rewriting the old one.
4. **Do not sync back to the wiki** — the wiki copy is a historical snapshot. If stakeholders need a current view, generate a read-only mirror separately; do not re-edit the wiki page.
5. **Commit normally** — spec changes travel in the same PR as the code that enacts them when possible.

## Rules

- **Complements the PRD** — PRD says what, spec says how. Don't duplicate.
- **Decisions are the core** — if there's no decision to document, there's no spec to write
- **Architecture, not implementation** — component boundaries and data flow, not TypeScript interfaces
- **ADRs live inside the spec** — not in a separate `docs/adr/` folder. Each decision: *decision / alternatives / why / reversibility*
- **Drafts in the wiki, active specs in the repo** — enforced by the lifecycle. Don't mix.
- **Repo is tool-agnostic** — promoted files never reference the wiki. Provenance lives in git history.
- **Feeds into `engineering:breakdown`** — the spec + PRD together define what gets split into tickets
- **Use wiki-librarian for all wiki operations** — never call wiki MCP tools directly from this skill. The wiki-librarian agent handles schema compliance, title persistence, dedup, and cross-referencing.
- **See `docs/doc-model.md`** for the broader plugin doc model (where PRDs, glossaries, ADRs, and requirement IDs live, and how coverage is verified).

## What a Spec Captures

### Concepts and Framing
- **What this is / isn't** — one paragraph positioning
- **Key concepts** — the vocabulary of the system. Define once, use everywhere.
- **Design principles** — the rules that guide decisions

### Architecture (the core)
- **Component boundaries** — what modules/services exist, what each owns, how they communicate. Diagram preferred.
- **Data flow** — how data moves through the system end-to-end
- **Key decisions** — trade-offs considered, what was chosen and why. "We use X because Y, not Z because W" is the atomic unit of a spec.
- **Integration points** — where this touches other systems, dependencies
- **Migration strategy** — if changing existing architecture, how to get from A to B

### Open Questions
- What needs spikes or further design
- What's explicitly deferred

## Level of Detail

**Too light (just vibes):**
> "The engine runs workflows with agents."

**Right level (architecture + decisions):**
> "The engine has two primitives: a concurrency pool (max N agents, auto-fills from ready work) and an ask queue (agents post human decisions, engine parks and resumes). We chose append-only JSONL for execution logs over SQLite because it matches the existing session persistence pattern and supports crash recovery via replay."

**Too heavy (implementation code):**
> ```typescript
> interface ExecutionRecord = { t: 'node_start', nodeId: string, ts: number } | ...
> ```

Describe shape and intent. TypeScript interfaces, schemas, and record formats belong in the codebase, not the spec.

## How to Write It

1. **Research** — explore the codebase, understand existing architecture. The principal-engineer agent is a good collaborator.
2. **Challenge trade-offs** — MUST invoke the brainstorm skill before proceeding: call `Skill("brainstorm", "--grill")`. Do NOT ask ad-hoc inline questions — brainstorm's structured flow (one-at-a-time interview, parallel research, codex pressure test) must run in full. Continue with step 3 only after brainstorm completes. Document what was considered and why.
3. **Reference the PRD** — the spec implements the behaviors described in the PRD.
4. **Decisions over descriptions** — focus on the non-obvious. Document WHY, not just WHAT.
4. **Diagrams over prose** — component boundaries and data flow are almost always clearer as diagrams.
5. **Save to Wiki** — delegate to the `wiki-librarian` agent. Provide: the page title (prefixed with "Spec — "), the full spec content, the project name, suggested Tags, and any related page URLs to cross-reference (especially the PRD it implements). The wiki-librarian handles schema, properties, title quirks, and dedup. Do NOT call Notion MCP tools directly.
6. **Update related docs** — ask the wiki-librarian to search for and update related PRDs, specs, epics, and tasks to reference the new or updated spec. When related tasks already exist, ensure the spec has an `Implementation tickets` section with their actual ticket URLs grouped by phase / architectural area / decision anchor. When a related PRD exists, ensure both pages link to each other.
7. **Verify backlinks** — fetch the spec and related pages after updates. Do not report completion until the spec links to related PRD/task URLs and those pages link back to the spec, or until you have reported an explicit manual follow-up with the exact links/section text to add.

## Rules

- **Complements the PRD** — PRD says what, spec says how. Don't duplicate.
- **Decisions are the core** — if there's no decision to document, there's no spec to write
- **Architecture, not implementation** — component boundaries and data flow, not TypeScript interfaces
- **Living document** — update when architecture changes
- **Bidirectional links** — when creating or updating a spec, link it to related PRDs and actual task URLs, and update those related docs/tasks to link back. A spec is incomplete if known related tickets/PRDs exist but are not linked.
- **Feeds into `engineering:breakdown`** — the spec + PRD together define what gets split into tickets
- **Wiki, not project pages** — specs go in the Wiki database, not nested under project pages. This ensures discoverability and verification tracking.
- **Use wiki-librarian for all Notion operations** — never call Notion MCP tools directly from the spec skill. The wiki-librarian agent handles schema compliance, title persistence, dedup, and cross-referencing.
