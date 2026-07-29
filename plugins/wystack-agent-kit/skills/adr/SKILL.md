---
name: adr
description: "Record a contested architecture decision as a dated, append-only ADR — alternatives weighed, trade-offs, and the moment in time — when the full deliberation would bloat the spec's inline Decisions section. Use when a spec decision was genuinely contested and the user wants the expanded reasoning captured, or when superseding a prior decision. Optional doc type — enabled via docs.types; absent, decisions stay one-liners in the spec. Skip uncontested or obvious choices."
---
# ADR

An Architecture Decision Record: the full deliberation behind one *contested* decision — what was chosen, the alternatives weighed, the trade-offs, the moment in time. The expanded form of a decision whose one-line spec entry would lose what made it hard.

`$ARGUMENTS` — the decision to record (a spec decision reference, a contested choice from a brainstorm), the prior ADR to supersede, or empty (interactive).

**Prerequisites.** Load `wystack-agent-kit:workspace` — doc store, doc-status vocabulary, and whether `adr` is in `docs.types`. Not enabled → stop and tell the user how to enable it rather than writing an orphan record. Not set up → `wystack-agent-kit:setup-agent-kit`.

## Earn the ADR

Both tests must pass, or keep the one-line decision in the spec and write no ADR:

- **Contested** — a real alternative was weighed and rejected, with trade-offs a one-liner flattens. "Delivery is async, here's why" is one line; a genuine version-coupling-vs-dependency-leak deliberation across three package layouts is an ADR's worth.
- **Would bloat the spec** — the full _what / alternatives / why / reversibility_ doesn't fit the Decisions section without drowning the surrounding design.

## What an ADR captures

- **Decision** — what was chosen, in one sentence. The first line is the decision itself.
- **Context** — the forces in play at the time, dated because it's a snapshot: later context may shift, this record doesn't.
- **Alternatives** — the options genuinely weighed and why each was rejected. The alternatives are the point; an ADR with one option is a one-liner in disguise.
- **Trade-offs** — what the chosen path costs, and what's accepted by taking it.
- **Reversibility** — how expensive this is to undo, so a future reader knows whether to revisit or respect it.

The *why-at-the-time*, never the interfaces/schemas (those live in code) or the current design (the spec).

## Workflow

1. **Confirm it's earned** — run both [Earn the ADR](#earn-the-adr) tests; either fails → keep the spec one-liner and stop.
2. **Identify the spec it serves** — an ADR points up to exactly one spec; know which `SPEC-NNNN` before writing.
3. **Draft** — decision first, then context / alternatives / trade-offs / reversibility. Dated. Cite terms in context (`docs/doc-model.md` § Cite in context), cross-cutting terms as glossary citations in the doc store's link form (§ Terms and ubiquitous language).
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: title `"ADR — …"`, `id` `ADR-NNNN` (next sequential), `serves: SPEC-NNNN`, `supersedes:` the prior ADR when replacing one (flip its status to `superseded`). Add the `expands:` link on the spec's matching one-line decision. Verify backlinks resolve both ways before reporting done; an unwritable link is a setup gap to report with a fix, never a chore handed over.

## Rules

- **The spec stays primary** — delete every ADR and the specs still explain themselves; the ADR is depth-on-demand (`expands:` down, `serves:` up, per `docs/doc-model.md` § Doc-type registry).
- **Append-only** — never edited after acceptance; the record is the moment it was made. Overturning = a new ADR that `supersedes:` the old, body untouched, per `docs/doc-model.md` § Supersession at decision granularity.
- **One spec per ADR** — a decision spanning two specs belongs to the one that owns the affected boundary; cite the other in context.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the body; cross-references are name/id only.
