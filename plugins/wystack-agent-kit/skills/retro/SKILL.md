---
name: retro
description: "Run a project retrospective from accumulated calibration data — read the workspace calibration records, surface where the workflow is miscalibrated (estimation accuracy, perspective credibility, outcome by size), and propose updated workflow tuning for the user to accept. Use periodically after a batch of tickets closes, or when the user asks to refine the workflow, recalibrate estimation, or review how the team pipeline is performing."
---

# Retro

Close the calibration loop. `orchestrate`, `finish-task`, and `perspective` *emit* outcome data; `retro` *consumes* it — turning accumulated evidence into the workspace `tuning.json`, which the fixed skills read. Refinement is data, not code; retro never edits the skills.

## Input

`retro [project]` — infer project from CWD if omitted. A manual ceremony, not a trigger — run it when a batch of work has closed.

## Prerequisites

Load `wystack-agent-kit:workspace` — it resolves where the calibration records and `tuning.json` live. If the workspace isn't set up there is nothing to retrospect; say so and stop.

## Workflow

### 1. Gather

Read every record in the workspace `calibration/` directory — `TASK-*.json` records from `finish-task`, perspective verdict/override logs, Diverge-strategy synthesis notes. When the workspace has `reviews/` and `findings/` directories, read `REV-*.json` pass records and the linked `findings/*.json` files — review verdicts let `review_rounds` and verdict distributions be re-derived from primary evidence rather than the calibration field's running count. Use finding records (see `skills/code-review/RECORD-FORMAT.md`) for recurring-finding analysis by `signature`, category/confidence distributions, triage outcomes (`open` vs `fixed` vs `false-positive`), and whether deferred SUGGESTs were acted on.

**Enough live records** (rough floor: ~8 closed tickets' worth) → go to step 2.

**Too few** → offer **reconstruction** rather than stopping. A retro on noise produces noise, but the evidence usually still exists outside `calibration/`.

#### Reconstruct (opt-in)

Estimation-accuracy records are reconstructed by `wystack-agent-kit:calibrate` (its reconstruct stage) — run it, then return here. Ask the user first — it costs a fetch sweep across the task store, git, and PRs.

Reconstruction covers estimation accuracy only — perspective verdicts and per-ticket outcomes aren't recoverable from history. Those rows stay fed by live `perspective` and `finish-task` records.

If there aren't enough closed tickets to reconstruct from either, say so plainly and stop.

### 2. Analyze

Look for where the seed policy and reality diverge:

| Signal | Question | Evidence in calibration data |
|---|---|---|
| **Estimation accuracy** | Are sizes predicting argument size? | delegated — `wystack-agent-kit:calibrate` owns record reconstruction, anchor verification, and the workspace known-seam list |
| **Perspective credibility** | Are configured perspectives worth following? | how often `findings` were acted on vs overridden |
| **Outcome by size** | Which ticket sizes/shapes run clean vs need rework? | merged-vs-reworked outcome grouped by size |

A record feeds whichever rows its fields support — reconstructed estimation records carry no perspective or outcome fields, so those rows draw only on live records.

### 3. Surface findings

Present what the data shows — each finding with its evidence, not a bare claim. Lead with the strongest miscalibration. Deliver inline for a small retro, an HTML report for a substantial one.

### 4. Propose tuning

Recommend a `tuning.json` — **deltas from the seed defaults only**, never a full restatement. Each proposed change carries the evidence behind it. Estimation has no tuning entry — anchors and known seams are `calibrate`'s to propose into `workspace.md`; invoke it rather than deriving estimation deltas here.

```json
{
  "updated": "2026-05-15",
  "tickets_analyzed": 14,
  "perspective": { "why": "findings acted on in 80% of invocations — credible, keep weighting it" }
}
```

### 5. Accept and report

The user reviews each recommendation — accept, edit, or reject per item. Write only the accepted deltas to the workspace `tuning.json`; `orchestrate` and `groom` read it on their next run — no skill edit, no restart. Then summarize what was tuned and what the skills will now do differently.

## Rules

- **Advisory.** retro proposes; the user decides every delta. Never auto-write `tuning.json`.
- **Reads calibration, never deletes it.** The data only accrues.
