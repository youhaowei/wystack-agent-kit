---
name: establish-design
description: Bootstrap a project's visual design system. Produces DESIGN.md at project root with register (brand/product), visual direction, tokens (color OKLCH, type scale, spacing, radii, shadows), @wystack/ui primitive mapping, project-specific anti-patterns, and accessibility targets. Run once per new project, or to refresh when the design system needs to be re-established. Use when the user mentions "set up design system", "design context", "project design", "DESIGN.md", "establish design", "design tokens", "design bootstrap", "set up the design system for this project", or starts a new visual project that needs a system. Reads but does not own product context (audience, brand voice, anti-references) — that lives in PRODUCT.md / PRD owned by wystack-agent-kit:pm.
---
# Establish

Per-project visual design system bootstrap. Outputs `DESIGN.md` at the project root and a brief `## Design Context` summary block in `CLAUDE.md` / `AGENTS.md` pointing at it.

## What to do

<what-to-do>

1. **Read product context first.**
   - Look for `PRODUCT.md`, `PRD.md`, or product context in `CLAUDE.md` / `AGENTS.md`.
   - If a Notion PRD is referenced, ask the user to point you at it.
   - If no product context exists: **stop**. Tell the user to run `wystack-agent-kit:prd` first. Do **not** silently infer audience/brand/voice — that drift defeats the boundary.

2. **Scan the codebase** for existing design signals:
   - Existing `DESIGN.md` (if present, read first; offer to refresh rather than overwrite).
   - `tailwind.config.*`, `theme.*`, `tokens.*`, CSS custom properties.
   - `@wystack/ui` import patterns — what primitives are already used.
   - Brand assets: logos, favicons, defined colors.
   - Existing components: typography choices, spacing patterns.
   - Anything style-guide-shaped already in the repo.

3. **Run a short visual interview** — only on what you can't infer. 2–3 questions per round, max 2 rounds. Use the harness's structured question tool when one exists; otherwise ask in chat and stop. Topics:
   - **Register confirmation** (brand / product / mixed) — lead with codebase hypothesis if signal is clear.
   - **Visual direction** (3–5 references + 2–3 anti-references — *visual* taste only, not brand voice).
   - **Light / dark / both**, **WCAG target**, **color palette seed** (brand color or starting point).
   - Reduced-motion / color-blindness considerations.
   
   **Do NOT** ask about audience, brand voice, brand personality, jobs-to-be-done — those belong in PRODUCT.md, owned by PM.

4. **Confirm before writing.** Present a draft outline (not the full DESIGN.md) and confirm the register, palette direction, and primitives mapping with the user. Only write after confirmation.

5. **Write `DESIGN.md`** at project root using the template below.

6. **Append `## Design Context` summary** to `CLAUDE.md` (or `AGENTS.md` if that's the project convention) — short pointer block, not a duplicate of DESIGN.md.

7. **Confirm what was written** and summarize the key principles + register decision.

</what-to-do>

## Boundary: design ≠ product

`establish-design` owns the **visual** system. It does not own:

- **Audience** — who uses it, jobs-to-be-done — owned by `wystack-agent-kit:pm` via `wystack-agent-kit:prd`, captured in `PRODUCT.md` / PRD.
- **Brand voice / personality** — copywriter and ux-writer reference this from PRODUCT.md or DESIGN.md's voice section (whichever the project uses).
- **Strategic positioning** — owned by `wystack-agent-kit:pm` / `marketing-specialist`.

If product context is missing, redirect — don't fabricate.

## DESIGN.md template

```markdown
# Design — [Project Name]

> Established: [YYYY-MM-DD]
> Loaded by: Agent Kit plugin skills (frontend, polish, copywriting, ux-writing, discoverability)

## Register

[brand | product | mixed (with primary)]

[One sentence justifying the choice — e.g., "App UI for SREs on call; everything else is product mode. Marketing site is brand mode."]

## Visual Direction

**References** (what to look like):
- [Reference 1 — what specifically about it]
- [Reference 2]
- [Reference 3]

**Anti-references** (what NOT to look like):
- [Anti-ref 1 — why we avoid]
- [Anti-ref 2]

**Aesthetic adjective set** (3 words max): [e.g., "calm, clinical, dense"]

## Theme

- **Mode**: [light | dark | both]
- **Default**: [if both]
- **Brand color (anchor)**: `oklch(L C H)` — [name]

## Tokens

### Color (OKLCH)

```css
:root {
  /* Surface */
  --color-bg-canvas: oklch(L C H);
  --color-bg-subtle: oklch(L C H);
  --color-bg-overlay: oklch(L C H);

  /* Foreground */
  --color-fg-default: oklch(L C H);
  --color-fg-muted: oklch(L C H);
  --color-fg-subtle: oklch(L C H);

  /* Border */
  --color-border-default: oklch(L C H);
  --color-border-subtle: oklch(L C H);
  --color-border-strong: oklch(L C H);

  /* Brand + accent */
  --color-accent: oklch(L C H);
  --color-accent-fg: oklch(L C H);

  /* Status */
  --color-success: oklch(L C H);
  --color-warning: oklch(L C H);
  --color-danger: oklch(L C H);
}
```

[Plus dark-theme overrides if applicable]

### Type scale (fluid)

| Token | Use | Value |
|---|---|---|
| `--text-xs` | captions, helpers | `clamp(0.7rem, ...)` |
| `--text-sm` | secondary body | `clamp(0.85rem, ...)` |
| `--text-base` | body | `clamp(1rem, ...)` |
| `--text-lg` | lead | `clamp(1.125rem, ...)` |
| `--text-xl` | h4 | `clamp(1.25rem, ...)` |
| `--text-2xl` | h3 | `clamp(1.5rem, ...)` |
| `--text-3xl` | h2 | `clamp(2rem, ...)` |
| `--text-4xl` | h1 | `clamp(2.5rem, ...)` |
| `--text-display` | hero (brand mode) | `clamp(3rem, ...)` |

**Family**:
- **Display / heading**: [font name + provider + load strategy]
- **Body**: [font name + provider + load strategy]
- **Mono** (if used): [font name]

### Spacing

`--space-{1..12}` on a 4px or 8px base. Document the base.

### Radii

`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`

### Shadows

`--shadow-card`, `--shadow-popover`, `--shadow-modal`

## Primitives

Composing from `@wystack/ui`:

[Table or list of which primitives are in active use, any local extensions, any TODOs to promote local components upstream.]

## Project-specific anti-patterns

Layered on top of the global anti-pattern catalog. Specific things this project must avoid:

- [Anti-pattern 1 — why]
- [Anti-pattern 2]

## Accessibility

- **WCAG target**: [AA | AAA — for which surfaces]
- **Reduced motion**: [strategy]
- **Color-blindness**: [palette tested with tools? primary signals not color-only?]
- **Keyboard parity**: [confirmed on all interactive surfaces]

## Discoverability defaults

- **Schema types in use**: [Organization, SoftwareApplication, Article, etc.]
- **OG image template**: [path]
- **llms.txt status**: [exists / planned / N/A]

## Voice (if not in PRODUCT.md)

If PRODUCT.md doesn't capture brand voice, note here:

- **Persona**: [one sentence]
- **Examples** (positive): ["..."]
- **Examples** (avoid): ["..."]

(Otherwise: link to PRODUCT.md and remove this section.)
```

## Refresh vs first-run

- **Neither file exists**: full interview + write DESIGN.md.
- **DESIGN.md exists**: read first. If user wants refresh, ask which sections to update; never silently overwrite.
- **DESIGN.md exists, but PRODUCT.md missing**: write DESIGN.md, then prompt user to run `wystack-agent-kit:prd`.
- **PRODUCT.md exists, DESIGN.md missing**: full interview + write DESIGN.md. Cite PRODUCT.md sections in DESIGN.md where relevant (register, audience implications).

## Anti-patterns specific to this skill

- **Don't fabricate product context.** If audience/brand/voice is missing, redirect to PM. Inferring from one-line user prompts produces drift.
- **Don't write a full PRODUCT.md "to be helpful".** Boundary lives by being respected.
- **Don't write `DESIGN.md` from a single prompt.** Always do a real interview round, even if short. Better to ask 3 questions and confirm than to assume.
- **Don't pick generic palettes.** Saying "tasteful neutrals + a blue accent" produces the same DESIGN.md every time. Push for specific OKLCH values tied to brand.
