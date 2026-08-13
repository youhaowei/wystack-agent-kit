---
name: adr
description: Record or supersede an architecture decision whose rationale and consequences must survive beyond the current implementation.
---

# ADR

Capture a decision only when a real alternative existed and future work needs to understand why it was rejected. Keep local, reversible choices in code or the relevant spec.

Follow the user's template, then the project's existing ADR convention. With neither, use the smallest structure that preserves:

- context and forces;
- the decision;
- meaningful alternatives;
- consequences and trade-offs.

Write the reasoning, not a meeting transcript. Link the decision to the system or requirement it serves. Preserve accepted history: supersede an obsolete ADR with a new one and make the relationship explicit.

Complete when a future reader can tell what was chosen, why the strongest alternative lost, and what consequences to expect.
