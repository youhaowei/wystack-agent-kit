---
name: ux-writing
description: Write or improve in-product copy — button labels, error messages, empty states, form helper text, system messages, tooltips, microcopy, onboarding text, accessibility copy, voice and tone calibration. Use when the user mentions "button label", "error message", "empty state", "form helper text", "tooltip", "microcopy", "system message", "loading state", "in-product copy", "in-app text", "UX writing", "alt text", "ARIA label", "screen reader copy", or asks to "rewrite this label / button / error / empty state". Functional clarity over persuasion — UX writing serves the task, marketing copy persuades. For landing-page / hero / value-prop / marketing copy, see wystack-agent-kit:copywriting.
---
# UX Writing

Functional in-product copy. Clarity > persuasion. Terse, action-oriented, system-conscious, accessibility-aware.

## What to do

1. **Identify the surface** (button, error, empty state, loading, form field, tooltip, system message) and **the moment** (success, error, neutral, destructive, onboarding) — each has its own patterns and tone.
2. **Apply the relevant reference pattern** — don't invent; deviation from established microcopy patterns usually means reinventing badly.
3. **For errors, answer the three questions**: What happened? Why? How to fix it?
4. **Mirror existing terminology**; flag drift.
5. **Pass accessibility checks** (below) and account for translation expansion if the product is or may be translated.

## When to load each reference

| Writing | Load |
|---|---|
| Button labels, CTAs, terminology consistency, loading states, confirmations, form instructions, redundant copy detection, translation-friendly phrasing | [`references/ux-writing/microcopy-patterns.md`](../../references/ux-writing/microcopy-patterns.md) |
| Brand voice + per-moment tone calibration | [`references/ux-writing/voice-and-tone.md`](../../references/ux-writing/voice-and-tone.md) |
| Error messages (formula, templates, anti-blame patterns) | [`references/ux-writing/error-messages.md`](../../references/ux-writing/error-messages.md) |
| Empty states (three-part formula, types, anti-patterns) | [`references/ux-writing/empty-states.md`](../../references/ux-writing/empty-states.md) |
| Link text, alt text, ARIA labels, plain language, status announcements | [`references/ux-writing/accessibility-copy.md`](../../references/ux-writing/accessibility-copy.md) |

## Cognitive mode (don't drift to marketing)

UX writing serves the task — no brand storytelling, persuasive narrative, hype, marketing superlatives ("supercharge", "unlock", "transform"), or humor (especially in errors). Marketing landing page or hero block → hand off to `wystack-agent-kit:copywriting`. The line: in-app, mid-task → ux-writing; marketing site, pre-conversion → copywriting.

## Terminology consistency

Mirror the product's existing choices (Sign in vs Log in, Settings vs Preferences, Delete vs Remove vs Trash). If they're inconsistent across the product, flag it — variety is confusion, not richness.

## Voice anchor

Read brand voice from `DESIGN.md` before writing — it's project-defined, written by `wystack-agent-kit:establish-design`, not generic. If missing or has no voice section, ask the user for 2 examples (one positive, one to avoid) before drafting.

## Accessibility is non-negotiable

Every label, error, and alt text passes before shipping:

- Link text has standalone meaning out of context.
- Icon buttons have `aria-label`.
- Errors don't depend on color alone.
- Form fields have `<label>` (visible or `sr-only`).
- Status changes use `aria-live` regions.
- Plain language target: grade 8 for consumer surfaces, grade 12 for developer surfaces.
