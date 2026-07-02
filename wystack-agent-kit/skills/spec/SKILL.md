---
name: spec
description: "Write or update a technical specification — system design, component boundaries, data flow, and the decisions that shaped them. The engineering counterpart to `prd`. Use when the user wants a tech spec, design doc, architecture doc, or system design documented before implementation, when editing an existing spec, or after `wystack-agent-kit:brainstorm --grill` produces architecture that needs formal documentation."
---
# Spec

A technical specification: PRD says **what**, spec says **how** — component boundaries, data flow, and the decisions that shaped them. The spec is the *living* design document, edited freely as the design evolves; its load-bearing decisions and their reasoning live in it, in the Decisions section.

**Write the architecture, not the document** — the discipline that governs every doc skill (architecture-not-meta, first-line-is-the-thing, one-line-decision default, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. The spec-specific rules below build on it.

The spec's **Key concepts** section is a per-spec *index into the glossary* — the terms this spec leans on, each cited `[[term-slug]]`. The spec defines no terms; the glossary is the single canonical home for the project's ubiquitous language. See `docs/doc-model.md` § Terms.

**Cite in context.** When the spec references the PRD it implements, give a one-clause reason inline — the tie-breaker — plus a link to the full record, placed where it shapes the design. Never a bare link or a standalone list, never a restatement of the record. See `docs/doc-model.md` § Cite in context.

`$ARGUMENTS` — feature/system description, PRD reference, spec title, or empty (interactive).

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the document store and doc-status vocabulary. The spec lives in the doc store like every other doc (default local home `.wystack/docs/specs/`); there is no promote-to-repo step. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Phase 1 — Draft

1. **Research** — explore the codebase; `wystack-agent-kit:principal` is a good collaborator.
2. **Challenge trade-offs** — if the architecture isn't pressure-tested, invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full. If a brainstorm design is already in context, build from it.
3. **Draft the spec** — decisions over descriptions, document WHY; cross-reference the PRD, don't duplicate it. Follow `docs.specTemplate` if the workspace sets one; otherwise the default structure (drop what a given spec doesn't need, add a Domain Model section for DDD-committed projects):

   - **Overview** — open with what the system *is*, in the first sentence (the first-line rule). One paragraph; scope it by what it does, not by framing the section.
   - **Key concepts** — an *index into the glossary*: the domain terms this spec leans on, each cited `[[term-slug]]` with a one-clause note on why it matters *here*, not a re-definition. The glossary note is the canonical definition (canonical name, domain-precise meaning, aliases, relationships); Key concepts points at it. A term the spec uses that has **no glossary note yet** gets one first — via `wystack-agent-kit:glossary` — then is cited here; a used-but-undefined term is a coverage gap, not a license to define it inline. See `docs/doc-model.md` § Terms.
   - **Boundaries** — the modules/components, what each owns, how they communicate. Diagram if it helps.
   - **Data flow** — how data moves through the system, end to end.
   - **Decisions** — the load-bearing choices, each as _what we chose / the alternatives / why_. Record only real decisions (a genuine alternative existed); skip the obvious. Edit these in place as the design evolves — the section reflects current thinking, not a history of every choice ever made. **When `adr` is enabled** (`docs.types`) and a decision was genuinely *contested* — real alternatives weighed, trade-offs that a one-liner would flatten — offer to capture the full deliberation as an ADR via `wystack-agent-kit:adr`. Keep the one-line decision here with an `expands:` link down to it; the ADR is depth-on-demand, the spec still reads complete without it. Don't reach for an ADR for an obvious or uncontested choice — the one-liner is the default.
   - **Integration** — what this touches; dependencies.
   - **Open questions** — what's unresolved or deferred.

   Describe shape and intent, not code. Interfaces, message shapes, schemas, and types live in the codebase — prose that restates them is a drift-magnet. Apply the ownership test: if a detail's authoritative home is the code, the spec points to it, it does not copy it. Paste a signature in only when the prototype *is* the decision (a state machine, a reducer, a type shape the design turns on).
4. **Critique** — invoke `wystack-agent-kit:critique` on the draft; resolve load-bearing findings before saving.
5. **Save + cross-link** — delegate to `wiki-librarian`: save with title `"Spec — …"`, `id` `SPEC-NNNN` (next sequential). Link the PRD it implements (bidirectional) and an `Implementation tickets` section, following the Save + cross-link protocol in `docs/doc-model.md` § Cross-linking (delegate, verify backlinks resolve, report gaps as fixes).

The spec lives in the doc store and is edited there as the design evolves — no promotion gate.

## Changing a decision

When a design change overturns a prior decision, **edit the Decisions section in place** — update the choice and its reasoning to reflect current thinking. The spec is the living design; it shows what's true now, not a log of what changed. If a superseded choice is still worth warning future readers about ("we tried X, it failed because Y — don't revisit"), keep a one-line note in the entry's _why_; otherwise just replace it.

When `adr` is enabled and the overturned decision had an ADR, the ADR is **append-only** — don't edit it. Write a new ADR that `supersedes:` the old one, flip the old to `superseded`, and re-point the spec's one-liner `expands:` to the new ADR. The in-place edit governs the spec's one-liner; the supersession governs the ADR trail.

## Rules

- **Does this spec need to exist?** Apply the earn-the-page test (`docs/doc-model.md`) before writing. A substrate or utility package whose contract is its code plus a handful of small decisions does *not* get a standalone spec — fold those decisions into the Decisions section of its one architectural consumer. Reach for a standalone spec when a system has real structure to design: multiple components, non-obvious data flow, contested choices.
- **Decisions are a living section, not a separate record** — load-bearing choices live in the spec's Decisions section, edited in place as the design evolves. Record only genuine decisions; skip the obvious. Format and ceremony level follow the one-line-decision default (`docs/doc-model.md`).
- **Link neighbors, verify backlinks** — PRD and tickets, both directions, per `docs/doc-model.md` Cross-linking.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the spec body; cross-references are name/id only.
- **Terms are cited, not defined** — every domain term is defined once in its glossary note; Key concepts, Domain Model, and the rest of the spec cite `[[term-slug]]` and use the canonical name. A new term gets a glossary note (via `wystack-agent-kit:glossary`) before it's used here. Code identifiers must match the canonical name — drift is a bug.
- **Level of detail** — architecture and decisions, not vibes and not code. _Too light:_ "the engine runs workflows with agents." _Right:_ "a concurrency pool (max N, auto-fills from ready work) + an ask queue (agents park on human decisions); append-only JSONL logs over SQLite, to match session persistence and support replay-recovery." _Too heavy:_ pasted TypeScript interfaces or schemas.

## Reference

- `docs/doc-model.md` — where PRDs, terms, and requirement IDs live; cross-linking; the Cite in context rule; coverage verification.
