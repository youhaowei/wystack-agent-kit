---
name: story
description: "Write or update a Story — the canonical artifact for one requirement: its goal, acceptance bar, scenarios, and traceability links. Use when a PRD's story index needs its stories authored or refined, when a requirement's acceptance criteria or scenarios change, or after wystack-agent-kit:prd produces an index of stories to flesh out. Skip architecture and implementation — that's wystack-agent-kit:spec."
---
# Story

The canonical artifact for one requirement: its goal and acceptance bar, in user language. A Story states *what* the system should do and *how we'll know it's done* — never *how to build it*.

**Write the requirement, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, one-line decisions, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. A Story inherits it: open with what the user can do, not "this story describes…".

`$ARGUMENTS` — a story to author or refine (sentence, PRD reference, or requirement ID), or empty (work the configured home's open stories).

**Prerequisite.** Load `wystack-agent-kit:workspace` for the doc store provider and the doc status vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Goal, not how

A Story commits to an *outcome*, not a *method*: acceptance criteria define *done*, scenarios describe *observable behavior*, neither prescribes the mechanism. The how belongs to `wystack-agent-kit:spec` (architecture) and the tickets `wystack-agent-kit:breakdown` slices off (delivery). This is why a Story stays negotiable even once Accepted — it commits to a behavior, so refining the behavior is legitimate.

> Story — "An applicant can save a draft and resume it later; success = they return to exactly where they left off."
> Not a story — "Drafts are stored in a `drafts` table keyed by session token." (that's spec/implementation)

## What a Story owns

- **Story sentence** — one line: "As a [role], I want [goal], so that [value]."
- **Details** — the requirement's substance: what the behavior is, who it serves, what it depends on.
- **Scenarios + edge cases** — concrete examples and a what-if / expected-behavior table (owned here, not in the PRD).
- **Product acceptance** — the user-language done statement ("done = user can X"). It's the requirement bar the delivery tickets trace up to; the *concrete testable ACs* belong to the tickets (`breakdown`), not the Story.
- **Status** — on the shared ladder (see below).
- **Links** — the linked specs (the design that realizes it), the delivery tickets (created by `breakdown`), and the verifying tests (its verification trace).

## The doc store owns the story

A Story is a **PM-owned requirement** that complements the PRD — the PRD indexes it, the Story details it; the ticket that implements it is an **engineer-owned** work item (`breakdown` → `task-manager`). Story and ticket are two artifacts in two stores — see `docs/doc-model.md` § Story for the full split. The **doc store** owns the story's reference, status, and body, the same way it owns every doc type. The kit never mints references — the store's adapter allocates (`ST-42` local, `ENG-128` when the store is tracker-backed). Status moves on the shared doc ladder and **Implemented is derived from verifying tests** — a requirement can't be marked done without a test that proves it.

## Status — the shared ladder

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`), the same ladder every doc type uses (`docs/doc-model.md` § The shared status ladder). Story-specific notes:

- **Accepted** — committed, ready for tasks. *Not frozen* — refine in place as understanding sharpens.
- **Implemented** — built and verified. **Derived** from the verifying tests; don't hand-flip where a trace exists.
- **Superseded** — replaced by a *different* requirement (new story, new ID) via a `supersedes:` link. Correcting the same requirement is an in-place edit, not a supersession.

## Quality bar

The requirement bar: **Valuable, Negotiable, Testable**, with unambiguous **product acceptance** ("done = user can X") and **goal, not how**. A Story is *not sized* — *Estimable* and *Small* are the ticket's axes, not the story's. `wystack-agent-kit:breakdown` decomposes the Story into natural vertical slices (one ticket each; floor INVEST *Valuable*/*Independent*, never a fragment below a shippable slice), and each ticket owns its concrete testable ACs, implementation guidance, and estimate. The coverage loop closes here — the story's requirement ID is what the verifying tests cite. See `docs/doc-model.md` § Story.

## Workflow

1. **Load the doc store.** Resolve its provider via `wystack-agent-kit:workspace` — you're authoring a requirement doc (a tracker-backed store holds it as a requirement-type issue: same artifact, different provider).
2. **Research.** Read the parent PRD (intent, the index entry this fleshes out) and any linked spec. A Story **cites, never owns**: cite canonical terms as `[[term-slug]]` (never define one — that's the glossary note's job; a term with no note yet gets one via `wystack-agent-kit:glossary` first), and hold no *how*-decision (the `goal-not-how` wall keeps contested decisions in the linked spec, never the Story). See `docs/doc-model.md` § Terms.
3. **Author the requirement.** Story sentence, details, scenarios + edge cases, product acceptance. Goal-not-how throughout. Set status (typically Proposed on first author, Accepted once committed).
4. **Save in the doc store.** Delegate to `wystack-agent-kit:wiki-librarian` — never call provider APIs directly. The store allocates the stable reference; record it.
5. **Cross-link (mandatory, verified)** — per `docs/doc-model.md` § Cross-linking (verify backlinks resolve, report gaps as fixes). Link the Story to: the parent PRD's index (the index entry resolves to this story), the spec(s) that design it, and — as they appear — its delivery tasks and verifying tests. Update the PRD's story index so its link to this story resolves.

## Reference

- `docs/doc-model.md` § Story, § The shared status ladder, § Terms, § Cross-linking.
- `wystack-agent-kit:prd` — owns intent + the story index that links here.
- `wystack-agent-kit:breakdown` — plans implementation off this story; each ticket references its requirement ID and owns its concrete ACs.
- `wystack-agent-kit:wiki-librarian` — the doc store adapter; never call provider APIs directly.
