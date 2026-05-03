---
name: ux-writing
description: Write or improve in-product copy — button labels, error messages, empty states, form helper text, system messages, tooltips, microcopy, onboarding text, accessibility copy, voice and tone calibration. Use when the user mentions "button label", "CTA copy", "error message", "empty state", "form helper text", "tooltip", "microcopy", "system message", "loading state", "in-product copy", "in-app text", "UX writing", "alt text", "ARIA label", "screen reader copy", or asks to "rewrite this label / button / error / empty state". Functional clarity over persuasion — UX writing serves the task, marketing copy persuades. For landing-page / hero / value-prop / marketing copy, see copywriting.
---

# UX Writing

Functional in-product copy. Clarity > persuasion. Terse, action-oriented, system-conscious, accessibility-aware.

## What to do

<what-to-do>

1. **Identify the surface.** Button, error, empty state, loading state, form field, tooltip, system message? Each has its own pattern set.
2. **Identify the moment.** Success, error, neutral, destructive, onboarding? Tone shifts per moment.
3. **Apply the relevant pattern** from the references — don't invent from scratch. Microcopy has well-established patterns; deviation usually means reinventing badly.
4. **Test against the three error questions** when writing errors: What happened? Why? How to fix it?
5. **Check terminology consistency** with rest of product. Build/maintain a project terminology glossary; flag drift.
6. **Apply accessibility checks**: link text standalone-meaningful, alt text describes information, icon buttons labeled, status changes announced.
7. **Account for translation expansion** if the product is or might be translated.

</what-to-do>

## When to load each reference

| Writing | Load |
|---|---|
| Button labels, CTAs, terminology consistency, loading states, confirmations, form instructions, redundant copy detection, translation-friendly phrasing | [`references/ux-writing/microcopy-patterns.md`](../../references/ux-writing/microcopy-patterns.md) |
| Brand voice + per-moment tone calibration | [`references/ux-writing/voice-and-tone.md`](../../references/ux-writing/voice-and-tone.md) |
| Error messages (formula, templates, anti-blame patterns) | [`references/ux-writing/error-messages.md`](../../references/ux-writing/error-messages.md) |
| Empty states (three-part formula, types, anti-patterns) | [`references/ux-writing/empty-states.md`](../../references/ux-writing/empty-states.md) |
| Link text, alt text, ARIA labels, plain language, status announcements | [`references/ux-writing/accessibility-copy.md`](../../references/ux-writing/accessibility-copy.md) |

## Cognitive mode (don't drift to marketing)

UX writing serves the user task. It is not the place for:

- Brand storytelling
- Persuasive narrative
- Excitement / hype
- Marketing superlatives ("supercharge", "unlock", "transform")
- Humor (especially in errors)

If the surface is a marketing landing page or a hero block, hand off to `copywriting`. The line: in-app, in-flow, mid-task → ux-writing. On the marketing site, pre-conversion → copywriting.

## Terminology glossary

When writing for a project that already has terminology choices (Sign in vs Log in, Settings vs Preferences, Delete vs Remove vs Trash), mirror what's there. If terminology is inconsistent across the product, flag it — variety is confusion, not richness.

If the project has no glossary yet, propose one in DESIGN.md or alongside it.

## Voice anchor

`establish` (when run for this project) writes the brand voice to `DESIGN.md`. Read it before writing — voice is project-defined, not generic.

If `DESIGN.md` is missing or has no voice section, ask the user to define voice in 2 examples (one positive, one to avoid) before drafting.

## Accessibility is non-negotiable

Every label, every error, every alt text passes accessibility checks before shipping:

- Link text has standalone meaning out of context.
- Icon buttons have `aria-label`.
- Errors don't depend on color alone.
- Form fields have `<label>` (visible or `sr-only`).
- Status changes use `aria-live` regions.
- Plain language target: grade 8 for consumer surfaces, grade 12 for developer surfaces.
