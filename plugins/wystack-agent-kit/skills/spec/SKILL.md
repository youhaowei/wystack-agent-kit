---
name: spec
description: "Write or update a technical specification — system design, component boundaries, data flow, and the decisions that shaped them. The engineering counterpart to `prd`. Use when the user wants a technical spec or system design documented before implementation, when editing an existing spec, or after `wystack-agent-kit:brainstorm --grill` produces architecture that needs formal documentation."
---
# Spec

A technical specification: the PRD says **what**, the spec says **how** — component boundaries, data flow, and the decisions that shaped them. The *living* design document — edited freely in the doc store as the design evolves, no promotion gate.

`$ARGUMENTS` — feature/system description, PRD reference, spec title, or empty (interactive).

**Prerequisites.** Load `wystack-agent-kit:workspace` — doc store and doc-status vocabulary. Not set up → `wystack-agent-kit:setup-agent-kit`. Doc discipline is inherited from `docs/doc-model.md` § Write the artifact, not the document.

## Workflow

1. **Earn the page** — a substrate or utility package whose contract is its code plus a few small decisions gets no standalone spec; fold its decisions into its one architectural consumer's spec. A standalone spec is for real structure: multiple components, non-obvious data flow, contested choices.

2. **Research** — explore the codebase; `wystack-agent-kit:principal` is a good collaborator.

3. **Challenge trade-offs** — architecture not pressure-tested → invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full. A brainstorm design already in context → build from it.

4. **Draft** — decisions over descriptions, document why; reference the PRD as one-clause reason + link in context (`docs/doc-model.md` § Cite in context), never duplicate it. Follow `docs.specTemplate` when the workspace sets one; otherwise the default structure — drop what a given spec doesn't need, add a Domain Model section for DDD-committed projects:

   - **Overview** — what the system *is*, in the first sentence. One paragraph.
   - **Key concepts** — an *index into the glossary*: each term this spec leans on, cited in the doc store's link form (§ Terms and ubiquitous language) with a one-clause note on why it matters *here* — never a re-definition. A used term with no glossary note gets one first via `wystack-agent-kit:glossary` (§ Terms and ubiquitous language).
   - **Boundaries** — the modules/components, what each owns, how they communicate. Diagram if it helps.
   - **Data flow** — how data moves through the system, end to end.
   - **Decisions** — the load-bearing choices, each as _what we chose / the alternatives / why_. Only real decisions (a genuine alternative existed); edited in place — current thinking, not a change log. When `adr` is enabled (`docs.types`) and a decision was genuinely contested — trade-offs a one-liner would flatten — offer `wystack-agent-kit:adr`: the one-liner stays here with an `expands:` link down; the spec still reads complete without it.
   - **Integration** — what this touches; dependencies.
   - **Open questions** — what's unresolved or deferred.

5. **Critique** — invoke `wystack-agent-kit:critique` on the draft; resolve load-bearing findings before saving.

6. **Save + cross-link** — delegate to `wiki-librarian`: title `"Spec — …"`, `id` `SPEC-NNNN` (next sequential). Link the PRD it implements (bidirectional) and an `Implementation tickets` section, per `docs/doc-model.md` § Cross-linking — verify backlinks resolve; report an unwritable link as a setup gap with a fix.

## Rules

- **Shape and intent, not code** — interfaces, message shapes, schemas, and types live in the codebase; the spec points at them, never copies. Paste a signature only when the prototype *is* the decision (a state machine, a reducer, a type shape the design turns on).
- **Level of detail** — architecture and decisions, not vibes and not code. _Too light:_ "the engine runs workflows with agents." _Right:_ "a concurrency pool (max N, auto-fills from ready work) + an ask queue (agents park on human decisions); append-only JSONL logs over SQLite, to match session persistence and support replay-recovery." _Too heavy:_ pasted TypeScript interfaces.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the spec body; cross-references are name/id only.
- **Overturned decisions** — edit the spec's Decisions entry in place; a still-useful warning survives as one line in its _why_ ("we tried X, it failed because Y"). An ADR is append-only — supersede per `docs/doc-model.md` § Supersession and re-point the spec's `expands:`.
