# Exploration Prompts & Presentation Templates

Subagent prompts and the output shapes the user sees. Kept separate from `SKILL.md` to keep the imperative tight.

## Groom analysis

Prompt for the `Explore` subagent during step 2 of single-task mode:

```
Task: "{title}"
{description}

Using the estimation scale (XS through XXL — see engineering:estimation), analyze:

1. **Affected files** — paths + brief rationale.
2. **Implementation complexity** — files changed, new vs existing patterns, test infrastructure.
3. **Suggested estimate** — apply the scale with reasoning:
   - What model/agent tier would execute this?
   - Apply multipliers/reducers from the estimation heuristics.
4. **Full scope at that estimate tier**:
   - What tests are required? (unit, integration, edge cases)
   - What docs need updating? (CLAUDE.md, inline, API docs)
   - Any migration needed?
5. **Suggested acceptance criteria** — concrete, testable, referencing actual file paths.
6. **If L+ size** — suggest how to split based on code module boundaries.

Exploration depth: "quick" for likely S/M, "very thorough" for likely L+.
```

## Groom result format

```
### TASK-{id}: {title}
Status: {status} | Priority: {priority} | Current estimate: {est} | Type: {type}

**Description**: {summary}

**Codebase Analysis**:
- Files: {affected files}
- Suggested estimate: **{size}** ({model tier, e.g. Sonnet or Opus}) — {reasoning}
- Full scope at {size}:
  - Tests: {what's required}
  - Docs: {what needs updating}
  - Migration: {if any}

**Suggested Acceptance Criteria**:
1. {criterion referencing code}
2. {test criterion}
3. {doc criterion}
```

## Implementation plan

Prompt for the `Explore` subagent during step 3 of single-task mode:

```
Task: "{title}"
{description}
{acceptance criteria}

Create a detailed implementation plan:

1. **Ordered implementation steps** — concrete changes with:
   - Specific files, functions, and line ranges.
   - Existing patterns to follow (cite examples in codebase).
   - Exact insertion points for new code.
   - Design decisions that need user input.
2. **Test strategy** — what to test, which test files, existing test patterns to follow.
3. **Dependencies** — order of operations, what must be done first.
4. **Risk areas** — parts most likely to need iteration.

Exploration depth: "very thorough"
```

## Plan format

```
### Implementation Plan

**Steps**:
1. {step with specific file + function + what to change}
2. {step referencing existing pattern to follow}
3. {step for tests}
4. {step for docs if needed}

**Test Strategy**: {approach}
**Risk Areas**: {what might need iteration}
```

## Batch summary format

```
## Planning Summary

### Changes
- TASK-{id}: {title} — estimate: ? → M (large model tier, e.g. Opus), added ACs + plan → **Ready**
- TASK-{id}: {title} — priority: Medium → High → **Ready**
- TASK-{id}: {title} — split into 3 sub-tasks

### Promoted to Ready ({count})
- TASK-{id}: {title} (High, M) — has estimate, ACs, scope, plan, unblocked

### Still Needs Work ({count})
- TASK-{id}: {title} — missing: {what's missing}

### Updated Priority Stack (Ready tasks first)
1. TASK-{id}: {title} (High, S/medium model tier, e.g. Sonnet) — Ready
2. TASK-{id}: {title} (High, M/large model tier, e.g. Opus) — Ready
...

### Stats
Reviewed: {n} | Changed: {n} | Created: {n} | Archived: {n}
```
