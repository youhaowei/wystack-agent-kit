---
name: frontend-design
description: Create production-grade frontend interfaces — pages, components, layouts, hero sections, dashboards, marketing surfaces, app UI. Applies project DESIGN.md (tokens, primitives, anti-references), brand-vs-product register, and the named anti-pattern catalog. Use before any UI work — building a new page, component, layout, or screen. Triggers on "build a page or component", "design this UI", "make a hero section", "redesign this", or any request that produces visual frontend code. For polishing functionally complete work, see wystack-agent-kit:polish-design. For per-project design system bootstrap, see wystack-agent-kit:establish-design.
---
# Frontend

Primary skill for distinctive frontend interfaces that avoid generic AI aesthetics.

## What to do

1. **Load project context.** Read `DESIGN.md` if present (tokens, register, primitives, project anti-refs). If missing, recommend `wystack-agent-kit:establish-design` — but proceed for greenfield exploration.
2. **Confirm register** for the surface — brand vs product (below). Different rules.
3. **Commit to a bold aesthetic direction** before writing code. Indecision in the middle reads as templated.
4. **Compose from `@wystack/ui-react` primitives** ([`references/ui-primitives.md`](../../references/ui-primitives.md)), tokens from `@wystack/ui-core`. No raw `<button>` / `<input>` / `<dialog>` in feature code.
5. **Use semantic tokens, never raw values** — `--color-*` / `--space-*` / `--text-*` / `--radius-*` / `--shadow-*`.
6. **Apply the anti-pattern catalog** continuously ([`references/anti-patterns.md`](../../references/anti-patterns.md)), and run the AI Slop Test before declaring done.

## Brand vs Product register

| Register | When | Rules favor |
|---|---|---|
| **Brand** | Marketing pages, landing, portfolios, editorial | Bold visual statement, asymmetry, distinctive type, hero typography, scroll choreography |
| **Product** | App UI, dashboards, admin tools, settings, forms | Density, scannability, predictable affordances, restraint, system fidelity |

A landing page and a dashboard can't follow the same playbook. `establish-design` records register in `DESIGN.md`; confirm if ambiguous.

## Bold aesthetic direction

Pick an extreme — *brutally minimal*, *maximalist chaos*, *retro-futuristic*, *organic/natural*, *luxury/refined*, *playful/toy-like*, *editorial/magazine*, *brutalist/raw*, *art deco/geometric*, *soft/pastel*, *industrial/utilitarian*. Bold maximalism and refined minimalism both work — the failure mode is hedging in the middle. Match implementation intensity to the vision: maximalist → elaborate animation, layered effects, density; minimalist → restraint, precise spacing and type. Mismatched intensity reads as confused. Two designs from the same prompt should not converge on the same defaults.

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

A distinctive interface makes someone ask "how was this made?" — not "which AI made this?" The anti-pattern catalog ([`references/anti-patterns.md`](../../references/anti-patterns.md)) is the fingerprint list of AI-generated work from 2024–2025.
