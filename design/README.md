# Design Plugin

Design quality for frontend interfaces — creative direction, evaluation, Figma iteration, and anti-pattern detection.

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
| **design-review** (`review/`) | Structured evaluation — AI slop detection, hierarchy, a11y, performance. |
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
