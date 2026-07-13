---
name: estimate
description: "Size engineering work by complexity — how intricate the correctness argument is, independent of who builds it — on a relative point ladder anchored per project. Produces points + the counted correctness arguments. Use during grooming, task creation, and planning when the user asks how big work is."
---

# Estimate

Size the **correctness argument**, not the code — what a skeptical reviewer must independently check, not how many lines change.

## Workflow

1. **Load the work item + context.** the ticket/slice, its spec/architecture, and the code it touches — enough to see the correctness argument. Trust grooming comments and linked relations over stale ticket text: scope may have been rescoped or already delivered upstream since it was written.

2. **Size the argument.** Count the *independent* correctness arguments (cases × invariants); place on the ladder against the project's reference set.

3. **Report.** `N pts` + the counted arguments, one clause each — the enumeration is the reason. Record the enumeration with the estimate on the ticket: it's what `wystack-agent-kit:calibrate` later diffs against the delivered arguments.

## The ladder

| Pts | Complexity | Correctness-argument structure |
|---|---|---|
| 0.5 | XS | one obvious case |
| 1 | S | a few cases, no interaction |
| 2 | M− | several cases, shallow interaction |
| **3** | **M (anchor)** | **a bounded set of interacting cases, known solution path** |
| 5 | M+ | interacting invariants that must co-hold |
| 8 | L | a deep or wide argument — many independent invariants |
| 13 | XL | argument spans subsystems with cross-cutting invariants |
| 21 | XXL | a very large argument — large but may still be coherent |

The structural column is the portable definition; the concrete anchor is the **per-project reference set** — past tickets per rung, diverse in kind, the smallest set that spans the rung, in `workspace.md` § Estimation Anchors (established and refined by `wystack-agent-kit:calibrate`). Compare against the reference nearest in kind. Missing rung → size against the structural column and record the ticket as that rung's provisional anchor.

**Anchor 3** is defined by the *work* (bounded argument, known path), never by who or what implements it.

**XXL** is very high complexity, not an automatic split — splitting is decided elsewhere.

## Rules

- **Complexity is the only output.** Risk, oversight, execution strategy, splitting — the consumer's reads; don't emit them here.
- **Sweep the seams.** Before placing, ask whether correctness needs an invariant to co-hold in a subsystem the ticket never names — serialization boundaries, a second entry/auth sink, cache completeness, reactivity contracts, persistence, failure/degrade paths. An unnamed co-holding invariant moves the rung up.
- **Novelty isn't complexity.** Major unknowns → timebox a spike; the spike's output is the estimate.
- **Never re-anchor the ladder.** `calibrate` refines the project's anchors and known seams; the scale itself moves only by deliberate manual re-anchor.
- Use consistently across `wystack-agent-kit:new-task`, `:groom`, `:next-task`.
