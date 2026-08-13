---
name: code-review
description: Review a diff, branch, or pull request for correctness, requirement fidelity, maintainability, and concrete regression risk.
---

# Code Review

Pin the comparison point and read the repository's instructions plus the originating requirement or spec. If either boundary is ambiguous, make the assumption visible.

Review every changed area against four questions:

- Does it do what the requirement says?
- Can an input, state, failure path, or concurrency edge make it incorrect?
- Does the design increase coupling or make the next change harder?
- Is important behavior unprotected at the right test or runtime seam?

Lead with findings. Each finding needs evidence, impact, location, and the smallest useful correction. Separate confirmed defects from inferences and questions. Omit style preferences, issues already enforced by tooling, and generic requests for more tests.

Use independent review lanes when the change is broad or high-risk; delegation is evidence collection, not ceremony. Keep the review read-only unless the user asks for fixes.

Complete when every changed area has been considered, relevant checks are reported, and remaining uncertainty is explicit.
