---
name: estimation
description: "Size engineering work using a shared relative scale anchored at 3/M. Use during grooming, task creation, and planning when the user asks how big work is or how much agent oversight it needs."
---

# Estimation

Relative sizing for engineering tasks. Everything is compared to the anchor: **"Is this easier or harder than a 3?"**

## Anchor: 3 / M

**"Can I hand this to a strong coding agent and mostly walk away?"**

If yes, it is a 3 or below. This is the standard `wystack-agent-kit:groom` and `wystack-agent-kit:new-task` should target.

## Project calibration

The anchor and scale are the **seed** — fixed framework. The per-project adjustment lives in the workspace `tuning.json`, resolved via `wystack-agent-kit:workspace` (callers load it first). If `tuning.json` has an `estimation` entry, read it first — `wystack-agent-kit:retro` writes it from predicted-vs-actual data, and it tells you whether this project's 3/M anchor has been running optimistic or conservative. Adjust your read of the scale accordingly.

## Scale

| Pts | Size | Expected execution model | Relative to anchor |
|---|---|---|---|
| **0.5** | XS | Local / lightweight model | Trivially simpler |
| **1** | S | Lightweight / mid-tier model | Much simpler |
| **2** | M- | Mid-tier / strong model | Slightly simpler |
| **3** | **M** | **Strong coding agent** | **Anchor — fire and forget** |
| **5** | M+ | Strong coding agent + one or two check-ins | Harder |
| **8** | L | Strong coding agent + explicit planning | Much harder |
| **13** | XL | Human-led with agent assistance | Needs active steering |
| **21** | XXL | Split first | Too large as written |

## How to Size

Compare the task to the anchor. Consider:

- Scope breadth
- Clarity of acceptance criteria
- Risk and blast radius
- Familiarity with the code paths
- Reasoning complexity
- Required test, doc, and migration work

There is no formula. Use judgment and explain the reasoning. State the size *and* what it implies for oversight — the execution model from the scale — as the takeaway; the number alone isn't the answer.

## Rules

- Estimates include the whole job: implementation, tests, docs, cleanup, and migration work
- Prefer splitting XXL work before execution
- If a task depends on major unknowns, size the uncertainty, not just the code delta
- Use this scale consistently across `wystack-agent-kit:new-task`, `wystack-agent-kit:groom`, and `wystack-agent-kit:next-task`
