---
name: calibrate
description: "Establish or refine a project's estimation reference set from closed-ticket actuals — size the argument each ticket actually delivered, verify anchors against how the work behaved, and propose anchor and known-seam deltas. Use at workspace init to seed anchors from history, after a batch of tickets closes, or when estimates keep missing; retro delegates estimation accuracy here."
---

# Calibrate

Maintain the project's estimation reference set — the anchors and known seams `estimate` reads — from how closed work actually behaved. Sizing itself is always `wystack-agent-kit:estimate`; calibrate supplies post-work context and compares.

Prerequisite: `wystack-agent-kit:workspace`.

## Workflow

1. **Sample** closed tickets across every rung, current anchors always included. Unsized tickets carry a delivered size only, no verdict.

2. **Reconstruct** one record per ticket — parallel subagents, persisted to workspace `calibration/` (`docs/run-record.md`). Assemble the post-work context per the fetch recipe, run `wystack-agent-kit:estimate` on it → the **delivered size**; verdict = recorded vs delivered, judged against same-era peers; name the **context gap** on every mis-size — what the pre-work context never named.

3. **Verify anchors** — actuals-clean only: verdict accurate, zero unnamed-invariant fix commits. Each rung keeps the smallest set that spans its kinds of work. An unclear rung needs a wider sample, not a guess.

4. **Walk through.** Render a visual report via the `present` skill (direct HTML if unavailable) — per rung, each candidate with a plain-language gist of the work, recorded vs delivered size, and cleanliness evidence; it must stand without the tracker open. The user accepts each item: anchor delta, known-seam delta, upstream doc fix when a gap traces to a spec, portable-rule proposal for `estimate` when a gap isn't project-specific. Write only what's accepted (`workspace.md` § Estimation Anchors) and report what `estimate` will now do differently.

## Fetch recipe

Known traps in the raw evidence — a floor, not a ceiling:

- **Effort is not size**: commits, review rounds, wall time, diff volume witness that an invariant existed — never feed them into the size itself.
- **PR linkage**: attachment-first; branches drift and the PR may live in a sibling repo. No PR → keep the record, empty actuals, gap noted.
- **Ticket kind**: design/spec tickets deliver doc revisions — size the doc delta.
- **Done** = PR `mergedAt`; state-history wall time is idle-dominated, never an effort window.
- **Review rounds**: denylist bots; a rate-limited zero is missing data, not "trivial".
- **Commit classification**: named-invariant fix / **unnamed-invariant fix** / infra / lint / revert / rework-replacement, by stated intent + diff (fetch full bodies; listings truncate). Unnamed-invariant count is the primary under-sizing evidence.
- **Scope drift**: a recorded-vs-delivered match after descoping, reverts, or upstream no-ops is lucky, not accurate.
- **Diff stats**: replaced-in-branch attempts double-count rework.

## Rules

- **Forward-only.** Never rewrite a closed ticket's estimate in the tracker.
- **Insufficient is a verdict.** Too few same-era records to support a rung conclusion → say so rather than conclude.
- **Records accrue.** Append to `calibration/`, never delete.
- Anchors record points, not size labels.
