---
name: spec
description: "Write or update a technical specification — system design, component boundaries, data flow, and the decisions that shaped them. The engineering counterpart to `prd`. Use when the user wants a tech spec, design doc, architecture doc, or system design documented before implementation, when editing an existing spec, or after `wystack-agent-kit:brainstorm --grill` produces architecture that needs formal documentation."
---
# Spec

A technical specification: PRD says **what**, spec says **how** — component boundaries, data flow, and the decisions that shaped them. The spec is the *living* design document, edited freely as the design evolves. It records its own decisions inline — the design and the reasoning behind it live together, in one doc.

The spec owns the project's **ubiquitous language** — technical and shared domain terms live in its Key concepts section. There is no separate glossary; see `docs/doc-model.md` § Terms.

**Cite in context.** When the spec references the PRD it implements, give a one-clause reason inline — the tie-breaker — plus a link to the full record, placed where it shapes the design. Never a bare link or a standalone list, never a restatement of the record. See `docs/doc-model.md` § Cite in context.

`$ARGUMENTS` — feature/system description, PRD reference, spec title, or empty (interactive).

**Prerequisites.** Load `wystack-agent-kit:workspace` — it resolves the document store and doc-status vocabulary. The spec lives in the doc store like every other doc (default local home `.wystack/docs/specs/`); there is no promote-to-repo step. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Phase 1 — Draft

1. **Research** — explore the codebase; `wystack-agent-kit:principal` is a good collaborator.
2. **Challenge trade-offs** — if the architecture isn't pressure-tested, invoke `Skill("wystack-agent-kit:brainstorm", "--grill")` and let it run in full. If a brainstorm design is already in context, build from it.
3. **Draft the spec** — decisions over descriptions, document WHY; cross-reference the PRD, don't duplicate it. Follow `docs.specTemplate` if the workspace sets one; otherwise the default structure (drop what a given spec doesn't need, add a Domain Model section for DDD-committed projects):

   - **Overview** — what this is, what it isn't. A paragraph.
   - **Key concepts** — the project's ubiquitous language: technical terms and shared domain terms (the ones that also shape architecture). One per term — canonical name, a one-sentence domain-precise definition, aliases to avoid, relationships when useful. Between dictionary and detail: "**Applicant** — a person submitting an application to a Listing; distinct from User (account without applying)" not "a person who applies" and not the column layout. The spec owns these terms; the PRD cites them in context. See `docs/doc-model.md` § Terms.
   - **Boundaries** — the modules/components, what each owns, how they communicate. Diagram if it helps.
   - **Data flow** — how data moves through the system, end to end.
   - **Decisions** — the load-bearing choices, each as _what we chose / the alternatives / why_. Record only real decisions (a genuine alternative existed); skip the obvious. Edit these in place as the design evolves — the section reflects current thinking, not a history of every choice ever made.
   - **Integration** — what this touches; dependencies.
   - **Open questions** — what's unresolved or deferred.

   Describe shape and intent, not code. Interfaces, schemas, and types live in the codebase — paste them into a spec only when a prototype *is* the decision (a state machine, a reducer, a type shape).
4. **Critique** — invoke `wystack-agent-kit:critique` on the draft; resolve load-bearing findings before saving.
5. **Save + cross-link** — delegate to `wiki-librarian`: save with title `"Spec — …"`, `id` `SPEC-NNNN` (next sequential), then link neighbors per `docs/doc-model.md` Cross-linking — the PRD it implements (bidirectional) and an `Implementation tickets` section. Verify backlinks resolve before reporting done; if a write can't be automated, report it as a setup gap with a concrete fix — don't hand the edits over as a chore. Never call doc-store MCP tools directly.

The spec lives in the doc store and is edited there as the design evolves — no promotion gate.

## Changing a decision

When a design change overturns a prior decision, **edit the Decisions section in place** — update the choice and its reasoning to reflect current thinking. The spec is the living design; it shows what's true now, not a log of what changed. If a superseded choice is still worth warning future readers about ("we tried X, it failed because Y — don't revisit"), keep a one-line note in the entry's _why_; otherwise just replace it.

## Rules

- **Decisions are a living section, not a separate record** — load-bearing choices live in the spec's Decisions section as _what / alternatives / why_, edited in place as the design evolves. Record only genuine decisions (a real alternative existed); skip the obvious.
- **Link neighbors, verify backlinks** — PRD and tickets, both directions, per `docs/doc-model.md` Cross-linking.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the spec body; cross-references are name/id only.
- **Terms are owned, not duplicated** — technical and shared domain terms are defined once in Key concepts; Domain Model and the rest of the spec use those canonical names. A new term gets a Key concepts entry before it's used elsewhere. Code identifiers must match — drift is a bug.
- **Level of detail** — architecture and decisions, not vibes and not code. _Too light:_ "the engine runs workflows with agents." _Right:_ "a concurrency pool (max N, auto-fills from ready work) + an ask queue (agents park on human decisions); append-only JSONL logs over SQLite, to match session persistence and support replay-recovery." _Too heavy:_ pasted TypeScript interfaces or schemas.

## Reference

- `docs/doc-model.md` — where PRDs, terms, and requirement IDs live; cross-linking; the Cite in context rule; coverage verification.
