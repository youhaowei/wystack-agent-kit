# Doc Model

How WyStack Agent Kit treats product and engineering documentation.

## The rule

- **Docs live in the configured doc store.** PRD, Spec, tasks, initiatives, and stakeholder-facing artifacts live wherever the workspace declares — local markdown (default `.wystack/docs`), GitHub/GitLab/Linear/Jira, Notion, or another adapter. The store is canonical for docs; there is no promote-to-repo ceremony.
- **The repo holds code, tests, and requirement-ID traces** — not docs. Requirements enter the repo through E2E tests, not mirrored PRD files. The test is the executable proof of the requirement.
- **Two doc types, terms defined inline.** PRD says what, Spec says how. Domain terms live where they're used — product terms in the PRD, technical and shared terms in the Spec's Key concepts section. There is no separate glossary artifact. See [Terms](#terms-and-ubiquitous-language).
- **Docs reference each other.** A doc is single-purpose; links are the connective tissue. See [Cross-linking](#cross-linking).
- **The repo is tool-agnostic.** No wiki URLs, page IDs, or tool names in committed code or tests. Provenance lives in git history.
- **The workspace declares storage.** Lifecycle skills resolve the workspace via the tracked `.wystack.json` pointer and read its `storage.json` before assuming where tasks or docs live.

## Where things live

Both doc types — PRD, Spec — live in the configured doc store. They share one **status vocabulary** (`docs.statuses`, see `storage-contract.md`) — including a `superseded` role — because they share a store, and a store runs one workflow. What differs per type is *purpose*, not lifecycle.

| Doc | Home | Notes |
|---|---|---|
| **PRD** | Doc store | Planning/commitment artifact. Stakeholder-editable. Captures intent, not implementation. Defines product terms inline next to their use. References the specs that design it. Product-level decisions (a chosen scope, a deliberate non-goal) live in the PRD itself, as _what / alternatives / why_. |
| **Spec** | Doc store | Living design document — current-state architecture and the decisions behind it, edited freely. Carries the **Key concepts** section that defines technical and shared domain terms (the project's ubiquitous language). Records its own load-bearing decisions inline (a Decisions section: _what / alternatives / why_, edited in place as the design evolves). References the PRD it implements and the tickets that carry it. |
| **Tasks, initiatives** | Work-item store | Ops-layer. Cross-repo, cross-functional, includes non-code work. |
| **Requirement IDs** | Authored in PRD, referenced in repo test JSDoc | Format per `conventions.requirementIdFormat` (default `<PRD-KEY>-US-<group>.<item>`). The only requirement trace in the repo. |

## Supersession

A whole doc supersedes the same way: write the replacement, point it at the old via a `supersedes:` link, flip the old doc's status to `superseded`. The superseded doc's **body is never edited** and the doc is never deleted — only its status changes — so the trail is append-only. This is for replacing an *entire* doc (a v2 spec that reshapes a system, a rewritten PRD); individual design decisions are not superseded this way — they are edited in place in the spec's Decisions section.

## Requirements in the repo

No mirrored PRD file. Requirements reach the repo through E2E test documentation:

```ts
/**
 * BLOSSOM-US-1.2: Draft application save
 *
 * User story: Applicant starts form, leaves, returns later — draft persists.
 * Success: Applicant resumes where they left off.
 *
 * @prd Blossom Application        (reference, not a link)
 */
test("applicant can save draft and resume", async () => {
  // ...
});
```

Why this beats a mirrored PRD:
- **Zero drift**: can't document a requirement without a test demonstrating it.
- **Tight traceability**: `BLOSSOM-US-1.2` → test → implementation code, no intermediate doc.
- **Executable**: tests can't lie about what shipped. A mirrored PRD can.
- **Tool-agnostic**: repo says nothing about where the `BLOSSOM-US-1.2` ID originated.

## Doc store layout

Docs live where the configured doc provider declares (`docs.path`). For the default local-markdown provider, that's `.wystack/docs`, organized by type:

```
.wystack/docs/                   # docs.path default
  prds/
    0001-feature-name.md
  specs/
    0001-feature-name.md
    0002-other-feature.md
```

A remote provider (Notion, Linear, …) holds the same artifacts as native pages; the layout above is the local form. Skills resolve the path through `wiki-librarian` and never assume `.wystack/docs` directly.

Frontmatter carries the doc identity and links:

```yaml
---
id: SPEC-0001
title: Feature Name
status: active
supersedes: SPEC-0000      # on a doc that replaces an earlier whole doc
relates-to: [SPEC-0002]    # related docs
---
```

## Coverage verification

A requirement in the PRD without a matching test is a coverage gap. Checking this is the `qa` agent's job — on-demand, not continuous.

`qa` reads requirement IDs from the configured doc store via `wiki-librarian`, greps the repo for each, and reports:
- Orphan requirements (no test)
- Orphan tests (requirement ID not in PRD)
- Specs missing referenced requirement IDs

Run pre-release, pre-demo, during QA passes. Not every PR.

## Why this shape

1. **One canonical home per doc**: no draft-vs-promoted split to keep in sync. A doc has exactly one home — the store — and one status. No frozen snapshots drifting from a repo copy.
2. **Single-purpose, linked**: each doc does one job (PRD intent, spec design + its decisions + its terms) and reaches the other by link. Splitting concerns only works because the links hold it together — see [Cross-linking](#cross-linking).
3. **Tool-portable**: the repo holds only code, tests, and requirement-ID traces — nothing tool-specific. Swap doc providers tomorrow; committed code is untouched.
4. **Stakeholder-friendly**: teams keep their preferred collaboration surface; docs stay editable there without a promotion gate.

## Terms and ubiquitous language

There is no separate glossary artifact. Domain terms — the project's ubiquitous language — are defined **where they're used**, in the doc that owns them:

| Term kind | Defined in | Example |
|---|---|---|
| **Product term** — a concept a stakeholder reasons about | PRD, inline next to its first use | "**Applicant** — a person submitting an application to a Listing." |
| **Technical / shared term** — structure, or a domain term that also shapes architecture | Spec, in the **Key concepts** section | "**Pipe** — the WebSocket message frame for one connection." · "**Applicant**" when it's also an aggregate root |

**One owner per term.** A term lives in exactly one place. The product-vs-technical split is a heuristic, not a partition — many domain entities (Applicant, Order) appear in *both* product stories and architecture. The rule that breaks the tie: **if a term is in the spec's Key concepts, the spec owns it** — the PRD then cites it in context (a one-clause use + link), never re-defines it. A term defines the canonical name, a one-sentence domain-precise definition, aliases to avoid, and relationships when useful — between dictionary ("a person who applies") and spec detail (hashed-SSN columns, soft-delete).

**Strategic / tactical DDD** — bounded contexts, aggregates, domain events, context maps, anti-corruption layers — lives in the Spec's optional Domain Model section. Projects that don't do DDD skip it with no loss; its terms come from the Spec's Key concepts.

Flow: spec Key concepts + PRD product terms seed canonical names → PRD and spec use them → code and tests use them → coverage check verifies the loop closes.

## Cross-linking

Docs reference related docs **as part of their content** — links are the connective tissue that lets each doc stay single-purpose. There is no fixed link matrix; link whatever the content calls for. In practice:

- A **spec** links to the PRD it implements and the tickets that carry it.
- A **PRD** links to the specs that design it, and cites spec-owned terms in context where it uses them.

This is **mandatory and verified**: a doc skill creates the links and confirms backlinks resolve before reporting done. If a link can't be written automatically, report it as a setup gap with a concrete fix — never hand the edits over as a chore.

### Cite in context

When a doc references another doc — a spec citing the PRD it implements, or a PRD using a term the spec defines — the reference is **a one-clause reason inline + a link to the full record**, placed where it shapes the surrounding text, not gathered into a standalone list. The inline clause carries the tie-breaker (the constraint or requirement that makes the text read sensibly here); the link is for the full detail. This holds for the authoritative records: the PRD (the intent), and a term's owning doc (the definition — spec Key concepts, or PRD for a product term).

(A spec's own design decisions and term definitions are *not* cross-references — they live directly in the spec, in its Decisions and Key concepts sections. Cite-in-context governs links *out* to records another doc owns, not a doc's own content.)

The reader should follow the text *without clicking*, and click only for depth. Two symmetric failures to avoid:

- **Bare link** — a reference with no reason ("see the PRD") is a directory entry; it forces a click to learn anything. A reason with no link is unverifiable.
- **Restated record** — more than the tie-breaker duplicates the record. The owning doc stays the single source of its own full content; the citing doc never becomes a second copy.

> **Bad (bare link / directory):**
> "Implements: MEM-US-1, MEM-US-2, MEM-US-3." — reader must open the PRD to learn anything.
>
> **Bad (restated record):**
> "This serves the goal that memories persist across sessions so a user returning after a week sees their full history, which matters because the product's core promise is continuity and… (MEM-US-2)" — the spec just copied the PRD.
>
> **Good (tie-breaker clause + link):**
> "…serves the offline-first goal ([MEM-US-2](#))." · "…a **Pipe** ([Key concepts](#)) per connection."

## Skills that participate

- `setup-agent-kit/` — creates `.wystack/` workspace and storage setup for a repo
- `prd/` — writes PRDs in the configured doc store; defines product terms inline; cites spec-owned terms in context; references designing specs; records product-level decisions inline
- `spec/` — writes the living design doc in the doc store, including its Key concepts section (the ubiquitous language) and Decisions section; references the PRD and tickets; carries optional Domain Model section for DDD-committed projects
- `qa` agent — runs coverage verification on demand
- `wiki-librarian` agent — document-store CRUD; plugin skills delegate here
- `breakdown/`, `groom/`, `start-task/` — read specs from the configured doc store via `wiki-librarian`
