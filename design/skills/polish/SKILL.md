---
name: polish
description: Final quality pass — alignment, spacing, states, copy, responsiveness. Fixes the small things that separate good from great. Only for functionally complete work.
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Polish

Systematic final pass. Don't polish incomplete work.

## Prerequisites

Load the `design:build` skill for design principles.

## Checklist

Work through each dimension. Fix as you go.

### Alignment & Spacing
- Everything lines up to grid
- All gaps use spacing scale (no random 13px)
- Optical alignment for icons (may need offset)
- Consistent at all breakpoints

### Typography
- Hierarchy consistent — same elements, same sizes/weights
- Line length 45-75 characters
- No widows/orphans
- Font loading: no FOUT/FOIT flashes

### Color & Contrast
- All text meets WCAG AA
- No hard-coded colors — use design tokens
- Works in all themes
- Tinted neutrals — no pure gray or pure black
- No gray text on colored backgrounds

### Interaction States
All 8 for every interactive element:
- [ ] Default, Hover, Focus (`:focus-visible`), Active
- [ ] Disabled, Loading, Error, Success

### Transitions
- All state changes animated (150-300ms)
- Exponential easing only — no bounce/elastic
- 60fps — only transform/opacity
- `prefers-reduced-motion` respected

### Copy
- Consistent terminology throughout
- Consistent capitalization (title case or sentence case)
- No typos
- Button labels: verb + object

### Edge Cases
- [ ] Empty states guide toward action
- [ ] Loading states show progress
- [ ] Error states: what + why + fix
- [ ] Long content handled (truncation, overflow)
- [ ] Missing data handled gracefully

### Responsive
- [ ] Mobile, tablet, desktop
- [ ] Touch targets 44px+
- [ ] No horizontal scroll
- [ ] No text < 14px on mobile

### Code Cleanup
- [ ] No console.log
- [ ] No commented-out code
- [ ] No unused imports
- [ ] No TypeScript `any`

## Verification
- Use it yourself — interact with the feature
- Check all states, not just happy path
- Compare to design intent
