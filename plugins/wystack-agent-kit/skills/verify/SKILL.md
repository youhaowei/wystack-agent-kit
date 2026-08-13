---
name: verify
description: Verify a behavior or delivery claim through the highest-fidelity available runtime evidence, targeted checks, and explicit uncertainty.
---

# Verify

State the claim being verified and choose the closest observable seam: real runtime behavior first, then integration or contract checks, then static evidence. Use the project's existing commands and fixtures rather than inventing a broad test sweep.

Exercise the golden path and the edges most likely to falsify the claim. Observe outputs directly; do not infer runtime success from compilation or a passing unit suite. For pure logic with no runtime surface, focused tests may be the highest-fidelity evidence.

Report what each piece of evidence proves and what it leaves unproven. Capture reproducible artifacts when they materially improve reviewability. Keep diagnosis or fixes separate unless the user asked for them.

Complete when the claim is supported, disproved, or explicitly blocked by a named evidence gap.
