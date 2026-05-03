---
name: improve-codebase
description: Find deepening opportunities in a codebase — turn shallow modules into deep ones using Ousterhout's lens, Fowler's catalog of moves, and WyStack project constraints. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.
---

<what-to-do>

Walk the codebase. Find shallow modules and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The goal is testability, locality, and AI-navigability.

1. Read the project glossary (`engineering:glossary` output) and ADRs in any spec touched. Use that vocabulary when naming candidates.
2. Use `Agent` with `subagent_type=Explore` to walk the codebase. Note where modules feel shallow, where understanding requires bouncing across many files, where pure functions exist only for testability but bugs hide in their callers.
3. Apply the **deletion test** to suspects. Present a numbered list of candidates with file paths, the friction, the proposed shape, and benefits framed as **leverage** + **locality**.
4. Do not propose interfaces yet. Ask which candidate to explore.
5. Once chosen, drop into a grilling loop on the design — constraints, dependencies, the deepened interface, what survives in tests. Update glossary or open an ADR inline as decisions crystallize.
6. **Structural refactors get dedicated tickets** — never bundled into feature work. When the user picks a candidate to pursue, propose the ticket via `engineering:new` rather than starting work.

Use the vocabulary in [LANGUAGE.md](LANGUAGE.md) **exactly** — module, interface, depth, seam, adapter, leverage, locality. Do not drift into "component", "service", "boundary."

</what-to-do>

<supporting-info>

## Reference files

- [LANGUAGE.md](LANGUAGE.md) — full vocabulary, principles, and rejected framings. Read once; refer to terms by name afterward.
- [DEEPENING.md](DEEPENING.md) — how to deepen given the dependency category (in-process, local-substitutable, remote-but-owned, true-external).
- [CATALOG.md](CATALOG.md) — Fowler's named refactorings as a cheat sheet. Use when the user asks "how do I actually move from here to there."
- [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) — "Design It Twice" — spawn parallel sub-agents to produce radically different interfaces for a chosen candidate. Use when the user wants to explore alternatives before committing.

## WyStack constraints

These are the constraints on any deepening proposal in a WyStack-flavored codebase. They override generic advice when they conflict.

- **Compose from primitives.** New seams in feature code must use `@wystack/ui` (stdui) primitives where applicable. Never raw `<button>` / `<input>` in features.
- **Don't reinvent shared infrastructure.** Prefer existing WyStack primitives (`@wystack/server`, `@wystack/client`, `@wystack/runtime`, `@wystack/log`, etc. — see the WyStack repo for the canonical list). If a primitive is wrong for the job, fix it upstream or diverge with an explicit rationale — don't fork silently.
- **Token-driven design.** Semantic tokens, OKLCH. No raw hex. Theming is structural.
- **Fail loudly at boundaries.** `Result<T, E>` or tagged errors. `null` for absence, never for failure. Never swallow.
- **One file, one job.** Concepts co-located. Read one file, understand it. Agent-navigable.
- **Doc model.** Promoted specs and glossaries live in the repo. PRDs and tasks live in Notion. See `engineering/CLAUDE.md` and `engineering/docs/doc-model.md`.

## Cross-references

- Glossary terms come from `engineering:glossary`. If a deepened module needs a name not in the glossary, add it inline — same discipline as `engineering:groom`.
- ADRs live in promoted specs (`engineering:spec`). Surface ADR conflicts only when friction is real enough to warrant reopening. Mark explicitly: _"contradicts ADR-X — reopen because…"_.
- Structural change → ticket, not branch work. Use `engineering:new` to file. The grooming step decides scope.

## What this skill is NOT

- Not a kitchen-sink architecture audit (`engineering:full-review` covers cross-cutting concerns).
- Not cross-project alignment (`arch-audit`-style WyStack extraction questions live elsewhere).
- Not a feature change. If the proposal mixes feature work with structure, split.

</supporting-info>
