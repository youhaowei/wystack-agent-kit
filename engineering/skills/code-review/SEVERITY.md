# Severity Model

Two labels, not five. Applied by the orchestrator (the calling skill) when consolidating reviewer findings. Reviewers keep using their native labels (Critical/High/Medium/Low/Nit) as input signal — the orchestrator re-classifies. Forcing reviewers to pre-triage reduces recall.

Shared between `engineering:code-review` and `engineering:full-review`.

## MUST — merge gate

Fix on branch, OR file an immediate ticket with owner if out-of-branch-scope.

Includes:

- **Correctness bugs** — observed, not speculative.
- **AC violations**, security holes.
- **Inaccurate comments or docs** — treat as code.
- **Test issues** — tests asserting X but claiming Y; 0-expect tests; tests encoding current behavior vs spec contract; existence smoke tests that catch no behavioral bug.
- **Maintainability hazards** — bright-line test: _"will a future engineer reading this cold be wrong about what it does, or need to read unrelated code?"_ If YES → MUST.

Maintainability triggers:
- Function does 3+ unrelated things.
- Name misleads.
- Duplicated logic across 3+ sites.
- Abstraction leak.
- Implicit invariant that would break on plausible refactor.
- Dead code.
- File > 500 lines with mixed concerns.

## SUGGEST — nice-to-have

Inline comment at the code site by default. **Tickets are commitments, not memory.**

File as a ticket only if the **near-term-trigger test** passes:

1. Known near-term work will touch this area, OR
2. Hard deadline, OR
3. Blocks a committed PRD.

Otherwise: inline comment + KB note.

## Not in this model

- Speculative findings ("this could fail under X") — defer to a follow-up ticket, not the current branch's MUST list.
- Stylistic preferences absent a maintainability hazard — these are SUGGEST at most.
- Findings about code outside the diff — file as separate tickets.
