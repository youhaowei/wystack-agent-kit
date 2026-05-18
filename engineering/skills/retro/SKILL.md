---
name: retro
description: "Run a project retrospective from accumulated calibration data — read the workspace calibration records, surface where the workflow is miscalibrated (size→regime fit, estimation accuracy, ccg credibility, agent breakdown), and propose updated workflow tuning for the user to accept. Use periodically after a batch of tickets closes, or when the user asks to refine the workflow, recalibrate estimation, or review how the team pipeline is performing."
---

# Retro

Close the calibration loop. `orchestrate`, `finish-task`, and `ccg` *emit* outcome data; `retro` *consumes* it — turning accumulated evidence into project-local policy the skills read.

The skills are a fixed framework. `retro` doesn't edit them — it writes the workspace `tuning.json`, and the skills adapt by reading it. Refinement is data, not code.

## Input

`retro [project]` — infer project from CWD if omitted. A manual ceremony, not a trigger — run it when a batch of work has closed.

## Prerequisites

Load `engineering:workspace` — it resolves where the calibration records and `tuning.json` live. If the workspace isn't set up there is nothing to retrospect; say so and stop.

## Workflow

### 1. Gather

Read every record in the workspace `calibration/` directory — `TASK-*.json` records from `finish-task`, ccg verdict/override logs, Diverge-strategy synthesis notes.

**Enough live records** (rough floor: ~8 closed tickets' worth) → go to step 2.

**Too few** → offer **backfill** rather than stopping. A retro on noise produces noise, but the evidence usually still exists outside `calibration/`.

#### Backfill (opt-in)

Reconstruct **estimation-accuracy records only** from already-closed tickets. Ask the user first — it costs a fetch sweep across the task store, git, and PRs.

For each closed ticket: take the predicted size from grooming, and an actual-effort proxy from git and PR data — commit count, diff stat, rework commits, review rounds, time on branch. Write one record per ticket to `calibration/`, marked `"source": "reconstructed"`.

Backfill does **not** reconstruct the other signals — trust regime, ccg verdicts, and agent breakdown aren't recoverable from history. Those rows stay orchestrate-fed.

If there aren't enough closed tickets to backfill either, say so plainly and stop.

### 2. Analyze

Look for where the seed policy and reality diverge:

| Signal | Question | Evidence in calibration data |
|---|---|---|
| **Size → regime fit** | Is each size in the right trust regime? | review rounds, scope violations, override counts grouped by size |
| **Estimation accuracy** | Are sizes predicting effort? | review rounds / rework as a proxy for "harder than sized" |
| **ccg credibility** | Is ccg's advice worth following? | how often `findings` were acted on vs overridden |
| **Agent breakdown** | Which ticket sizes/shapes run clean vs need rework? | outcome by size |

Records marked `"source": "reconstructed"` are proxy data — feed them only into **Estimation accuracy**, never the other three rows. They are enough to catch a systematically optimistic or conservative anchor, not enough for fine adjustment.

### 3. Surface findings

Present what the data shows — each finding with its evidence, not a bare claim. Lead with the strongest miscalibration. Hand off to `engineering:present` — inline for a small retro, an HTML report for a substantial one.

### 4. Propose tuning

Recommend a `tuning.json` — **deltas from the seed defaults only**, never a full restatement. Each proposed change carries the evidence behind it. If a delta rests on reconstructed records, say so in its `why` — the user is accepting proxy-grade evidence.

```json
{
  "updated": "2026-05-15",
  "tickets_analyzed": 14,
  "size_regime": {
    "S": { "regime": "full", "why": "S tickets averaged 2.3 review rounds — skim too loose" }
  },
  "estimation": {
    "why": "M tickets consistently needed check-ins — the 3/M anchor reads optimistic for this project"
  },
  "ccg": { "why": "findings acted on in 80% of invocations — credible, keep weighting it" }
}
```

### 5. Accept and report

The user reviews each recommendation — accept, edit, or reject per item. Write only the accepted deltas to the workspace `tuning.json`; `orchestrate`, `estimation`, and `groom` read it on their next run — no skill edit, no restart. Then summarize what was tuned and what the skills will now do differently.

## Rules

- **Advisory.** retro proposes; the user decides every delta. Never auto-write `tuning.json`.
- **Reads calibration, never deletes it.** retro consumes live records; backfill may add reconstructed ones — the data only accrues.
