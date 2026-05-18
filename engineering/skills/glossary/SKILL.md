---
name: glossary
description: "Draft, promote, or update the project glossary — the ubiquitous language (DDD) that names every domain concept. Use when the user wants to define domain terms, resolve naming ambiguity, harden terminology, capture a domain model, or promote a signed-off glossary draft into the repo. Also seeded when PRD or spec work surfaces terms that need canonicalizing."
---
# Glossary

Own the project's ubiquitous language — canonical names for domain concepts, their definitions, aliases to avoid, and relationships. The glossary is shared by PRD, spec, code, and tests; terminology drift anywhere is a silent bug.

Counterpart to `spec`: spec owns architectural DDD (bounded contexts, aggregates), glossary owns lexical DDD (the words). See `docs/doc-model.md` for the broader doc model.

`$ARGUMENTS` — concept to define, glossary title to promote, term to revise, or empty (interactive).

**Prerequisites.** Load `engineering:workspace` — it resolves the document store and the promoted-glossary path (`.claude/glossary.md` by default). If the workspace isn't set up, run `engineering:setup-agent-kit`.

Three phases, picked from current state:

- **Draft** — no glossary, or a draft in the doc store.
- **Promote** — the doc-store draft is `approved`/`stable`, no promoted file yet.
- **Repo-canonical** — the promoted file exists.

## What an entry captures

Per term: **canonical name** (the one spelling used in PRD, spec, code, tests) · **one-sentence definition** (tight, domain-specific) · **aliases to avoid** · **conflicts** (when two concepts share a casual name) · **relationships** (contains / contained-by / relates-to, with cardinality when useful) · **code pointer** (optional, for domain entities).

Group entries by domain cluster, not alphabetically — a reader should orient to a subsystem by reading its cluster.

**Level of detail** — domain-precise, between dictionary and spec:

> **Applicant** — a person submitting an application to a Listing. Distinct from **User** (may have an account without applying) and **Household** (groups applicants on one application).
> - Aliases to avoid: candidate, submitter
> - Relationships: belongs_to Household, references one Listing
> - Code: `src/features/applicant/`

Too thin = "a person who applies" (dictionary). Too heavy = hashed-SSN, soft-delete columns, optimistic locking (spec territory).

## Phase 1 — Draft

1. **Collect** — scan the conversation, open PRDs/specs, and recent code for domain terms. Note ambiguities (same word, different meaning) and synonyms (different words, same meaning).
2. **Challenge** — for each ambiguous or conflicting term, propose a canonical name with reasoning; present alternatives and defer to the user. For non-obvious concepts, invoke `Skill("engineering:brainstorm", "--grill")` to force explicitness about concept boundaries — skip obviously-unambiguous terms.
3. **Write entries** — one per term, grouped by domain cluster, opinionated about canonical names.
4. **Save + cross-check** — delegate to `wiki-librarian`: save with title `"Glossary — …"`, project, tags, cross-references to related PRDs/specs. Then ask it to scan open PRDs/specs for term uses that don't match the canonical names. Never call doc-store MCP tools directly.

Draft glossaries stay in the doc store while terminology is debated.

## Promote & repo-canonical

Both follow the shared **promotion ceremony** — see `docs/doc-model.md`. Glossary's parameters:

| Parameter | Value |
|---|---|
| Promoted file | the configured glossary path (`.claude/glossary.md` by default), organized by domain cluster |
| Frontmatter `id` | `GLOSSARY` |
| Promote triggers | status flips to `approved`/`stable`, or explicit _"promote the glossary"_ |
| Commit message | `promote glossary` |

Glossary-specific: in a repo-canonical edit that renames a term, grep the repo for the old name and update specs, code, and test JSDoc — the rename is incomplete until downstream references match.

## Rules

- **Canonical names are opinionated** — pick one, explain why, list aliases to avoid. Ambivalence defeats the glossary.
- **Code must match the glossary** — rename one, rename the other. Drift between glossary terms and code identifiers is a bug.
- **Domain language only** — skip generic programming terms ("service", "repository", "controller"); those belong in architecture discussion.
