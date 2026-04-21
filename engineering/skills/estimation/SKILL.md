---
name: estimation
description: "Size engineering work using a shared relative scale anchored at 3/M. Use during grooming, task creation, and planning when the user asks how big work is or how much agent oversight it needs."
---

# Estimation

Relative sizing for engineering tasks. Everything is compared to the anchor: **"Is this easier or harder than a 3?"**

## Anchor: 3 / M

**"Can I hand this to a strong coding agent and mostly walk away?"**

If yes, it is a 3 or below. This is the standard `engineering:groom` and `engineering:new` should target.

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

Compare the task to the anchor and to recent completed work. Consider:

- Scope breadth
- Clarity of acceptance criteria
- Risk and blast radius
- Familiarity with the code paths
- Reasoning complexity
- Required test, doc, and migration work

There is no formula. Use judgment and explain the reasoning.

## Rules

- Estimates include the whole job: implementation, tests, docs, cleanup, and migration work
- Prefer splitting XXL work before execution
- If a task depends on major unknowns, size the uncertainty, not just the code delta
- Use this scale consistently across `engineering:new`, `engineering:groom`, and `engineering:next`
