---
name: brainstorm
description: "Turn a rough idea or vague request into a validated design before implementation. Use when the user wants to brainstorm an idea, design a feature or subsystem, think a problem through, or explore an approach before building anything non-trivial. Skip bug fixes, clear-scope refactors, and trivial changes."
---
# Brainstorm

Turn a rough idea into a validated design. Two acts: **interview → design**. Stop at acceptance — capturing the artifact and handing off belong to other skills.

`/brainstorm [--light | --grill | --no-docs]`

| Mode | Depth |
|---|---|
| `--light` | Fewer questions — small scope, or a clear existing vision. |
| (default) | Assertive — challenge assumptions, question trade-offs, push on scope. |
| `--grill` | Relentless — walk every branch, resolve dependencies one by one. |
| `--no-docs` | Skip the domain layer (deliberate terminology changes). |

**The pace is the point.** One question per turn — ask, stop, wait for the answer. Never batch questions, including in Round 0. Rushing is the primary failure mode; if it feels slow, it's working.

## Hard gate: no implementation

Until the user explicitly accepts the design:

- **Don't** edit implementation (source, tests, configs, manifests, production docs), commit/push/PR, install, migrate, deploy, or create tickets.
- **Do** read/search code, run non-mutating inspection, and draft options, approaches, and diagrams in chat.

## The center: four-axis loop

Every top-level component is tracked across four dimensions; each question aims at the weakest.

| Axis | Measures |
|---|---|
| **Goal** | Is the purpose specific? What does success look like? |
| **Constraints** | What limits the solution — technical, business, time, resource. |
| **Criteria** | How we know it's good — acceptance, metrics, "done". |
| **Context** | Surrounding state, prior decisions, background the design depends on. |

After each answer, re-score and aim the next question at the weakest cell across all components — this stops one component soaking up attention while siblings stay vague, and forces constraints/criteria onto the agenda. Scoring is a legibility instrument, not a gate ([SCORING.md](./SCORING.md)); stopping is holistic judgment.

## Phases

**Act 1 — Interview**

1. **Explore first** — anything the code answers doesn't get asked. Check the workspace, `CONTEXT.md`, the glossary, existing specs (their Key concepts index and Decisions sections), tasks, competitor profiles.
2. **Detect lens** — pick the fitting framework(s) from [FRAMEWORKS.md](./FRAMEWORKS.md); don't announce it.
3. **Four-axis loop** — one question per turn with a recommended answer; target the weakest axis; smart-skip what's clear. The domain layer runs here: when domain context is load-bearing, challenge terms against their glossary notes, sharpen fuzzy language to canonical names, cross-reference claims with code and prior decisions ([FRAMEWORKS.md §3](./FRAMEWORKS.md)).
4. **Readiness check** — holistic judgment the design is clear enough to propose.

**Act 2 — Design**

5. **Propose 2-3 approaches** — trade-offs, lead with the strongest, push back on smells.
6. **Present the design** — sections scaled to complexity, per-section approval, diagrams where they help.
7. **Acceptance gate** — summarize design, rejected alternatives, guardrails. **Stop until the user explicitly accepts.**

## After acceptance

The accepted design is the deliverable; what happens next:

- **Capture** — write and deliver the design as the artifact it earns.
- **Verify** — `wystack-agent-kit:perspective` for an advisory read; skip if unavailable.
- **Domain** — persist resolved terms and decisions to their canonical homes per `docs/doc-model.md`: each term as a glossary note (`wystack-agent-kit:glossary`), each decision into the spec's (or PRD's) Decisions section, expanding a *contested* one into an ADR when `adr` is enabled.
- **Continue** — one next skill: `prd` / `spec` / `breakdown` / direct implementation. Session ran long → offer `wystack-agent-kit:handoff`.

## Rules

- **Scope map** — maintain a running picture of the major pieces; surface it as prose when the framing shifts ("I'm treating X and Y as separate concerns because…") — never as a formatted list or a question; the user corrects it by how they answer.
- **Persist pushback** — once a constraint is accepted, write it into the artifact that guides implementation.
- **Parallel research** — launch Explore agents while the interview continues.
- **YAGNI** — cut unnecessary scope from every design.

## Escape hatches

- **Impatient / "just do it"** — once: "the hard questions are the value, two more then we move." Pushed twice → stop, ask permission to switch to implementation.
- **Fully-formed plan with real evidence** — skip the interview, still run lens-appropriate review.
- **Vibe shift** — builder mode turning serious ("this could be a real company") upgrades to the idea-validation lens.
