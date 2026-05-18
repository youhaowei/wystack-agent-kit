# Review Loop

The convergence loop shared by review-driven workflows: iterate **assess → fix → re-assess** until the work is clean. `engineering:finish-task` runs it twice — once around `code-review`, then around `full-review`. `engineering:code-review` follows it for standalone multi-round use.

The loop is generic over the assessment — what runs each round varies (one lens or three); the round structure, fix policy, and exit gate do not.

## A round

1. **Assess** — run the assessment (a reviewer, or a multi-lens review) over the current diff.
2. **Triage** — classify every finding **MUST** / **SUGGEST** (`skills/code-review/SEVERITY.md`).
3. **Fix** — apply the fix policy below.
4. **Re-assess** — if anything was fixed, loop back to step 1 over the updated diff. A fix can introduce a new finding; an unverified fix is not a fix.

## Fix policy

- **MUST** — always fixed. These gate.
- **SUGGEST** — judgment, not a reflex:
  - **Cheap and in touched code** → fix now. Filing a ticket for a one-line hygiene fix costs more than the fix.
  - **Expensive, out-of-scope (pulls in untouched code), or speculative (no observed bug)** → defer to a follow-up ticket.

Fixing a cheap SUGGEST in touched code is hygiene. Fixing one that expands the diff into untouched code is scope drift — defer it.

## Exit gate

Converged = **zero MUST + every reviewer ships / accepts**. SUGGESTs never gate — open SUGGESTs are fine to land with, once their follow-up tickets exist.

## Stop / escalate signals

- **Scope drift** — a MUST surfaced *inside* a previous round's fix means that fix was out of scope. File it as a separate ticket; don't pile more onto the branch.
- **Round budget** — soft 2–3 rounds for well-scoped work. Round 5+ still surfacing MUSTs → stop and triage the cause: scope too broad, requirements unclear, or reviewers disagreeing on "correct."
- **Stall** — the same finding recurring across rounds without convergence → surface to a human; don't loop blindly.
