---
name: polish-design
description: Final quality pass — alignment, spacing, states, copy, responsiveness. Fixes the small things that separate good from great. Only for functionally complete work.
---
# Polish

Systematic final pass on functionally complete work. Load `wystack-agent-kit:frontend-design` for the design principles, token rules, and anti-pattern catalog. Work each dimension, fix as you go.

## Alignment & spacing
- Everything lines up to grid; all gaps use the spacing scale (no random 13px)
- Optical alignment for icons (may need offset); consistent at all breakpoints

## Typography
- Hierarchy consistent — same elements, same sizes/weights
- Line length 45–75 characters; no widows/orphans
- Font loading: no FOUT/FOIT flashes

## Color & contrast
- All text meets WCAG AA; tokens only, no hard-coded colors; works in all themes
- Tinted neutrals — no pure gray/black; no gray text on colored backgrounds

## Interaction states
All 8 for every interactive element: Default, Hover, Focus (`:focus-visible`), Active, Disabled, Loading, Error, Success.

## Transitions
- Animate all state changes (150–300ms); exponential easing only, no bounce/elastic
- 60fps — transform/opacity only; `prefers-reduced-motion` respected

## Copy
- Consistent terminology and capitalization; no typos; button labels are verb + object

## Edge cases
- Empty states guide toward action; loading states show progress
- Error states: what + why + fix; long content handled (truncation, overflow); missing data handled gracefully

## Responsive
- Mobile, tablet, desktop; touch targets 44px+; no horizontal scroll; no text < 14px on mobile

## Code cleanup
- No console.log, commented-out code, unused imports, or TypeScript `any`

## Verification
Interact with the feature yourself — check all states, not just the happy path, against design intent.
