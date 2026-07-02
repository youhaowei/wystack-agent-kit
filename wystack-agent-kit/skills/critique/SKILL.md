---
name: critique
description: "Adversarially pressure-test a finished design, plan, spec, or PRD — walk every branch, attack every assumption, surface holes, unresolved dependencies, and unstated risks. Findings only, no rewrite. Use when the user says 'critique this', 'poke holes', or 'red-team this design/plan/spec'. For code, see wystack-agent-kit:code-review. For whether a feature works at runtime, see wystack-agent-kit:verify. To turn a fuzzy idea into a design, see wystack-agent-kit:brainstorm."
---
# Critique

Attack a finished design artifact until only the strong structure survives. Findings only — critique surfaces holes, it does not rewrite the doc.

The design-phase analog of `code-review`: `code-review` adversarially reads code, `critique` adversarially reads a design, plan, spec, or PRD.

## Input

`critique [target]` — the artifact under attack: a path, a doc-store URL, or the design in context. Critique needs a *finished artifact* to attack — if there is only a fuzzy idea, stop and point the user at `wystack-agent-kit:brainstorm`.

## Workflow

1. **Load the artifact** — read it in full. If it references a PRD, spec, or prior decisions, read those too — a hole is often a contradiction with context the doc assumes.
2. **Restate the claim** — in one or two lines, what this artifact decides and why. A precise restatement is what makes the attack precise; a vague one produces vague findings.
3. **Attack** — see [What to attack](#what-to-attack). Walk every branch and every dependency. Stopping at the first hole is the failure mode.
4. **Perspective pass (optional)** — `wystack-agent-kit:perspective` on the artifact with `red-team` intent. Advisory; fold its findings into triage. Skip if unavailable.
5. **Triage + report** — separate load-bearing holes from nits, then deliver the findings. Name each hole and where it lives; do not rewrite the doc.

## What to attack

Use the four-axis rubric as a completeness lens ([../brainstorm/SCORING.md](../brainstorm/SCORING.md)) — for every top-level component, is **Goal / Constraints / Criteria / Context** pinned? An unpinned cell is a hole.

Then the adversarial pass:

- **Unstated assumptions** — what must be true for this to work that the doc never says?
- **Unresolved dependencies** — decisions that silently depend on other decisions not yet made.
- **Failure modes** — what breaks this? Concurrency, scale, the unhappy path, the empty case, the partial failure.
- **Contradictions** — claims that fight each other across sections.
- **Scope creep** — what is in the design that the stated goal does not need? (YAGNI.)
- **The rejected turn** — the obvious alternative the doc dismissed or never considered. Is the rejection actually justified?

When the artifact is a spec or PRD, also attack its **doc discipline** (`docs/doc-model.md` § Write the artifact, not the document) — authoring sets the rule, review catches what authoring missed:

- **Doc-meta narration** — sentences about the doc itself, its conventions, or its provenance instead of the architecture/behavior.
- **Non-overview opening** — a first paragraph that frames the section or links out instead of stating what the thing *is*.
- **Over-ceremonied decisions** — a small uncontested choice expanded into a full what/alternatives/why block.
- **Restated code** — interfaces, message shapes, or types prose-copied from the codebase (drift-magnet).
- **A doc that hasn't earned its existence** — could it be deleted with no loss because its content lives in code or another doc? Then it should fold.

## Rules

- **Findings only — never rewrite.** Fixing belongs to the artifact's owner; findings-only keeps critique safe by construction — it edits nothing.
- **Attack the structure, not the person.** Adversarial toward the artifact, collaborative toward its author.
- **Ground every finding.** Cite the section or claim. "This feels weak" with no pointer is noise.
