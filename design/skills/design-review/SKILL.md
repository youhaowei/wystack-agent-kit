---
name: design-review
description: Evaluate design quality — AI slop detection, visual hierarchy, accessibility, performance. Structured findings with severity and actionable fixes.
---
## Skill communication contract

Every skill output should reduce the user's cognitive load while preserving enough information to learn from the work and make important decisions.

- Lead with the recommendation, readiness state, or blocker.
- Separate facts, evidence, inference, and decisions needed from the user.
- Explain the useful why behind non-obvious work; keep process logs out of the main narrative.
- Group information by ownership boundary, user impact, or decision area rather than command chronology.
- Ask one concrete question when user input is required; avoid loose option lists unless requested.
- Prefer compact state/evidence/next-action tables for handoffs.


# Design Review

Evaluate an interface as a design director would. Produces structured findings, not fixes.

## Prerequisites

Load the `design:build` skill for design principles and anti-patterns before evaluating.

## Evaluation Dimensions

### 1. AI Slop Detection (First)
Check against all anti-patterns from `design:build`. Would someone immediately believe "AI made this"? List specific tells.

### 2. Visual Hierarchy
- Eye flows to most important element first?
- Clear primary action visible in 2 seconds?
- Size, color, position communicate importance correctly?
- No visual competition between elements of different weight?

### 3. Information Architecture
- Structure intuitive for new users?
- Related content grouped logically?
- Cognitive overload? Too many choices at once?

### 4. Emotional Resonance
- What emotion does this evoke? Is that intentional?
- Would target user feel "this is for me"?

### 5. Composition & Typography
- Layout balanced or uncomfortably weighted?
- Whitespace intentional or leftover?
- Type hierarchy signals read order clearly?
- Font choices reinforce brand/tone?

### 6. Color & Contrast
- Color communicates, not just decorates?
- Palette cohesive? Accent draws attention to right things?
- All text meets WCAG AA (4.5:1 body, 3:1 large)?
- Works for colorblind users?

### 7. Interaction States
- All 8 states designed? (default, hover, focus, active, disabled, loading, error, success)
- Empty states guide users toward action?
- Error states helpful and non-blaming?

### 8. Accessibility
- Semantic HTML, proper heading hierarchy, landmarks?
- Keyboard navigation, focus indicators, tab order?
- ARIA labels on interactive elements?
- Touch targets 44px+?

### 9. Performance
- Layout properties animated? (should be transform/opacity only)
- Images lazy loaded? Appropriate formats?
- Layout shift on load?
- `prefers-reduced-motion` respected?

### 10. Responsive
- Works at mobile/tablet/desktop?
- No horizontal scroll?
- Content adapts, not just shrinks?

## Output Format

### Anti-Patterns Verdict
Pass/fail. List specific tells. Be brutally honest.

### Overall Impression
Gut reaction — what works, biggest opportunity. 2-3 sentences.

### What's Working
2-3 specific strengths with reasoning.

### Priority Issues (3-5 max)
For each:
- **What**: Name the problem
- **Why**: How it hurts users
- **Fix**: Concrete action
- **Severity**: Critical / High / Medium / Low

### Minor Observations
Quick notes on smaller issues.

## Principles
- Direct — vague feedback wastes time
- Specific — "the submit button" not "some elements"
- Prioritized — if everything is important, nothing is
- Actionable — concrete suggestions, not "consider exploring..."
