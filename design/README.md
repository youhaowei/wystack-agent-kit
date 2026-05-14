# Design Plugin

Design quality for frontend interfaces — creative direction, evaluation, Figma iteration, and anti-pattern detection.

## Skill Communication Contract

Every design skill should reduce the user's cognitive load while preserving
enough information for the user to learn from the work and make important
decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious design choices; keep process logs out
  of the main narrative.
- Group information by user impact, surface, ownership boundary, or decision
  area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option
  lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.

## Agents

| Agent | Model | Role |
|-------|-------|------|
| **designer** | opus | Creative director + executor. Builds UI, iterates in Figma, owns design quality. |
| **reviewer** | sonnet | Independent quality auditor. Evaluates but does not write code. |

## Codex Compatibility

- Codex should install this plugin through the repo marketplace entry pointing to
  `./plugins/design`, not the top-level `design/` directory directly.
- The design skills are shared across Claude and Codex. Only the packaging and
  a few harness-specific instruction surfaces differ.
- When an instruction says to update persistent project guidance, prefer
  `AGENTS.md` in Codex-oriented repos and fall back to `CLAUDE.md` when that is
  the existing project convention.

## Skills

| Skill | Purpose |
|-------|---------|
| **build/** | Design principles, anti-patterns, aesthetic direction. Foundation for all design work. |
| **design-review** (`design-review/`) | Structured evaluation — AI slop detection, hierarchy, a11y, performance. |
| **polish/** | Final quality pass — alignment, spacing, states, copy, responsiveness. |
| **distill/** | Simplification — remove complexity, reveal essence. |
| **iterate/** | Figma iteration loop — code → Figma → screenshot → evaluate → refine. |
| **setup/** | One-time project design context setup. Writes to the project's instruction file (`AGENTS.md` or `CLAUDE.md`). |

## References

`skills/build/references/` contains detailed guidance on typography, color, spatial design, motion, interaction, responsive design, and UX writing.

## Attribution

Adapted from:
- [Anthropic frontend-design skill](https://github.com/anthropics/claude-code) (Apache 2.0)
- [Impeccable](https://impeccable.style) by Paul Bakaus (Apache 2.0)
