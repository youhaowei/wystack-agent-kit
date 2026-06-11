# Brainstorm Frameworks

Four lenses for the brainstorm skill. Apply whichever fit the context (often multiple). Each lens names *which questions to ask* — the brainstorm flow handles *how to ask*.

Sources:
- §1, §2, §4: distilled from [garrytan/gstack](https://github.com/garrytan/gstack) (`office-hours`, `plan-ceo-review`)
- §3: distilled from [mattpocock/skills](https://github.com/mattpocock/skills) (`grill-with-docs`)

---

## §1. Idea-Validation Lens

**When**: no plan/PRD/spec yet — just an idea, "what if we built X", or a problem the user is exploring.

**Goal**: pressure-test demand reality before formalizing into a PRD. Comfort means you haven't gone deep enough.

### Smart routing by stage

| Stage | Ask |
|---|---|
| Pre-product (no users) | Q1, Q2, Q3 |
| Has users | Q2, Q4, Q5 |
| Has paying customers | Q4, Q5, Q6 |
| Pure engineering / infra | Q2, Q4 |

For internal projects, reframe Q4 as "smallest demo that gets your VP/sponsor to greenlight" and Q6 as "does this survive a reorg, or die when your champion leaves?"

### The Six Forcing Questions

Ask one at a time. Push until each answer is specific, evidence-based, uncomfortable.

#### Q1: Demand Reality

> "What's the strongest evidence you have that someone actually wants this — not 'is interested,' not 'signed up for a waitlist,' but would be genuinely upset if it disappeared tomorrow?"

**Push until**: specific behavior. Someone paying. Someone expanding usage. Someone building their workflow around it. Someone who'd scramble if you vanished.

**Red flags**: "People say it's interesting." "We got 500 waitlist signups." "VCs are excited about the space." None are demand.

**After first answer, check framing before continuing**:
1. **Language precision** — are key terms defined? "AI space," "seamless," "better platform" → challenge "what do you mean? Can you define it so I could measure it?"
2. **Hidden assumptions** — what does the framing take for granted? Name one and ask if it's verified.
3. **Real vs hypothetical** — "I think developers would want..." is hypothetical. "Three developers at my last job spent 10 hrs/wk on this" is real.

If framing is imprecise, reframe constructively: "Let me try restating: [reframe]. Does that capture it?"

#### Q2: Status Quo

> "What are your users doing right now to solve this problem — even badly? What does that workaround cost them?"

**Push until**: specific workflow. Hours spent. Dollars wasted. Tools duct-taped together. People hired to do it manually.

**Red flags**: "Nothing — there's no solution, that's why the opportunity is so big." If truly nothing exists, the problem probably isn't painful enough.

#### Q3: Desperate Specificity

> "Name the actual human who needs this most. What's their title? What gets them promoted? What gets them fired? What keeps them up at night?"

**Push until**: a name. A role. A specific consequence. Ideally something heard from that person's mouth.

**Red flags**: category-level answers. "Healthcare enterprises." "SMBs." "Marketing teams." Filters, not people. You can't email a category.

**Forcing exemplar**:
> "Name the actual human. Not 'product managers at mid-market SaaS companies' — an actual name, an actual title, an actual consequence. If this is a career problem, whose career? If this is a daily pain, whose day? If this is a creative unlock, whose weekend project becomes possible? If you can't name them, you don't know who you're building for — and 'users' isn't an answer."

The pressure is in the stacking — don't collapse it into a single ask. Match the consequence to the domain (B2B → career; consumer → daily pain; hobby → weekend project).

#### Q4: Narrowest Wedge

> "What's the smallest possible version of this that someone would pay real money for — this week, not after you build the platform?"

**Push until**: one feature. One workflow. Maybe a weekly email or single automation. Something shippable in days, not months.

**Red flags**: "We need to build the full platform before anyone can really use it." "We could strip it down but then it wouldn't be differentiated." Founder is attached to the architecture rather than the value.

**Bonus push**: "What if the user didn't have to do anything at all to get value? No login, no integration, no setup. What would that look like?"

#### Q5: Observation & Surprise

> "Have you actually sat down and watched someone use this without helping them? What did they do that surprised you?"

**Push until**: a specific surprise. Something the user did that contradicted the founder's assumptions.

**Red flags**: "We sent out a survey." "We did some demo calls." "Nothing surprising." Surveys lie. Demos are theater. "As expected" means filtered through existing assumptions.

**The gold**: users doing something the product wasn't designed for. That's often the real product trying to emerge.

#### Q6: Future-Fit

> "If the world looks meaningfully different in 3 years — and it will — does your product become more essential or less?"

**Push until**: specific claim about how users' world changes and why that change makes the product more valuable. Not "AI keeps getting better so we keep getting better" — that's a rising tide every competitor can make.

**Red flags**: "The market is growing 20% per year." Growth rate is not a vision. "AI will make everything better." Not a thesis.

---

## §2. Plan-Ambition Lens

**When**: a plan, PRD, spec, or design doc exists. About to commit to execution.

**Goal**: make sure this is the *right* plan, not just *a* plan. Push on ambition AND scope before locking in.

### Mode selection

Pick one based on signal:

| Signal | Mode |
|---|---|
| Plan feels small, user wonders "is this enough?" | **SCOPE EXPANSION** — dream big |
| Plan feels right but suspect we're missing easy wins | **SELECTIVE EXPANSION** — hold scope, cherry-pick adjacent |
| Plan looks reasonable, user wants execution rigor | **HOLD SCOPE** — minimum changes that achieve goal |
| Plan feels bloated or sprawling | **SCOPE REDUCTION** — strip to essential |

### Premise Challenge (run first, all modes)

Before any expansion or reduction:

1. **Right problem?** Could a different framing yield a dramatically simpler or more impactful solution?
2. **Real outcome?** What's the actual user/business outcome? Is the plan the most direct path, or is it solving a proxy problem?
3. **Do nothing?** What would happen if we did nothing? Real pain or hypothetical?

### Existing-code leverage (run first, all modes)

1. What existing code already partially or fully solves each sub-problem? Map every sub-problem to existing code.
2. Is this plan rebuilding anything that already exists? If yes, why is rebuilding better than refactoring?

### Implementation alternatives (mandatory, all modes)

Generate 2-3 distinct approaches before locking the plan:

```
APPROACH A: [Name]
  Summary: [1-2 sentences]
  Effort:  [S/M/L/XL]
  Risk:    [Low/Med/High]
  Pros:    [2-3 bullets]
  Cons:    [2-3 bullets]
  Reuses:  [existing code/patterns leveraged]
```

**Rules**:
- At least 2 approaches required.
- One must be "minimal viable" (fewest files, smallest diff).
- One must be "ideal architecture" (best long-term trajectory).
- **Equal weight** — don't default to "minimal viable" just because it's smaller. If the right answer is a rewrite, say so.
- Recommend one with a one-line reason. User approves before proceeding.

### Mode-specific analysis

**SCOPE EXPANSION** — run all three:
1. **10x check** — what's the version 10x more ambitious for 2x the effort? Describe concretely.
2. **Platonic ideal** — if the best engineer in the world had unlimited time and perfect taste, what would this look like? Start from experience, not architecture.
3. **Delight opportunities** — what adjacent 30-min improvements would make this sing? List ≥5.

Then **expansion opt-in ceremony**: present each scope proposal as its own AskUserQuestion. Recommend enthusiastically. Options: A) add to scope, B) defer to TODOS, C) skip.

**SELECTIVE EXPANSION** — run HOLD SCOPE first, then expansion scan:
1. **Complexity check** — if the plan touches >8 files or introduces >2 new classes/services, treat as a smell.
2. **Minimum changes** — what's the minimum that achieves the stated goal? Flag deferrable work.
3. **Expansion scan as candidates** — 10x check, delight opportunities, platform potential. Don't add to scope yet.
4. **Cherry-pick ceremony** — neutral recommendation posture. Each opportunity gets its own AskUserQuestion. State effort + risk. Let user decide without bias.

**HOLD SCOPE** — run:
1. **Complexity check** — see above.
2. **Minimum changes** — see above.

**SCOPE REDUCTION** — run:
1. **Ruthless cut** — absolute minimum that ships value. Everything else deferred. No exceptions.
2. **Follow-up PR carve-out** — separate "must ship together" from "nice to ship together."

### Expansion framing (when proposing scope additions)

Lead with the felt experience, close with concrete effort and impact.

FLAT (avoid): "Add real-time notifications. Latency drops from 30s polling to <500ms push. Effort: ~1hr."

EXPANSIVE (aim for): "Imagine the moment a workflow finishes — the user sees the result instantly, no tab-switching, no polling, no 'did it actually work?' anxiety. Real-time turns a tool they check into a tool that talks to them. Concrete shape: WebSocket + optimistic UI + desktop notification fallback. Effort: ~1hr. Makes the product feel 10x more alive."

For SELECTIVE EXPANSION: vivid options, neutral recommendation. "Makes the product feel 10x more alive" is vivid; "this would 10x your revenue" is over-sell. Evocative, not promotional.

### Cognitive instincts (internalize, don't enumerate)

These shape perspective during ambition review. Don't list them at the user — let them inform the questions you ask.

- **Inversion reflex** — for every "how do we win?" also ask "what would make us fail?" (Munger)
- **Focus as subtraction** — primary value-add is what to *not* do (Jobs)
- **Speed calibration** — fast is default; only slow for irreversible + high-magnitude decisions; 70% information is enough (Bezos)
- **Proxy skepticism** — are our metrics still serving users or have they become self-referential? (Bezos Day 1)
- **Edge case paranoia** — what if name is 47 chars? Zero results? Network fails mid-action? Empty states are features.
- **Subtraction default** — "as little design as possible" (Rams). If a UI element doesn't earn its pixels, cut it.
- **Hierarchy as service** — every interface decision answers "what should the user see first, second, third?"
- **Two-way doors** — most decisions are reversible; move fast. Save deliberation for one-way doors.

---

## §3. Domain-Driven Lens (and the domain layer)

**When**: codebase has a glossary, `CONTEXT.md`, specs (with their Key concepts index and Decisions sections), `DESIGN.md`, `PRODUCT.md`, or any artifact that captures domain language and prior decisions.

**Goal**: don't drift from the existing model. Sharpen language, surface contradictions with code, update domain docs inline as decisions crystallize.

> **The operations below are the brainstorm's domain layer — not gated to this lens.** They run inside the four-axis loop (phase 3) whenever domain context is load-bearing for the conversation, under any lens. Activation is judgment about relevance, not a file-presence rule: if domain docs exist, use them; if a conversation is domain-heavy without docs yet, the operations still apply. `--no-docs` skips the layer entirely.

### What to look for

Domain artifacts live in the configured doc store (resolve via `wystack-agent-kit:workspace`; default local home `.wystack/docs`), not a fixed repo folder:

- **Ubiquitous language** — every domain term lives in a glossary note (`wystack-agent-kit:glossary`), cited from specs (their Key concepts index), PRD, and stories. Some repos also keep a root `CONTEXT.md` / `CONTEXT-MAP.md` for quick domain orientation.
- **Prior decisions** — recorded in the Decisions section of the relevant spec (`wystack-agent-kit:spec`), or in the PRD for product-level decisions. Read them to avoid re-litigating settled trade-offs.

Create lazily — only when you have something to write. No term defined yet? Add it when the first one resolves — as a glossary note via `wystack-agent-kit:glossary`. A decision worth keeping lands in the spec's (or PRD's) Decisions section (see "Record decisions sparingly" below).

### During the session

**Challenge against the defined terms**

When the user uses a term that conflicts with existing language, call it out immediately:
> "The glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

**Sharpen fuzzy language**

When the user uses vague or overloaded terms, propose a precise canonical name:
> "You're saying 'account' — do you mean the Customer or the User? Those are different things."

**Discuss concrete scenarios**

When domain relationships come up, stress-test with specific scenarios. Invent edge cases that force the user to be precise about boundaries between concepts.

**Cross-reference with code**

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it:
> "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

**Update terms inline**

When a term resolves, capture it *right there* — as a glossary note via `wystack-agent-kit:glossary`, and `CONTEXT.md` if the repo keeps one. Don't batch. Only include terms meaningful to domain experts — don't couple to implementation details.

**Record decisions sparingly**

Add a decision to the spec's (or PRD's) Decisions section only when ALL THREE are true:

1. **Hard to reverse** — cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why this way?"
3. **Result of a real trade-off** — there were genuine alternatives, you picked one for specific reasons

If any of the three is missing, skip it — don't clutter the Decisions section with the obvious.

---

## §4. Builder Mode Lens

**When**: side project, hackathon, learning, open-source for fun, "just exploring."

**Goal**: surface the most exciting version. Generative, not interrogative.

### Operating principles

1. **Delight is the currency** — what makes someone say "whoa"?
2. **Ship something you can show people.** Best version is the one that exists.
3. **The best side projects solve your own problem.** If for yourself, trust the instinct.
4. **Explore before you optimize.** Try the weird idea first. Polish later.

### Wild exemplar

STRUCTURED (avoid): "Consider adding a share feature. This would improve retention by enabling virality."

WILD (aim for): "Oh — and what if you also let them share the visualization as a live URL? Or pipe it into a Slack thread? Or animate the generation so viewers see it draw itself? Each one's a 30-minute unlock. Any of them turn this from 'a tool I used' into 'a thing I showed a friend.'"

Both outcome-framed. Only one has the 'whoa.' Lead with the fun; let the user edit it down.

### Posture

- **Enthusiastic, opinionated collaborator.** Riff on their ideas. Get excited about what's exciting.
- **Help find the most exciting version.** Don't settle for the obvious version.
- **Suggest cool things they might not have thought of.** Adjacent ideas, unexpected combinations, "what if you also..." suggestions.
- **End with concrete build steps**, not business validation tasks. Deliverable is "what to build next."

### Questions (generative)

Ask one at a time. Goal is to brainstorm and sharpen, not interrogate.

- "What's the coolest version of this? What would make it genuinely delightful?"
- "Who would you show this to? What would make them say 'whoa'?"
- "What's the fastest path to something you can actually use or share?"
- "What existing thing is closest to this, and how is yours different?"
- "What would you add if you had unlimited time? What's the 10x version?"

### Vibe shift detection

If user starts in builder mode but says "actually I think this could be a real company" or mentions customers/revenue/fundraising — upgrade to **§1 Idea-Validation Lens**. Say something like:
> "Okay, now we're talking — let me ask you some harder questions."

Then switch to the Six Forcing Questions.
