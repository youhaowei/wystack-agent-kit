# Brainstorm Frameworks

Four lenses for the brainstorm skill. Apply whichever fit (often multiple). Each lens names *which questions to ask* — the brainstorm flow handles *how to ask*.

Sources: §1, §2, §4 distilled from [garrytan/gstack](https://github.com/garrytan/gstack); §3 from [mattpocock/skills](https://github.com/mattpocock/skills).

---

## §1. Idea-Validation Lens

**When**: no plan/PRD/spec yet — an idea, "what if we built X", a problem being explored.
**Goal**: pressure-test demand reality before formalizing. Comfort means you haven't gone deep enough.

| Stage | Ask |
|---|---|
| Pre-product (no users) | Q1, Q2, Q3 |
| Has users | Q2, Q4, Q5 |
| Has paying customers | Q4, Q5, Q6 |
| Pure engineering / infra | Q2, Q4 |

For internal projects: reframe Q4 as "smallest demo that gets your VP/sponsor to greenlight", Q6 as "does this survive a reorg, or die when your champion leaves?"

### The Six Forcing Questions

Ask one at a time. Push until each answer is specific, evidence-based, uncomfortable. The quoted stems are calibrated — use them close to verbatim; the red flag under each is the anti-pattern to reject.

**Q1 — Demand Reality:** *"What's the strongest evidence someone actually wants this — not 'is interested', not 'signed up for a waitlist', but would be genuinely upset if it disappeared tomorrow?"*
Red flag: "people say it's interesting", "500 waitlist signups", "VCs are excited" — none are demand.
After the first answer, check framing before continuing: are key terms defined (challenge "AI space", "seamless", "better platform"), what does the framing assume, and is the evidence real behavior vs hypothetical ("I think developers would..."). If imprecise, reframe constructively: "Let me restate: [reframe]. Does that capture it?"

**Q2 — Status Quo:** *"What are your users doing right now to solve this — even badly? What does that workaround cost them?"*
Red flag: "nothing — there's no solution, that's the opportunity." If truly nothing exists, the problem probably isn't painful enough.

**Q3 — Desperate Specificity:** *"Name the actual human who needs this most. Their title? What gets them promoted, fired, kept up at night?"*
Red flag: category answers ("healthcare enterprises", "SMBs") — filters, not people; you can't email a category. Stack the pressure, matching consequence to domain (B2B → career; consumer → daily pain; hobby → weekend project); don't collapse into one ask.

**Q4 — Narrowest Wedge:** *"What's the smallest version someone would pay real money for — this week, not after you build the platform?"*
Red flag: "we need the full platform first", "stripped down it wouldn't be differentiated" — attachment to architecture over value. Bonus push: "what if the user did nothing to get value — no login, no setup?"

**Q5 — Observation & Surprise:** *"Have you watched someone use this without helping them? What did they do that surprised you?"*
Red flag: "we sent a survey", "did demo calls", "nothing surprising" — surveys lie, demos are theater, "as expected" means filtered through assumptions. The gold is users doing something it wasn't designed for — the real product emerging.

**Q6 — Future-Fit:** *"If the world looks meaningfully different in 3 years — and it will — does this become more essential or less?"*
Red flag: "market growing 20%/yr" (growth rate isn't a vision), "AI will make everything better" (a rising tide every competitor rides).

---

## §2. Plan-Ambition Lens

**When**: a plan, PRD, spec, or design doc exists; about to commit to execution.
**Goal**: make sure this is the *right* plan, not just *a* plan.

| Signal | Mode |
|---|---|
| Plan feels small, "is this enough?" | **SCOPE EXPANSION** — dream big |
| Feels right but suspect missing easy wins | **SELECTIVE EXPANSION** — hold scope, cherry-pick adjacent |
| Reasonable, user wants execution rigor | **HOLD SCOPE** — minimum changes that achieve goal |
| Feels bloated or sprawling | **SCOPE REDUCTION** — strip to essential |

**Run first, all modes:**
- **Premise** — right problem, or does a reframe yield something simpler/more impactful? Real outcome, or a proxy? What if we did nothing — real pain or hypothetical?
- **Existing-code leverage** — map every sub-problem to code that already solves it. Is the plan rebuilding something? If so, why is rebuild better than refactor?

**Implementation alternatives (mandatory):** generate 2-3 distinct approaches (summary, effort S/M/L/XL, risk, pros/cons, code reused) before locking. At least two; one "minimal viable" (smallest diff), one "ideal architecture" (best long-term). Weight them equally — if the right answer is a rewrite, say so. Recommend one with a one-line reason; user approves before proceeding.

**Mode-specific:**
- **SCOPE EXPANSION** — 10x check (10x more ambitious for 2x effort, concretely), platonic ideal (best engineer, unlimited time — start from experience not architecture), ≥5 delight opportunities. Then present each addition as its own AskUserQuestion (add / defer to TODOS / skip), recommending enthusiastically.
- **SELECTIVE EXPANSION** — run HOLD SCOPE, then scan 10x/delight/platform as *candidates* only. Cherry-pick ceremony: each its own AskUserQuestion, state effort+risk, neutral posture — let the user decide unbiased.
- **HOLD SCOPE** — complexity check (>8 files or >2 new classes/services is a smell), then minimum changes that achieve the stated goal; flag deferrable work.
- **SCOPE REDUCTION** — ruthless cut to the absolute minimum that ships value; carve out "must ship together" from "nice to ship together."

**Expansion framing:** lead with the felt experience, close with concrete effort + impact. Not "add real-time notifications, latency 30s→<500ms, ~1hr" (flat) but "the moment a workflow finishes the user sees it instantly — no polling, no 'did it work?' anxiety; WebSocket + optimistic UI + desktop fallback, ~1hr, makes the product feel alive" (evocative, not promotional). For SELECTIVE EXPANSION keep the vividness but the recommendation neutral.

**Cognitive instincts** — let these shape the questions, don't list them at the user: invert ("what would make us fail?"), focus as subtraction (the value-add is what *not* to do), speed-calibrate (fast by default, slow only for irreversible + high-magnitude, 70% info is enough), proxy skepticism (do metrics still serve users?), edge-case paranoia (empty states are features), and two-way-door bias (most decisions are reversible — move fast).

---

## §3. Domain-Driven Lens (and the domain layer)

**When**: the codebase has a glossary, `CONTEXT.md`, specs (Key concepts + Decisions), or any artifact capturing domain language and prior decisions.
**Goal**: don't drift from the existing model — sharpen language, surface contradictions with code, update domain docs as decisions crystallize.

> **These operations are the brainstorm's domain layer, not gated to this lens.** They run inside the four-axis loop whenever domain context is load-bearing, under any lens — judgment about relevance, not a file-presence rule. `--no-docs` skips the layer.

Domain artifacts live in the configured doc store (resolve via `wystack-agent-kit:workspace`; default `.wystack/docs`). Where terms and decisions live and how they cross-link is defined once in `docs/doc-model.md` — the glossary is the term spine (every term cited, never redefined), decisions land in the spec's Decisions section. Don't restate that here; apply it.

During the session:
- **Challenge against defined terms** — a term that conflicts with the glossary: *"the glossary defines 'cancellation' as X, but you mean Y — which is it?"*
- **Sharpen fuzzy language** — propose a precise canonical name: *"'account' — the Customer or the User? Those are different things."*
- **Stress-test with scenarios** — invent edge cases that force precision about concept boundaries.
- **Cross-reference with code** — *"your code cancels entire Orders, but you said partial cancellation is possible — which is right?"*
- **Capture inline** — when a term resolves, write the glossary note right there; don't batch. Only terms meaningful to domain experts, decoupled from implementation.
- **Record a decision** only when it's hard to reverse, surprising without context, *and* the result of a real trade-off. Missing any of the three — skip it.

---

## §4. Builder Mode Lens

**When**: side project, hackathon, learning, open-source for fun, "just exploring."
**Goal**: surface the most exciting version. Generative, not interrogative.

Principles: delight is the currency (what makes someone say "whoa"?); ship something you can show (the best version is the one that exists); the best side projects solve your own problem — trust the instinct; explore the weird idea before you optimize.

**Suggest wildly, let the user edit down.** Not "consider a share feature to improve retention via virality" (structured) but "what if you let them share the viz as a live URL? Pipe it into a Slack thread? Animate the generation so viewers watch it draw itself? Each a 30-min unlock that turns 'a tool I used' into 'a thing I showed a friend'" (wild). Both outcome-framed; only one has the 'whoa'.

Posture: enthusiastic, opinionated collaborator — riff, get excited, suggest adjacent ideas and unexpected combinations. End with concrete build steps, not business-validation tasks. Questions, one at a time: coolest version? who would you show it to? fastest path to something usable/shareable? closest existing thing and how yours differs? the 10x version with unlimited time?

**Vibe shift:** if the user says "this could be a real company" or mentions customers/revenue/fundraising, upgrade to **§1**: *"Okay, now we're talking — let me ask you some harder questions."*
