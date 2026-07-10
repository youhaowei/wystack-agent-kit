---
name: adr
description: "Record a contested architecture decision as a dated, append-only ADR — alternatives weighed, trade-offs, and the moment in time — when the full deliberation would bloat the spec's inline Decisions section. Use when a spec decision was genuinely contested and the user wants the expanded reasoning captured, or when superseding a prior decision. Optional doc type — enabled via docs.types; absent, decisions stay one-liners in the spec. Skip uncontested or obvious choices."
---
# ADR

An Architecture Decision Record: the full deliberation behind one *contested* decision — what was chosen, the alternatives weighed, the trade-offs, the moment in time. The ADR is the **expanded form** of a decision whose one-line spec entry would lose what made it hard.

**Optional type, off by default.** ADR participates only when `docs.types` enables `adr`. Without it, a contested decision stays a one-liner in the spec's Decisions section — the floor, which loses nothing a reader needs.

**The spec stays primary.** A reader understands the system from the spec alone; the ADR is depth-on-demand. The spec's one-line decision links down (`expands:`), the ADR points up to the one spec it serves (`serves:`) — delete every ADR and the specs still explain themselves. Open with the decision, not "this record documents…" (the shared doc discipline lives in `docs/doc-model.md` § Write the artifact, not the document).

`$ARGUMENTS` — the decision to record (a spec decision reference, a contested choice from a brainstorm), the prior ADR to supersede, or empty (interactive).

**Prerequisite.** Load `wystack-agent-kit:workspace` — it resolves the doc store, the doc-status vocabulary, and confirms `adr` is in `docs.types`. If `adr` isn't enabled, stop and tell the user how to enable it (`docs.types`) rather than writing an orphan record. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

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

Describe the decision and its reasoning, not the implementation — the ADR is the *why-at-the-time*, never the interfaces/schemas (those live in code) or the current design (the spec).

## Append-only and supersession

An ADR is **never edited after acceptance** — the record is the moment it was made. To overturn one: write a **new** ADR with the new deliberation, `supersedes:` the old (body untouched, status flipped to `superseded`), and re-point the spec's one-liner `expands:` to the new ADR. This mirrors whole-doc supersession (`docs/doc-model.md` § Supersession) at *decision* granularity — the trail is append-only, never rewritten.

## Workflow

1. **Confirm it's earned.** Run both [Earn the ADR](#earn-the-adr) tests. If either fails, keep the spec one-liner and stop.
2. **Identify the spec it serves.** An ADR always points up to exactly one spec. Know which `SPEC-NNNN` before writing — that's the `serves:` target.
3. **Draft** — decision first, then context / alternatives / trade-offs / reversibility. Dated. Cite spec-owned terms in context (`docs/doc-model.md` § Cite in context); when `glossary` is enabled, cite cross-cutting terms as `[[term-slug]]`.
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: save with title `"ADR — …"`, `id` `ADR-NNNN` (next sequential), `serves: SPEC-NNNN`, and `supersedes:` the prior ADR when this replaces one. Then add the `expands:` link to the spec's matching one-line decision via the librarian. On supersession, flip the prior ADR's status to `superseded`. Verify backlinks resolve (spec one-liner → this ADR, this ADR → spec) before reporting done. If a write can't be automated, report a setup gap with a concrete fix — never hand the edits over as a chore. Never call doc-store MCP tools directly.

## Rules

- **One spec per ADR** (`serves:`) — a decision spanning two specs belongs to the one that owns the affected boundary; cite the other in context.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the ADR body; cross-references are name/id only.

## Reference

- `docs/doc-model.md` § Doc-type registry, § Supersession, § Cite in context.
- `wystack-agent-kit:spec` — owns the inline one-line decision that links down to this ADR.
- `wystack-agent-kit:wiki-librarian` — doc-store CRUD; never call provider APIs directly.
