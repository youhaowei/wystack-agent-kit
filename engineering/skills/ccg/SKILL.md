---
name: ccg
description: "Multi-model advisory review — dispatch a question, document, diff, or design decision to Codex and Gemini, then synthesize their findings against your own. Use to pressure-test a decision, get an independent second and third opinion, or add alt-model perspective before committing. Advisory only — surfaces findings, never returns a binding verdict."
---
# CCG

**C**laude + **C**odex + **G**emini. Independent alt-model perspective on a question, document, diff, or design decision — then synthesis.

The value is *divergence*: where three models agree, confidence is high; where they disagree, a real decision is hiding. Same-model self-review shares blind spots; alt-model review does not.

## 1. Identify target and type

What is being reviewed shapes how reviewers are prompted. Decide the type from context — don't ask if it's obvious.

| Type | Target | Reviewers look for |
|---|---|---|
| **doc** | Spec, PRD, design/decision doc | Gaps, contradictions, unstated assumptions, scope creep, missing cases |
| **arch** | A proposed approach or design decision | Soundness, hidden coupling, simpler alternatives, failure modes |
| **diff** | A code change (`git diff`, branch, PR) | Bugs, regressions, edge cases, missed error paths |
| **ask** | An open question or judgment call | A reasoned answer — and pushback if the premise is flawed |

## 2. Check available CLIs

Probe `command -v codex` / `command -v gemini`. The skill runs with whatever is present:

- **Both** → full CCG (two alt-model perspectives + Claude).
- **One** → that reviewer + Claude; note the reduced coverage in the synthesis.
- **Neither** → return `unavailable` (step 6) and stop — never substitute Claude-only review and call it CCG.

If a reviewer errors or times out mid-run, report it and synthesize from what returned — never silently drop it.

## 3. Compose per-reviewer prompts

One prompt per reviewer, shaped to the type. Each prompt:

- Names the target by path (prefer pointing at a path over pasting — both CLIs read the working tree).
- States the type and its focus (the table above).
- Says "be specific and direct; push back hard if something is wrong."
- Bounds length (~400–500 words) so synthesis stays tractable.
- For `doc` and `arch`, asks for "the single biggest weakness" — forces a prioritized finding.

Give the two reviewers slightly **different framings** when it widens coverage — e.g. for a doc, Codex on architectural soundness, Gemini on product/UX and missing cases. Divergent framing surfaces more than identical prompts.

## 4. Dispatch in parallel

Run both concurrently as background commands — they take time. Non-interactive, read-only:

```
codex exec --skip-git-repo-check "<prompt>"
gemini -p "<prompt>" --approval-mode plan
```

## 5. Synthesize

Read all reviewer output. Produce:

- **Convergence** — findings multiple reviewers raised independently. High confidence; lead with these.
- **Divergence** — findings only one raised, or where reviewers disagree. Flag as a decision; don't silently pick a side.
- **Your own read** — Claude is the third voice. Add what the others missed; disagree explicitly where warranted.

Don't average opinions into mush. A finding two models raised and one missed is still a finding.

When ccg is invoked directly by the user, deliver the synthesis via `engineering:present`; as a subroutine of another skill, return the findings to the caller.

## 6. Return a verdict

Always name one of three states:

| State | Meaning |
|---|---|
| **`pass`** | No material findings from any reviewer. Convergent "looks good." |
| **`findings`** | Material issues raised. List them — convergent first, then divergent. |
| **`unavailable`** | No alt-model CLI present. Say so plainly; recommend human review. Do not fake-synthesize from Claude alone. |

## Advisory contract

CCG is **advisory, never a gate.**

- The caller (a skill or the user) decides what to do with findings — CCG does not block, approve, or merge.
- A caller must handle all three states — never assume `findings` means stop or `pass` means proceed.
- Every result is overridable with no friction and no penalty. If the user reads the findings and proceeds anyway, that's a valid outcome — record it and move on.
- `pass` is not a guarantee; `findings` is not a veto. Both are input to a human or deterministic check, not a substitute for one.

## Record the outcome

When invoked inside a workflow that keeps a calibration log, append one line to the workspace's calibration log: target, type, verdict, and whether the user acted on the findings or overrode. Over time this measures whether CCG findings are useful or noise — its own credibility check. No calibration log → skip silently.

## When not to use

Trivial or mechanical changes — alt-model review is just noise.
