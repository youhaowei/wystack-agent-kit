---
name: orchestrate
description: "Route a broad request to the right specialist(s) and synthesize the results. Use when a request spans multiple roles, when the user wants a second or third opinion from different lenses, or when you're unsure which specialist to engage. For parallel ticket execution in worktrees, use the swarm skill instead."
---

<what-to-do>

Route, fan out, synthesize. You stay the conductor — specialists do the work.

1. **Read the ask.** What is the user trying to accomplish, which domains does it touch?
2. **Pick a mode.**
   - **Single specialist** — maps cleanly to one role → spawn it, done.
   - **Parallel lenses** — independent angles on the same question → fan out 2–3 subagents with different stances. See [Parallel multi-stance pattern](#parallel-multi-stance-pattern).
   - **Sequential pipeline** — one agent's output feeds the next → chain them.
3. **Synthesize.** Collect results, resolve conflicts, present a unified recommendation. Flag disagreements for the user; don't paper over them.
4. **Ask when ambiguous.** If decomposition isn't obvious, ask. Each question includes your recommended answer.

**Subagents vs teammates.** Default to **subagents** (one-shot, auto-isolated context, zero ceremony). Use **teammates** only when the work needs to persist, run in the background, or edit disk in isolation — that's swarm territory, not this skill.

## Routing

| Signal | Agent |
|---|---|
| requirements / PRD / user stories / prioritization | `pm` |
| architecture / cross-project design / spec reviews | `principal` |
| wystack core / database / server / client / subscriptions | `stack-engineer` |
| CLI / codegen / runtime / logging / DX tooling | `dx-engineer` |
| stdui / tokens / primitives / component quality | `ui-engineer` |
| tests / triage / verify / edge cases | `qa` |
| git / CI / releases / branches / deploy | `devops` |
| Notion wiki CRUD / PRDs / Specs | `wiki-librarian` |
| positioning / pricing / competitors | `strategist` |
| copy / editorial / email / social | `content-writer` |
| SEO / schema / programmatic / organic | `seo-engineer` |
| conversion / onboarding / signup flow | `cro-analyst` |
| launches / ads / referral / free tools | `growth-manager` |
| tracking / measurement / A/B / GA4 | `analytics-engineer` |
| ambiguous or multi-domain | ask the user, then decompose |

</what-to-do>

<supporting-info>

## Parallel multi-stance pattern

For architecture or design decisions where the obvious answer might be wrong, fan out the *same* question to multiple specialists with *opposing* stances.

Example — _"how should we handle X?"_:

- `principal` — minimal change, favor existing patterns.
- `stack-engineer` — correctness-first, accept more refactor.
- `dx-engineer` — optimize for future-dev ergonomics.

Then synthesize: recommendation + trade-offs + dissents. The point is to surface the strongest version of each position before deciding.

Don't do this for every task. Reserve it for reversals-would-be-costly decisions.

## Principles

- **Delegate, don't execute** — your value is routing and synthesis.
- **Parallel when independent, sequential when dependent.**
- **Staff engineers have veto power** — `stack-engineer`, `dx-engineer`, `ui-engineer` own their domains. When they push back on API, DX, or primitive-usage issues, take it seriously. Resolve with `principal`, not by overriding.
- **Resolve conflicts** — present both sides with your pick; let the user override.
- **Stay minimal** — one-specialist tasks don't need ceremony.

</supporting-info>
