---
name: story
description: "Write or update a Story — the canonical artifact for one requirement: its goal, acceptance bar, scenarios, and traceability links. Use when a PRD's story index needs its stories authored or refined, when a requirement's acceptance criteria or scenarios change, or after wystack-agent-kit:prd produces an index of stories to flesh out. Skip architecture and implementation — that's wystack-agent-kit:spec."
---
# Story

The canonical artifact for one requirement: its goal and acceptance bar, in user language. A Story commits to an *outcome*, never a *method* — acceptance criteria define *done*, scenarios describe *observable behavior*, neither prescribes the mechanism. The how belongs to `wystack-agent-kit:spec` (architecture) and the tickets `wystack-agent-kit:breakdown` slices off (delivery). The full story/ticket ownership split lives in `docs/doc-model.md` § Story.

> Story — "An applicant can save a draft and resume it later; success = they return to exactly where they left off."
> Not a story — "Drafts are stored in a `drafts` table keyed by session token." (spec/implementation)

`$ARGUMENTS` — a story to author or refine (sentence, PRD reference, or requirement ID), or empty (work the configured home's open stories).

**Prerequisites.** Load `wystack-agent-kit:workspace` — doc store provider and doc-status vocabulary. Not set up → `wystack-agent-kit:setup-agent-kit`. Open with what the user can do, not "this story describes…" (`docs/doc-model.md` § Write the artifact, not the document).

## What a Story owns

- **Story sentence** — one line: "As a [role], I want [goal], so that [value]."
- **Details** — the requirement's substance: what the behavior is, who it serves, what it depends on.
- **Scenarios + edge cases** — concrete examples and a what-if / expected-behavior table (owned here, not in the PRD).
- **Product acceptance** — the user-language done statement ("done = user can X") the delivery tickets trace up to; *concrete testable ACs* belong to the tickets, not the Story.
- **Status** — on the shared doc ladder (`docs/doc-model.md` § The shared status ladder). Story-specific: **Accepted** is committed but not frozen — refine in place; **Implemented** is *derived* from the verifying tests, never hand-flipped where a trace exists; **Superseded** means a *different* requirement replaced it (new story, new ID, `supersedes:` link) — correcting the same requirement is an in-place edit.
- **Links** — the spec(s) that design it, the delivery tickets, and the verifying tests (its verification trace — the story's requirement ID is what they cite).

## Workflow

1. **Load the doc store** — resolve the provider via the workspace; a tracker-backed store holds the story as a requirement-type issue: same artifact, different provider.
2. **Research** — read the parent PRD (intent, the index entry this fleshes out) and any linked spec. A Story **cites, never owns**: terms as glossary citations in the doc store's link form (a term with no note gets one via `wystack-agent-kit:glossary` first), and no *how*-decision — goal-not-how keeps contested decisions in the linked spec.
3. **Author** — story sentence, details, scenarios + edge cases, product acceptance, meeting the Quality bar (`docs/doc-model.md` § Story): Valuable, Negotiable, Testable, unambiguous product acceptance, goal-not-how. Not sized — *Estimable* and *Small* are the ticket's axes. Set status (Proposed on first author, Accepted once committed).
4. **Save** — delegate to `wystack-agent-kit:wiki-librarian`; never call provider APIs directly. The store's adapter allocates the stable reference (`ST-42` local, `ENG-128` tracker-backed) — the kit never mints it; record it.
5. **Cross-link (mandatory, verified)** — per `docs/doc-model.md` § Cross-linking: the parent PRD's index entry, the spec(s) that design it, and — as they appear — delivery tasks and verifying tests. Verify backlinks resolve; report gaps as fixes.
