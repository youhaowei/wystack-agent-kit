---
name: story
description: "Write or update a Story — the canonical artifact for one requirement: its goal, acceptance bar, scenarios, and traceability links. Use when a PRD's story index needs its stories authored or refined, when a requirement's acceptance criteria or scenarios change, or after wystack-agent-kit:prd produces an index of stories to flesh out. Skip architecture and implementation — that's wystack-agent-kit:spec."
---
# Story

The canonical artifact for one requirement: its goal and acceptance bar, in user language. A Story states *what* the system should do and *how we'll know it's done* — never *how to build it*.

**Write the requirement, not the document** — the shared doc discipline (architecture-not-meta, first-line-is-the-thing, one-line decisions, earn-the-page) lives in `docs/doc-model.md` § Write the artifact, not the document. A Story inherits it: open with what the user can do, not "this story describes…".

`$ARGUMENTS` — a story to author or refine (sentence, PRD reference, or requirement ID), or empty (work the configured home's open stories).

**Prerequisite.** Load `wystack-agent-kit:workspace` for the configured `requirements.storyHome`, doc/work-item providers, and status vocabulary. If the workspace isn't set up, run `wystack-agent-kit:setup-agent-kit`.

## Goal, not how

A Story commits to an *outcome*, not a *method*: acceptance criteria define *done*, scenarios describe *observable behavior*, neither prescribes the mechanism. The how belongs to `wystack-agent-kit:spec` (architecture) and the tickets `wystack-agent-kit:breakdown` slices off (delivery). This is why a Story stays negotiable even once Accepted — it commits to a behavior, so refining the behavior is legitimate.

> Story — "An applicant can save a draft and resume it later; success = they return to exactly where they left off."
> Not a story — "Drafts are stored in a `drafts` table keyed by session token." (that's spec/implementation)

## What a Story owns

- **Story sentence** — one line: "As a [role], I want [goal], so that [value]."
- **Details** — the requirement's substance: what the behavior is, who it serves, what it depends on.
- **Scenarios + edge cases** — concrete examples and a what-if / expected-behavior table (owned here, not in the PRD).
- **Acceptance criteria** — the canonical acceptance bar for this requirement. Tickets *reference* these; they don't restate or own them.
- **Status** — on the shared ladder (see below).
- **Links** — the linked specs (the design that realizes it), the delivery tasks (created by `breakdown`), and the verifying tests (its verification trace).

## The canonical home owns ID and status

`requirements.storyHome` selects where a Story lives — and the home owns its ID and status. The kit never mints IDs. One story, one canonical home, one status authority; no mixed mode.

- **`docs` (default)** — a doc in the doc store. Its stable ID (e.g. `ST-42`, allocated by the adapter) is the requirement ID. The kit owns status on the shared ladder and **derives Implemented from verifying tests**.
- **`tasks`** — a work-item in the tracker (distinct issue type or label, delivery tasks as sub-issues). The issue's stable ID (e.g. `ENG-128`) is the requirement ID. **The tracker owns status** — the issue's state *is* the story status, mapped onto the ladder for display; the kit reads, never overrides.

## Status — the shared ladder

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`), the same ladder every doc type uses (`docs/doc-model.md` § The shared status ladder). Story-specific notes:

- **Accepted** — committed, ready for tasks. *Not frozen* — refine in place as understanding sharpens.
- **Implemented** — built and verified. In `docs` mode this is **derived** from the verifying tests; don't hand-flip where a trace exists. In `tasks` mode the tracker's done-state maps here.
- **Superseded** — replaced by a *different* requirement (new story, new ID) via a `supersedes:` link. Correcting the same requirement is an in-place edit, not a supersession.

## Quality bar

The full **INVEST** bar — *Independent, Negotiable, Valuable, Estimable, Small, Testable* — plus **unambiguous ACs** ("done" isn't a judgment call) and **goal, not how**. Story and task are one unit at two granularities: both carry their own ACs, both size on `wystack-agent-kit:estimation`'s scale. *Small* is that estimate — a story below the split threshold (seed XXL/21) *is* its own ticket, completed directly; a story at or over it goes to `wystack-agent-kit:breakdown`, which SPIDR-splits it into tasks. The story owns the requirement ID and requirement-level ACs (the coverage loop closes here); a task owns its slice-level ACs and references the parent for the ID.

## Workflow

1. **Resolve the home.** Read `requirements.storyHome` and the relevant provider. Know whether you're writing a doc or a work-item before authoring.
2. **Research.** Read the parent PRD (intent, the index entry this fleshes out) and any linked spec. A Story **cites, never owns**: cite canonical terms as `[[term-slug]]` (never define one — that's the glossary note's job; a term with no note yet gets one via `wystack-agent-kit:glossary` first), and hold no *how*-decision (the `goal-not-how` wall keeps contested decisions in the linked spec, never the Story). See `docs/doc-model.md` § Terms.
3. **Author the requirement.** Story sentence, details, scenarios + edge cases, acceptance criteria. Goal-not-how throughout. Set status (typically Proposed on first author, Accepted once committed).
4. **Save in the canonical home.** Delegate to `wystack-agent-kit:wiki-librarian` (docs mode) or `wystack-agent-kit:task-manager` (tasks mode) — never call provider APIs directly. The home allocates the stable ID; record it.
5. **Cross-link (mandatory, verified)** — per `docs/doc-model.md` § Cross-linking (verify backlinks resolve, report gaps as fixes). Link the Story to: the parent PRD's index (the index entry resolves to this story), the spec(s) that design it, and — as they appear — its delivery tasks and verifying tests. Update the PRD's story index so its link to this story resolves.

## Reference

- `docs/doc-model.md` § Story, § The shared status ladder, § Terms, § Cross-linking.
- `wystack-agent-kit:prd` — owns intent + the story index that links here.
- `wystack-agent-kit:breakdown` — slices delivery tickets off this story; tickets reference its ACs.
- `wystack-agent-kit:wiki-librarian` / `wystack-agent-kit:task-manager` — provider adapters; never call provider APIs directly.
