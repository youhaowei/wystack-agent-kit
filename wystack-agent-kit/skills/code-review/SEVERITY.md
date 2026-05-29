# Severity Model

Two labels, not five. Applied by the orchestrator (the calling skill) when consolidating reviewer findings. Reviewers keep using their native labels (Critical/High/Medium/Low/Nit) as input signal — the orchestrator re-classifies. Forcing reviewers to pre-triage reduces recall.

Shared between `wystack-agent-kit:code-review` and `wystack-agent-kit:full-review`.

## MUST — merge gate

Fix on branch. If a MUST is genuinely out-of-branch-scope, that is a deferral — recommend a follow-up ticket with owner; it is filed only on the user's explicit pick, never auto-created.

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

The **near-term-trigger test** informs whether to *recommend* a follow-up ticket — it does not file one. Recommend a ticket when:

1. Known near-term work will touch this area, OR
2. Hard deadline, OR
3. Blocks a committed PRD.

Otherwise the recommendation is: inline comment + KB note. Either way, a ticket is filed only on the user's explicit pick.

## Not in this model

- Speculative findings ("this could fail under X") — not a current-branch MUST; surface them with a deferral recommendation, not a filed ticket.
- Stylistic preferences absent a maintainability hazard — these are SUGGEST at most.
- Findings about code outside the diff — recommend separate tickets; the user picks what gets filed.
