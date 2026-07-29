---
name: glossary
description: "Define a domain term as an atomic glossary note (glossary/<term>.md) — the single canonical home for the project's ubiquitous language, cited everywhere in the doc store's link form. Use when a new domain term appears, a term needs sharpening or renaming, or a spec/PRD/story references a term that has no note yet. The glossary is the term spine: every domain term lives here, every other doc cites it. Skip generic programming terms."
---
# Glossary

The project's **term spine**: one atomic note per term (`glossary/<term>.md`), the single canonical home every other doc cites — in the doc store's link form (`docs/doc-model.md` § Terms and ubiquitous language) — and never redefines. The directory *is* the glossary — a single `glossary.md` listing every term is the antipattern this structure avoids. Change the note once, every citation follows. Core type, always on — never opt-in.

`$ARGUMENTS` — the term to define or revise, or empty (interactive — sweep open specs/PRDs/stories for used-but-undefined terms).

**Prerequisites.** Load `wystack-agent-kit:workspace` — doc store and doc-status vocabulary. Not set up → `wystack-agent-kit:setup-agent-kit`. A note opens with the definition, not "this note defines…" (`docs/doc-model.md` § Write the artifact, not the document).

## What belongs

**Domain language only** — a term a domain expert reasons about: an entity, a state, a process, a project-specific policy. Skip generic programming vocabulary ("service", "repository", "handler") — that's architecture discussion, and it belongs in the spec's prose.

The test: *would two people on this project argue about what this word means, or use two different words for it?* Yes → glossary term. A universal CS concept in its textbook sense → not.

## What a note captures

- **Canonical name + definition** — the one spelling used in every spec, PRD, story, and code identifier, and a one-sentence domain-precise definition.
- **Aliases to avoid** — the casual synonyms that cause drift.
- **Relationships** — contains / contained-by / relates-to, with cardinality when useful.
- **Used by** — the specs/PRDs that lean on this term, when its blast radius helps a reader (especially a shared-kernel term spanning several specs).

**Level of detail** — domain-precise, between dictionary and spec:

> **Applicant** — a person submitting an application to a Listing. Distinct from **User** (may have an account without applying) and **Household** (groups applicants on one application).
> - Aliases to avoid: candidate, submitter
> - Relationships: belongs_to Household, references one Listing
> - Used by: SPEC-0002 (intake), SPEC-0005 (matching)

Too thin: "a person who applies" (dictionary). Too heavy: hashed-SSN columns, soft-delete, optimistic locking (spec territory).

## Workflow

1. **Collect** — scan the conversation, open PRDs/specs/stories, and recent code for the term(s) in play. Note ambiguities (same word, two meanings) and synonyms (two words, one meaning).
2. **Resolve the canonical name** — for an ambiguous or conflicting term, propose one canonical name with reasoning; present alternatives and defer to the user. For a genuinely contested concept boundary, `Skill("wystack-agent-kit:brainstorm", "--grill")` forces explicitness — skip obviously-unambiguous terms.
3. **Write the note** — one file, slug filename (`glossary/applicant.md`), definition first, opinionated about the canonical name.
4. **Save + cross-link** — delegate to `wystack-agent-kit:wiki-librarian`: save the note, then scan open specs/PRDs/stories for uses not yet citing the note and add citations in the doc store's link form, per `docs/doc-model.md` § Cross-linking — verify citations resolve; report gaps as fixes.

## Rules

- **A used term needs a note** — a domain term referenced in a spec, PRD, story, or code identifier with no glossary note is a coverage gap; the interactive sweep and the `qa` coverage check surface these.
- **A rename is incomplete until downstream matches** — update the note's slug/filename, grep the repo and update code and test identifiers, re-point every citation of the old slug. Drift between a glossary term and a code identifier is a bug.
