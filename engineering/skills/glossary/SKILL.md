---
name: glossary
description: "Draft, promote, or update the project glossary — the ubiquitous language (DDD) that names every domain concept in the codebase. Use when defining new domain terms, resolving naming ambiguity, hardening terminology, or when a signed-off glossary draft is ready to promote into the repo. Triggers on: \"glossary\", \"domain model\", \"DDD\", \"ubiquitous language\", \"name this concept\", \"define domain term\", or when PRD/spec work surfaces terminology that needs to be canonicalized."
---

# Glossary

Own the project's ubiquitous language — the canonical names for domain concepts, their definitions, aliases to avoid, and the relationships between them. The glossary is shared by PRD, spec, code, and tests; a drift in terminology anywhere becomes a silent bug.

See `docs/doc-model.md` for how the glossary fits the broader plugin doc model. This skill is the counterpart to `spec/` — spec owns architectural DDD (bounded contexts, aggregates); glossary owns lexical DDD (the words themselves).

`$ARGUMENTS` — concept to define, glossary title to promote, existing term to revise, or empty (interactive).

## Lifecycle

```
1. draft            — glossary lives in the wiki; terms debated with stakeholders
2. promote          — stable glossary is exported to .claude/glossary.md
3. repo-canonical   — glossary lives in the repo; edits happen via PR
```

Default behavior: if no glossary exists, `draft`. If a wiki draft has status `approved`/`stable` and no `.claude/glossary.md` exists, `promote`. If `.claude/glossary.md` exists, `repo-canonical`.

## What a Glossary Captures

For each term:

- **Name** — the canonical spelling used everywhere (PRD, spec, code, tests)
- **One-sentence definition** — tight, unambiguous, domain-specific
- **Aliases to avoid** — words that mean the same thing but shouldn't be used (e.g., *Applicant*: avoid "candidate", "submitter")
- **Conflicts** — when two concepts share a name in casual speech; make the distinction explicit
- **Relationships** — what it contains, what contains it, what it relates to (with cardinality when useful)
- **Code pointer** — optional; where the term is implemented in the codebase (for domain entities)

Group terms by domain cluster, not alphabetically. A reader should be able to orient to a subsystem by reading its cluster.

## Level of Detail

**Too thin (dictionary):**
> Applicant: A person who applies.

**Right level (domain-precise):**
> **Applicant** — a person submitting an application to a Listing. Distinct from **User** (who may have an account without applying) and from **Household** (which groups applicants on a single application).
> - Aliases to avoid: candidate, submitter
> - Relationships: belongs_to Household, references one Listing
> - Code: `src/features/applicant/`

**Too heavy (spec territory):**
> Applicant entity stores hashed SSN, is soft-deleted via deletedAt column, uses optimistic locking via version field...

Data model and implementation live in the spec, not the glossary.

## Phase 1 — Draft

Used when terms need to be coined, debated, or consolidated.

1. **Collect** — scan the current conversation, open PRDs, specs, and recent code changes for domain terms in use. Note ambiguities (same word, different meaning) and synonyms (different words, same meaning).
2. **Challenge** — for each ambiguous or conflicting term, propose a canonical name with reasoning. Present alternatives and defer to the user.
3. **Interview** — for non-obvious concepts, MUST invoke the brainstorm skill: call `Skill("engineering:brainstorm", "--grill")`. Use this to force explicitness about boundaries between concepts. Skip for terms that are obviously unambiguous.
4. **Write entries** — one per term. Group by domain cluster. Be opinionated about canonical names.
5. **Save draft to wiki** — delegate to the `wiki-librarian` agent. Provide: the page title (prefixed with "Glossary — "), the full content, the project name, suggested Tags, and cross-references to related PRDs/specs. The wiki-librarian handles schema and dedup. Do NOT call wiki MCP tools directly.
6. **Cross-update related docs** — ask the wiki-librarian to scan open PRDs and specs for uses of the terms and flag any that don't match the glossary's canonical names.

Draft glossaries stay in the wiki while terminology is still being debated.

## Phase 2 — Promote

Used when a glossary draft is stable enough to become canonical. Invoked explicitly ("promote the glossary") or when the wiki draft flips to `approved`/`stable`.

1. **Fetch the draft** — delegate to `wiki-librarian` to retrieve the full content.
2. **Strip tool references** — the promoted file must contain no wiki URLs, page IDs, or tool names. If entries reference specs or PRDs by name, keep those references; if they reference them by wiki URL, convert to name-only.
3. **Write the file** — create `.claude/glossary.md` with tool-neutral frontmatter:
   ```yaml
   ---
   id: GLOSSARY
   title: <project> Glossary
   status: active
   ---
   ```
   Followed by the body, organized by domain cluster.
4. **Mark wiki page promoted** — delegate to `wiki-librarian` to update the wiki page's status to `promoted` (or equivalent archived state). One-way promotion.
5. **Commit** — the commit message is the record of provenance: `promote glossary`. Do not add wiki URLs to the commit body.
6. **Announce completion** — report the `.claude/glossary.md` path. Subsequent term additions happen via PR alongside the code that introduces them.

## Phase 3 — Repo-canonical

Used when the glossary needs to change after promotion — usually because code introduced a new domain concept, renamed an existing one, or clarified a relationship.

1. **Locate `.claude/glossary.md`**.
2. **Edit directly** — add, revise, or remove entries in place.
3. **Review downstream** — if a term was renamed, grep the repo for the old name and update specs, code, and test JSDoc. The rename is incomplete until downstream references match.
4. **Do not sync back to the wiki** — the wiki copy is a historical snapshot. Generate a read-only mirror separately if stakeholders need a current view.
5. **Commit with code** — glossary changes usually travel in the same PR as the code that enacts them.

## Rules

- **Canonical names are opinionated** — pick one, explain why, list aliases to avoid. Ambivalence defeats the glossary.
- **One sentence per definition** — tight. If you need more, the concept is probably two concepts.
- **Draft in the wiki, promote to the repo** — enforced by the lifecycle. Don't mix.
- **Repo is tool-agnostic** — the promoted glossary never references the wiki.
- **Code must match the glossary** — rename one, rename the other. Drift between glossary terms and code identifiers is a bug.
- **Glossary feeds PRD and spec** — both skills reference the glossary when writing. The PRD skill seeds new terms back into the glossary draft.
- **Skip generic programming terms** — "service", "repository", "controller" belong in architecture discussion, not the glossary. Glossary is for *domain* language.
- **Use wiki-librarian for all wiki operations** — never call wiki MCP tools directly from this skill.
- **See `docs/doc-model.md`** for how glossary relates to PRD, spec, and the rest of the plugin doc model.
