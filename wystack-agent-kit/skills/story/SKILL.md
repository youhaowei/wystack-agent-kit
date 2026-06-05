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

A Story commits to an *outcome*, not a *method*. The acceptance criteria define *done*; the scenarios describe *observable behavior*; neither prescribes the mechanism. Over-prescribing the how inside a requirement smuggles implementation into the wrong artifact and forecloses the implementer's judgment — that belongs to `wystack-agent-kit:spec` (architecture) and the tickets `wystack-agent-kit:breakdown` slices off the story (delivery). This is why a Story stays negotiable even once Accepted: it commits to a behavior, so refining the behavior is legitimate.

> Story — "An applicant can save a draft and resume it later; success = they return to exactly where they left off."
> Not a story — "Drafts are stored in a `drafts` table keyed by session token." (that's spec/implementation)

## What a Story owns

- **Story sentence** — one line: "As a [role], I want [goal], so that [value]."
- **Details** — the requirement's substance: what the behavior is, who it serves, what it depends on.
- **Scenarios + edge cases** — concrete examples and a what-if / expected-behavior table. (These moved out of the PRD; the Story owns them now.)
- **Acceptance criteria** — the canonical acceptance bar for this requirement. Tickets *reference* these; they don't restate or own them.
- **Status** — on the shared ladder (see below).
- **Links** — the linked specs (the design that realizes it), the delivery tasks (created by `breakdown`), and the verifying tests (its verification trace).

## The canonical home owns ID and status

`requirements.storyHome` selects where a Story lives — and the home owns its ID and status. The kit never mints IDs.

- **`docs` (default)** — the Story is a doc in the doc store. Its stable ID (e.g. `ST-42`, allocated by the adapter) is the requirement ID. The kit owns its status on the shared ladder and **derives Implemented from verifying tests**.
- **`tasks`** — the Story is a work-item in the tracker: a distinct issue type or label, with delivery tasks as its sub-issues. The issue's stable ID (e.g. `ENG-128`) is the requirement ID. **The tracker owns status** — the issue's state *is* the story status, mapped onto the ladder for display. The kit reads it and never overrides.

One story, one canonical home, one status authority. No mixed mode.

## Status — the shared ladder

`Draft → Proposed → Accepted → Implemented → Superseded` (+ `Archived`), the same ladder every doc type uses (`docs/doc-model.md` § The shared status ladder).

- **Proposed** — the requirement exists, not yet committed.
- **Accepted** — committed and agreed, ready for tasks. *Not frozen* — refine it in place as understanding sharpens.
- **Implemented** — built and verified. In `docs` mode this is **derived** from the verifying tests in the trace; don't hand-flip it where a trace exists. In `tasks` mode the tracker's done-state maps here.
- **Superseded** — replaced by a *different* requirement (new story, new ID), recorded with a `supersedes:` link. Reserve this for genuine replacement; correcting the same requirement is an in-place edit, not a supersession.

## Quality bar

A Story is **Valuable · Negotiable · Testable**, with **unambiguous acceptance criteria**, and states the **goal, not the how**. (INVEST's *Estimable* and *Small* are delivery properties — they live on the tickets `breakdown` slices off the story, not on the requirement.)

- **Valuable** — visible user value, not a technical task.
- **Negotiable** — open to refinement even when Accepted; edit in place, supersede only to replace.
- **Testable** — a verifying test can be named immediately; tests verify the story.
- **Unambiguous ACs** — the acceptance bar is concrete enough that "done" isn't a judgment call.
- **Goal, not how** — no implementation, schema, or architecture inside the requirement.

## Workflow

1. **Resolve the home.** Read `requirements.storyHome` and the relevant provider. Know whether you're writing a doc or a work-item before authoring.
2. **Research.** Read the parent PRD (intent, the story index entry this fleshes out) and any linked spec. Use canonical term names — cite spec-owned terms in context (one-clause use + link), define pure product terms inline. See `docs/doc-model.md` § Terms.
3. **Author the requirement.** Story sentence, details, scenarios + edge cases, acceptance criteria. Goal-not-how throughout. Set status (typically Proposed on first author, Accepted once committed).
4. **Save in the canonical home.** Delegate to `wystack-agent-kit:wiki-librarian` (docs mode) or `wystack-agent-kit:task-manager` (tasks mode) — never call provider APIs directly. The home allocates the stable ID; record it.
5. **Cross-link (mandatory, verified).** Link the Story to: the parent PRD's index (the index entry resolves to this story), the spec(s) that design it, and — as they appear — its delivery tasks and verifying tests. Update the PRD's story index so its link to this story resolves. Verify backlinks resolve before reporting done; if a link can't be written automatically, report a setup gap with a concrete fix.

## Reference

- `docs/doc-model.md` § Story, § The shared status ladder, § Terms, § Cross-linking.
- `wystack-agent-kit:prd` — owns intent + the story index that links here.
- `wystack-agent-kit:breakdown` — slices delivery tickets off this story; tickets reference its ACs.
- `wystack-agent-kit:wiki-librarian` / `wystack-agent-kit:task-manager` — provider adapters; never call provider APIs directly.
