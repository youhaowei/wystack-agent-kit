# Philosophy: Impeccable

Source: [pbakaus/impeccable](https://github.com/pbakaus/impeccable). Forked at v1.3.0; current upstream has restructured to v3+ with a different shape (separate browser extension, multi-harness installers). We treat impeccable as an inspiration source, not a maintained fork.

## Core ideas worth porting

### 1. The AI slop test
> "If you showed this interface to someone and said 'AI made this,' would they believe you immediately?"

Used as a quality gate after `frontend-design` and in `polish-design`. See `references/anti-patterns.md` for the named slop catalog.

### 2. Brand vs Product register
Two contradictory sets of rules depending on what you're designing:

| Register | Examples | Rules favor |
|---|---|---|
| **Brand** | Marketing pages, landing pages, portfolios, editorial | Bold visual statement, asymmetry, distinctive type, hero typography, scroll choreography |
| **Product** | App UI, dashboards, admin tools, settings | Density, scannability, predictable affordances, restraint, system fidelity |

A landing page and a dashboard can't follow the same playbook. `establish-design` records the project's primary register in `DESIGN.md` so subsequent skills know which mode to apply.

### 3. Bold direction over safe defaults
Pick an extreme aesthetic — *brutally minimal*, *maximalist chaos*, *retro-futuristic*, *editorial-magazine*, *brutalist/raw*, *art deco/geometric*, *industrial/utilitarian* — and execute it with precision. Bold maximalism and refined minimalism both work; the failure mode is hedging in the middle.

### 4. Codebase-aware polish
Polish should *scan* the codebase — read existing tokens, components, rendered output — and respect the system rather than invent a new one. We carry this directly into our `polish-design` skill.

### 5. Named anti-patterns
Naming a pattern (Cardocalypse, Purple Gradient, Hero Metric, Glow Mode) makes it discussable, refusable, and fixable. Vague "this looks generic" doesn't lead to a fix; "this is Side-Tab Cards" does.

## What we didn't take

- **The 23-command surface** (palette, typeset, animate, colorize, bolder, quieter, layout, delight, etc.) — too narrow for our usage data; consolidated into `polish-design`.
- **PRODUCT.md generation in `establish-design`** — Agent Kit planning workflows own product context (PRD, spec, project mode). `establish-design` only owns DESIGN.md.
- **Browser extension + live-build server** — out of scope for plugin layer.

## Where we diverge

Our `frontend-design` defaults less aggressively to maximalism. Impeccable's "BOLD aesthetic direction" framing pushes hard toward distinctive marketing surfaces; our `frontend-design` works equally for product UI where restraint is the right answer. The register decision (made in `establish-design`, recorded in DESIGN.md) tunes the bias.
