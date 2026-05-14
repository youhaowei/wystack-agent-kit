# Testing Philosophy

## Recommendation

Default to **no new automated test until a concrete risk earns one**. When a
test is earned, prefer TDD: write the failing contract first, make it pass, then
refactor.

Testing is a design tool, not a ceremony. A test should protect a contract that
could realistically break without the type system, linter, review, or runtime
verification catching it.

## Test Gate

Before adding or requesting a test, answer:

1. What behavior contract does this protect?
2. What bug class would escape without it?
3. Why is this the cheapest stable seam to test?
4. Will the test survive a valid refactor?

If any answer is weak, do not add the test. Prefer type checking, linting,
runtime verification, screenshots, or a follow-up note.

If the answer is strong, use TDD when practical:

1. Name the contract, spec anchor, bug class, or boundary being protected.
2. Write the smallest failing test at the stable public seam.
3. Implement only enough to pass.
4. Refactor while keeping the contract stable.

## Write Tests When

- **Hidden edge cases**: regex boundaries, fallback chains, off-by-ones,
  ordering, cache invalidation, concurrency, retries, clocks, deduplication.
- **Spec contracts**: behavior anchored to a PRD story, Spec decision, ADR, or
  edge-case table. Test names should reference the anchor, for example
  `Decision #8: stale records sort by indexedAt`.
- **Regressions**: a real bug escaped before. Name the bug or failure mode in
  the test.
- **System boundaries**: parsers, validators, serializers, protocol adapters,
  network-shape mappers, persistence/replay boundaries, external API adapters.

## Do Not Test

- Trivial enum-to-string switches or total mappings already proven by
  TypeScript.
- Glue/composition code with no logic of its own.
- UI rendering details in unit tests. Prefer E2E, interaction tests, and
  screenshots for visible behavior.
- Implementation details that churn with every refactor.
- Existence smoke tests such as "exports function X" or "test runner sees this
  package." If the test cannot catch a behavioral bug, it is noise.

## Review Standard

Reviewers should flag both missing strategic tests and waste tests.

- Missing test: only when an unprotected contract matches the "Write Tests
  When" list and is near-term risky.
- Waste test: when the test only encodes current implementation, proves
  existence, adds maintenance weight, or would block a
  different-but-spec-compliant implementation.

A bad test can hurt more than a missing test. Missing tests leave risk visible;
bad tests create false confidence, freeze the wrong interface, and make future
refactors look unsafe even when behavior stays correct.

Coverage percentage is not a goal. Confidence is.
