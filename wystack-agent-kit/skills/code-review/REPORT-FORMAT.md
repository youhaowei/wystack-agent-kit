# Report Format

Two formats: the **reviewer brief** (what each reviewer outputs) and the **final report** (what the orchestrator presents to the user).

## Reviewer output (per reviewer)

Each reviewer ends with four sections:

```
## Insight
<3-5 sentences: what this branch changes, the main architectural boundary/contract touched, strongest positive pattern, and most important risk to watch. Use evidence from the diff/context; say "No architectural signal" if the change is too small.>

## Findings
- **title** — one-line headline
  Category: bug | security | performance | concurrency | api-contract | data-loss | test-gap | docs-gap | build-release | maintainability
  Severity: critical | high | medium | low
  Confidence: high | medium | low
  Evidence:
    - `path:startLine` — "verbatim quote from diff/context (≤240 chars)"
  Reasoning: why this matters (not a restatement of the title)
  Reproduction: steps to observe, or omit when not applicable
  Recommendation: smallest correct fix or defer destination
  Min fix scope: files/symbols that must change (optional)
  Suggested regression tests: (optional bullet list)

## PATTERNS OBSERVED
- **Pattern name** — where (file:line or module); what makes this worth propagating; suggested destination (CLAUDE.md / spec / KB / inline comment)

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
- Architectural decision → the spec's Decisions section (`wystack-agent-kit:spec`).
- Tactical pattern → KB + optional inline comment.

### On Ship verdict

Why this matters: reviewers optimized to "find issues" will always find something. Without an explicit ship argument, their findings bias toward blocking by default — noise accumulates faster than it converges. The argument forces them to weigh severity × ship-worthiness in their own voice.

Include the argument even when the verdict is SHIP — _"no findings, ship it"_ is a legitimate argument and locks in that the reviewer actually considered the question.

## Final report (orchestrator)

Single message — don't drip-feed findings.

### Clarity contract

The final report is a decision artifact, not a work log.

- Lead with the recommendation and any decision needed from the user.
- Prefer state over chronology: say what is true now, not the order you discovered it.
- Group by ownership/boundary when multiple repos, submodules, packages, or worktrees are involved.
- Keep process evidence in `Verification Evidence`; do not narrate every command inline.
- If the next action is obvious, recommend it directly. If user approval is required, ask one concrete question.

```
## Review Summary

### Recommendation
{SHIP / SHIP-WITH-TICKETS / BLOCK / NEEDS USER DECISION} — {one-sentence reason}

### Decision Needed
{None / the one concrete user choice needed. Example: "Approve pushing the submodule branch and then the parent repo pointer."}

**PR**: {#number + title + URL, or "No open PR found"}
**Branch**: {branch} → {base} | **Files**: {n} | **Lines**: +{a}/-{r}
**Reviewers**: {list}

### PR Summary
{3-5 bullets max, grouped by current state: intent, actual diff, user-facing impact, live PR/check/review state. No chronological narration.}

### Diff Shape
- **Primary modules**: {module/file clusters touched}
- **Data/control flow**: {what path changes at runtime}
- **Tests/docs**: {coverage/doc changes or absence}

### Architectural Insight
{1-2 short paragraphs. Explain the boundary/contract this PR touches, whether the implementation deepens or muddies that boundary, and any reusable pattern worth carrying forward. Ground this in files/modules, not vibes. If no meaningful architectural change exists, say so.}

### Risk Read
- **Highest ship risk**: {specific risk or "none found"}
- **Most fragile assumption**: {assumption from code/context, or "none identified"}
- **Evidence quality**: {strong/moderate/weak, based on context, tests, and runtime/check evidence}

### Perspectives
- **Correctness**: {1 sentence}
- **Architecture**: {1 sentence}
- **Tests**: {1 sentence}
- **Fresh eyes**: {1 sentence}

### Triage summary
| MUST | SUGGEST | PATTERNS |
|---|---|---|
| {n} | {n} | {n} |

### Multi-reviewer agreement
{findings flagged by 2+ reviewers — higher signal}

### MUST ({n})
{numbered: title, evidence (path + quote), gate=must, severity, confidence, reasoning, reviewer(s), recommendation, min fix scope when known}

### SUGGEST ({n})
{numbered: title, evidence, gate=suggest, severity, confidence, reasoning, reviewer, recommended destination (inline comment / KB / follow-up — filed only on user approval)}

### PATTERNS OBSERVED ({n})
{numbered: pattern name, location, why worth capturing, proposed destination}

### Reviewer ship verdicts
| Reviewer | Verdict | Argument (1 line) |
|---|---|---|
| code-reviewer | SHIP / SHIP-WITH-TICKETS / BLOCK | {their argument, compressed} |
| principal | ... | ... |
| qa | ... | ... |

### Branch recommendation
{synthesize: if all SHIP or SHIP-WITH-TICKETS → recommend ship; if any BLOCK → lead with the blocker. Do NOT average severity — weigh the arguments. A Critical finding with a compelling "defer-to-ticket" argument from the flagging reviewer is still a SHIP-WITH-TICKETS; a Medium finding with "this changes a documented contract" is a BLOCK.}

### Verification Evidence
{compact table or bullets: check/runtime evidence, result, scope. If only static review happened, say "Static only" and name the missing confidence signal.}

---

Actions: (1) Fix inline  (2) Discuss + fix  (3) Discuss only  (4) Skip
```

Report must be self-contained — copy/paste-able into another session.

## Walk-through actions

- **Fix inline**: apply all fixes → re-run preflight → show diff → offer commit.
- **Discuss + fix**: walk findings highest-severity first in the `collaborate` shape — each finding gets its block (title + detail + bold recommendation), then a single prompt asks for batch confirmation. The user responds with one batch (e.g. _"fix #1, #3; defer #2 with ticket; skip rest"_). Don't drip-feed one finding per turn. If a finding genuinely needs deep back-and-forth, break out, discuss, return to the batch.
- **Discuss only**: same walk-through, no fixing.
- **Skip**: acknowledge, continue.
