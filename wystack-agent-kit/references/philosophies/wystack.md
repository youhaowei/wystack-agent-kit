# Philosophy: WyStack Design Tenets

Our own additions on top of `impeccable.md` and `anthropic-frontend.md`. These hold across all WyStack consumer projects.

## 1. Token-driven, never raw

Semantic tokens for color, spacing, type, radii, shadows. No raw hex, no magic numbers in feature components. If a value isn't in the token set, the value is wrong — extend the token set, don't bypass.

OKLCH for color. Perceptually uniform; theming becomes structural rather than incidental.

## 2. Compose from primitives

Feature components compose from `@wystack/ui` primitives. No raw `<button>` / `<input>` / `<dialog>` in feature code. See `references/ui-primitives.md`.

If a primitive is missing or wrong, fix upstream. If you must diverge, document why with a `// TODO(wystack/ui)` comment and file a stdui ticket.

## 3. Theming is structural

Light/dark/brand themes are token swaps, not visual switches. Same component code, different token values. The component never knows which theme is active.

## 4. Density is a token, not a fork

Compact and comfortable density use the same components with different `--space-*` scales. No "compact" component variants.

## 5. Accessibility is non-negotiable

WCAG AA contrast minimum. Visible focus rings on all interactives. Reduced-motion respected. Screen-reader labels on icon buttons. Keyboard parity with mouse.

These are validated in `polish-design`, not optional polish-passes.

## 6. Performance is part of design

- Core Web Vitals targets are design constraints (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- Animation uses `transform` + `opacity` only.
- Images: modern formats (AVIF/WebP), responsive `srcset`, `loading="lazy"` below the fold.
- Fonts: `font-display: swap`, subset by latin/range, max 2 families.

## 7. Brand vs product register, but with a default

The register split (impeccable concept) applies. Default to **product** when ambiguous — most WyStack consumer surfaces are app UI, not marketing. `establish-design` confirms per-project.

## 8. Composition over inheritance for variants

Variants are props, not class hierarchies. `<Button variant="ghost" size="sm" />`, not `<GhostButton size="sm" />`. Lets the design system grow without combinatoric class explosion.

## 9. Ship the system, not snapshots

Polish is continuous, not a final pass. The design system absorbs improvements; individual screens don't accrete one-off styles. If you find yourself adding a one-off style, the token set or primitive set has a gap — fix that.

## 10. Discoverability is part of shipping

Pages aren't done when they look good — they're done when the right audience can find them. Schema markup, meta tags, IA, llms.txt, and registry/marketplace presence are designer-touched concerns, not "marketing's problem."

See `references/discoverability/`.
