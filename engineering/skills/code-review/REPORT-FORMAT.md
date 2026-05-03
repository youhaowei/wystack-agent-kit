# Report Format

Two formats: the **reviewer brief** (what each reviewer outputs) and the **final report** (what the orchestrator presents to the user).

## Reviewer output (per reviewer)

Each reviewer ends with three sections:

```
## Findings
- **file:line** — description
  Category: Bug | Design | Security | Coverage | Performance | Style | Maintainability | Doc
  Severity (reviewer's initial read): Critical | High | Medium | Low | Nit

## PATTERNS OBSERVED
- **Pattern name** — where (file:line or module); what makes this worth propagating; suggested destination (CLAUDE.md / Spec ADR / KB / inline comment)

## Ship verdict
**SHIP** | **SHIP-WITH-TICKETS: <list>** | **BLOCK: <reason>**

**Argument:** <2–4 sentences weighing the findings above against ship-readiness. Name the specific risk of shipping now vs the specific cost of not shipping. If SHIP-WITH-TICKETS, justify why each deferred finding is safe to defer. If BLOCK, name the one thing that must change before this can merge.>
```

### On PATTERNS

Reviewers surface good practice worth propagating — not just defects. Name the pattern, say where, explain why. _"Well-written"_ without a named pattern doesn't count.

Examples:
- _"Flag-check cancellation via pending IDs"_ (flatter than signal plumbing).
- _"Per-call fresh synthetic Request"_ (immutable adapter boundary).
- _"Hoist-to-export for testability"_ (pure function testable without DI).
- _"Spec-anchored test names"_.

Destinations:
- Project-specific idiom → CLAUDE.md.
- Architectural decision → Spec ADR.
- Tactical pattern → KB + optional inline comment.

### On Ship verdict

Why this matters: reviewers optimized to "find issues" will always find something. Without an explicit ship argument, their findings bias toward blocking by default — noise accumulates faster than it converges. The argument forces them to weigh severity × ship-worthiness in their own voice.

Include the argument even when the verdict is SHIP — _"no findings, ship it"_ is a legitimate argument and locks in that the reviewer actually considered the question.

## Final report (orchestrator)

Single message — don't drip-feed findings.

```
## Review Summary

**Branch**: {branch} → {base} | **Files**: {n} | **Lines**: +{a}/-{r}
**Reviewers**: {list}

### Changes
{2-3 sentences}

### Perspectives
- **Correctness**: {1 sentence}
- **Architecture**: {1 sentence}
- **Tests**: {1 sentence}
- **Fresh eyes**: {1 sentence}
- {specialists}

### Triage summary
| MUST | SUGGEST | PATTERNS |
|---|---|---|
| {n} | {n} | {n} |

### Multi-reviewer agreement
{findings flagged by 2+ reviewers — higher signal}

### MUST ({n})
{numbered: file:line, description, reviewer(s), recommended action (fix on branch / file immediate ticket if out-of-scope)}

### SUGGEST ({n})
{numbered: file:line, description, reviewer, recommended destination (inline comment / KB / ticket-if-triggered)}

### PATTERNS OBSERVED ({n})
{numbered: pattern name, location, why worth capturing, proposed destination}

### Reviewer ship verdicts
| Reviewer | Verdict | Argument (1 line) |
|---|---|---|
| code-reviewer | SHIP / SHIP-WITH-TICKETS / BLOCK | {their argument, compressed} |
| principal | ... | ... |
| qa | ... | ... |
| {specialists} | ... | ... |

### Branch recommendation
{synthesize: if all SHIP or SHIP-WITH-TICKETS → recommend ship; if any BLOCK → lead with the blocker. Do NOT average severity — weigh the arguments. A Critical finding with a compelling "defer-to-ticket" argument from the flagging reviewer is still a SHIP-WITH-TICKETS; a Medium finding with "this changes a documented contract" is a BLOCK.}

---

Actions: (1) Fix inline  (2) Discuss + fix  (3) Discuss only  (4) Skip
```

Report must be self-contained — copy/paste-able into another session.

## Walk-through actions

- **Fix inline**: apply all fixes → re-run preflight → show diff → offer commit.
- **Discuss + fix**: walk findings highest-severity first in the `collaborate` shape — each finding gets its block (title + detail + bold recommendation), then a single prompt asks for batch confirmation. The user responds with one batch (e.g. _"fix #1, #3; defer #2 with ticket; skip rest"_). Don't drip-feed one finding per turn. If a finding genuinely needs deep back-and-forth, break out, discuss, return to the batch.
- **Discuss only**: same walk-through, no fixing.
- **Skip**: acknowledge, continue.
