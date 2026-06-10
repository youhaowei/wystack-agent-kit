---
name: glossary
description: "Define a cross-cutting domain term as an atomic glossary note (glossary/<term>.md) — the single canonical home for a shared-kernel term that no one spec owns, cited everywhere as [[term-slug]]. Use when a term spans multiple specs with no single owner, or when resolving naming for such a term. Optional doc type — enabled via docs.types; absent, terms live in the owning spec's Key concepts or PRD inline. Skip spec-local and product-only terms."
---
# Glossary

A glossary note is the single canonical home for one **cross-cutting** term — a shared-kernel domain concept that spans multiple specs and is owned by none of them. One note per term, `glossary/<term>.md`, cited everywhere as `[[term-slug]]`. Never a monolith: the directory is the glossary, each note is an atomic, independently-linkable definition.

**Optional type, off by default.** Glossary participates only when `docs.types` enables `glossary`. Without it, every term lives in its owning doc — spec-local and shared terms in the Spec's Key concepts, product-only terms inline in the PRD. That is the floor and it loses nothing: a cross-cutting term simply falls back to the most-architectural spec's Key concepts. The glossary earns its place only when a term genuinely has no single spec owner.

**One owner per term.** The glossary doesn't duplicate terms specs already own — it owns the ones they *can't*. A term used by one spec belongs in that spec's Key concepts; a product-only term belongs inline in the PRD; only a term shared across specs with no single owner gets a glossary note. The note is then the canonical home — specs, PRD, and stories **cite** it (`[[term-slug]]` + link), never redefine it. (This is the discipline whose absence sank the old monolithic glossary: a second home for terms the spec already owned. The atomic-note model keeps each term in exactly one place.)

**Write the term, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. A note opens with the definition, not "this note defines…".

`$ARGUMENTS` — the cross-cutting term to define or revise, or empty (interactive).

**Prerequisite.** Load `wystack-agent-kit:workspace` — it resolves the doc store, the doc-status vocabulary, and confirms `glossary` is in `docs.types`. If `glossary` isn't enabled, stop and tell the user how to enable it (`docs.types`), or route the term to its owning spec's Key concepts instead. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Does this term earn a glossary note?

Only a term with **no single spec owner** does. Run the ownership ladder (`docs/doc-model.md` § Terms):

- Used by one spec → its Key concepts, not here.
- Product-only, stakeholder-facing → PRD inline, not here.
- **Shared across specs, owned by none** → a glossary note. This is the only case.

A term that one spec clearly owns does not get a note just because another spec mentions it — the second spec cites the first's Key concepts. Reserve the glossary for genuine shared-kernel concepts (a `Tenant` that billing, auth, and provisioning all reason about equally).

## What a note captures

One file per term, the slug as filename (`glossary/tenant.md`):

- **Canonical name + definition** — the one spelling used in every spec, PRD, story, and code identifier, and a one-sentence domain-precise definition.
- **Aliases to avoid** — the casual synonyms that cause drift.
- **Relationships** — contains / contained-by / relates-to, with cardinality when useful.
- **Owning specs** — the specs that share this term, so a reader knows its blast radius (the reason it's cross-cutting, not spec-local).

**Level of detail** — domain-precise, between dictionary and spec:

> **Tenant** — an isolated customer account that owns its own users, billing, and provisioned resources. The unit of data isolation across every bounded context.
> - Aliases to avoid: organization, workspace, account
> - Relationships: has many Users, has one BillingProfile, owns many Resources
> - Owning specs: SPEC-0003 (auth), SPEC-0007 (billing), SPEC-0011 (provisioning)

Too thin = "a customer" (dictionary). Too heavy = the `tenants` table columns, row-level-security policy (spec territory).

## Workflow

1. **Confirm it's cross-cutting.** Run the ownership ladder. If one spec owns it, route the term there and stop — don't write a note.
2. **Resolve the canonical name.** For an ambiguous or conflicting term, propose one canonical name with reasoning; present alternatives and defer to the user. For a genuinely contested concept boundary, `Skill("wystack-agent-kit:brainstorm", "--grill")` forces explicitness.
3. **Write the note** — one file, slug filename, opinionated about the canonical name. Definition first.
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: save as `glossary/<slug>.md`. Ask the librarian to scan the owning specs (and any PRD/story) for uses of this term that don't yet cite `[[term-slug]]`, and update them to cite the note. Verify the `[[term-slug]]` citations resolve before reporting done. If a write can't be automated, report a setup gap with a concrete fix — never hand the edits over as a chore. Never call doc-store MCP tools directly.

## Renaming a term

A rename is incomplete until downstream references match. After renaming, update the note's slug/filename, grep the repo for the old name and update code and test identifiers, and re-point every `[[old-slug]]` citation. Code must match the canonical name — drift between a glossary term and a code identifier is a bug.

## Rules

- **Atomic notes, never a monolith** — one term, one file. A single `glossary.md` listing every term is the antipattern this type exists to avoid.
- **Cross-cutting only** — a term one spec owns lives in that spec's Key concepts. The glossary is for shared-kernel terms, not a dumping ground for every definition.
- **Cited, not copied** — specs, PRD, and stories cite `[[term-slug]]`; the note is the single source of the term's meaning. A citing doc never restates the definition.
- **Domain language only** — skip generic programming terms ("service", "repository", "controller"); those are architecture discussion, not domain vocabulary.

## Reference

- `docs/doc-model.md` § Doc-type registry, § Terms, § Cite in context.
- `wystack-agent-kit:spec` — owns spec-local terms in Key concepts; cites glossary notes for cross-cutting ones.
- `wystack-agent-kit:wiki-librarian` — doc-store CRUD; never call provider APIs directly.
