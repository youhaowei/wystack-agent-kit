---
name: calibrate
description: "Establish or refine a project's estimation reference set — backfill closed tickets with actuals from PRs, re-size each through the argument lens, verify anchors against how the work actually behaved, and propose tuning deltas. Use at workspace init to seed anchors from history, periodically after a batch of tickets closes, or when estimates keep missing; retro delegates its estimation-accuracy signal here."
---

# Calibrate

The same sizing act as `wystack-agent-kit:estimate`, run with post-work context: the shipped PR shows the argument that *actually* had to hold. A mis-size is a **context gap** — an invariant lived at a seam the pre-work context never named. Output: a re-anchored reference set, plus the recovered context written back where `estimate` reads it.

Prerequisite: `wystack-agent-kit:workspace` (task/doc providers, VCS config).

## Workflow

1. **Mode.** `workspace.md` § Estimation Anchors absent → *establish*; present → *refine*. Same steps either way; refine always re-verifies the sitting anchors.

2. **Sample.** Closed tickets across every estimated rung — deepest where the unit lives (3/M, 5/M+), always including the current anchors. Note what was excluded and why.

3. **Backfill** — one record per ticket, parallel subagents, persisted to workspace `calibration/` marked `"source": "reconstructed"` (`docs/run-record.md`). Per ticket:
   - Re-size from the description alone — enumerate the correctness arguments, place on the ladder — *before* weighing the recorded estimate.
   - Gather actuals per the fetch recipe below.
   - Verdict: accurate / under-sized / over-sized / uncertain, judged against same-era peers only, never absolute effort.
   - **Name the context gap on every mis-size**: the seam or invariant the ticket text never mentioned.

4. **Verify anchors.** An anchor must be *actuals-clean* — verdict accurate, zero unnamed-invariant fix commits — not merely well-described. Displace within the 1–3-per-rung cap, never grow. A rung with no clean exemplar stays empty (`estimate`'s provisional-anchor rule fills it later).

5. **Propose; the user accepts each item.**
   - the anchor-set delta,
   - a deltas-only `tuning.json` `estimate` entry — the recurring context gaps (this project's seam list), each with ticket evidence,
   - an upstream fix when a gap traces to a doc, not a ticket (a spec section that never names the boundary).

   Write only what's accepted — `workspace.md` § Estimation Anchors + `tuning.json` — and report what `estimate` will now do differently.

## Fetch recipe

Per-ticket evidence rules — don't improvise these:

- **PR linkage**: attachment-first; branch names drift and the PR may live in another repo. No PR found → keep the record, empty actuals, gap noted.
- **Done** = PR `mergedAt`. **Effort window** = first→last commit authored timestamps, labeled coarse. State-history wall time is idle-and-queue dominated — never an effort proxy.
- **Review rounds**: state-history oscillation cross-checked with review timestamps; denylist bot reviewers; record `human_review_present` and `rate_limited` separately — a rate-limited zero is missing data, not "trivial".
- **Commit classification** — the discriminating signal: named-invariant fix / **unnamed-invariant fix** / infra-harness / lint / revert / rework-replacement, classified by each commit's own stated intent + diff. Unnamed-invariant fix count is the primary under-sizing evidence. Don't attempt fix→review-comment causal attribution.
- **Scope drift**: follow blocking/related relations; a recorded-vs-delivered match after descoping, reverts, or upstream no-ops is *lucky*, not accurate — record `scope_drift` with the linked ticket.
- **Diff stats**: replaced-in-branch attempts double-count; flag `diff_double_counts_rework` rather than reading raw diff as delivered scope.

## Rules

- **Advisory.** Propose; the user accepts every anchor and delta. Never auto-write.
- **n-threshold.** No per-rung verdict below ~4 same-era records — report "insufficient samples" instead of concluding.
- **Records accrue.** Append to `calibration/`, never delete. Reconstructed records feed estimation accuracy only — `retro`'s other signals need live records.
- Anchors record points, not size labels — tracker label scales differ.
