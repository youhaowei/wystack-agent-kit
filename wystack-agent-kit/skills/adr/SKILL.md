---
name: adr
description: "Record a contested architecture decision as a dated, append-only ADR — alternatives weighed, trade-offs, and the moment in time — when the full deliberation would bloat the spec's inline Decisions section. Use when a spec decision was genuinely contested and the user wants the expanded reasoning captured, or when superseding a prior decision. Optional doc type — enabled via docs.types; absent, decisions stay one-liners in the spec. Skip uncontested or obvious choices."
---
# ADR

An Architecture Decision Record: the full deliberation behind one *contested* decision — what was chosen, the alternatives weighed, the trade-offs, the moment in time. The ADR is the **expanded form** of a decision whose one-line entry in the spec would lose what made it hard.

**Optional type, off by default.** ADR participates only when `docs.types` enables `adr`. Without it, a contested decision stays a one-liner in the spec's Decisions section — that is the floor, and it loses nothing a reader needs to understand the system. Reach for an ADR only when the deliberation is load-bearing *and* genuinely contested; an obvious or uncontested choice never earns one.

**The spec stays primary.** A reader understands the system from the spec alone. The ADR is depth-on-demand — the spec's one-line decision links down to it (`expands:`), the ADR points up to the spec it serves (`serves:`). The dependency runs ADR → spec, never spec → ADR-for-understanding: delete every ADR and the specs still explain themselves.

**Write the decision, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. An ADR opens with the decision, not "this record documents…".

`$ARGUMENTS` — the decision to record (a spec decision reference, a contested choice from a brainstorm), the prior ADR to supersede, or empty (interactive).

**Prerequisite.** Load `wystack-agent-kit:workspace` — it resolves the doc store, the doc-status vocabulary, and confirms `adr` is in `docs.types`. If `adr` isn't enabled, stop and tell the user how to enable it (`docs.types`) rather than writing an orphan record. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Earn the ADR

Before writing one, both tests must pass:

- **Contested** — a real alternative was weighed and rejected, with trade-offs a one-liner flattens. "Delivery is async, here's why" is one line, not an ADR. "We co-locate the wire protocol and channel in one package rather than two *or* folding into the server, because splitting creates a version-coupling seam with no independent-release benefit and folding leaks server deps to the client" — that's an ADR's worth of deliberation.
- **Would bloat the spec** — the full _what / alternatives / why / reversibility_ doesn't fit the spec's Decisions section without drowning the surrounding design. If it fits as a one-liner, keep it inline.

Fail either test → keep the one-line decision in the spec, write no ADR.

## What an ADR captures

- **Decision** — what was chosen, in one sentence. The first line is the decision itself.
- **Context** — the forces in play at the time: the constraint, the requirement tension, the moment. Dated, because it's a snapshot — later context may shift, but this record doesn't.
- **Alternatives** — the options genuinely weighed and why each was rejected. The alternatives are the point; an ADR with one option is a one-liner in disguise.
- **Trade-offs** — what the chosen path costs, and what's accepted by taking it.
- **Reversibility** — how expensive this is to undo, so a future reader knows whether to revisit or respect it.

Describe the decision and its reasoning, not the implementation — interfaces and schemas live in the code, the current design lives in the spec. The ADR is the *why-at-the-time*.

## Append-only and supersession

An ADR is **never edited after acceptance** — the record is the moment it was made. When a later decision overturns it:

1. Write a **new** ADR that captures the new decision and its deliberation.
2. The new ADR `supersedes:` the old; the old flips to `superseded` (body untouched).
3. Re-point the spec's one-line decision `expands:` to the new ADR.

This mirrors whole-doc supersede one tier down (`docs/doc-model.md` § Supersession), at *decision* granularity. The trail is append-only — the reasoning history survives, never rewritten.

## Workflow

1. **Confirm it's earned.** Run both [Earn the ADR](#earn-the-adr) tests. If either fails, keep the spec one-liner and stop.
2. **Identify the spec it serves.** An ADR always points up to exactly one spec. Know which `SPEC-NNNN` before writing — that's the `serves:` target.
3. **Draft** — decision first, then context / alternatives / trade-offs / reversibility. Dated. Cite spec-owned terms in context (`docs/doc-model.md` § Cite in context); when `glossary` is enabled, cite cross-cutting terms as `[[term-slug]]`.
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: save with title `"ADR — …"`, `id` `ADR-NNNN` (next sequential), `serves: SPEC-NNNN`, and `supersedes:` the prior ADR when this replaces one. Then add the `expands:` link to the spec's matching one-line decision via the librarian. On supersession, flip the prior ADR's status to `superseded`. Verify backlinks resolve (spec one-liner → this ADR, this ADR → spec) before reporting done. If a write can't be automated, report a setup gap with a concrete fix — never hand the edits over as a chore. Never call doc-store MCP tools directly.

## Rules

- **One spec per ADR** — an ADR serves exactly one spec (`serves:`). A decision spanning two specs belongs to the one that owns the affected boundary; cite the other in context.
- **Never edit an accepted ADR** — overturn by superseding, never by rewriting. The record is append-only.
- **The spec keeps the one-liner** — writing an ADR doesn't remove the decision from the spec; it expands it. The spec's Decisions section stays the readable summary, the ADR holds the depth.
- **Tool-agnostic content** — never reference the doc store tool, page IDs, or URLs in the ADR body; cross-references are name/id only.

## Reference

- `docs/doc-model.md` § Doc-type registry, § Supersession, § Cite in context.
- `wystack-agent-kit:spec` — owns the inline one-line decision that links down to this ADR.
- `wystack-agent-kit:wiki-librarian` — doc-store CRUD; never call provider APIs directly.
