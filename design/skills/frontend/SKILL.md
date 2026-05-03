---
name: frontend
description: Create production-grade frontend interfaces — pages, components, layouts, hero sections, dashboards, marketing surfaces, app UI. Applies project DESIGN.md (tokens, primitives, anti-references), brand-vs-product register, and the named anti-pattern catalog. Use before any UI work — building a new page, component, layout, or screen. Triggers on "build a page", "create a component", "design this UI", "build the frontend", "make a hero section", "design a dashboard", "build the landing page", "redesign this", "the homepage needs", or any request that produces visual frontend code. For polishing functionally complete work, see polish. For per-project design system bootstrap, see establish.
---

# Frontend

Primary skill for creating distinctive frontend interfaces that avoid generic AI aesthetics. Loads the project's design context, applies the anti-pattern catalog, and produces production-grade code.

## What to do

<what-to-do>

1. **Load project context.** Read `DESIGN.md` if present (tokens, register, primitives mapping, project-specific anti-refs). If missing, recommend running `establish` first — but proceed if the user wants greenfield exploration.
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

A landing page and a dashboard can't follow the same playbook. `establish` records register in `DESIGN.md`. Confirm if ambiguous.

## Bold aesthetic direction

Pick an extreme — *brutally minimal*, *maximalist chaos*, *retro-futuristic*, *organic/natural*, *luxury/refined*, *playful/toy-like*, *editorial/magazine*, *brutalist/raw*, *art deco/geometric*, *soft/pastel*, *industrial/utilitarian*. Bold maximalism and refined minimalism both work — the failure mode is hedging in the middle.

## Aesthetics dimensions (load on demand)

Detailed per-dimension references live alongside this skill. Load when working in the relevant area:

- [`references/typography.md`](references/typography.md) — scales, pairing, loading
- [`references/color.md`](references/color.md) — OKLCH, palettes, dark mode, contrast
- [`references/spatial.md`](references/spatial.md) — grids, rhythm, container queries, hierarchy
- [`references/motion.md`](references/motion.md) — timing, easing, reduced motion
- [`references/interaction.md`](references/interaction.md) — states, focus, forms, keyboard, modals
- [`references/responsive.md`](references/responsive.md) — mobile-first, fluid, input detection
- [`references/ux-writing.md`](references/ux-writing.md) — quick reference (deeper coverage in plugin-level `references/ux-writing/`)

## Plugin-level references (always-loadable)

- [`design/references/anti-patterns.md`](../../references/anti-patterns.md) — named slop catalog
- [`design/references/ui-primitives.md`](../../references/ui-primitives.md) — `@wystack/ui` mapping
- [`design/references/philosophies/`](../../references/philosophies/) — impeccable, anthropic-frontend, wystack tenets

## DOs / DON'Ts cheat sheet

### Typography
- **DO**: Modular type scale with fluid sizing (`clamp`). Vary weights and sizes for hierarchy.
- **DON'T**: Inter/Roboto/Arial/system defaults. Monospace as "developer" theater. Large rounded-corner icons above every heading.

### Color
- **DO**: OKLCH for perceptually uniform palettes. Tint neutrals toward brand hue. Dominant + sharp accents.
- **DON'T**: Cyan-on-dark. Purple-to-blue gradients. Gradient text. Pure black/white. Gray text on colored backgrounds. Default to dark + glow.

### Layout
- **DO**: Visual rhythm through varied spacing. Asymmetry. Break the grid intentionally. Fluid spacing with `clamp()`.
- **DON'T**: Cards around everything. Nested cards. Identical card grids. Hero metric template. Center everything. Same spacing everywhere.

### Visual details
- **DO**: Intentional decorative elements that reinforce brand.
- **DON'T**: Glassmorphism everywhere. Thick colored border on one side. Decorative sparklines. Generic drop shadows. Modals when not needed.

### Motion
- **DO**: Exponential easing (ease-out-quart/quint/expo). Staggered page-load reveals. `grid-template-rows` for height animations.
- **DON'T**: Bounce/elastic. Animate layout properties. Animation for its own sake.

### Interaction
- **DO**: Progressive disclosure. Empty states that teach. Every interactive responsive.
- **DON'T**: Redundant info. Every button primary. Missing hover/focus/active/disabled states.

### Responsive
- **DO**: Container queries for components. Adapt for different contexts.
- **DON'T**: Hide critical functionality on mobile. Desktop-first design.

## The AI Slop Test

> If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, redesign.

A distinctive interface should make someone ask "how was this made?" — not "which AI made this?"

Review the DON'Ts above. They are the fingerprints of AI-generated work from 2024–2025.

## Implementation

Match implementation complexity to the aesthetic vision:
- Maximalist designs → elaborate animations, layered effects, density.
- Minimalist designs → restraint, precision, careful spacing and typography.

Mismatched intensity (minimalist aesthetic with maximalist code, or vice versa) reads as confused.

Interpret creatively. Two designs from the same prompt should not converge on the same defaults. Vary themes, fonts, color, motion. The model is capable of distinct creative output — don't hold back.
