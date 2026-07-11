# Exploration Prompts & Presentation Templates

Subagent prompts and the output shapes the user sees. Kept separate from `SKILL.md` to keep the imperative tight.

## Groom analysis

Prompt for the `Explore` subagent during step 2 of single-task mode:

```
Task: "{title}"
{description}

Using the estimation scale (XS through XXL — see wystack-agent-kit:estimation), analyze:

1. **Affected files** — paths + brief rationale.
2. **Implementation complexity** — files changed, new vs existing patterns, test infrastructure.
3. **Suggested estimate** — apply the scale with reasoning:
   - What model/agent tier would execute this?
   - Apply multipliers/reducers from the estimation heuristics.
4. **Full scope at that estimate tier**:
   - What tests are required after applying `docs/testing-philosophy.md`? Default to none unless the task touches a hidden edge case, spec contract, regression, or system boundary.
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
- Suggested estimate: **{size}** ({model tier, e.g. standard/Sonnet/Terra or deep/Opus/Sol}) — {reasoning}
- Full scope at {size}:
  - Tests: {what's required after strategic test gate, or "No new automated tests"}
  - Docs: {what needs updating}
  - Migration: {if any}

**Suggested Acceptance Criteria**:
1. {criterion referencing code}
2. {verification criterion: strategic test, runtime check, screenshot, typecheck, or lint}
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
2. **Test strategy** — apply `docs/testing-philosophy.md`; say "No new automated tests" when the change is glue, trivial mapping, UI rendering detail, or implementation-only refactor.
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
3. {step for verification; include tests only if the strategic gate warrants them}
4. {step for docs if needed}

**Test Strategy**: {approach}
**Risk Areas**: {what might need iteration}
```

## Batch summary format

```
## Planning Summary

### Changes
- TASK-{id}: {title} — estimate: ? → M (deep model tier, e.g. Opus/Sol), added ACs + plan → **Ready**
- TASK-{id}: {title} — priority: Medium → High → **Ready**
- TASK-{id}: {title} — split into 3 sub-tasks

### Promoted to Ready ({count})
- TASK-{id}: {title} (High, M) — has estimate, ACs, scope, plan, unblocked

### Still Needs Work ({count})
- TASK-{id}: {title} — missing: {what's missing}

### Updated Priority Stack (Ready tasks first)
1. TASK-{id}: {title} (High, S/standard model tier, e.g. Sonnet/Terra) — Ready
2. TASK-{id}: {title} (High, M/deep model tier, e.g. Opus/Sol) — Ready
...

### Stats
Reviewed: {n} | Changed: {n} | Created: {n} | Archived: {n}
```
