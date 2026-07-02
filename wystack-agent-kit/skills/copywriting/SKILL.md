---
name: copywriting
description: Write or improve marketing copy for landing pages, homepages, pricing pages, feature pages, about pages, hero sections, value propositions, headlines, subheadlines, CTAs, social proof, comparison pages. Use when the user mentions "write copy", "rewrite this hero", "landing page copy", "pricing page copy", "value prop", "CTA copy", "improve this copy", "copy feedback", or "edit copy". Persuasive narrative, brand voice, conversion-focused. For in-product copy (button labels, errors, empty states, microcopy, system messages), see wystack-agent-kit:ux-writing.
---
# Copywriting

Persuasive marketing copy. Two modes in one skill: write new (greenfield) and edit existing (seven-sweep editorial methodology). Voice serves persuasion; clarity matters but emotional resonance matters too.

## What to do

<what-to-do>

1. **Identify mode**: greenfield write, or edit existing draft? Different process per mode (see below).
2. **Read brand voice** from `DESIGN.md` if present. If voice section is missing, ask for two voice examples (one positive, one anti-pattern) before drafting.
3. **Gather context** — page purpose, audience, primary action, proof points available, traffic source. Skip questions answered by existing project docs (PRD, spec, DESIGN.md).
4. **Apply the six core principles** (below) on first draft.
5. **Run the seven sweeps** ([SEVEN-SWEEPS.md](SEVEN-SWEEPS.md)) on every draft before declaring done — your own draft included.
6. **Provide alternatives** for headlines and CTAs (2–3 options with rationale per).
7. **Annotate decisions** for any non-obvious choice.
8. **Hand off** meta tags / structured data / discoverability work to `wystack-agent-kit:discoverability`.

</what-to-do>

## Cognitive mode (don't drift to UX writing)

Copywriting is *persuasive*. UX writing is *functional*. The line:
- Pre-conversion / marketing surfaces / hero blocks → copywriting
- Post-conversion / in-app / mid-task → ux-writing

Symptoms of drift toward UX writing: copy that reads like instructions, no emotional resonance, all features no benefits.
Symptoms of drift toward marketing slop: superlatives, buzzwords, hype that says nothing.

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

**Sentence rules**:
- One idea per sentence.
- Mix short and long for rhythm.
- Front-load important information.
- Max ~25 words per sentence.

**Paragraph rules**:
- Short paragraphs (2–4 sentences for web).
- Strong opening sentence per paragraph.
- White space for scannability.

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

For deeper page templates by type (homepage, landing, pricing, feature, about), see [PAGE-TYPES.md](PAGE-TYPES.md).

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

Use the seven-sweep methodology — sequential focused passes that each catch issues missed by the others. After each sweep, re-check earlier sweeps to ensure no regressions.

The sweeps:
1. **Clarity** — can the reader understand it?
2. **Voice & tone** — consistent throughout?
3. **So what** — every claim answers "why care?"
4. **Prove it** — every claim has evidence?
5. **Specificity** — concrete enough to be compelling?
6. **Heightened emotion** — does it move the reader?
7. **Zero risk** — every barrier to action removed?

Full methodology with templates, anti-patterns, and checklists: [SEVEN-SWEEPS.md](SEVEN-SWEEPS.md).

## Persuasion psychology

The marketing-psychology reference ([`references/marketing-psychology.md`](../../references/marketing-psychology.md)) lists 70+ mental models for understanding why people buy. Load when:
- Writing pricing copy → anchoring, decoy, framing, mental accounting, charm pricing.
- Building trust → authority, social proof, reciprocity, pratfall.
- Reducing CTA friction → loss aversion, regret aversion, default effect, status-quo bias.
- Driving urgency → scarcity, loss aversion, Zeigarnik.

## Output format

When delivering copy:

1. **Page copy** organized by section (headline, subheadline, CTA, section headers, body, secondary CTAs).
2. **Annotations** for non-obvious choices (which principle / model applied, why this word).
3. **Alternatives** for headlines and CTAs — 2–3 options per, with rationale.
4. **Meta content** if relevant (page title for SEO, meta description) — or hand off to `wystack-agent-kit:discoverability`.

## Common problems → fixes

| Problem | Symptom | Fix |
|---|---|---|
| Wall of features | List of what the product does without why it matters | Add "which means…" after each feature |
| Corporate speak | "Leverage synergies to optimize outcomes" | Ask "How would a human say this?" |
| Weak opening | Starts with company history or vague statements | Lead with the reader's problem or desired outcome |
| Buried CTA | The ask comes after too much buildup | Make CTA obvious, early, and repeated |
| No proof | "Customers love us" with no evidence | Add specific testimonials, numbers, case references |
| Generic claims | "We help businesses grow" | Specify who, how, by how much |
| Mixed audiences | Tries to speak to everyone | Pick one audience and write directly |
| Feature overload | Lists every capability | Focus on 3–5 benefits that matter most |
