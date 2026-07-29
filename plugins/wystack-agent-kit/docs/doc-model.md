# Doc Model

One rule generates this model: **every piece of knowledge has exactly one owning artifact — everything else cites it, never restates it.** Below: the artifacts and what each owns, how status moves, the two hardest ownership boundaries (Story vs ticket, terms), how citing works, and how coverage verifies the loops closed.

## The artifacts

The doc store is canonical — no promote-to-repo step; location and provider are `docs/storage-contract.md`'s contract, resolve it, never assume. The repo owns only code, tests, and requirement-ID traces — no other tool identity (wiki URLs, page IDs, provider names) in committed code.

| Doc | Home | Owns |
|---|---|---|
| **PRD** | Doc store | Intent: purpose, users, goals/non-goals, dependencies, inline product decisions, **story index** — links, never story bodies. |
| **Spec** | Doc store | Living design doc: current architecture, inline Decisions, **Key concepts** as a glossary index. Edited freely. |
| **Story** | Doc store (provider may be tracker-backed) | One requirement — see [Story](#story). |
| **Glossary** | Doc store, one note per term | The term's definition — see [Terms](#terms-and-ubiquitous-language). |
| **ADR** _(optional)_ | Doc store | A contested decision's full deliberation, dated, append-only. |
| **Tasks, initiatives** | Work-item store | Ops layer. A **ticket** — the slice `breakdown` cuts from a Story — owns concrete testable ACs, implementation guidance, estimate; references the story's requirement ID. |
| **Requirement IDs** | The story's stable reference, cited in repo test JSDoc | Allocated by the store's adapter (`ST-42` local, `ENG-128` tracker), never minted by the kit. Format per `conventions.requirementIdFormat`. |

### Doc-type registry

Core types — PRD, Spec, Story, Glossary — are always on; skills hard-depend on them. Optional types opt in via `docs.types` (see `storage-contract.md`); a skill adapts only when the type is enabled. New optional types register by descriptor + ID.

| Type | ID | Owns | Cited / expanded by |
|---|---|---|---|
| **ADR** | `adr` | A contested decision's full deliberation, append-only, dated. | Spec one-liner links down (`expands:`); the ADR points up (`serves:`). |

## Lifecycle

### The shared status ladder

One ladder (`docs.statuses`), every doc type:

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`)

- **Draft** — being written. **Proposed** — complete, not committed.
- **Accepted** — committed, not necessarily built. Not frozen: edited in place; supersession is for replacement, not refinement.
- **Implemented** — built and verified. Derived from verifying tests where a trace exists (Stories especially); by hand otherwise.
- **Superseded** — replaced. **Archived** — retired.

Not every type travels every rung — a glossary note rests at *Accepted*.

### Supersession

Whole doc: the successor carries `supersedes:`, the old doc flips to `superseded`, its body is never edited, never deleted. Design decisions are instead edited in place in the spec's Decisions section — except when `adr` is enabled, where a decision supersedes at decision granularity with the same mechanics. Spec → ADR is `expands:`, ADR → spec is `serves:`; the spec alone must explain the system. A Story never expands into an ADR — `goal-not-how` keeps contested decisions in the spec.

## Story

One requirement — goal, value, and product acceptance in user language. The *what*, never the *how*; the spec (architecture) and tickets (delivery) own the how.

| | Story | Ticket |
|---|---|---|
| Owner | PM | Engineer |
| Store | doc store (as the requirement doc) | task store |
| Owns | goal, value, scenarios, product acceptance ("done = user can X"), requirement ID, requirement status | concrete testable ACs, implementation guidance, delivery, work-item status |
| Sizing | not estimated — decomposed into natural slices | estimated (complexity) |
| References | — | the story's requirement ID |

- **The doc store owns the story** — reference, status, body. *Implemented* is derived from verifying tests: no done without proof. A tracker-backed provider shapes only the reference form, not ownership.
- **The PRD links, never mirrors.** Status is read through the link; surface it inline only when the link would mislead (a *Superseded* story).
- **Quality bar:** Valuable, Negotiable, Testable, unambiguous product acceptance, goal-not-how. Not sized — *Estimable* and *Small* are the ticket's axes. `breakdown` cuts natural vertical slices, one ticket each; the floor is INVEST *Valuable*/*Independent* — never fragment below an independently shippable slice. The coverage loop closes at the Story: its requirement ID is what verifying tests cite.
- **Ready bar:** a ticket is **Ready** — eligible to pick and execute — with an estimate, concrete testable ACs, a scope definition, and no incomplete blocker. `breakdown` emits tickets born Ready; `groom` makes any other ticket Ready; `next-task`/`reprioritize` map the status vocabulary onto it. A plan is *not* part of the bar — `start-task` requires one before execution and routes planless tickets through `groom`.

## Terms and ubiquitous language

Every domain term lives in exactly one glossary note: canonical name, one-sentence domain-precise definition, aliases to avoid, relationships when useful. Everything else **cites** the term — a link to its note, in the doc store's native link form. Citation form follows storage, because a citation the store can't resolve is dead text:

- **Local markdown** — a relative link with the term as text: `[proof obligation](../glossary/proof-obligation.md)`. Plain `[[slug]]` renders as literal brackets on GitHub and most viewers — never use it here.
- **Stores with native wiki links or mentions** (Obsidian vault, Notion, kb) — the store's own form (`[[term-slug]]`, a page mention). The adapter doc records which.

Tooling that verifies term coverage must accept whichever form the configured doc store uses — the invariant is "resolves to the term's one note", not a surface syntax.

| Doc | Term use |
|---|---|
| **Glossary note** | *Defines* — the single canonical home. |
| **Spec** | **Key concepts** = an index of the terms it leans on, cited. No definitions. |
| **PRD** | Cites where a term shapes intent. No definitions. |
| **Story** | Pure consumer. Owns none. |

A term used anywhere with no note is a coverage gap. DDD structure (bounded contexts, aggregates, …) lives in the Spec's optional Domain Model section; its terms are glossary notes like any other.

## Cross-linking

Links are content, not appendix — a spec links its PRD and tickets; a PRD links its specs. **Mandatory and verified**: the doc skill creates the links and confirms backlinks resolve before reporting done. An unwritable link is a setup gap to report with a concrete fix, never a manual chore.

### Cite in context

A reference to a record another doc owns = **one-clause reason inline + link to the full record**, placed where it shapes the text — never a standalone list. (A spec's own decisions aren't cross-references; its terms always are.) Two symmetric failures:

- **Bare link** — "see the PRD" forces a click to learn anything.
- **Restated record** — more than the tie-breaker duplicates the record.

> **Bad:** "Implements: MEM-US-1, MEM-US-2, MEM-US-3."
> **Bad:** "This serves the goal that memories persist across sessions so a user returning after a week sees… (MEM-US-2)"
> **Good:** "…serves the offline-first goal ([MEM-US-2](#))." · "…a [pipe](../glossary/pipe.md) per connection."

## Coverage verification

Requirements reach the repo through E2E test documentation — the cited ID is the story's requirement ID, and the story's verification trace records which tests prove it:

```ts
/**
 * BLOSSOM-US-1.2: Draft application save
 *
 * User story: Applicant starts form, leaves, returns later — draft persists.
 * Success: Applicant resumes where they left off.
 *
 * @prd Blossom Application        (reference, not a link)
 */
test("applicant can save draft and resume", async () => { /* ... */ });
```

A requirement without a verifying test, or a domain term without a glossary note, is a coverage gap. The `qa` agent checks on demand (pre-release, pre-demo, QA passes — not every PR): read requirement IDs from the stories, grep the repo, report orphan requirements, orphan tests, specs missing referenced IDs, and undefined terms.

## Write the artifact, not the document

A doc conveys the thing it documents — never itself. Every doc skill inherits these rules.

- **Architecture, not meta.** No sentences about the doc, its conventions, its provenance, or where other docs live. Navigation out is a bare cross-link at most.
- **First line is the thing.** "A concurrency pool that…", never "This document describes…".
- **Decisions default to one-liners.** `**X:** chose A over B because C`. The full _what / alternatives / why_ block only for a load-bearing, genuinely contested choice.
- **Earn the page.** If deleting the doc loses nothing not already in code or another doc, don't write it — fold it into the doc that owns the content.
