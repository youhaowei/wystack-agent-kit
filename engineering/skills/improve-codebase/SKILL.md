---
name: improve-codebase
description: Find deepening opportunities in a codebase — turn shallow modules into deep ones using Ousterhout's lens, Fowler's catalog of moves, and WyStack project constraints. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.
---
# Improve Codebase

Walk the codebase. Find shallow modules and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The goal is testability, locality, and AI-navigability.

## Workflow

1. Read the project glossary (`engineering:glossary` output) and ADRs in any spec touched. Use that vocabulary when naming candidates.
2. Use `Agent` with `subagent_type=Explore` to walk the codebase. Note where modules feel shallow, where understanding requires bouncing across many files, where pure functions exist only for testability but bugs hide in their callers.
3. Apply the **deletion test** to suspects. Deliver via `engineering:present` a numbered list of candidates — ordered by leverage, highest first as the recommended pick — with file paths, the friction, the proposed shape, and benefits framed as **leverage** + **locality**.
4. Do not propose interfaces yet. Ask which candidate to explore.
5. Once chosen, drop into a grilling loop on the design — constraints, dependencies, the deepened interface, what survives in tests. Update glossary or open an ADR inline as decisions crystallize.
6. **Structural refactors get dedicated tickets** — never bundled into feature work. When the user picks a candidate to pursue, propose the ticket via `engineering:new-task` rather than starting work.

Use the vocabulary in [LANGUAGE.md](LANGUAGE.md) **exactly** — module, interface, depth, seam, adapter, leverage, locality. Do not drift into "component", "service", "boundary."

## Reference files

- [LANGUAGE.md](LANGUAGE.md) — full vocabulary, principles, and rejected framings. Read once; refer to terms by name afterward.
- [DEEPENING.md](DEEPENING.md) — how to deepen given the dependency category (in-process, local-substitutable, remote-but-owned, true-external).
- [CATALOG.md](CATALOG.md) — Fowler's named refactorings as a cheat sheet. Use when the user asks "how do I actually move from here to there."
- [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) — "Design It Twice" — spawn parallel sub-agents to produce radically different interfaces for a chosen candidate. Use when the user wants to explore alternatives before committing.

## Project constraints

Before proposing, read the project's architectural constraints — its `CLAUDE.md`, `CONTEXT.md`, glossary, ADRs, and workspace docs. They override generic deepening advice when they conflict: a proposal that's "deeper" by Ousterhout but violates a project rule is not an improvement.

Constraint categories to look for: required UI/server primitives to compose from (don't reinvent shared infrastructure — fix it upstream or diverge with explicit rationale, never fork silently), error-handling discipline at boundaries, design-token rules, one-file-one-job locality, and where docs/specs live. The project states its own values for each; this skill enforces whatever it finds.

## Cross-references

- Glossary terms come from `engineering:glossary`. If a deepened module needs a name not in the glossary, add it inline.
- ADRs live in promoted specs (`engineering:spec`). Surface ADR conflicts only when friction is real enough to warrant reopening. Mark explicitly: _"contradicts ADR-X — reopen because…"_.

## What this skill is NOT

- Not a kitchen-sink architecture audit (`engineering:full-review` covers cross-cutting concerns).
- Not cross-project alignment — that's the `engineering:principal` agent's remit.
- Not a feature change. If the proposal mixes feature work with structure, split.
