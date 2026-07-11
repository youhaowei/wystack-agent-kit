# Philosophy: Anthropic Frontend Design

Source: [anthropics/claude-plugins-official `plugins/frontend-design`](https://github.com/anthropics/claude-plugins-official). The original "distinctive frontend, avoid AI slop" skill that impeccable later built upon. Apache-2.0.

Largely dormant since late 2025 (only LICENSE updates). We treat this as source-philosophy reference, not active fork target.

## Core principles we inherit

### 1. Distinctive over plausible
The default mode of a frontend LLM is "produce something plausible." That output converges on the same generic patterns. The principle: aim for *unforgettable*, not *acceptable*.

### 2. Aesthetic direction is the first decision
Before tokens, components, or layout — pick a direction. Brutalist, editorial, retro-futuristic, organic, industrial. Bold commitment to a single direction reads as designed; trying to please everyone reads as templated.

### 3. Implementation matches aesthetic
- Maximalist designs need elaborate code (extensive animation, layered effects).
- Minimalist designs need restraint, precision, careful spacing and typography.

The failure mode is mismatched intensity — minimalist aesthetic implemented with maximalist code, or vice versa.

### 4. Don't repeat across generations
Two designs from the same prompt should not converge. Vary themes, fonts, color, motion. The model is capable of distinct creative output; the slop pattern is converging to safe defaults.

### 5. Working code, not mockups
Production-grade, functional, accessible — not a sketchpad artifact. The output should ship.

## Categories the original skill organized by

- Typography (scales, pairing, loading)
- Color & contrast (OKLCH, palettes, dark mode)
- Layout & space (grids, rhythm, container queries)
- Visual details (decorative restraint)
- Motion (timing, easing, reduced motion)
- Interaction (forms, focus, loading)
- Responsive (mobile-first, fluid, container queries)
- UX writing (labels, errors, empty states)

Our equivalent organization lives in `references/anti-patterns.md` (the DON'Ts named) and across `references/discoverability/`, `references/ux-writing/` (the DOs broken out).

## What changed for our context

- We added **WyStack primitive composition** as a hard constraint (see `references/ui-primitives.md`). Anthropic's source assumed greenfield HTML/CSS; we ship into a token-driven design system.
- We split UX writing out as a separate `ux-writer` agent's domain — Anthropic kept it as a sub-section of frontend-design.
- We added **discoverability** as a peer concern — ranking and citation are first-class outputs, not afterthoughts.
