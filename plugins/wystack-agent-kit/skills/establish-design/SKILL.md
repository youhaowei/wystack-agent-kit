---
name: establish-design
description: Bootstrap a project's visual design system. Produces DESIGN.md at project root with register (brand/product), visual direction, tokens (color OKLCH, type scale, spacing, radii, shadows), @wystack/ui primitive mapping, project-specific anti-patterns, and accessibility targets. Run once per new project, or to refresh when the design system needs to be re-established. Use when the user mentions "set up design system", "design context", "project design", "DESIGN.md", "establish design", "design tokens", "design bootstrap", "set up the design system for this project", or starts a new visual project that needs a system. Reads but does not own product context (audience, brand voice, anti-references) — that lives in PRODUCT.md / PRD owned by wystack-agent-kit:pm.
---
# Establish

Per-project visual design system bootstrap. Outputs `DESIGN.md` at the project root and a brief `## Design Context` pointer block in `CLAUDE.md` / `AGENTS.md`.

## What to do

1. **Read product context first — gate.** Look for `PRODUCT.md`, `PRD.md`, or product context in `CLAUDE.md` / `AGENTS.md`; ask the user to point you at a referenced Notion PRD. **If no product context exists, stop** and tell the user to run `wystack-agent-kit:prd`. Never infer audience/brand/voice — that drift defeats the boundary.
2. **Scan the codebase** for design signals: existing `DESIGN.md` (read first, offer refresh over overwrite), `tailwind.config.*` / `theme.*` / `tokens.*` / CSS custom properties, `@wystack/ui-core` (tokens) and `@wystack/ui-react` (components) usage, brand assets, and typography/spacing patterns in existing components.
3. **Run a short visual interview** — a couple of focused rounds, only on what you can't infer. Use the harness's structured question tool if one exists. Cover: register (brand / product / mixed, lead with codebase hypothesis), visual direction (3–5 references + 2–3 anti-references, *visual* taste only), light/dark/both, WCAG target, palette seed, reduced-motion / color-blindness. **Do NOT** ask about audience, brand voice, personality, or jobs-to-be-done — those are PM's, in PRODUCT.md.
4. **Confirm before writing.** Present a draft outline (register, palette direction, primitives mapping) and confirm. Write `DESIGN.md` only after confirmation.
5. **Append `## Design Context`** — a short pointer block, not a duplicate — to `CLAUDE.md` (or `AGENTS.md` per project convention). Summarize the key principles + register decision.

## Boundary: design ≠ product

`establish-design` owns the **visual** system only. Audience and jobs-to-be-done, brand voice/personality, and strategic positioning belong to `wystack-agent-kit:pm` (via `prd`) and `marketing-specialist`, captured in `PRODUCT.md`. Copywriter and ux-writer reference voice from there. If product context is missing, redirect — don't fabricate, and don't write a PRODUCT.md "to be helpful".

## DESIGN.md template

Section skeleton and the token vocabulary a project must emit. Fill placeholders; keep the semantic token names (they are the cross-skill contract `frontend-design` and `polish-design` consume).

```markdown
# Design — [Project Name]

> Established: [YYYY-MM-DD]
> Loaded by: Agent Kit plugin skills (frontend, polish, copywriting, ux-writing, discoverability)

## Register
[brand | product | mixed (with primary)] — one sentence justifying the choice.

## Visual Direction
- **References** (what to look like): 3–5, each with what specifically.
- **Anti-references** (what NOT to look like): 2–3, each with why.
- **Aesthetic adjective set** (3 words max).

## Theme
- **Mode**: [light | dark | both] · **Default** (if both) · **Brand anchor**: `oklch(L C H)`

## Tokens

### Color (OKLCH) — semantic names, dark-theme overrides if applicable
Surface: `--color-bg-canvas`, `--color-bg-subtle`, `--color-bg-overlay`
Foreground: `--color-fg-default`, `--color-fg-muted`, `--color-fg-subtle`
Border: `--color-border-default`, `--color-border-subtle`, `--color-border-strong`
Brand: `--color-accent`, `--color-accent-fg`
Status: `--color-success`, `--color-warning`, `--color-danger`

### Type scale (fluid, clamp())
`--text-xs` captions · `--text-sm` secondary · `--text-base` body · `--text-lg` lead · `--text-xl` h4 · `--text-2xl` h3 · `--text-3xl` h2 · `--text-4xl` h1 · `--text-display` hero (brand mode)
**Family**: display/heading, body, mono (if used) — each with provider + load strategy.

### Spacing / Radii / Shadows
`--space-{1..12}` on a documented 4px or 8px base · `--radius-{sm,md,lg,full}` · `--shadow-{card,popover,modal}`

## Primitives
Which `@wystack/ui` primitives are in active use, local extensions, and any TODOs to promote local components upstream.

## Project-specific anti-patterns
Layered on the global catalog — specific things this project must avoid, each with why.

## Accessibility
WCAG target (AA/AAA, which surfaces) · reduced-motion strategy · color-blindness (palette tested? signals not color-only?) · keyboard parity.

## Discoverability defaults
Schema types in use · OG image template path · llms.txt status.

## Voice (only if not in PRODUCT.md)
Persona + positive/avoid examples. Otherwise link PRODUCT.md and remove this section.
```

## Refresh vs first-run

- **DESIGN.md exists**: read first; on refresh, ask which sections to update — never silently overwrite.
- **DESIGN.md missing, PRODUCT.md exists**: full interview + write, citing PRODUCT.md where relevant (register, audience implications).
- **DESIGN.md exists, PRODUCT.md missing**: write DESIGN.md, then prompt the user to run `wystack-agent-kit:prd`.

## Watch for

- **Don't pick generic palettes.** "Tasteful neutrals + a blue accent" produces the same DESIGN.md every time. Push for specific OKLCH values tied to brand.
- **Don't write DESIGN.md from a single prompt.** Always run a real interview round, even if short.
