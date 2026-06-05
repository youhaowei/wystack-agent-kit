# Doc Model

How WyStack Agent Kit treats product and engineering documentation.

## The rule

- **Docs live in the configured doc store.** PRD, Spec, tasks, initiatives, and stakeholder-facing artifacts live wherever the workspace declares — local markdown (default `.wystack/docs`), GitHub/GitLab/Linear/Jira, Notion, or another adapter. The store is canonical for docs; there is no promote-to-repo ceremony.
- **The repo holds code, tests, and requirement-ID traces** — not docs. Requirements enter the repo through E2E tests, not mirrored PRD files. The test is the executable proof of the requirement.
- **Two doc types, terms defined inline.** PRD says what, Spec says how. Domain terms live where they're used — product terms in the PRD, technical and shared terms in the Spec's Key concepts section. Terms are not a standalone artifact. See [Terms](#terms-and-ubiquitous-language).
- **Docs reference each other.** A doc is single-purpose; links are the connective tissue. See [Cross-linking](#cross-linking).
- **The repo trace is the canonical home's stable ID.** A test cites the story's requirement ID — whatever its canonical home provides as a stable identifier. Tool-neutrality is a **provider-selection property**, not a kit guarantee: the default local-markdown home yields neutral IDs (`ST-42`); a team that makes a tracker the story home has chosen tracker-shaped IDs (`ENG-128`) in its test traces, knowingly. No other tool identity — wiki URLs, page IDs, provider names beyond the requirement ID — belongs in committed code. Provenance lives in git history.
- **The workspace declares storage.** Lifecycle skills resolve the workspace via the tracked `.wystack.json` pointer and read its `storage.json` before assuming where tasks or docs live.

## Write the artifact, not the document

A doc's job is to convey the thing it documents — the architecture, the behavior — not to describe itself. Every doc skill inherits these rules; they are stated once here and referenced, never restated.

- **Architecture, not meta.** No sentences about the doc, its conventions, its provenance, or where other docs live. The reader wants the system, not a tour of the page. "This spec records its decisions inline", "neutral package depended on by both X and Y", "What this is / isn't" as a heading — all meta. Cut them. Navigation out to another doc is a bare cross-link at most, never a paragraph (see [Cite in context](#cite-in-context)).
- **First line is the thing.** Open with what the thing *is*, in one sentence. Readers judge the doc on its first paragraph; a preamble of links or process fails that test. "A concurrency pool that…" not "This document describes…".
- **Decisions default to one-liners.** A decision is `**X:** chose A over B because C`. Expand to the full _what / alternatives / why_ block *only* when the choice is load-bearing and was genuinely contested. The ceremony is the exception, not the default — "delivery is async, here's why" is one line, not a four-part block.
- **Earn the page (ownership test).** Before writing a doc, ask: *could you delete it and lose nothing that isn't already elsewhere — in code, or another doc?* If yes, don't write it, or fold it into the doc that owns the content. Each doc type applies this in its own skill (the spec skill, for instance, uses it to decide whether a small package gets a standalone spec or folds into its consumer).

These are about *what not to put in*. What each doc type *does* own — PRD intent, spec design + decisions + terms — is below.

## Where things live

PRD, Spec, and Story live in the configured doc store. They share one **status vocabulary** (`docs.statuses`, see `storage-contract.md`) — one store runs one workflow. What differs per type is *purpose*, not lifecycle.

| Doc | Home | Notes |
|---|---|---|
| **PRD** | Doc store | Planning/commitment artifact. Stakeholder-editable. Captures intent, not implementation. Holds purpose, users, goals/non-goals, dependencies, and a **story index** — a link per story, not the story bodies. Defines product terms inline next to their use. References the specs that design it. Product-level decisions live in the PRD itself, as _what / alternatives / why_. |
| **Spec** | Doc store | Living design document — current-state architecture and the decisions behind it, edited freely. Carries the **Key concepts** section that defines technical and shared domain terms (the project's ubiquitous language). Records its own load-bearing decisions inline (a Decisions section: _what / alternatives / why_, edited in place as the design evolves). References the PRD it implements and the tickets that carry it. |
| **Story** | Canonical home (doc store by default, work-item store if configured) | The canonical requirement artifact: one requirement's goal and acceptance bar in user language. Owns its body (sentence, details, scenarios, edge cases), acceptance criteria, status, and the links to delivery tasks, verifying tests, and specs. States the *what*, not the *how* — see [Story](#story). |
| **Tasks, initiatives** | Work-item store | Ops-layer. Cross-repo, cross-functional, includes non-code work. |
| **Requirement IDs** | Provided by the story's canonical home, referenced in repo test JSDoc | The canonical home's own stable ID is the requirement ID. The kit never mints it — the adapter allocates (local-markdown `ST-42`, a tracker issue `ENG-128`). Format per `conventions.requirementIdFormat`. The only requirement trace in the repo. |

### The shared status ladder

`docs.statuses` is one ladder every doc type moves through:

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`)

- **Draft** — being written.
- **Proposed** — complete, not yet committed. The requirement or design exists but no one has said yes.
- **Accepted** — committed and agreed, not necessarily built. (This is the state bare `Active` used to conflate with "shipped".) *Accepted is not frozen* — the doc stays negotiable and is edited in place; supersession is for replacement, not refinement.
- **Implemented** — built and verified. Where a verifying-test trace exists (Stories especially), the Accepted→Implemented flip is **justified by those tests** — derived, self-correcting. Where no trace exists (a spec with no direct tests), it is settable by hand.
- **Superseded** — replaced by a successor (see [Supersession](#supersession)). **Archived** — retired.

One ladder, every type: an *Accepted* PRD is committed intent; an *Accepted* spec is agreed design; an *Accepted* story is a committed requirement. None implies built until *Implemented*.

## Supersession

A whole doc supersedes the same way: write the replacement, point it at the old via a `supersedes:` link, flip the old doc's status to `superseded`. The superseded doc's **body is never edited** and the doc is never deleted — only its status changes — so the trail is append-only. This is for replacing an *entire* doc (a v2 spec that reshapes a system, a rewritten PRD); individual design decisions are not superseded this way — they are edited in place in the spec's Decisions section.

## Story

A Story is the canonical artifact for one requirement: its goal and its acceptance bar, in user language. It states *what* the system should do and *how we'll know it's done* — never *how to build it*. Prescribing the how inside a requirement smuggles implementation into the wrong artifact and forecloses the implementer's judgment; that belongs to the spec (architecture) and the tickets (delivery slices).

**The canonical home owns the story** — its ID, its status, and its body. `requirements.storyHome` (see `storage-contract.md`) selects the home:

- **`docs` (default)** — the story is a doc in the doc store. The kit owns its status on the shared ladder and *derives* Implemented from verifying tests.
- **`tasks`** — the story is a work-item in the tracker (a distinct issue type or label; delivery tasks are its sub-issues). The **tracker owns status** — the issue's state *is* the story status, mapped onto the ladder for display. The kit reads it and never overrides.

One story, one canonical home, one status authority. No mixed mode.

**The PRD links, it does not mirror.** The PRD's story index is a link per story; status is read through the link. Surface status inline only when the link alone wouldn't make it obvious (a *Superseded* story the reader shouldn't follow). Mirroring status into the PRD duplicates state the home owns, and duplicated state drifts.

**Quality bar.** A story is *Valuable, Negotiable, Testable*, with *unambiguous acceptance criteria*, and states the *goal, not the how*. INVEST's *Estimable* and *Small* are delivery properties — they live on the tickets `breakdown` slices off the story, not on the requirement.

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

The cited ID is the story's requirement ID, provided by its canonical home. The test *verifies the story*: the story's verification trace records which tests prove it, and the coverage loop closes at the Story (not the PRD).

Why this beats a mirrored PRD:
- **Zero drift**: can't document a requirement without a test demonstrating it.
- **Tight traceability**: requirement ID → test → implementation code, no intermediate doc.
- **Executable**: tests can't lie about what shipped. A mirrored PRD can.
- **Provider-portable by default**: with a neutral home the repo says nothing about where the ID originated; with a tracker home, the trace names the tracker by deliberate choice.

## Doc store layout

Docs live where the configured doc provider declares (`docs.path`). For the default local-markdown provider, that's `.wystack/docs`, organized by type:

```
.wystack/docs/                   # docs.path default
  prds/
    0001-feature-name.md
  specs/
    0001-feature-name.md
    0002-other-feature.md
  stories/                       # when storyHome = docs
    ST-42-resume-draft.md
```

A remote provider (Notion, Linear, …) holds the same artifacts as native pages; the layout above is the local form. Skills resolve the path through `wiki-librarian` and never assume `.wystack/docs` directly. (With `storyHome = tasks`, stories live in the work-item store instead, not here.)

Frontmatter carries the doc identity and links:

```yaml
---
id: SPEC-0001
title: Feature Name
status: accepted           # the shared ladder: draft|proposed|accepted|implemented|superseded|archived
supersedes: SPEC-0000      # on a doc that replaces an earlier whole doc
relates-to: [SPEC-0002]    # related docs
---
```

## Coverage verification

A requirement without a matching test is a coverage gap. Checking this is the `qa` agent's job — on-demand, not continuous.

`qa` reads requirement IDs from the **canonical story home** (the doc store via `wiki-librarian`, or the work-item store when `storyHome = tasks`), greps the repo for each, and reports:
- Orphan requirements (story with no verifying test)
- Orphan tests (requirement ID not backed by a story)
- Specs missing referenced requirement IDs
- In `tasks` mode, a story-issue marked done with no verifying test — a coverage gap, surfaced without touching the tracker's status (the tracker owns status).

Run pre-release, pre-demo, during QA passes. Not every PR.

## Why this shape

1. **One canonical home per doc**: no draft-vs-promoted split to keep in sync. A doc has exactly one home — the store — and one status. No frozen snapshots drifting from a repo copy.
2. **Single-purpose, linked**: each doc does one job (PRD intent, spec design + its decisions + its terms) and reaches the other by link. Splitting concerns only works because the links hold it together — see [Cross-linking](#cross-linking).
3. **Tool-portable**: the repo holds only code, tests, and requirement-ID traces — nothing tool-specific. Swap doc providers tomorrow; committed code is untouched.
4. **Stakeholder-friendly**: teams keep their preferred collaboration surface; docs stay editable there without a promotion gate.

## Terms and ubiquitous language

Domain terms — the project's ubiquitous language — are defined **where they're used**, in the doc that owns them:

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
- `prd/` — writes PRDs in the configured doc store; holds a story index (links, not bodies); defines product terms inline; cites spec-owned terms in context; references designing specs; records product-level decisions inline
- `story/` — writes/updates Story artifacts in the configured canonical home; owns the requirement body, acceptance criteria, status, and traceability links
- `spec/` — writes the living design doc in the doc store, including its Key concepts section (the ubiquitous language) and Decisions section; references the PRD and tickets; carries optional Domain Model section for DDD-committed projects
- `breakdown/` — slices tickets off stories; tickets reference the story's ACs and add delivery checks
- `qa` agent — runs coverage verification on demand, reading requirement IDs from the canonical story home
- `wiki-librarian` agent — document-store CRUD; plugin skills delegate here
- `upgrade/` — reconciles a project to the installed kit version by replaying declared migration steps
- `groom/`, `start-task/` — read specs from the configured doc store via `wiki-librarian`
