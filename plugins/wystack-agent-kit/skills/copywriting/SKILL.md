---
name: copywriting
description: Write or improve marketing copy for landing pages, homepages, pricing pages, feature pages, about pages, hero sections, value propositions, headlines, subheadlines, CTAs, social proof, comparison pages. Use when the user mentions "write copy", "rewrite this hero", "landing page copy", "pricing page copy", "value prop", "CTA copy", "improve this copy", "copy feedback", or "edit copy". Persuasive narrative, brand voice, conversion-focused. For in-product copy (button labels, errors, empty states, microcopy, system messages), see wystack-agent-kit:ux-writing.
---
# Copywriting

Persuasive marketing copy. Two modes in one skill: write new (greenfield) and edit existing (seven-sweep editorial methodology). Voice serves persuasion; clarity matters but emotional resonance matters too.

## What to do

1. **Identify mode**: greenfield write, or edit existing draft? Process differs per mode (below).
2. **Read brand voice** from `DESIGN.md` if present. If the voice section is missing, ask for two examples (one positive, one anti-pattern) before drafting.
3. **Gather context** — page purpose, audience, primary action, proof points, traffic source. Skip what project docs (PRD, spec, DESIGN.md) already answer.
4. **Apply the six core principles** on the first draft; **run the seven sweeps** on every draft before declaring done, your own included.
5. **Deliver** per the output format: alternatives for headlines and CTAs, annotations for non-obvious choices.
6. **Hand off** meta tags / structured data / discoverability to `wystack-agent-kit:discoverability`.

## Cognitive mode (don't drift to UX writing)

Copywriting is *persuasive*, UX writing is *functional*. Pre-conversion / marketing / hero blocks → copywriting; post-conversion / in-app / mid-task → ux-writing. Drift toward UX writing reads like instructions (features, no benefits, no resonance); drift toward slop piles on superlatives and buzzwords that say nothing.

## Six core principles

1. **Clarity over cleverness.** Choose clear if forced to pick.
2. **Benefits over features.** Features = what it does. Benefits = what that means for the customer. Bridge with "which means…".
3. **Specificity over vagueness.** "Cut weekly reporting from 4 hours to 15 minutes" beats "save time on your workflow".
4. **Customer language over company language.** Mirror voice-of-customer from reviews, support tickets, interviews.
5. **One idea per section.** Each section advances one argument; build a logical flow down the page.
6. **Honest over sensational.** Never fabricate stats, testimonials, or capabilities.

## Style rules

**Cut these words**: very, really, extremely, incredibly, just, actually, basically, in order to, that (often), things/stuff.

**Replace these**:

| Weak | Strong |
|---|---|
| Utilize | Use |
| Implement | Set up |
| Leverage | Use |
| Facilitate | Help |
| Innovative | New |
| Robust | Strong |
| Seamless | Smooth |
| Cutting-edge | New / Modern |
| Streamline | (be specific about what step is removed) |
| Optimize | (be specific about what improves) |

**Sentences**: one idea each, front-loaded, ~25 words max; mix short and long for rhythm.
**Paragraphs**: 2–4 sentences for web, strong opener, white space for scannability.

## Page structure framework

### Above the fold

- **Headline** — single most important message. Communicate core value prop. Specific > generic.
  - Formulas: "{Achieve outcome} without {pain point}" · "The {category} for {audience}" · "Never {unpleasant event} again" · "{Question highlighting main pain point}"
- **Subheadline** — expands on headline, adds specificity. 1–2 sentences.
- **Primary CTA** — action-oriented button text. Communicate what they get: "Start free trial" > "Sign up".

### Core sections

| Section | Purpose |
|---|---|
| Social proof | Credibility (logos, stats, testimonials) |
| Problem / pain | Show you understand their situation |
| Solution / benefits | Connect to outcomes (3–5 key benefits) |
| How it works | Reduce perceived complexity (3–4 steps) |
| Objection handling | FAQ, comparisons, guarantees |
| Final CTA | Recap value, repeat CTA, risk reversal |

For deeper page templates by type (homepage, landing, pricing, feature, about), see [PAGE-TYPES.md](PAGE-TYPES.md); for competitor/alternative pages, [COMPARISON-PAGES.md](COMPARISON-PAGES.md).

## CTA copy

**Avoid**: Submit, Sign Up, Learn More, Click Here, Get Started.

**Prefer**: `[Action Verb] + [What They Get] + [Qualifier if needed]`

| Bad | Good |
|---|---|
| Sign up | Start free trial |
| Get started | Create your first project |
| Learn more | See pricing |
| Submit | Get the checklist |

## Editing existing copy

Run the seven-sweep methodology — sequential focused passes (Clarity → Voice & tone → So what → Prove it → Specificity → Heightened emotion → Zero risk), each re-verifying the earlier ones. Full method: [SEVEN-SWEEPS.md](SEVEN-SWEEPS.md).

## Persuasion psychology

The marketing-psychology reference ([`references/marketing-psychology.md`](../../references/marketing-psychology.md)) lists 70+ mental models for understanding why people buy. Load when:
- Writing pricing copy → anchoring, decoy, framing, mental accounting, charm pricing.
- Building trust → authority, social proof, reciprocity, pratfall.
- Reducing CTA friction → loss aversion, regret aversion, default effect, status-quo bias.
- Driving urgency → scarcity, loss aversion, Zeigarnik.

## Output format

Deliver: page copy organized by section (headline, subheadline, CTA, section headers, body, secondary CTAs); 2–3 headline/CTA alternatives each with rationale; annotations for non-obvious choices (principle/model applied); meta content if relevant (SEO title, meta description).

## Common problems → fixes

Beyond the principles and sweeps above, watch for:

| Problem | Symptom | Fix |
|---|---|---|
| Weak opening | Starts with company history or vague statements | Lead with the reader's problem or desired outcome |
| Buried CTA | The ask comes after too much buildup | Make the CTA obvious, early, and repeated |
| Mixed audiences | Tries to speak to everyone | Pick one audience and write directly |
