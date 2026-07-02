---
name: glossary
description: "Define a domain term as an atomic glossary note (glossary/<term>.md) — the single canonical home for the project's ubiquitous language, cited everywhere as [[term-slug]]. Use when a new domain term appears, a term needs sharpening or renaming, or a spec/PRD/story references a term that has no note yet. The glossary is the term spine: every domain term lives here, every other doc cites it. Skip generic programming terms."
---
# Glossary

The glossary is the project's **term spine**: the single canonical home for every domain term. One atomic note per term (`glossary/<term>.md`); every other doc — PRD, Spec, Story — *cites* the note (`[[term-slug]]`) and never redefines it. The directory is the glossary; each note is an independently-linkable definition. Never a monolith — a single `glossary.md` listing every term is the antipattern this structure exists to avoid.

**Core, always on.** The glossary holds the ubiquitous language together — without it, terms scatter across docs, the same entity gets defined twice, and code identifiers match neither. Every project has one; it isn't opt-in.

**One owner, one home.** A term lives in exactly one note. Spec Key concepts is an *index* into the glossary (the terms a spec leans on, cited), not a second place to define them; the PRD cites product terms; a Story cites in user language. The note is the only definition — change it once, every citation follows.

**Write the term, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. A note opens with the definition, not "this note defines…".

`$ARGUMENTS` — the term to define or revise, or empty (interactive — sweep open specs/PRDs/stories for used-but-undefined terms).

**Prerequisite.** Load `wystack-agent-kit:workspace` — it resolves the doc store and the doc-status vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## What belongs in the glossary

**Domain language only.** A term a domain expert reasons about — an entity, a state, a process, a policy with a project-specific meaning. Skip generic programming vocabulary ("service", "repository", "controller", "handler"); that's architecture discussion, not domain language, and it belongs in the spec's prose, not a term note.

The test: *would two people on this project argue about what this word means, or use two different words for it?* If yes, it's a glossary term. If it's a universal CS concept used in its textbook sense, it isn't.

## What a note captures

One file per term, the slug as filename (`glossary/applicant.md`):

- **Canonical name + definition** — the one spelling used in every spec, PRD, story, and code identifier, and a one-sentence domain-precise definition.
- **Aliases to avoid** — the casual synonyms that cause drift.
- **Relationships** — contains / contained-by / relates-to, with cardinality when useful.
- **Used by** — the specs/PRDs that lean on this term, when it helps a reader see its blast radius (especially for a shared-kernel term spanning several specs).

**Level of detail** — domain-precise, between dictionary and spec:

> **Applicant** — a person submitting an application to a Listing. Distinct from **User** (may have an account without applying) and **Household** (groups applicants on one application).
> - Aliases to avoid: candidate, submitter
> - Relationships: belongs_to Household, references one Listing
> - Used by: SPEC-0002 (intake), SPEC-0005 (matching)

Too thin = "a person who applies" (dictionary). Too heavy = hashed-SSN columns, soft-delete, optimistic locking (spec territory).

## Workflow

1. **Collect.** Scan the conversation, open PRDs/specs/stories, and recent code for the term(s) in play. Note ambiguities (same word, two meanings) and synonyms (two words, one meaning).
2. **Resolve the canonical name.** For an ambiguous or conflicting term, propose one canonical name with reasoning; present alternatives and defer to the user. For a genuinely contested concept boundary, `Skill("wystack-agent-kit:brainstorm", "--grill")` forces explicitness — skip obviously-unambiguous terms.
3. **Write the note** — one file, slug filename, definition first, opinionated about the canonical name.
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: save as `glossary/<slug>.md`, then scan open specs/PRDs/stories for uses of this term not yet citing `[[term-slug]]` and update them to cite the note. Follow the Save + cross-link protocol in `docs/doc-model.md` § Cross-linking (delegate, verify citations resolve, report gaps as fixes).

## Renaming a term

A rename is incomplete until downstream references match. After renaming: update the note's slug/filename, grep the repo for the old name and update code and test identifiers, and re-point every `[[old-slug]]` citation. Code must match the canonical name — drift between a glossary term and a code identifier is a bug.

## Rules

- **Atomic notes, never a monolith** — one term, one file. A single `glossary.md` listing every term is the failure mode this type exists to avoid.
- **The glossary defines; everyone else cites** — specs, PRD, and stories cite `[[term-slug]]`; the note is the single source of the term's meaning. A citing doc never restates the definition. A spec's Key concepts is an index of citations, not a second definitions list.
- **A used term needs a note** — a domain term referenced in a spec, PRD, story, or code identifier with no glossary note is a coverage gap. The interactive sweep and the `qa` coverage check surface these.
- **Domain language only** — skip generic programming terms; those are architecture discussion, not domain vocabulary.

## Reference

- `docs/doc-model.md` § Terms, § Cite in context, § Coverage verification.
- `wystack-agent-kit:spec` — its Key concepts section indexes (cites) glossary terms; it defines none.
- `wystack-agent-kit:wiki-librarian` — doc-store CRUD; never call provider APIs directly.
