---
name: estimate
description: Estimate engineering complexity by sizing the independent correctness arguments and cross-boundary invariants the work must satisfy.
---

# Estimate

Size the correctness argument, not lines of code, elapsed time, or who performs the work.

Use the project's scale, anchors, and output template when they exist. Otherwise use a relative scale whose rungs mean:

- **XS** — one obvious case;
- **S** — a few independent cases;
- **M** — interacting cases with a known path;
- **L** — invariants spanning a boundary or subsystem;
- **XL** — many cross-cutting invariants or a system-wide argument.

Enumerate the independent cases and invariants that justify the placement. Sweep unnamed seams such as serialization, authorization, persistence, caching, reactivity, failure recovery, and compatibility. Treat major unknowns as uncertainty that may need a spike, not automatically as complexity.

Complete when the estimate is traceable to the counted arguments and the assumptions that could move it are explicit.
