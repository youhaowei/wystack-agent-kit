---
name: cross-review
description: "Find defects in a branch by planning independent review angles across available reviewers, preferring model-family diversity without requiring it, grounding each seam in source or runtime evidence, and returning an explicit passed/findings/incomplete status through ReportFindings. Use when reviewing a branch or diff for bugs before it ships, and as the review stage `pr-gate` invokes. Skip when the ask is to explain a change or judge merge-readiness — that is pr-walkthrough."
---

# Cross Review

Cross-review has no caller-selected review shape. `effort` is the sole caller-controlled
review-shape input. The workflow derives its phase: it is `focused-recheck` when `since` is
supplied or prior findings are non-empty; otherwise it is `initial`. Null, undefined, and empty
findings do not trigger a focused re-check.

Review-shape `effort` defaults to `low`. Model reasoning is separate and also defaults to
`low` for every routed seat; never inherit the caller session's effort. Raise only the failed
seat by one rung when its result is incomplete because of reasoning rather than missing input,
tool access, or provider availability. High, xhigh, and max are never defaults.

The initial planner receives ticket scope and acceptance criteria, diff shape/effective size,
risk or miss cost, author/native families, available angle and panel seats, effort, and
explicitly applicable prior evidence. It chooses technical angles × model families, panel
seats, fan-out, and an issue-driven evidence depth for each seam or angle. There is no seat
cap or evidence budget. High-confidence source-complete seams may go directly to judgment;
ambiguous, disputed, sibling-dependent, runtime-dependent, or expensive-to-miss seams get
the needed source or runtime evidence. Higher effort makes marginal and subtle seams more
worth grounding; it does not require evidence for every candidate.

Model-family diversity is preferred evidence, not the definition of independence. When a
planned external family is unavailable or fails to answer, reroute that exact angle to the
strongest available fresh reviewer and record the actual family. Only an explicit owner or
repository hard gate may forbid this fallback. Do not return `incomplete` solely because a
preferred family was unavailable.

## Runtime configuration

Read these environment variables before invocation:

- `CROSS_REVIEW_BRIDGE_MODEL`, `CROSS_REVIEW_WORKER_MODEL`, `CROSS_REVIEW_JUDGE_MODEL`
- `CLAUDEX`, `CROSS_REVIEW_NATIVE_FAMILY`, `CROSS_REVIEW_ANGLE_SEATS`,
  `CROSS_REVIEW_PANEL_SEATS`, `CROSS_REVIEW_CODEX_MODEL`

They describe availability, not mandatory fan-out. Pass `claudex` from `CLAUDEX`. Under
Claudex, absent role routes default internally to bridge `gpt-5.6-luna`, worker
`gpt-5.6-terra`, and judge `gpt-5.6-sol`; role environment values or flat route arguments are
overrides, not prerequisites. Non-Claudex omissions inherit normally. Flat arguments are required:

```js
Workflow({
  scriptPath: "<this skill's base directory>/workflow.js",
  args: {
    base, workdir, effort, modelEffort, instructions, priorEvidence,
    effectiveSize, diffShape, risk, acceptanceCriteria,
    bridgeModel, workerModel, judgeModel, claudex, nativeFamily, authorFamily,
    angleSeats, panelSeats, codexModel,
  },
})
```

For a focused re-check only, additionally pass non-empty `findings` and the required `since`
fix-start ref. A `since`-only call is valid for a strict regression read; do not pass
`findings: []` to select a phase.

`base` is the actual PR base and `workdir` is the absolute checkout. Put ticket scope and
known risk in `instructions`; pass `unknown` for an unknown author family. `priorEvidence`
entries must state `applicable: true`, a seam, disposition, and either exact reviewed base/head
or the exact prepared range. Evidence without exact target metadata is prior context only and
cannot count as current.

## Phase behavior

`initial` runs adaptive discovery. It clusters root-cause seams, assigns different model
families where useful and available, falls back to fresh available reviewers, and reuses only
exact-range applicable evidence instead of regenerating it.
Fix rounds do not restart broad discovery. If the fix diff introduces a new risky seam, the
planner may add that named seam only.

`focused-recheck` runs one scenario check for every prior finding plus one strict regression
read of the fix diff. Non-empty findings require `since`; without it the run is `incomplete`.
With `since` but no findings, it runs only the strict regression read.

## Evidence and result contract

Evidence dispositions are `confirmed-from-source`, `reproduced-at-runtime`, `refuted`, or
`unresolved`. A grounded `refuted` result is completed evidence: judgment drops the proposed
failure. Planner depth binds each retained seam: `runtime` requires runtime reproduction, or a
refutation backed by that exercise or complete source proof the path is unreachable; `source`
accepts source or runtime grounding; `direct` launches no worker. Only unresolved, missing, or
depth-contradicting planned evidence is `incomplete`.

The workflow returns `{ status, level, phase, routing, findings, plan, coverage, evidence }`. `plan` and `evidence` are explicit on every terminal path (`null` only when preparation failed before planning).

- `passed`: all required work completed and no finding survived.
- `findings`: all required work completed and at least one finding survived.
- `incomplete`: a required plan, seat, check, evidence item, panel judgment, or synthesis is missing.

An empty completed initial or focused re-check result is `passed`; an empty list under
`incomplete` is never clean. For completed runs, call `ReportFindings` once, with an empty
list only for `passed`. Report concrete coverage/evidence gaps to the gate owner immediately.
