# Doc Model

How WyStack Agent Kit treats product and engineering documentation.

## The rule

- **Docs live in the configured doc store.** PRD, Spec, tasks, initiatives, and stakeholder-facing artifacts live wherever the workspace declares — local markdown (default `.wystack/docs`), GitHub/GitLab/Linear/Jira, Notion, or another adapter. The store is canonical for docs; there is no promote-to-repo ceremony.
- **The repo holds code, tests, and requirement-ID traces** — not docs. Requirements enter the repo through E2E tests, not mirrored PRD files. The test is the executable proof of the requirement.
- **The glossary is the term spine.** Every domain term lives in exactly one place — a glossary note (`glossary/<term>.md`) — and every other doc *cites* it (`[[term-slug]]`), never redefines it. PRD says what, Spec says how, and both draw their vocabulary from the glossary. The glossary is core: without it the ubiquitous language has no canonical home and the docs drift. See [Terms](#terms-and-ubiquitous-language).
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

PRD, Spec, Story, and Glossary live in the configured doc store. They share one **status vocabulary** (`docs.statuses`, see `storage-contract.md`) — one store runs one workflow. What differs per type is *purpose*, not lifecycle. PRD/Spec/Story/Glossary are the **always-on core**; ADR is the one **optional** type a project opts into (see [Doc-type registry](#doc-type-registry)).

| Doc | Home | Notes |
|---|---|---|
| **PRD** | Doc store | Planning/commitment artifact. Stakeholder-editable. Captures intent, not implementation. Holds purpose, users, goals/non-goals, dependencies, and a **story index** — a link per story, not the story bodies. Cites domain terms as `[[term-slug]]` into the glossary, never re-defining them. References the specs that design it. Product-level decisions live in the PRD itself, as _what / alternatives / why_. |
| **Spec** | Doc store | Living design document — current-state architecture and the decisions behind it, edited freely. Its **Key concepts** section is a per-spec *index* into the glossary — the terms this spec leans on, each cited as `[[term-slug]]`, not redefined. Records its own load-bearing decisions inline (a Decisions section: _what / alternatives / why_, edited in place as the design evolves). References the PRD it implements and the tickets that carry it. |
| **Story** | Canonical home (doc store by default, work-item store if configured) | The canonical requirement artifact: one requirement's goal and acceptance bar in user language. Owns its body (sentence, details, scenarios, edge cases), acceptance criteria, status, and the links to delivery tasks, verifying tests, and specs. States the *what*, not the *how* — see [Story](#story). |
| **Glossary** | Doc store, `glossary/<term>.md` | The **term spine**: the single canonical home for *every* domain term, one atomic note per term — never a monolith. Each note defines the canonical name; every other doc (PRD, Spec, Story) cites it as `[[term-slug]]`. A domain term used anywhere with no glossary note is a coverage gap. See [Terms](#terms-and-ubiquitous-language). |
| **ADR** _(optional)_ | Doc store, `adrs/` | Dated record of a **contested** decision — the deliberation a one-liner can't hold: alternatives, trade-offs, the moment in time. **Append-only.** Points UP to the spec it expands (`serves:` link); the spec's inline one-liner points down (`expands:`). Written *only* when full deliberation would bloat the spec's Decisions section. Does not replace inline one-line decisions — it is their optional expanded home. See [Doc-type registry](#doc-type-registry). |
| **Tasks, initiatives** | Work-item store | Ops-layer. Cross-repo, cross-functional, includes non-code work. |
| **Requirement IDs** | Provided by the story's canonical home, referenced in repo test JSDoc | The canonical home's own stable ID is the requirement ID. The kit never mints it — the adapter allocates (local-markdown `ST-42`, a tracker issue `ENG-128`). Format per `conventions.requirementIdFormat`. The only requirement trace in the repo. |

### Doc-type registry

Doc types are a two-tier registry. **Core types are always on** — PRD, Spec, Story, Glossary — because skills hard-depend on them: `breakdown` slices tickets off a Story, the `qa` coverage loop closes at the Story (its ID is the requirement ID), and every doc draws its vocabulary from the Glossary (the term spine — without it there's no canonical home for the ubiquitous language and the docs drift). Remove a core type and those skills lose their anchor, so core types are never opt-out.

**Optional types are opt-in** via `docs.types` (see `storage-contract.md`): a project that lists `adr` gains it; one that doesn't loses nothing — a contested decision absent an ADR stays a one-line decision in the spec. The "earn the page" discipline that keeps a small package from getting a standalone spec keeps a project from carrying a type it won't use. New optional types register by adding a descriptor and an ID; core types never appear in `docs.types`.

A skill reads `docs.types` and adapts **only when an optional type is enabled** — a project with no `docs.types` sees no new prose for it. The optional types and their participating skills:

| Type | ID | Owns | Cited / expanded by |
|---|---|---|---|
| **ADR** | `adr` | A contested decision's full deliberation, append-only, dated. | Spec Decisions one-liner links down (`expands:`); the ADR points up (`serves:`). |

### The shared status ladder

`docs.statuses` is one ladder every doc type moves through:

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`)

- **Draft** — being written.
- **Proposed** — complete, not yet committed. The requirement or design exists but no one has said yes.
- **Accepted** — committed and agreed, not necessarily built. (This is the state bare `Active` used to conflate with "shipped".) *Accepted is not frozen* — the doc stays negotiable and is edited in place; supersession is for replacement, not refinement.
- **Implemented** — built and verified. Where a verifying-test trace exists (Stories especially), the Accepted→Implemented flip is **justified by those tests** — derived, self-correcting. Where no trace exists (a spec with no direct tests), it is settable by hand.
- **Superseded** — replaced by a successor (see [Supersession](#supersession)). **Archived** — retired.

One ladder, every type: an *Accepted* PRD is committed intent; an *Accepted* spec is agreed design; an *Accepted* story is a committed requirement. None implies built until *Implemented*. A **glossary note** uses the same ladder but rests at *Accepted* — a term is `draft` while its name is being resolved, `accepted` once canonical and in use; it has no "built" state, so the *Implemented* rung simply isn't exercised (a renamed or retired term moves to *Superseded*/*Archived*). The ladder is shared; not every type travels every rung, just as a spec with no test trace reaches *Implemented* only by hand.

## Supersession

A whole doc supersedes the same way: write the replacement, point it at the old via a `supersedes:` link, flip the old doc's status to `superseded`. The superseded doc's **body is never edited** and the doc is never deleted — only its status changes — so the trail is append-only. This is for replacing an *entire* doc (a v2 spec that reshapes a system, a rewritten PRD); individual design decisions are not superseded this way — they are edited in place in the spec's Decisions section.

**When `adr` is enabled, a decision supersedes at *decision* granularity** — the mirror of whole-doc supersede, one tier down. A new ADR points at the old via `supersedes:`, the old flips to `superseded`, its body is never edited; the trail is append-only. This does **not** revert "decisions default to one-liners": the default stays inline and one-line in the spec's Decisions section, and an ADR is the rare expanded form for a decision genuinely contested enough that its alternatives and trade-offs would bloat the spec. The link directions name the dependency: spec → ADR is `expands` (the spec's one-liner links down to the full record), ADR → spec is `serves` (the ADR points up to what it serves). A reader understands the system from the spec alone — the ADR is depth-on-demand, never required reading. A Story never expands into an ADR: the `goal-not-how` boundary keeps a requirement free of architecture decisions, so a contested decision a requirement surfaces is resolved in the spec the Story links to, not in the Story.

## Story

A Story is the canonical artifact for one requirement: its goal and its acceptance bar, in user language. It states *what* the system should do and *how we'll know it's done* — never *how to build it*. Prescribing the how inside a requirement smuggles implementation into the wrong artifact and forecloses the implementer's judgment; that belongs to the spec (architecture) and the tickets (delivery slices).

**The canonical home owns the story** — its ID, its status, and its body. `requirements.storyHome` (see `storage-contract.md`) selects the home:

- **`docs` (default)** — the story is a doc in the doc store. The kit owns its status on the shared ladder and *derives* Implemented from verifying tests.
- **`tasks`** — the story is a work-item in the tracker (a distinct issue type or label; delivery tasks are its sub-issues). The **tracker owns status** — the issue's state *is* the story status, mapped onto the ladder for display. The kit reads it and never overrides.

One story, one canonical home, one status authority. No mixed mode.

**The PRD links, it does not mirror.** The PRD's story index is a link per story; status is read through the link. Surface status inline only when the link alone wouldn't make it obvious (a *Superseded* story the reader shouldn't follow). Mirroring status into the PRD duplicates state the home owns, and duplicated state drifts.

**Quality bar.** A story is *Valuable, Negotiable, Testable*, with *unambiguous acceptance criteria*, and states the *goal, not the how*. *Estimable* and *Small* are delivery-granularity — meaningless for a requirement, so they don't apply to the story. The full INVEST bar applies to the tickets `breakdown` slices off it — and *Valuable* is re-tested per slice, not inherited: a Valuable story can slice into worthless horizontal fragments, so each ticket must itself be independently valuable (`breakdown` uses this as its brake on over-splitting).

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
  glossary/                      # core — the term spine, one note per term
    tenant.md
    applicant.md
  adrs/                          # when docs.types includes "adr"
    0007-co-locate-wire-and-channel.md
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

An ADR carries `serves:` (the spec it expands) and, when it replaces an earlier decision, `supersedes:` the prior ADR; the spec's Decisions one-liner carries `expands:` the ADR. A glossary note is identified by its slug filename (`glossary/tenant.md`) and cited as `[[tenant]]`:

```yaml
---
id: ADR-0007
title: Co-locate wire protocol and channel
status: accepted
serves: SPEC-0001          # points up to the spec this decision expands
supersedes: ADR-0004       # when it replaces an earlier decision (append-only)
---
```

## Coverage verification

A requirement without a matching test — or a domain term without a glossary note — is a coverage gap. Checking both is the `qa` agent's job — on-demand, not continuous.

`qa` reads requirement IDs from the **canonical story home** (the doc store via `wiki-librarian`, or the work-item store when `storyHome = tasks`), greps the repo for each, and reports:
- Orphan requirements (story with no verifying test)
- Orphan tests (requirement ID not backed by a story)
- Specs missing referenced requirement IDs
- In `tasks` mode, a story-issue marked done with no verifying test — a coverage gap, surfaced without touching the tracker's status (the tracker owns status).
- Undefined terms (a domain term used in a spec, PRD, story, or code identifier with no glossary note) — the vocabulary loop closes at the glossary the way the requirement loop closes at the Story.

Run pre-release, pre-demo, during QA passes. Not every PR.

## Why this shape

1. **One canonical home per doc**: no draft-vs-promoted split to keep in sync. A doc has exactly one home — the store — and one status. No frozen snapshots drifting from a repo copy.
2. **Single-purpose, linked**: each doc does one job (PRD intent, spec design + its decisions + its terms) and reaches the other by link. Splitting concerns only works because the links hold it together — see [Cross-linking](#cross-linking).
3. **Tool-portable**: the repo holds only code, tests, and requirement-ID traces — nothing tool-specific. Swap doc providers tomorrow; committed code is untouched.
4. **Stakeholder-friendly**: teams keep their preferred collaboration surface; docs stay editable there without a promotion gate.

## Terms and ubiquitous language

Domain terms — the project's ubiquitous language — live in **one place**: the glossary. Each term is an atomic note (`glossary/<term>.md`); every other doc *cites* it, never redefines it. The glossary is the spine the rest of the documentation hangs off.

**One owner per term, one home for all terms.** A term lives in exactly one note, which defines the canonical name, a one-sentence domain-precise definition, aliases to avoid, and relationships when useful — between dictionary ("a person who applies") and spec detail (hashed-SSN columns, soft-delete). Every doc that uses the term cites the note (`[[term-slug]]` + link):

| Doc | How it uses a term |
|---|---|
| **Glossary note** | *Defines* it — the single canonical home. |
| **Spec** | Its **Key concepts** section is an *index*: the terms this spec leans on, each cited `[[term-slug]]`. No definitions. |
| **PRD** | Cites `[[term-slug]]` where a product term shapes intent. No definitions. |
| **Story** | Pure consumer — cites `[[term-slug]]` in user-language requirements. Owns none. |

**Why a single spine.** The distributed model (terms defined next to first use, in whichever doc) was tried and drifted: the same entity defined twice, two specs disagreeing on a boundary, code identifiers matching neither. One note per term, cited everywhere, makes drift impossible to introduce silently — a definition change is one edit, propagated by every citation. The cost is that every project carries a glossary; the spine earns it by being the thing that holds the vocabulary together.

**Coverage.** A domain term used in a spec, PRD, story, or code identifier with **no glossary note** is a coverage gap — surfaced the same way an orphan requirement is. The vocabulary loop closes at the glossary: glossary note → cited by docs → used by code and tests → coverage check verifies every used term has a note.

**Strategic / tactical DDD** — bounded contexts, aggregates, domain events, context maps, anti-corruption layers — lives in the Spec's optional Domain Model section. Projects that don't do DDD skip it with no loss; its terms are glossary notes like any other, cited from the Domain Model section.

## Cross-linking

Docs reference related docs **as part of their content** — links are the connective tissue that lets each doc stay single-purpose. There is no fixed link matrix; link whatever the content calls for. In practice:

- A **spec** links to the PRD it implements and the tickets that carry it, and cites glossary terms (`[[term-slug]]`) in its Key concepts index.
- A **PRD** links to the specs that design it, and cites glossary terms in context where it uses them.

This is **mandatory and verified**: a doc skill creates the links and confirms backlinks resolve before reporting done. If a link can't be written automatically, report it as a setup gap with a concrete fix — never hand the edits over as a chore.

### Cite in context

When a doc references another doc — a spec citing the PRD it implements, or any doc using a glossary term — the reference is **a one-clause reason inline + a link to the full record**, placed where it shapes the surrounding text, not gathered into a standalone list. The inline clause carries the tie-breaker (the constraint or requirement that makes the text read sensibly here); the link is for the full detail. This holds for the authoritative records: the PRD (the intent), and the glossary note (the term's definition).

(A spec's own design decisions are *not* cross-references — they live directly in the spec's Decisions section. But its terms *are*: even a term this spec alone uses is defined in a glossary note and cited from Key concepts, never defined inline. Cite-in-context governs links *out* to records another doc owns — and every term is owned by the glossary.)

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
> "…serves the offline-first goal ([MEM-US-2](#))." · "…a [[pipe]] per connection."

## Skills that participate

- `setup-agent-kit/` — creates `.wystack/` workspace and storage setup for a repo
- `prd/` — writes PRDs in the configured doc store; holds a story index (links, not bodies); cites glossary terms (`[[term-slug]]`), never defines; references designing specs; records product-level decisions inline
- `story/` — writes/updates Story artifacts in the configured canonical home; owns the requirement body, acceptance criteria, status, and traceability links; cites glossary terms (`[[term-slug]]`), owns none
- `spec/` — writes the living design doc in the doc store; its Key concepts section is a glossary index (terms cited `[[term-slug]]`, not defined); Decisions section; references the PRD and tickets; carries optional Domain Model section for DDD-committed projects; when `adr` is enabled, offers an ADR for a contested decision and links it `expands:`
- `glossary/` — writes one atomic term-note per domain term (`glossary/<term>.md`); the single canonical home for the project's ubiquitous language, cited everywhere as `[[term-slug]]`
- `adr/` _(when `adr` enabled)_ — writes append-only decision records in the doc store, each `serves:` the spec it expands; owns ADR-to-ADR supersession at decision granularity
- `breakdown/` — slices tickets off stories; tickets reference the story's ACs and add delivery checks; reads linked ADRs for decision context when `adr` is enabled
- `qa` agent — runs coverage verification on demand, reading requirement IDs from the canonical story home
- `wiki-librarian` agent — document-store CRUD; plugin skills delegate here
- `upgrade/` — reconciles a project to the installed kit version by replaying declared migration steps
- `groom/`, `start-task/` — read specs from the configured doc store via `wiki-librarian`
