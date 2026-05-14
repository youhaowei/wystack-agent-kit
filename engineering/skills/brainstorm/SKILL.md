---
name: brainstorm
description: "Gate skill for non-trivial changes. Interview the user to refine requirements, explore approaches, and validate design before implementation. Auto-picks the right framework lens (idea-validation, plan-ambition review, or domain-driven discipline) based on what's in context. Works for features, architecture, process, tooling — anything that benefits from thinking before doing. Skip only for bug fixes, clear-scope refactors, or trivial changes."
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Brainstorm

Collaborative interview to refine requirements and produce a design before implementation.

`/brainstorm [--light | --grill]`

By default, be assertive — challenge assumptions, probe for gaps, don't accept the first answer. The goal is shared understanding, not politeness.

- **`--light`** — lighter touch for small scope or when the user already has a clear vision. Fewer questions, faster to design.
- **default** — actively challenge assumptions, question trade-offs, push on unclear scope. Ask until you're confident the design is solid.
- **`--grill`** — relentlessly question every assumption, walk down every branch of the design tree, resolve dependencies between decisions one by one. Don't stop until there's nothing left to clarify. Inspired by Brooks' *The Design of Design*.

## Lens detection (run first)

Before interviewing, look at what's in context and pick the right framework lens from [FRAMEWORKS.md](./FRAMEWORKS.md). The lens determines *which questions* to ask, not whether to ask. Lenses compose — apply all that fit.

| Signal in context | Lens | Why |
|---|---|---|
| No PRD/spec/design — just an idea or "what if we built X" | **Idea-validation** (FRAMEWORKS.md §1) | Pressure-test demand reality, status quo, narrowest wedge before formalizing |
| Existing PRD, spec, plan file, or design doc | **Plan-ambition** (FRAMEWORKS.md §2) | Push on scope/ambition: is this the 10-star version, or just acceptable? |
| Codebase has CONTEXT.md, glossary, or ADRs | **Domain-driven** (FRAMEWORKS.md §3) | Sharpen language against existing model, surface contradictions, update docs inline |
| Side project / hackathon / "just for fun" | **Builder mode** (FRAMEWORKS.md §4) | Generative not interrogative — surface the most exciting version |

Most sessions blend lenses: a new feature on an existing codebase needs idea-validation + domain-driven; a plan review needs plan-ambition + domain-driven; etc. Don't announce the lens to the user — just internalize the framework and let it shape the questions.

## Flow

1. **Explore context** — check files, docs, commits, existing Notion tasks. Know what exists before asking. Look for `CONTEXT.md`, `docs/adr/`, `DESIGN.md`, `PRODUCT.md`, project glossary.
2. **Detect lens** — see table above. Pick what's in context.
3. **Detect mode** — implement vs document-only? Ask if unclear.
4. **Scope check** — if too large for one spec, decompose into sub-projects first.
5. **Interview** — ask clarifying questions in the `collaborate` shape: each question has a recommended answer, rationale in one line, user overrides what they disagree with. Use the lens's question set from FRAMEWORKS.md. **Follow collaborate's tier rules: architecture/spec/PRD interview questions are load-bearing by default — use sequential mode (one question per turn).** Only batch when the questions are genuinely grooming-tier (trivial defaults, minor scope). When in doubt, sequential.
6. **Parallel research** — launch Explore/research agents while interviewing. Use perspective agents (competing framings) for key architectural decisions where trade-offs are non-obvious.
7. **Propose 2-3 approaches** — synthesize findings, present via `collaborate` (each approach = per-item block with recommendation). Lead with the strongest, push back on smells. For plan-ambition lens: include the "minimal viable" and "ideal architecture" approaches at equal weight (FRAMEWORKS.md §2).
8. **Present design** — scale detail to complexity. Use `collaborate` for section approval — section block + recommendation + summary table + single confirm. Don't drip-feed section approvals. Include diagrams where they help.
9. **Update domain docs inline (domain-driven lens only)** — when a term resolves or a decision crystallizes, update `CONTEXT.md` / glossary / ADR right there. Don't batch. See FRAMEWORKS.md §3.
10. **Save + review** — write spec, dispatch reviewer subagent, user reviews before proceeding.
11. **Next step** — depending on what was designed:
    - Product features → `/prd` to formalize the behavior spec
    - Architecture → `/spec` to formalize the technical design
    - Ready to build → `/work:breakdown` to create tickets
    - Process/tooling → decision record with rationale

## Principles

- **Think hard** — use extended thinking liberally. Question your own assumptions, stress-test trade-offs, consider second-order effects. Brainstorming is where depth pays off most.
- **Interview, don't assume** — ask before proposing.
- **Parallel research** — don't serialize exploration, launch agents while brainstorming continues.
- **Push back proactively** — offer your opinion, don't just facilitate. Anti-sycophancy: comfort means you haven't gone deep enough.
- **YAGNI** — cut unnecessary scope from all designs.
- **Check before creating** — search for existing tasks/specs before duplicating.
- **Smart-skip** — if earlier answers already cover a later question in the lens framework, skip it. Only ask questions whose answers aren't yet clear.
- **Stop after each question** — wait for the response before asking the next.

## Escape hatches

- **User says "just do it" / impatient** — once: respond "the hard questions are the value, two more then we move." Pick the most critical remaining questions from the active lens, then proceed. If they push back twice, respect it.
- **User provides fully-formed plan with real evidence** — skip the interview phase but still run lens-appropriate review (Phase 3 challenge for ideas, ambition modes for plans).
- **Vibe shifts mid-session** — builder mode → "this could be a real company" mentions: upgrade lens to idea-validation. Plan-mode → "let me rethink the whole thing": switch to idea-validation.
