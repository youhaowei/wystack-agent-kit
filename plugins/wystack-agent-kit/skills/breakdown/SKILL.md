---
name: breakdown
description: "Turn a requirement (Story) into an implementation plan — vertical-slice tickets ready to build. Use when a feature is defined (PRD/spec/story) but not yet split into implementation-ready work items, or when the user asks to break down a PRD, spec, story, or design into tasks."
---
# Breakdown

Take the requirement and devise the plan to build it: read the Story, the spec, and the code, then emit the vertical-slice tickets that deliver it. A **planning** skill — it owns the *plan*, not the requirement.

`$ARGUMENTS` — story / PRD / spec path, or empty (search configured docs for recent requirements).

Prerequisite: `wystack-agent-kit:workspace` for the configured task/doc providers.

The story-vs-ticket ownership model — who owns the requirement, who owns the concrete ACs and the *how* — is `docs/doc-model.md` § Story. This skill *applies* that model; it doesn't restate it.

## Workflow

1. **Load the requirement + context.** The Story (goal, product acceptance, scenarios) from the doc store, the spec (decisions + architecture) it links, and — when `adr` is enabled and a decision links out (`expands:`) — the ADRs behind contested constraints. Explore the codebase for where slice boundaries fall: affected modules, integration points, patterns, test infra.

2. **Devise the plan — natural vertical slices.** Decompose the Story into the smallest *complete* pieces that each ship value: every slice cuts all layers (_form → API → DB → response_), a user outcome (_"user can see workflow progress"_) not a component (_"build the progress service"_) — independently implementable, testable end-to-end, thinnest path first, dependencies explicit. INVEST is the brake, not a push to split: *Valuable* + *Independent* keep every slice worth shipping; a slice that isn't independently valuable is a horizontal fragment — merge it back. Group slices into phases that each ship.

   If the requirement won't cohere into one plan, it's likely *several requirements* — surface that back to `wystack-agent-kit:story` / `wystack-agent-kit:prd`; don't mint stories here.

3. **Emit tickets.** One per slice, delegated to `wystack-agent-kit:task-manager`; require the actual URLs/IDs back. Each ticket carries:
   - what the slice does + its **concrete testable ACs** (this ticket's done — the Story owns the requirement bar, referenced by requirement ID, never restated)
   - **implementation guidance** — the slice's approach, drawn from the spec's architecture; guidance for the implementer, not a binding contract
   - **estimate** (`wystack-agent-kit:estimation`) — the oversight level, not a split gate. A slice still estimating XXL wasn't atomic: split it further on a SPIDR axis (spike, paths, interfaces, data, rules).
   - verification approach, dependencies, and a `Source documents` section linking the Story (by requirement ID), PRD, and spec

4. **Back-link into sources (mandatory).** Via `wiki-librarian`, add/update an `Implementation tickets` section on the Story (grouped by ticket — the coverage loop closes at the Story), the PRD (by requirement/story), and the spec (by phase / area / decision). When the doc store and task store share a tracker, the native parent/child link *is* the Story back-link. Only one source doc exists → update it, note the missing counterpart. **Verify by fetching** the pages (or confirming sub-issue creation) — not from write receipts. Can't write automatically → report a **setup gap**: what blocked it and the fix that automates it next time; don't hand the user a chore.

## Reference

- `docs/doc-model.md` § Story — the story/ticket ownership model this skill applies.
- `wystack-agent-kit:estimation` — the per-ticket size + oversight scale.
- `wystack-agent-kit:task-manager` / `wystack-agent-kit:wiki-librarian` — provider adapters; never call provider APIs directly unless the adapter says so.
