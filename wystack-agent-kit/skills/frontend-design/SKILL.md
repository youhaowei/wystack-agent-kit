---
name: frontend-design
description: Create production-grade frontend interfaces — pages, components, layouts, hero sections, dashboards, marketing surfaces, app UI. Applies project DESIGN.md (tokens, primitives, anti-references), brand-vs-product register, and the named anti-pattern catalog. Use before any UI work — building a new page, component, layout, or screen. Triggers on "build a page", "create a component", "design this UI", "build the frontend", "make a hero section", "design a dashboard", "build the landing page", "redesign this", "the homepage needs", or any request that produces visual frontend code. For polishing functionally complete work, see wystack-agent-kit:polish-design. For per-project design system bootstrap, see wystack-agent-kit:establish-design.
---
# Frontend

Primary skill for creating distinctive frontend interfaces that avoid generic AI aesthetics. Loads the project's design context, applies the anti-pattern catalog, and produces production-grade code.

## What to do

<what-to-do>

1. **Load project context.** Read `DESIGN.md` if present (tokens, register, primitives mapping, project-specific anti-refs). If missing, recommend running `wystack-agent-kit:establish-design` first — but proceed if the user wants greenfield exploration.
2. **Confirm register** for the surface — brand mode (marketing/landing/editorial) vs product mode (app/dashboard/admin). Different rules.
3. **Commit to a bold aesthetic direction** before writing code. Indecision in the middle reads as templated.
4. **Compose from `@wystack/ui` primitives.** No raw `<button>` / `<input>` / `<dialog>` in feature code. See [`references/ui-primitives.md`](../../references/ui-primitives.md).
5. **Apply the anti-pattern catalog** continuously. Named patterns at [`references/anti-patterns.md`](../../references/anti-patterns.md).
6. **Use semantic tokens, never raw values.** Color, spacing, type, radii, shadows all from `--color-*` / `--space-*` / `--text-*` / `--radius-*` / `--shadow-*`.
7. **Run the AI Slop Test before declaring done.** See below.

</what-to-do>

## Brand vs Product register

| Register | When | Rules favor |
|---|---|---|
| **Brand** | Marketing pages, landing, portfolios, editorial | Bold visual statement, asymmetry, distinctive type, hero typography, scroll choreography |
| **Product** | App UI, dashboards, admin tools, settings, forms | Density, scannability, predictable affordances, restraint, system fidelity |

A landing page and a dashboard can't follow the same playbook. `wystack-agent-kit:establish-design` records register in `DESIGN.md`. Confirm if ambiguous.

## Bold aesthetic direction

Pick an extreme — *brutally minimal*, *maximalist chaos*, *retro-futuristic*, *organic/natural*, *luxury/refined*, *playful/toy-like*, *editorial/magazine*, *brutalist/raw*, *art deco/geometric*, *soft/pastel*, *industrial/utilitarian*. Bold maximalism and refined minimalism both work — the failure mode is hedging in the middle.

## References

Shared design context (plugin-root, also used by `polish-design`):
- [`references/anti-patterns.md`](../../references/anti-patterns.md) — named AI-slop catalog; the DON'Ts to detect and avoid
- [`references/ui-primitives.md`](../../references/ui-primitives.md) — `@wystack/ui` mapping
- [`references/philosophies/`](../../references/philosophies/) — impeccable, anthropic-frontend, wystack tenets
- [`references/ux-writing/`](../../references/ux-writing/) — in-product copy, errors, empty states, accessibility copy

Craft detail (reach for the dimension you're composing):
- [`references/color.md`](references/color.md) — OKLCH palettes, tinted neutrals, 60-30-10, WCAG contrast, dark mode
- [`references/typography.md`](references/typography.md) — type scale, weights, fluid sizing
- [`references/spatial.md`](references/spatial.md) — spacing system, grids, visual hierarchy, container queries
- [`references/motion.md`](references/motion.md) — duration, exponential easing, staggering, reduced-motion
- [`references/interaction.md`](references/interaction.md) — states, progressive disclosure, affordances
- [`references/responsive.md`](references/responsive.md) — container queries, context adaptation

## The AI Slop Test

> If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, redesign.

A distinctive interface should make someone ask "how was this made?" — not "which AI made this?"

Review the anti-pattern catalog ([`references/anti-patterns.md`](../../references/anti-patterns.md)) — those DON'Ts are the fingerprints of AI-generated work from 2024–2025.

## Implementation

Match implementation complexity to the aesthetic vision:
- Maximalist designs → elaborate animations, layered effects, density.
- Minimalist designs → restraint, precision, careful spacing and typography.

Mismatched intensity (minimalist aesthetic with maximalist code, or vice versa) reads as confused.

Interpret creatively. Two designs from the same prompt should not converge on the same defaults. Vary themes, fonts, color, motion. The model is capable of distinct creative output — don't hold back.
